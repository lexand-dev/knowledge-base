import { schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";
import { processDocument as processDoc, formatChunkForStorage } from "@/modules/documents/processing";
import { db } from "@/db/index";
import { documents, documentChunks } from "@/db/schema";
import { eq } from "drizzle-orm";

export const processDocumentJob = schemaTask({
  id: "process-document",
  schema: z.object({
    documentId: z.string(),
    userId: z.string(),
    storageKey: z.string(),
    mimeType: z.string(),
  }),
  run: async (payload) => {
    const { documentId, userId, storageKey, mimeType } = payload;

    try {
      await db.update(documents)
        .set({ status: "processing", updatedAt: new Date() })
        .where(eq(documents.id, documentId));

      const result = await processDoc({ storageKey, mimeType, userId, documentId });
      const { chunks, embeddings } = result;

      if (chunks.length === 0) {
        await db.update(documents)
          .set({ status: "failed", errorMessage: "No text extracted from document", updatedAt: new Date() })
          .where(eq(documents.id, documentId));
        return { success: false, error: "No text extracted" };
      }

      const chunksForStorage = chunks.map((chunk, i) =>
        formatChunkForStorage(chunk, embeddings[i], documentId, userId)
      );

      await db.insert(documentChunks).values(
        chunksForStorage.map((c) => ({ ...c, id: crypto.randomUUID() }))
      );

      await db.update(documents)
        .set({ status: "ready", chunkCount: chunks.length, updatedAt: new Date() })
        .where(eq(documents.id, documentId));

      return { success: true, chunkCount: chunks.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await db.update(documents)
        .set({ status: "failed", errorMessage: message, updatedAt: new Date() })
        .where(eq(documents.id, documentId));
      throw error;
    }
  },
});