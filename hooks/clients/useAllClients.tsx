"use client";

import { useQuery } from "@tanstack/react-query";

export interface Client {
  _id: string;
  name: string;
  email: string;
  address?: string;
}

export const useAllClients = () => {
  return useQuery<Client[], Error>({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients/all");

      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }

      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};
