import { useMutation, useQueryClient } from "@tanstack/react-query";

async function signOut(): Promise<void> {
  await fetch("/api/auth/sign-out", {
    method: "POST",
    credentials: "include",
  });
}

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
};
