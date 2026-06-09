import type { DocumentServiceDeps } from "./service";
import { db } from "@/db/index";
import { documents, documentChunks } from "@/db/schema";
import { eq } from "drizzle-orm";

type DocumentStatus = "uploading" | "processing" | "ready" | "failed";

export function createDocumentDbAdapter(): DocumentServiceDeps {
  async function getDocumentById(id: number) {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    if (!doc) return null;
    return {
      ...doc,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    };
  }

  async function createDocument(tenantId: number, data: { filename: string; storageKey: string; mimeType: string; size: number }) {
    const [doc] = await db.insert(documents).values({
      tenantId,
      filename: data.filename,
      storageKey: data.storageKey,
      mimeType: data.mimeType,
      size: data.size,
      status: "uploading",
    }).returning();
    return {
      ...doc,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    };
  }

  async function updateDocumentStatus(id: number, status: DocumentStatus, errorMessage?: string) {
    await db.update(documents)
      .set({ status, errorMessage: errorMessage ?? null, updatedAt: new Date() })
      .where(eq(documents.id, id));
  }

  async function listDocuments(opts: { tenantId: number; limit?: number; offset?: number }) {
    const docs = await db.select().from(documents)
      .where(eq(documents.tenantId, opts.tenantId))
      .limit(opts.limit ?? 50)
      .offset(opts.offset ?? 0);
    return docs.map((doc: typeof docs[number]) => ({
      ...doc,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    }));
  }

  async function deleteDocument(id: number) {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async function getChunksByDocumentId(documentId: number) {
    return db.select().from(documentChunks)
      .where(eq(documentChunks.documentId, documentId));
  }

  return {
    getDocumentById,
    createDocument,
    updateDocumentStatus,
    listDocuments,
    deleteDocument,
    getChunksByDocumentId,
  };
}