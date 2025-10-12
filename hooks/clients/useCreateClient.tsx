import { useMutation, useQueryClient } from "@tanstack/react-query";

type NewClient = {
  name: string;
  email: string;
  address?: string;
};

type Client = {
  _id: string;
  name: string;
  email: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
};

async function createClient(data: NewClient): Promise<Client> {
  const res = await fetch("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create client");
  }

  return res.json();
}

/**
 * Custom React Query mutation hook for creating a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: (newClient) => {
      // Optional: Update cached client list if it exists
      queryClient.invalidateQueries({ queryKey: ["clients"] });

      // You could also optimistically update the cache like this:
      // queryClient.setQueryData<Client[]>(["clients"], (old = []) => [...old, newClient]);
    },
    onError: (error: Error) => {
      console.error("Create client failed:", error.message);
    },
  });
}