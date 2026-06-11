import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createDocumentService } from "@/modules/documents";
import { createDocumentDbAdapter } from "@/modules/documents/adapter";
import { requireAuth, type AuthVariables } from "@/middleware/auth";

const documentAdapter = createDocumentDbAdapter();
const documentService = createDocumentService(documentAdapter);

export const documentRoutes = new Hono<{ Variables: AuthVariables }>()
  .use(requireAuth)
  .post(
    "/presigned-url",
    zValidator("json", z.object({
      filename: z.string().min(1),
      contentType: z.string(),
      size: z.number().max(10 * 1024 * 1024).optional(),
    })),
    async (c) => {
      const { filename, contentType } = c.req.valid("json");

      const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
      if (!allowedTypes.includes(contentType)) {
        return c.json({ error: "Invalid content type. Allowed: PDF, DOCX, TXT" }, 400);
      }

      const result = await documentService.generatePresignedUrl({ filename, contentType });
      return c.json(result);
    }
  )
  .post(
    "/",
    zValidator("json", z.object({
      filename: z.string(),
      storageKey: z.string(),
      mimeType: z.string(),
      size: z.number(),
    })),
    async (c) => {
      const user = c.get("user")!;
      const { filename, storageKey, mimeType, size } = c.req.valid("json");
      const doc = await documentService.createDocumentRecord(user.id, { filename, storageKey, mimeType, size });
      return c.json(doc, 201);
    }
  )
  .get("/", async (c) => {
    const user = c.get("user")!;
    const docs = await documentService.listDocuments({ userId: user.id });
    return c.json(docs);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const doc = await documentService.getDocument(id);
    if (!doc) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.json(doc);
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    await documentService.removeDocument(id);
    return c.json({ success: true, id });
  })
  .post("/:id/process", async (c) => {
    const id = c.req.param("id");
    const result = await documentService.processDocument(id);
    return c.json(result);
  })
  .get("/:id/status", async (c) => {
    const id = c.req.param("id");
    const doc = await documentService.getDocument(id);
    if (!doc) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.json({ id, status: doc.status, chunkCount: doc.chunkCount ?? 0 });
  });
