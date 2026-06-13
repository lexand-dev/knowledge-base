import { InferRequestType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";

const route = client.api.chat.threads[":id"];
type RequestType = InferRequestType<typeof route.$delete>["param"];

export const useDeleteThread = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RequestType>({
    mutationFn: async (param) => {
      const res = await route.$delete({ param });
      if (!res.ok) throw new Error("Failed to delete thread");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "threads"] });
    },
  });
};
