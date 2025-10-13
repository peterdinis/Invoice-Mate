"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const statusConfig = {
  paid: {
    label: "Zaplatené",
    className: "bg-success/10 text-success hover:bg-success/20",
  },
  pending: {
    label: "Čakajúce",
    className: "bg-warning/10 text-warning hover:bg-warning/20",
  },
  overdue: {
    label: "Po splatnosti",
    className: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  },
};

export const RecentInvoices = () => {
  const { data: invoices, isLoading, isError } = useRecentInvoices();

  if (isLoading)
    return (
      <Card className="p-6">
        <Spinner />
      </Card>
    );

  if (isError || !invoices)
    return (
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
            <Button>Znova načítať</Button>
          </EmptyContent>
        </Empty>
      </Card>
    );

  if (invoices.length === 0)
    return (
      <Card className="p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Ghost />
            </EmptyMedia>
            <EmptyTitle>Žiadne faktúry</EmptyTitle>
            <EmptyDescription>Nie sú dostupné žiadne posledné faktúry</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CustomLink href="/invoices">
              <Button>Pridať faktúru</Button>
            </CustomLink>
          </EmptyContent>
        </Empty>
      </Card>
    );

  return (
    <Card className="p-6 bg-gradient-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Posledné faktúry</h2>
        <CustomLink href="/invoices">
          <Button variant="outline">Zobraziť všetky</Button>
        </CustomLink>
      </div>

      <div className="space-y-4">
        {invoices.map((invoice: any) => (
          <div
            key={invoice._id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-semibold text-foreground">{invoice.invoiceNumber}</p>
                <Badge
                  className={
                    statusConfig[invoice.status as keyof typeof statusConfig].className
                  }
                >
                  {
                    statusConfig[invoice.status as keyof typeof statusConfig].label
                  }
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-bold text-foreground">{invoice.amount}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </p>
              </div>
              <CustomLink href={`/invoices/${invoice._id}`}>
                <Button variant="ghost" size="icon">
                  <Eye className="w-4 h-4" />
                </Button>
              </CustomLink>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentInvoices;
