import { issueSignedToken, presignUrl } from "@vercel/blob";
import type {
  Document,
  PresignedUrlRequest,
  PresignedUrlResponse,
  CreateDocumentRequest,
  DocumentListOptions,
  DocumentProcessingResult,
} from "./types";
import { processDocument as processDoc, formatChunkForStorage } from "./processing";

export interface DocumentServiceDeps {
  getDocumentById(id: number): Promise<Document | null>;
  createDocument(tenantId: number, data: CreateDocumentRequest): Promise<Document>;
  updateDocumentStatus(id: number, status: Document["status"], errorMessage?: string): Promise<void>;
  listDocuments(opts: DocumentListOptions): Promise<Document[]>;
  deleteDocument(id: number): Promise<void>;
  getChunksByDocumentId(documentId: number): Promise<unknown[]>;
  createChunks(chunks: { documentId: number; tenantId: number; content: string; embedding: string; pageNumber: number | null; chunkIndex: number }[]): Promise<void>;
  updateChunkCount(id: number, count: number): Promise<void>;
}

export function createDocumentService(deps: DocumentServiceDeps) {
  async function generatePresignedUrl(req: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    const token = await issueSignedToken({
      pathname: req.filename,
      operations: ["put"],
      maximumSizeInBytes: 10 * 1024 * 1024, // 10MB limit
      allowedContentTypes: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
    });

    const { presignedUrl } = await presignUrl(token, {
      operation: "put",
      pathname: req.filename,
      access: "private",
      allowedContentTypes: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
      maximumSizeInBytes: 10 * 1024 * 1024,
    });

    return {
      url: presignedUrl,
      uploadUrl: presignedUrl,
      key: req.filename,
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

  async function markAsReady(id: number, _chunkCount: number): Promise<void> {
    void _chunkCount;
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
      
      const { chunks, embeddings } = await processDoc({
        storageKey: doc.storageKey,
        mimeType: doc.mimeType,
        tenantId: doc.tenantId,
        documentId: doc.id,
      });

      const chunksForStorage = chunks.map((chunk, i) =>
        formatChunkForStorage(chunk, embeddings[i], doc.id, doc.tenantId)
      );

      await deps.createChunks(chunksForStorage);
      await deps.updateChunkCount(doc.id, chunks.length);
      await markAsReady(doc.id, chunks.length);

      return { id: doc.id, status: "ready", chunkCount: chunks.length };
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