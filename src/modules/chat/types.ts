export interface ChatThread {
  id: number;
  tenantId: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: number;
  threadId: number;
  tenantId: number;
  role: string;
  content: string;
  createdAt: Date;
}

export interface Citation {
  id: number;
  messageId: number;
  chunkId: number;
  filename: string;
  pageNumber: number | null;
}

export interface CreateThreadRequest {
  tenantId: number;
  title: string;
}

export interface CreateMessageRequest {
  threadId: number;
  tenantId: number;
  role: string;
  content: string;
}

export interface RAGContext {
  chunks: Array<{
    id: number;
    content: string;
    documentId: number;
    filename: string;
    pageNumber: number | null;
    chunkIndex: number;
  }>;
}

export interface ChatStreamPart {
  type: "text" | "citation";
  content: string;
  citation?: Citation;
}