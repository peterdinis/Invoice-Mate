"use client";

import { useQuery } from "@tanstack/react-query";

export interface Client {
  _id: string;
  name: string;
  email: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  invoices: any[]
}

interface ClientsResponse {
  data: Client[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

async function fetchClients(
  page: number,
  limit: number,
  searchTerm: string,
): Promise<ClientsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (searchTerm) params.set("search", searchTerm);

  const res = await fetch(`/api/clients?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Nepodarilo sa načítať klientov");
  }

  return res.json();
}

/**
 * Hook to fetch paginated + searchable clients
 */
export function useClients({
  page = 1,
  limit = 10,
  searchTerm = "",
}: {
  page?: number;
  limit?: number;
  searchTerm?: string;
}) {
  return useQuery({
    queryKey: ["clients", { page, limit, searchTerm }],
    queryFn: () => fetchClients(page, limit, searchTerm),
    staleTime: 30_000, // optional: 30s cache freshness
  });
}
