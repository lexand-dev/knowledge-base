export interface Env {
  DATABASE_URL: string;
  OPENAI_API_KEY: string;
  BLOB_READ_WRITE_TOKEN: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  RESEND_API_KEY: string;
  TRIGGER_API_KEY: string;
  TRIGGER_PUBLIC_API_KEY: string;
}

export interface ApiEnv {
  DATABASE_URL: string;
  OPENAI_API_KEY: string;
  BLOB_READ_WRITE_TOKEN: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  RESEND_API_KEY: string;
  TRIGGER_API_KEY: string;
  TRIGGER_PUBLIC_API_KEY: string;
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

export interface Document {
  id: number;
  tenantId: number;
  filename: string;
  storageKey: string;
  mimeType: string;
  size: number;
  status: "uploading" | "processing" | "ready" | "failed";
  errorMessage?: string;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  filename: string;
  storageKey: string;
  mimeType: string;
  size: number;
}

export interface ChatThread {
  id: number;
  tenantId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadRequest {
  title: string;
}

export interface ChatMessage {
  id: number;
  threadId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatRequest {
  threadId: number;
  content: string;
}

export interface ChatResponse {
  message: ChatMessage;
  citations: Citation[];
}

export interface Citation {
  id: number;
  messageId: number;
  chunkId: number;
  filename: string;
  pageNumber: number | null;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: "admin" | "member";
  tenantId: number;
}

export interface Session {
  user: User | null;
  tenant: { id: number; name: string } | null;
}