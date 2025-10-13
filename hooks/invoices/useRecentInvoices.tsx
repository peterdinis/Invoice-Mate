"use client"

import { useQuery } from "@tanstack/react-query"

export const useRecentInvoices = () => {
    return useQuery({
        queryKey: ["recentInvoices"],
        queryFn: async () => {
            const res = await fetch('/api/invoices/recent');
            if (!res.ok) throw new Error('Failed to fetch recent invoices');
            return res.json();
        }
    })
}