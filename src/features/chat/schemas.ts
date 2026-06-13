import { z } from "zod";

export const createThreadSchema = z.object({
  title: z.string().min(1),
});

export const sendMessageSchema = z.object({
  threadId: z.string().min(1),
  message: z.string().min(1),
});

export type CreateThreadValues = z.infer<typeof createThreadSchema>;
export type SendMessageValues = z.infer<typeof sendMessageSchema>;
