export interface Document {
  id: string;
  userId: string;
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
  id: string;
  documentId: string;
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
  userId: string;
  limit?: number;
  offset?: number;
}

export interface DocumentProcessingResult {
  id: string;
  status: Document["status"];
  chunkCount: number;
  errorMessage?: string;
}
