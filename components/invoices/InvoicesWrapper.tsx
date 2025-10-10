"use client";

import { FC, useState } from "react";
import DashboardNavigation from "../dashboard/DashboardNavigation";
import { Plus, Search, Badge, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import Link from "next/link";
import { Input } from "../ui/input";

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
  {
    id: "INV-005",
    client: "Consulting Firm",
    amount: "$4,560",
    status: "pending",
    date: "2025-09-25",
  },
  {
    id: "INV-006",
    client: "E-commerce Store",
    amount: "$8,920",
    status: "paid",
    date: "2025-09-22",
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

const InvoicesWrapper: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  return (
    <>
      <DashboardNavigation />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Faktúry
              </h1>
              <p className="text-muted-foreground mt-2">
                Spravujte a sledujte všetky vaše faktúry
              </p>
            </div>
            <Link href="/invoices/new">
              <Button className="gap-2" size="lg">
                <Plus className="w-5 h-5" />
                Nová faktúra
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-card lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Priečinky</h3>
                Folder DIALOG TODO
              </div>
              FOLDER LIST TODO
            </Card>

            <Card className="p-6 bg-gradient-card lg:col-span-3">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Hľadať faktúry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Číslo
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Klient
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Suma
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Stav
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Dátum
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                        Akcie
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-4 px-4 font-medium text-foreground">
                          {invoice.id}
                        </td>
                        <td className="py-4 px-4 text-foreground">
                          {invoice.client}
                        </td>
                        <td className="py-4 px-4 font-semibold text-foreground">
                          {invoice.amount}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className={
                              statusConfig[
                                invoice.status as keyof typeof statusConfig
                              ].className
                            }
                          >
                            {
                              statusConfig[
                                invoice.status as keyof typeof statusConfig
                              ].label
                            }
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {invoice.date}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end gap-2">
                            <Link href={`/invoices/${invoice.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/invoices/${invoice.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicesWrapper;
