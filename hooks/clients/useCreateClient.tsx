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

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["newClient"],
    mutationFn: createClient,
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: Error) => {
      console.error("Create client failed:", error.message);
    },
  });
}
