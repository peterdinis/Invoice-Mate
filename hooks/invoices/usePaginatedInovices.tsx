"use client";

import { useQuery } from "@tanstack/react-query";

export const usePaginatedInvoices = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["paginatedInvoices", page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/invoices?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return res.json();
    },
  });
};
