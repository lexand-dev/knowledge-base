export interface Document {
  id: number;
  tenantId: number;
  filename: string;
  storageKey: string;
  mimeType: string;
  size: number;
  status: "uploading" | "processing" | "ready" | "failed";
  errorMessage: string | null;
  chunkCount: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChunk {
  id: number;
  documentId: number;
  tenantId: number;
  content: string;
  embedding: string;
  pageNumber: number | null;
  chunkIndex: number;
  createdAt: Date;
}

export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
}

export interface PresignedUrlResponse {
  url: string;
  uploadUrl: string;
  key: string;
}

export interface CreateDocumentRequest {
  filename: string;
  storageKey: string;
  mimeType: string;
  size: number;
}

export interface DocumentListOptions {
  tenantId: number;
  limit?: number;
  offset?: number;
}

export interface DocumentProcessingResult {
  id: number;
  status: Document["status"];
  chunkCount: number;
  errorMessage?: string;
}