import { InferRequestType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";

const route = client.api.documents[":id"];
type RequestType = InferRequestType<typeof route.$delete>["param"];

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RequestType>({
    mutationFn: async (param) => {
      const res = await route.$delete({ param });
      if (!res.ok) throw new Error("Failed to delete document");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
};
