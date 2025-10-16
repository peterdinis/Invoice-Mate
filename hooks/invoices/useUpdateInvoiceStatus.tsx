"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InvoiceStatus } from "@/models/Invoice";

interface UpdateInvoiceStatusVariables {
  id: string;
  status: InvoiceStatus;
}

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: UpdateInvoiceStatusVariables) => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update invoice status");
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["paginatedInvoices"] });
    },
  });
};
