import type { ChatServiceDeps } from "./service";
import { db } from "@/db/index";
import { chatThreads, chatMessages, citations, documentChunks, documents } from "@/db/schema";
import { eq, desc, cosineDistance, sql } from "drizzle-orm";

export function createChatDbAdapter(): ChatServiceDeps {
  async function getThreadById(id: string) {
    const [thread] = await db.select().from(chatThreads).where(eq(chatThreads.id, id));
    if (!thread) return null;
    return {
      ...thread,
      createdAt: new Date(thread.createdAt),
      updatedAt: new Date(thread.updatedAt),
    };
  }

  async function createThread(data: { userId: string; title: string }) {
    const [thread] = await db.insert(chatThreads).values({
      id: crypto.randomUUID(),
      userId: data.userId,
      title: data.title,
    }).returning();
    return {
      ...thread,
      createdAt: new Date(thread.createdAt),
      updatedAt: new Date(thread.updatedAt),
    };
  }

  async function listThreads(userId: string) {
    const threads = await db.select().from(chatThreads)
      .where(eq(chatThreads.userId, userId))
      .orderBy(desc(chatThreads.updatedAt));
    return threads.map((t: typeof threads[number]) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));
  }

  async function deleteThread(id: string) {
    await db.delete(chatThreads).where(eq(chatThreads.id, id));
  }

  async function getMessagesByThreadId(threadId: string) {
    const messages = await db.select().from(chatMessages)
      .where(eq(chatMessages.threadId, threadId))
      .orderBy(chatMessages.createdAt);
    return messages.map((m: typeof messages[number]) => ({
      ...m,
      createdAt: new Date(m.createdAt),
    }));
  }

  async function createMessage(data: { threadId: string; userId: string; role: "user" | "assistant"; content: string }) {
    const [message] = await db.insert(chatMessages).values({
      id: crypto.randomUUID(),
      threadId: data.threadId,
      userId: data.userId,
      role: data.role,
      content: data.content,
    }).returning();
    return {
      ...message,
      createdAt: new Date(message.createdAt),
    };
  }

  async function searchRelevantChunks(
    userId: string,
    queryEmbedding: number[],
    limit = 5
  ): Promise<Array<{ id: string; content: string; documentId: string; pageNumber: number | null; filename: string; chunkIndex: number }>> {
    if (!queryEmbedding || queryEmbedding.length === 0) return [];

    // cosineDistance returns distance (0 = identical, 2 = opposite)
    // Convert to similarity: 1 - distance gives 1 = identical, -1 = opposite
    // Using desc() on similarity gives us most similar first
    const similarity = sql<number>`1 - (${cosineDistance(documentChunks.embedding, queryEmbedding)})`;

    const results = await db
      .select({
        id: documentChunks.id,
        content: documentChunks.content,
        documentId: documentChunks.documentId,
        pageNumber: documentChunks.pageNumber,
        chunkIndex: documentChunks.chunkIndex,
        filename: documents.filename,
        similarity,
      })
      .from(documentChunks)
      .innerJoin(documents, eq(documentChunks.documentId, documents.id))
      .where(eq(documentChunks.userId, userId))
      .orderBy(desc(similarity))
      .limit(limit);

    return results.map((row) => ({
      id: row.id,
      content: row.content,
      documentId: row.documentId,
      pageNumber: row.pageNumber,
      filename: row.filename,
      chunkIndex: row.chunkIndex,
    }));
  }

  async function createCitation(data: { messageId: string; chunkId: string; filename: string; pageNumber: number | null }) {
    const [citation] = await db.insert(citations).values({
      id: crypto.randomUUID(),
      messageId: data.messageId,
      chunkId: data.chunkId,
      filename: data.filename,
      pageNumber: data.pageNumber,
    }).returning();
    return citation;
  }

  return {
    getThreadById,
    createThread,
    listThreads,
    deleteThread,
    getMessagesByThreadId,
    createMessage,
    searchRelevantChunks,
    createCitation,
  };
}
