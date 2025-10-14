"use client";

import { useQuery } from "@tanstack/react-query";

interface InvoiceStats {
  totalRevenue: number;
  revenueChange: number;
  totalInvoices: number;
  invoiceChange: number;
  thisMonthRevenue: number;
  thisMonthInvoices: number;
  paidInvoicesThisMonth: number;
}

export const useInvoiceStats = () => {
  return useQuery<InvoiceStats>({
    queryKey: ["invoiceStats"],
    queryFn: async () => {
      const res = await fetch("/api/invoices/stats");
      if (!res.ok) throw new Error("Failed to fetch invoice statistics");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // Data are fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
};
