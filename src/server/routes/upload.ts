import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
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

export const uploadRoutes = new Hono<{ Variables: AuthVariables }>()
  .use(requireAuth)
  .post(
    "/",
    async (c) => {
      const user = c.get("user")!;
      const body = await c.req.json<HandleUploadBody>();

      try {
        const jsonResponse = await handleUpload({
          body,
          request: c.req.raw,
          onBeforeGenerateToken: async (pathname, _clientPayload) => {
            const filename = pathname.split("/").pop() || "unknown";
            const ext = filename.split(".").pop()?.toLowerCase();
            if (!["pdf", "docx", "txt"].includes(ext || "")) {
              throw new Error("Invalid file type. Allowed: PDF, DOCX, TXT");
            }

            const blobPathname = `documents/${user.id}/${crypto.randomUUID()}-${filename}`;

            const doc = await adapter.createDocument(user.id, {
              filename,
              storageKey: blobPathname,
              mimeType: getMimeType(filename),
              size: 0,
            });

            return {
              allowedContentTypes: ALLOWED_CONTENT_TYPES,
              maximumSizeInBytes: MAX_FILE_SIZE,
              tokenPayload: JSON.stringify({
                documentId: doc.id,
                blobPathname,
              }),
            };
          },
          onUploadCompleted: async ({ blob, tokenPayload }) => {
            try {
              const payload = JSON.parse(tokenPayload || "{}");
              const { documentId, blobPathname } = payload;

              if (documentId && blobPathname) {
                await adapter.updateDocumentStatus(documentId, "processing");

                await processDocumentJob.trigger({
                  documentId,
                  userId: user.id,
                  storageKey: blobPathname,
                  mimeType: blob.contentType,
                });
              }
            } catch (error) {
              console.error("onUploadCompleted error:", error);
            }
          },
        });

        return c.json(jsonResponse);
      } catch (error) {
        return c.json(
          { error: (error as Error).message },
          { status: 400 }
        );
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