import { cohere } from "@ai-sdk/cohere";
import { get } from "@vercel/blob";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).href;

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
  text: string;
}

async function extractTextFromBlob(
  storageKey: string,
  mimeType: string
): Promise<{ text: string }> {
  const result = await get(storageKey, { access: "private" });
  if (!result) throw new Error(`Blob not found: ${storageKey}. The file upload may have failed or the blob was deleted.`);

  if (!result.stream) throw new Error(`Blob stream is null for ${storageKey}`);

  const chunks: Uint8Array[] = [];
  const reader = result.stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks);

  if (mimeType === "application/pdf") {
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .filter((item): item is TextItem => "str" in item)
        .map((item) => item.str)
        .join(" ");
      textParts.push(pageText);
    }

    await pdf.destroy();
    return { text: textParts.join("\n") };
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    try {
      const mammoth = await import("mammoth");
      const { value } = await mammoth.extractRawText({ buffer });
      return { text: value };
    } catch (err) {
      throw new Error(`Failed to extract text from DOCX: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return { text: buffer.toString("utf-8") };
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
  const model = cohere.embedding("embed-multilingual-v3.0");
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

  return { chunks, embeddings, text };
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
    embedding: embedding,
    pageNumber: chunk.pageNumber,
    chunkIndex: chunk.chunkIndex,
  };
}
