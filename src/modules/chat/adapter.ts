import type { ChatServiceDeps } from "./service";
import { db } from "@/db/index";
import { chatThreads, chatMessages, citations } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

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
    queryEmbedding: string,
    limit = 5
  ): Promise<Array<{ id: string; content: string; documentId: string; pageNumber: number | null; filename: string; chunkIndex: number }>> {
    if (!queryEmbedding) return [];
    
    const embeddingArray = JSON.parse(queryEmbedding);
    
    const results = await db.execute(sql`
      SELECT 
        dc.id,
        dc.content,
        dc.document_id,
        dc.page_number,
        dc.chunk_index,
        d.filename,
        (dc.embedding::jsonb <#> ${embeddingArray}::jsonb) * -1 as similarity
      FROM document_chunks dc
      JOIN documents d ON dc.document_id = d.id
      WHERE dc.user_id = ${userId}
        AND d.status = 'ready'
      ORDER BY dc.embedding::jsonb <=> ${embeddingArray}::jsonb
      LIMIT ${limit}
    `);
    
    return results.rows.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      content: row.content as string,
      documentId: row.document_id as string,
      pageNumber: row.page_number as number | null,
      filename: row.filename as string,
      chunkIndex: row.chunk_index as number,
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
