import { cohere } from "@ai-sdk/cohere";
import type { ChatThread, ChatMessage, CreateThreadRequest, CreateMessageRequest, RAGContext } from "./types";

export interface ChatServiceDeps {
  getThreadById(id: string): Promise<ChatThread | null>;
  createThread(data: CreateThreadRequest): Promise<ChatThread>;
  listThreads(userId: string): Promise<ChatThread[]>;
  deleteThread(id: string): Promise<void>;
  getMessagesByThreadId(threadId: string): Promise<ChatMessage[]>;
  createMessage(data: CreateMessageRequest): Promise<ChatMessage>;
  searchRelevantChunks(
    userId: string,
    queryEmbedding: number[],
    limit?: number
  ): Promise<Array<{
    id: string;
    content: string;
    documentId: string;
    pageNumber: number | null;
    filename: string;
    chunkIndex: number;
  }>>;
  createCitation(data: { messageId: string; chunkId: string; filename: string; pageNumber: number | null }): Promise<unknown>;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const model = cohere.embedding("embed-multilingual-v3.0");
  const response = await model.doEmbed({ values: [text] });
  return response.embeddings[0];
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
  async function createThread(userId: string, title: string): Promise<ChatThread> {
    return deps.createThread({ userId, title });
  }

  async function getThread(id: string): Promise<ChatThread | null> {
    return deps.getThreadById(id);
  }

  async function listThreads(userId: string): Promise<ChatThread[]> {
    return deps.listThreads(userId);
  }

  async function removeThread(id: string): Promise<void> {
    return deps.deleteThread(id);
  }

  async function getThreadMessages(threadId: string): Promise<ChatMessage[]> {
    return deps.getMessagesByThreadId(threadId);
  }

  async function addMessage(data: CreateMessageRequest): Promise<ChatMessage> {
    return deps.createMessage(data);
  }

  async function retrieveContext(userId: string, query: string, limit = 5): Promise<RAGContext> {
    const embedding = await generateEmbedding(query);
    const chunks = await deps.searchRelevantChunks(userId, embedding, limit);
    return { chunks };
  }

  async function* streamChat(
    userId: string,
    threadId: string,
    userMessage: string
  ): AsyncGenerator<{ type: "text" | "citation" | "done"; content: string }, void, unknown> {
    const userMsg = await addMessage({
      threadId,
      userId,
      role: "user",
      content: userMessage,
    });
    void userMsg;

    const [contextResult, messages] = await Promise.all([
      retrieveContext(userId, userMessage, 5).catch(() => ({ chunks: [] }) as RAGContext),
      getThreadMessages(threadId),
    ]);
    const context = contextResult;
    const contextPrompt = buildContextPrompt(context.chunks);
    const systemPrompt = buildSystemPrompt(contextPrompt);

    const history: Array<{ role: "user" | "assistant"; content: string }> = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const model = cohere.languageModel("command-a-03-2025");
    const streamResult = await model.doStream({
      prompt: [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: [{ type: "text" as const, text: m.content }] })),
        { role: "user", content: [{ type: "text" as const, text: userMessage }] },
      ],
    });

    let fullResponse = "";

    const reader = streamResult.stream.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value.type === "text-delta") {
        const text = value.delta;
        fullResponse += text;
        yield { type: "text", content: text };
      }
    }

    const assistantMsg = await addMessage({
      threadId,
      userId,
      role: "assistant",
      content: fullResponse,
    });

    const citationMatch = fullResponse.match(/\[(\d+)\]/g);
    if (citationMatch) {
      const citedChunks = new Set<number>();
      citationMatch.forEach((match: string) => {
        const idx = parseInt(match.slice(1, -1)) - 1;
        if (idx >= 0 && idx < context.chunks.length) {
          citedChunks.add(idx);
        }
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

    yield { type: "done", content: assistantMsg.id };
  }

  return {
    createThread,
    getThread,
    listThreads,
    removeThread,
    getThreadMessages,
    addMessage,
    retrieveContext,
    streamChat,
  };
}

export type ChatService = ReturnType<typeof createChatService>;
