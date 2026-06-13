import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";
import type { Document } from "../types";

export const useGetDocuments = () => {
  return useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await client.api.documents.$get();
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json() as unknown as Document[];
    },
  });
};
