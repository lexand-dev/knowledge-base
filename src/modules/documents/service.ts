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
  getDocumentById(id: string): Promise<Document | null>;
  createDocument(userId: string, data: CreateDocumentRequest): Promise<Document>;
  updateDocumentStatus(id: string, status: Document["status"], errorMessage?: string): Promise<void>;
  listDocuments(opts: DocumentListOptions): Promise<Document[]>;
  deleteDocument(id: string): Promise<void>;
  getChunksByDocumentId(documentId: string): Promise<unknown[]>;
  createChunks(chunks: { documentId: string; userId: string; content: string; embedding: string; pageNumber: number | null; chunkIndex: number }[]): Promise<void>;
  updateChunkCount(id: string, count: number): Promise<void>;
}

export function createDocumentService(deps: DocumentServiceDeps) {
  async function generatePresignedUrl(req: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    const token = await issueSignedToken({
      pathname: req.filename,
      operations: ["put"],
      maximumSizeInBytes: 10 * 1024 * 1024,
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
    userId: string,
    data: CreateDocumentRequest
  ): Promise<Document> {
    return deps.createDocument(userId, data);
  }

  async function listDocuments(opts: DocumentListOptions): Promise<Document[]> {
    return deps.listDocuments(opts);
  }

  async function getDocument(id: string): Promise<Document | null> {
    return deps.getDocumentById(id);
  }

  async function removeDocument(id: string): Promise<void> {
    return deps.deleteDocument(id);
  }

  async function markAsProcessing(id: string): Promise<void> {
    return deps.updateDocumentStatus(id, "processing");
  }

  async function markAsReady(id: string, _chunkCount: number): Promise<void> {
    void _chunkCount;
    return deps.updateDocumentStatus(id, "ready");
  }

  async function markAsFailed(id: string, error: string): Promise<void> {
    return deps.updateDocumentStatus(id, "failed", error);
  }

  async function processDocument(id: string): Promise<DocumentProcessingResult> {
    const doc = await deps.getDocumentById(id);
    if (!doc) {
      return { id, status: "failed", chunkCount: 0, errorMessage: "Document not found" };
    }

    try {
      await markAsProcessing(id);
      
      const { chunks, embeddings } = await processDoc({
        storageKey: doc.storageKey,
        mimeType: doc.mimeType,
        userId: doc.userId,
        documentId: doc.id,
      });

      const chunksForStorage = chunks.map((chunk, i) =>
        formatChunkForStorage(chunk, embeddings[i], doc.id, doc.userId)
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
    listDocuments,
    getDocument,
    removeDocument,
    processDocument,
  };
}

export type DocumentService = ReturnType<typeof createDocumentService>;
