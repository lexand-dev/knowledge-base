import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";
import type { ChatMessage } from "../types";

const route = client.api.chat.threads[":id"].messages;

export const useGetMessages = (threadId: string | undefined) => {
  return useQuery<ChatMessage[]>({
    queryKey: ["chat", "messages", threadId],
    queryFn: async () => {
      if (!threadId) return [];
      const res = await route.$get({
        param: { id: threadId },
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json() as unknown as ChatMessage[];
    },
    enabled: !!threadId,
  });
};
