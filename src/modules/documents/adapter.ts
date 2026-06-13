import type { DocumentServiceDeps } from "./service";
import { db } from "@/db/index";
import { documents, documentChunks } from "@/db/schema";
import { eq } from "drizzle-orm";

type DocumentStatus = "uploading" | "processing" | "ready" | "failed";

interface ChunkInput {
  documentId: string;
  userId: string;
  content: string;
  embedding: number[];
  pageNumber: number | null;
  chunkIndex: number;
}

export function createDocumentDbAdapter(): DocumentServiceDeps {
  async function getDocumentById(id: string) {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    if (!doc) return null;
    return {
      ...doc,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    };
  }

  async function createDocument(userId: string, data: { filename: string; storageKey: string; mimeType: string; size: number }) {
    const [doc] = await db.insert(documents).values({
      id: crypto.randomUUID(),
      userId,
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

  async function updateDocumentStatus(id: string, status: DocumentStatus, errorMessage?: string) {
    await db.update(documents)
      .set({ status, errorMessage: errorMessage ?? null, updatedAt: new Date() })
      .where(eq(documents.id, id));
  }

  async function listDocuments(opts: { userId: string; limit?: number; offset?: number }) {
    const docs = await db.select().from(documents)
      .where(eq(documents.userId, opts.userId))
      .limit(opts.limit ?? 50)
      .offset(opts.offset ?? 0);
    return docs.map((doc: typeof docs[number]) => ({
      ...doc,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    }));
  }

  async function deleteDocument(id: string) {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async function getChunksByDocumentId(documentId: string) {
    return db.select().from(documentChunks)
      .where(eq(documentChunks.documentId, documentId));
  }

  async function createChunks(chunks: ChunkInput[]) {
    if (chunks.length === 0) return;
    await db.insert(documentChunks).values(
      chunks.map((c) => ({ ...c, id: crypto.randomUUID() }))
    );
  }

  async function updateChunkCount(id: string, count: number) {
    await db.update(documents)
      .set({ chunkCount: count, updatedAt: new Date() })
      .where(eq(documents.id, id));
  }

  return {
    getDocumentById,
    createDocument,
    updateDocumentStatus,
    listDocuments,
    deleteDocument,
    getChunksByDocumentId,
    createChunks,
    updateChunkCount,
  };
}

export type DocumentDbAdapter = ReturnType<typeof createDocumentDbAdapter>;
