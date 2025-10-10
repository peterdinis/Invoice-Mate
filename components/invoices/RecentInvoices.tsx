import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import Link from "next/link";
import CustomLink from "../shared/CustomLink";

const mockInvoices = [
  {
    id: "INV-001",
    client: "Acme Corporation",
    amount: "$5,280",
    status: "paid",
    date: "2025-10-05",
  },
  {
    id: "INV-002",
    client: "Tech Startup Inc",
    amount: "$3,420",
    status: "pending",
    date: "2025-10-03",
  },
  {
    id: "INV-003",
    client: "Design Studio LLC",
    amount: "$7,890",
    status: "paid",
    date: "2025-10-01",
  },
  {
    id: "INV-004",
    client: "Marketing Agency",
    amount: "$2,150",
    status: "overdue",
    date: "2025-09-28",
  },
];

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
  return (
    <Card className="p-6 bg-gradient-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Posledné faktúry</h2>
        <CustomLink href="/invoices">
          <Button variant="outline">Zobraziť všetky</Button>
        </CustomLink>
      </div>

      <div className="space-y-4">
        {mockInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-semibold text-foreground">{invoice.id}</p>
                <Badge
                  className={
                    statusConfig[invoice.status as keyof typeof statusConfig]
                      .className
                  }
                >
                  {
                    statusConfig[invoice.status as keyof typeof statusConfig]
                      .label
                  }
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{invoice.client}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-bold text-foreground">{invoice.amount}</p>
                <p className="text-sm text-muted-foreground">{invoice.date}</p>
              </div>
              <CustomLink href={`/invoices/${invoice.id}`}>
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
