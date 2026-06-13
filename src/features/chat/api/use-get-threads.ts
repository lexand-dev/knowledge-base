import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";
import type { ChatThread } from "../types";

export const useGetThreads = () => {
  return useQuery<ChatThread[]>({
    queryKey: ["chat", "threads"],
    queryFn: async () => {
      const res = await client.api.chat.threads.$get();
      if (!res.ok) throw new Error("Failed to fetch threads");
      return res.json() as unknown as ChatThread[];
    },
  });
};
