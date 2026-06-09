import { put } from "@vercel/blob";
import type {
  Document,
  PresignedUrlRequest,
  PresignedUrlResponse,
  CreateDocumentRequest,
  DocumentListOptions,
  DocumentProcessingResult,
} from "./types";

export interface DocumentServiceDeps {
  getDocumentById(id: number): Promise<Document | null>;
  createDocument(tenantId: number, data: CreateDocumentRequest): Promise<Document>;
  updateDocumentStatus(id: number, status: Document["status"], errorMessage?: string): Promise<void>;
  listDocuments(opts: DocumentListOptions): Promise<Document[]>;
  deleteDocument(id: number): Promise<void>;
  getChunksByDocumentId(documentId: number): Promise<unknown[]>;
}

export function createDocumentService(deps: DocumentServiceDeps) {
  async function generatePresignedUrl(req: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    const blob = await put(req.filename, Buffer.from("placeholder"), {
      contentType: req.contentType,
      access: "private",
    });

    return {
      url: blob.url,
      uploadUrl: blob.url,
      key: blob.pathname,
    };
  }

  async function createDocumentRecord(
    tenantId: number,
    data: CreateDocumentRequest
  ): Promise<Document> {
    return deps.createDocument(tenantId, data);
  }

  async function listTenantDocuments(opts: DocumentListOptions): Promise<Document[]> {
    return deps.listDocuments(opts);
  }

  async function getDocument(id: number): Promise<Document | null> {
    return deps.getDocumentById(id);
  }

  async function removeDocument(id: number): Promise<void> {
    return deps.deleteDocument(id);
  }

  async function markAsProcessing(id: number): Promise<void> {
    return deps.updateDocumentStatus(id, "processing");
  }

  async function markAsReady(id: number, chunkCount: number): Promise<void> {
    void chunkCount;
    return deps.updateDocumentStatus(id, "ready");
  }

  async function markAsFailed(id: number, error: string): Promise<void> {
    return deps.updateDocumentStatus(id, "failed", error);
  }

  async function processDocument(id: number): Promise<DocumentProcessingResult> {
    const doc = await deps.getDocumentById(id);
    if (!doc) {
      return { id, status: "failed", chunkCount: 0, errorMessage: "Document not found" };
    }

    try {
      await markAsProcessing(id);
      
      // TODO: Implement actual processing pipeline
      // 1. Download from Vercel Blob
      // 2. Extract text (pdf-parse, mammoth)
      // 3. Chunk with overlap
      // 4. Generate embeddings
      // 5. Store in pgvector

      const chunks = await deps.getChunksByDocumentId(id);
      await markAsReady(id, chunks.length);

      return { id, status: "ready", chunkCount: chunks.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await markAsFailed(id, message);
      return { id, status: "failed", chunkCount: 0, errorMessage: message };
    }
  }

  return {
    generatePresignedUrl,
    createDocumentRecord,
    listTenantDocuments,
    getDocument,
    removeDocument,
    processDocument,
  };
}

export type DocumentService = ReturnType<typeof createDocumentService>;