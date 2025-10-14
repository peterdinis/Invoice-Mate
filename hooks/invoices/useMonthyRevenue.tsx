"use client";

import { useQuery } from "@tanstack/react-query";

interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

export const useMonthlyRevenue = (months: number = 6) => {
  return useQuery<MonthlyRevenueData[]>({
    queryKey: ["monthlyRevenue", months],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/monthly-revenue?months=${months}`);
      if (!res.ok) throw new Error("Failed to fetch monthly revenue");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // Fresh for 5 minutes
  });
};
