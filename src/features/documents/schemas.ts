import { z } from "zod";

export const uploadDocumentSchema = z.object({
  filename: z.string().min(1),
});

export const completeUploadSchema = z.object({
  documentId: z.string().min(1),
  blobPathname: z.string().min(1),
});

export type UploadDocumentValues = z.infer<typeof uploadDocumentSchema>;
export type CompleteUploadValues = z.infer<typeof completeUploadSchema>;
