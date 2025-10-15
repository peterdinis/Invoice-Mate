import { IInvoice } from "@/models/Invoice";
import { useQuery } from "@tanstack/react-query";

interface PaginatedInvoices {
  invoices: IInvoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export function usePaginatedInvoices(
  page: number,
  limit: number,
  folderId?: string,
  searchTerm?: string,
) {
  return useQuery<PaginatedInvoices>({
    queryKey: ["invoices", { page, limit, folderId, searchTerm }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (folderId) params.set("folderId", folderId);
      if (searchTerm) params.set("search", searchTerm);

      const res = await fetch(`/api/invoices?${params.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Nepodarilo sa načítať faktúry");
      }

      return res.json();
    },
  });
}
