"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Ghost } from "lucide-react";
import CustomLink from "../shared/CustomLink";
import { useRecentInvoices } from "@/hooks/invoices/useRecentInvoices";
import { Spinner } from "../ui/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "../ui/empty";
import { RecentInvoice } from "@/types/InvoiceTypes";
import { memo, useMemo } from "react";

// Memoized Invoice Item with proper typing
interface InvoiceItemProps {
  invoice: RecentInvoice;
}

const InvoiceItem = memo(({ invoice }: InvoiceItemProps) => {
  const formattedDate = useMemo(
    () => new Date(invoice.createdAt).toLocaleDateString(),
    [invoice.createdAt],
  );

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <p className="font-semibold text-foreground truncate">
            {invoice.invoiceNumber}
          </p>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {invoice.clientName}
        </p>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="text-right">
          <p className="font-bold text-foreground">{invoice.amount}</p>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
        <CustomLink href={`/invoices/${invoice._id}`}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`View invoice ${invoice.invoiceNumber}`}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </CustomLink>
      </div>
    </div>
  );
});

InvoiceItem.displayName = "InvoiceItem";

// Memoized state components
const ErrorState = memo(() => (
  <Card className="p-6">
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Ghost className="animate-bounce w-8 h-8" />
        </EmptyMedia>
        <EmptyTitle>Chyba</EmptyTitle>
        <EmptyDescription>Nepodarilo sa načítať faktúry</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={() => window.location.reload()}>Znova načítať</Button>
      </EmptyContent>
    </Empty>
  </Card>
));

const EmptyState = memo(() => (
  <Card className="p-6">
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Ghost />
        </EmptyMedia>
        <EmptyTitle>Žiadne faktúry</EmptyTitle>
        <EmptyDescription>
          Nie sú dostupné žiadne posledné faktúry
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CustomLink href="/invoices">
          <Button>Pridať faktúru</Button>
        </CustomLink>
      </EmptyContent>
    </Empty>
  </Card>
));

const LoadingState = memo(() => (
  <Card className="p-6">
    <div className="flex justify-center items-center min-h-[200px]">
      <Spinner />
    </div>
  </Card>
));

ErrorState.displayName = "ErrorState";
EmptyState.displayName = "EmptyState";
LoadingState.displayName = "LoadingState";

// Main Component
export const RecentInvoices = () => {
  const { data: invoices, isLoading, isError } = useRecentInvoices();

  // Memoize the invoices list to prevent unnecessary re-renders
  const invoiceItems = useMemo(
    () =>
      invoices?.map((invoice: RecentInvoice) => (
        <InvoiceItem key={invoice._id} invoice={invoice} />
      )) || [],
    [invoices],
  );

  // Early returns for different states
  if (isLoading) return <LoadingState />;
  if (isError || !invoices) return <ErrorState />;
  if (invoices.length === 0) return <EmptyState />;

  return (
    <Card className="p-6 bg-gradient-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Posledné faktúry</h2>
        <CustomLink href="/invoices">
          <Button variant="outline">Zobraziť všetky</Button>
        </CustomLink>
      </div>

      <div className="space-y-4">{invoiceItems}</div>
    </Card>
  );
};

export default memo(RecentInvoices);
