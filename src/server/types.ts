export interface Document {
  id: string;
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
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadRequest {
  title: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatRequest {
  threadId: string;
  content: string;
}

export interface ChatResponse {
  message: ChatMessage;
  citations: Citation[];
}

export interface Citation {
  id: string;
  messageId: string;
  chunkId: string;
  filename: string;
  pageNumber: number | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  user: User | null;
}
