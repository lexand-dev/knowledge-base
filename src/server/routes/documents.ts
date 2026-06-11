import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createDocumentService } from "@/modules/documents";
import { createDocumentDbAdapter } from "@/modules/documents/adapter";
import type { AuthVariables } from "@/middleware/auth";

const documentAdapter = createDocumentDbAdapter();
const documentService = createDocumentService(documentAdapter);

export const documentRoutes = new Hono<{ Variables: AuthVariables }>();

documentRoutes.post(
  "/presigned-url",
  zValidator("json", z.object({ 
    filename: z.string().min(1), 
    contentType: z.string(),
    size: z.number().max(10 * 1024 * 1024).optional(), // 10MB default limit
  })),
  async (c) => {
    const { filename, contentType } = c.req.valid("json");
    
    // Validate content type
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowedTypes.includes(contentType)) {
      return c.json({ error: "Invalid content type. Allowed: PDF, DOCX, TXT" }, 400);
    }
    
    const result = await documentService.generatePresignedUrl({ filename, contentType });
    return c.json(result);
  }
);

documentRoutes.post(
  "/",
  zValidator("json", z.object({
    filename: z.string(),
    storageKey: z.string(),
    mimeType: z.string(),
    size: z.number(),
  })),
  async (c) => {
    const user = c.get("user");
    if (!user?.tenantId) {
      return c.json({ error: "Tenant required" }, 403);
    }
    const { filename, storageKey, mimeType, size } = c.req.valid("json");
    const doc = await documentService.createDocumentRecord(user.tenantId, { filename, storageKey, mimeType, size });
    return c.json(doc, 201);
  }
);

documentRoutes.get("/", async (c) => {
  const user = c.get("user");
  if (!user?.tenantId) {
    return c.json({ error: "Tenant required" }, 403);
  }
  const docs = await documentService.listTenantDocuments({ tenantId: user.tenantId });
  return c.json(docs);
});

documentRoutes.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const doc = await documentService.getDocument(id);
  if (!doc) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.json(doc);
});

documentRoutes.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  await documentService.removeDocument(id);
  return c.json({ success: true, id });
});

documentRoutes.post("/:id/process", async (c) => {
  const id = parseInt(c.req.param("id"));
  const result = await documentService.processDocument(id);
  return c.json(result);
});

documentRoutes.get("/:id/status", async (c) => {
  const id = parseInt(c.req.param("id"));
  const doc = await documentService.getDocument(id);
  if (!doc) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.json({ id, status: doc.status, chunkCount: doc.chunkCount ?? 0 });
});