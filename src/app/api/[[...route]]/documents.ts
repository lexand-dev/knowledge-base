import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createDocumentService } from "@/features/documents";
import { createDocumentDbAdapter } from "@/features/documents/adapter";
import { requireAuth, type AuthVariables } from "@/features/auth/middleware";

const documentAdapter = createDocumentDbAdapter();
const documentService = createDocumentService(documentAdapter);

const app = new Hono<{ Variables: AuthVariables }>()
  .use(requireAuth)
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

export default app;
