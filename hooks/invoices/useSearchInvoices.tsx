"use client";

import { useQuery } from "@tanstack/react-query";

export const useSearchInvoices = (query: string) => {
  return useQuery({
    queryKey: ["searchInvoices", query],
    queryFn: async () => {
      const res = await fetch(
        `/api/invoices/search?q=${encodeURIComponent(query)}`,
      );
      if (!res.ok) throw new Error("Failed to search invoices");
      return res.json();
    },
    enabled: !!query,
  });
};
