import { openai } from "@ai-sdk/openai";
import type { ChatThread, ChatMessage, CreateThreadRequest, CreateMessageRequest, RAGContext } from "./types";

export interface ChatServiceDeps {
  getThreadById(id: number): Promise<ChatThread | null>;
  createThread(data: CreateThreadRequest): Promise<ChatThread>;
  listThreads(tenantId: number): Promise<ChatThread[]>;
  deleteThread(id: number): Promise<void>;
  getMessagesByThreadId(threadId: number): Promise<ChatMessage[]>;
  createMessage(data: CreateMessageRequest): Promise<ChatMessage>;
  searchRelevantChunks(
    tenantId: number,
    queryEmbedding: string,
    limit?: number
  ): Promise<Array<{
    id: number;
    content: string;
    documentId: number;
    pageNumber: number | null;
    filename: string;
    chunkIndex: number;
  }>>;
  createCitation(data: { messageId: number; chunkId: number; filename: string; pageNumber: number | null }): Promise<unknown>;
}

async function generateEmbedding(text: string): Promise<string> {
  const model = openai.embedding("text-embedding-3-small");
  const response = await model.doEmbed({ values: [text] });
  return JSON.stringify(response.embeddings[0]);
}

function buildContextPrompt(chunks: RAGContext["chunks"]): string {
  if (chunks.length === 0) {
    return "No relevant context found.";
  }
  
  const contextParts = chunks.map((chunk, i) => 
    `[${i + 1}] ${chunk.filename}${chunk.pageNumber ? ` (page ${chunk.pageNumber})` : ""}:\n${chunk.content}`
  );
  
  return `Context from knowledge base:\n${contextParts.join("\n\n")}`;
}

function buildSystemPrompt(context: string): string {
  return `You are a helpful AI assistant answering questions based on the provided context from the user's knowledge base.

Guidelines:
- Answer only based on the provided context
- If the answer isn't in the context, say "I don't have enough information to answer that question."
- Cite your sources using [N] notation where N is the reference number
- Be concise but thorough
- Format code blocks appropriately if code is discussed

${context}`;
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
    const embedding = await generateEmbedding(query);
    const chunks = await deps.searchRelevantChunks(tenantId, embedding, limit);
    return { chunks };
  }

  async function *streamChat(
    tenantId: number,
    threadId: number,
    userMessage: string
  ): AsyncGenerator<{ type: "text" | "citation"; content: string }, void, unknown> {
    const userMsg = await addMessage({
      threadId,
      tenantId,
      role: "user",
      content: userMessage,
    });
    void userMsg;

    const context = await retrieveContext(tenantId, userMessage, 5);
    const contextPrompt = buildContextPrompt(context.chunks);
    const systemPrompt = buildSystemPrompt(contextPrompt);

    const messages = await getThreadMessages(threadId);
    const history: Array<{ role: "user" | "assistant"; content: string }> = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const model = openai.chat("gpt-4o-mini");
    const streamResult = await model.doStream({
      prompt: [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: [{ type: "text" as const, text: m.content }] })),
        { role: "user", content: [{ type: "text" as const, text: userMessage }] },
      ],
      temperature: 0.7,
    });

    let fullResponse = "";
    const citedChunks = new Set<number>();

    const reader = streamResult.stream.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      if (value.type === "text-delta") {
        const text = value.delta;
        fullResponse += text;
        yield { type: "text", content: text };
        
        const citationMatch = text.match(/\[(\d+)\]/g);
        if (citationMatch) {
          citationMatch.forEach((match: string) => {
            const idx = parseInt(match.slice(1, -1)) - 1;
            if (idx >= 0 && idx < context.chunks.length) {
              citedChunks.add(idx);
            }
          });
        }
      }
    }

    const assistantMsg = await addMessage({
      threadId,
      tenantId,
      role: "assistant",
      content: fullResponse,
    });

    for (const idx of citedChunks) {
      const chunk = context.chunks[idx];
      await deps.createCitation({
        messageId: assistantMsg.id,
        chunkId: chunk.id,
        filename: chunk.filename,
        pageNumber: chunk.pageNumber,
      });
      yield { type: "citation", content: `[${idx + 1}] ${chunk.filename}${chunk.pageNumber ? ` p.${chunk.pageNumber}` : ""}` };
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