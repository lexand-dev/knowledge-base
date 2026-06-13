import { useQuery } from "@tanstack/react-query";
import type { User } from "../types";

async function fetchSession(): Promise<{ user: User | null }> {
  const res = await fetch("/api/auth/get-session", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch session");
  return res.json();
}

export const useGetSession = () => {
  return useQuery<{ user: User | null }>({
    queryKey: ["auth", "session"],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000,
  });
};
