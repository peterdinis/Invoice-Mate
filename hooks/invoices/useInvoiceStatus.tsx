import { useQuery } from "@tanstack/react-query";

export interface InvoiceStatusData {
  name: string;
  value: number;
  percentage: number;
  color: string;
   [key: string]: unknown;
}

interface InvoiceStatusResponse {
  data: InvoiceStatusData[];
  total: number;
}

export const useInvoiceStatus = () => {
  return useQuery<InvoiceStatusResponse, Error>({
    queryKey: ["invoiceStatus"],
    queryFn: async () => {
      const response = await fetch("/api/invoices/status-count");

      if (!response.ok) {
        throw new Error("Failed to fetch invoice status data");
      }

      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};
