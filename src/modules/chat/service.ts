import type { ChatThread, ChatMessage, CreateThreadRequest, CreateMessageRequest, RAGContext } from "./types";

export interface ChatServiceDeps {
  getThreadById(id: number): Promise<ChatThread | null>;
  createThread(data: CreateThreadRequest): Promise<ChatThread>;
  listThreads(tenantId: number): Promise<ChatThread[]>;
  deleteThread(id: number): Promise<void>;
  getMessagesByThreadId(threadId: number): Promise<ChatMessage[]>;
  createMessage(data: CreateMessageRequest): Promise<ChatMessage>;
  searchRelevantChunks(tenantId: number, queryEmbedding: string, limit?: number): Promise<RAGContext["chunks"]>;
}

export function createChatService(deps: ChatServiceDeps) {
  async function createThread(tenantId: number, title: string): Promise<ChatThread> {
    return deps.createThread({ tenantId, title });
  }

  async function getThread(id: number): Promise<ChatThread | null> {
    return deps.getThreadById(id);
  }

  async function listTenantThreads(tenantId: number): Promise<ChatThread[]> {
    return deps.listThreads(tenantId);
  }

  async function removeThread(id: number): Promise<void> {
    return deps.deleteThread(id);
  }

  async function getThreadMessages(threadId: number): Promise<ChatMessage[]> {
    return deps.getMessagesByThreadId(threadId);
  }

  async function addMessage(data: CreateMessageRequest): Promise<ChatMessage> {
    return deps.createMessage(data);
  }

  async function retrieveContext(tenantId: number, query: string, limit = 5): Promise<RAGContext> {
    // TODO: Generate embedding from query using OpenAI
    // const embedding = await generateEmbedding(query);
    // const chunks = await deps.searchRelevantChunks(tenantId, embedding, limit);
    
    // Placeholder - returns empty context until embeddings are implemented
    const chunks = await deps.searchRelevantChunks(tenantId, "", limit);
    
    return { chunks };
  }

  async function *streamChat(
    tenantId: number,
    threadId: number,
    userMessage: string
  ): AsyncGenerator<string, void, unknown> {
    // Add user message to history
    await addMessage({
      threadId,
      tenantId,
      role: "user",
      content: userMessage,
    });

    // Retrieve relevant context (placeholder for RAG pipeline)
    void tenantId;
    void userMessage;
    const context = { chunks: [] };
    void context;

    // TODO: Implement actual RAG pipeline with OpenAI streaming
    // For now, yield a placeholder response
    const placeholder = "The RAG pipeline is not yet implemented.";
    
    for (const char of placeholder) {
      yield char;
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  return {
    createThread,
    getThread,
    listTenantThreads,
    removeThread,
    getThreadMessages,
    addMessage,
    retrieveContext,
    streamChat,
  };
}

export type ChatService = ReturnType<typeof createChatService>;