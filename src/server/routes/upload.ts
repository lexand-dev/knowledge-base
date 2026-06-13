import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { put } from "@vercel/blob";
import { requireAuth, type AuthVariables } from "@/middleware/auth";
import { createDocumentDbAdapter } from "@/modules/documents/adapter";
import { processDocumentJob } from "@/trigger";

const adapter = createDocumentDbAdapter();

const ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "txt":
      return "text/plain";
    default:
      return "application/octet-stream";
  }
}

function validateFileExtension(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["pdf", "docx", "txt"].includes(ext || "");
}

function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

export const uploadRoutes = new Hono<{ Variables: AuthVariables }>()
  .use(requireAuth)
  .post(
    "/",
    zValidator("form", z.object({
      file: z.any(),
      filename: z.string(),
    })),
    async (c) => {
      const user = c.get("user")!;
      const { file, filename } = c.req.valid("form");

      if (!validateFileExtension(filename)) {
        return c.json({ error: "Invalid file type. Allowed: PDF, DOCX, TXT" }, 400);
      }

      const fileSize = file?.size ?? 0;
      if (!validateFileSize(fileSize)) {
        return c.json({ error: `File size must be between 1 byte and ${MAX_FILE_SIZE / (1024 * 1024)}MB` }, 400);
      }

      const blobPathname = `documents/${user.id}/${crypto.randomUUID()}-${filename}`;
      const mimeType = getMimeType(filename);

      const doc = await adapter.createDocument(user.id, {
        filename,
        storageKey: blobPathname,
        mimeType,
        size: 0,
      });

      try {
        const blob = await put(blobPathname, file, {
          access: "public",
          contentType: mimeType,
        });

        await adapter.updateDocumentStatus(doc.id, "processing");

        await processDocumentJob.trigger({
          documentId: doc.id,
          userId: user.id,
          storageKey: blobPathname,
          mimeType,
        });

        return c.json({
          success: true,
          documentId: doc.id,
          blobUrl: blob.url,
        });
      } catch (error) {
        await adapter.updateDocumentStatus(doc.id, "failed");
        return c.json({ error: (error as Error).message }, 500);
      }
    }
  )
  .post(
    "/complete",
    zValidator("json", z.object({
      documentId: z.string(),
      blobPathname: z.string(),
    })),
    async (c) => {
      const user = c.get("user")!;
      const { documentId, blobPathname } = c.req.valid("json");

      const doc = await adapter.getDocumentById(documentId);
      if (!doc) {
        return c.json({ error: "Document not found" }, 404);
      }
      if (doc.userId !== user.id) {
        return c.json({ error: "Forbidden" }, 403);
      }
      if (doc.storageKey !== blobPathname) {
        return c.json({ error: "Blob pathname mismatch" }, 400);
      }

      await adapter.updateDocumentStatus(documentId, "processing");

      await processDocumentJob.trigger({
        documentId,
        userId: user.id,
        storageKey: blobPathname,
        mimeType: doc.mimeType,
      });

      return c.json({ success: true, documentId });
    }
  );
