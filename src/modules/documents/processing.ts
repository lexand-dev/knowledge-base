import { openai } from "@ai-sdk/openai";
import { get } from "@vercel/blob";
import { generateText } from "ai";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

interface ProcessedChunk {
  content: string;
  pageNumber: number | null;
  chunkIndex: number;
}

export interface ProcessDocumentOptions {
  storageKey: string;
  mimeType: string;
  userId: string;
  documentId: string;
}

export interface ProcessDocumentResult {
  chunks: ProcessedChunk[];
  embeddings: number[][];
}

async function extractTextFromBlob(
  storageKey: string,
  mimeType: string
): Promise<{ text: string; pageCount?: number }> {
  const result = await get(storageKey, { access: "public" });
  if (!result) throw new Error(`Blob not found: ${storageKey}`);

  const { text } = await generateText({
    model: openai.chat("gpt-4o-mini"),
    system: "Extract all text from the provided file. Output only the raw extracted text, without any explanation or commentary.",
    messages: [{
      role: "user",
      content: [{ type: "file" as const, data: result.blob.url, mediaType: mimeType }],
    }],
  });

  return { text };
}

function chunkText(text: string, pageNumbers: (number | null)[]): ProcessedChunk[] {
  const chunks: ProcessedChunk[] = [];
  let position = 0;
  
  while (position < text.length) {
    const end = position + CHUNK_SIZE;
    const chunkText = text.slice(position, end);
    const chunkIndex = chunks.length;
    
    chunks.push({
      content: chunkText,
      pageNumber: pageNumbers[chunkIndex] ?? null,
      chunkIndex,
    });
    
    position = end - CHUNK_OVERLAP;
    if (position >= text.length) break;
  }
  
  return chunks;
}

async function generateEmbeddings(chunks: ProcessedChunk[]): Promise<number[][]> {
  const texts = chunks.map((c) => c.content);
  const model = openai.embedding("text-embedding-3-small");
  const response = await model.doEmbed({ values: texts });
  
  return response.embeddings;
}

export async function processDocument(
  options: ProcessDocumentOptions
): Promise<ProcessDocumentResult> {
  const { storageKey, mimeType } = options;
  
  const { text } = await extractTextFromBlob(storageKey, mimeType);
  
  const pageNumbers = new Array(Math.ceil(text.length / CHUNK_SIZE)).fill(null);
  const chunks = chunkText(text, pageNumbers);
  
  const embeddings = await generateEmbeddings(chunks);
  
  return { chunks, embeddings };
}

export function formatChunkForStorage(
  chunk: ProcessedChunk,
  embedding: number[],
  documentId: string,
  userId: string
) {
  return {
    documentId,
    userId,
    content: chunk.content,
    embedding: JSON.stringify(embedding),
    pageNumber: chunk.pageNumber,
    chunkIndex: chunk.chunkIndex,
  };
}
