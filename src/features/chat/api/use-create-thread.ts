import { InferRequestType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import type { ChatThread } from "../types";

type RequestType = InferRequestType<typeof client.api.chat.threads.$post>["json"];

export const useCreateThread = () => {
  const queryClient = useQueryClient();

  return useMutation<ChatThread, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.chat.threads.$post({ json });
      if (!res.ok) throw new Error("Failed to create thread");
      return res.json() as unknown as ChatThread;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "threads"] });
    },
  });
};
