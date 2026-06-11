export interface ChatThread {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  userId: string;
  role: string;
  content: string;
  createdAt: Date;
}

export interface Citation {
  id: string;
  messageId: string;
  chunkId: string;
  filename: string;
  pageNumber: number | null;
}

export interface CreateThreadRequest {
  userId: string;
  title: string;
}

export interface CreateMessageRequest {
  threadId: string;
  userId: string;
  role: string;
  content: string;
}

export interface RAGContext {
  chunks: Array<{
    id: string;
    content: string;
    documentId: string;
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
