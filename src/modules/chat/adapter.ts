import type { ChatServiceDeps } from "./service";
import { db } from "@/db/index";
import { chatThreads, chatMessages, citations } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export function createChatDbAdapter(): ChatServiceDeps {
  async function getThreadById(id: number) {
    const [thread] = await db.select().from(chatThreads).where(eq(chatThreads.id, id));
    if (!thread) return null;
    return {
      ...thread,
      createdAt: new Date(thread.createdAt),
      updatedAt: new Date(thread.updatedAt),
    };
  }

  async function createThread(data: { tenantId: number; title: string }) {
    const [thread] = await db.insert(chatThreads).values({
      tenantId: data.tenantId,
      title: data.title,
    }).returning();
    return {
      ...thread,
      createdAt: new Date(thread.createdAt),
      updatedAt: new Date(thread.updatedAt),
    };
  }

  async function listThreads(tenantId: number) {
    const threads = await db.select().from(chatThreads)
      .where(eq(chatThreads.tenantId, tenantId))
      .orderBy(desc(chatThreads.updatedAt));
    return threads.map((t: typeof threads[number]) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));
  }

  async function deleteThread(id: number) {
    await db.delete(chatThreads).where(eq(chatThreads.id, id));
  }

  async function getMessagesByThreadId(threadId: number) {
    const messages = await db.select().from(chatMessages)
      .where(eq(chatMessages.threadId, threadId))
      .orderBy(chatMessages.createdAt);
    return messages.map((m: typeof messages[number]) => ({
      ...m,
      createdAt: new Date(m.createdAt),
    }));
  }

  async function createMessage(data: { threadId: number; tenantId: number; role: "user" | "assistant"; content: string }) {
    const [message] = await db.insert(chatMessages).values({
      threadId: data.threadId,
      tenantId: data.tenantId,
      role: data.role,
      content: data.content,
    }).returning();
    return {
      ...message,
      createdAt: new Date(message.createdAt),
    };
  }

  async function searchRelevantChunks(
    tenantId: number,
    queryEmbedding: string,
    limit = 5
  ): Promise<Array<{ id: number; content: string; documentId: number; pageNumber: number | null; filename: string; chunkIndex: number }>> {
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
      WHERE dc.tenant_id = ${tenantId}
        AND d.status = 'ready'
      ORDER BY dc.embedding::jsonb <=> ${embeddingArray}::jsonb
      LIMIT ${limit}
    `);
    
    return results.rows.map((row: Record<string, unknown>) => ({
      id: row.id as number,
      content: row.content as string,
      documentId: row.document_id as number,
      pageNumber: row.page_number as number | null,
      filename: row.filename as string,
      chunkIndex: row.chunk_index as number,
    }));
  }

  async function createCitation(data: { messageId: number; chunkId: number; filename: string; pageNumber: number | null }) {
    const [citation] = await db.insert(citations).values({
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