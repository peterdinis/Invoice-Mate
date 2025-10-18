"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Edit, Mail } from "lucide-react";
import { toast } from "sonner";
import { exportInvoiceToPDF } from "@/lib/pdfs/pdfExport";
import CustomLink from "../shared/CustomLink";

const InvoiceDetail = () => {
  const { id } = useParams();

  // Mock data - would come from API/state in real app
  const invoice = {
    id: id || "INV-001",
    client: {
      name: "Acme Corporation",
      email: "contact@acme.com",
      address: "123 Business St, Tech City, TC 12345",
    },
    date: "2025-10-05",
    dueDate: "2025-11-05",
    status: "paid",
    items: [
      { description: "Website Design", quantity: 1, rate: 3500, amount: 3500 },
      { description: "Logo Design", quantity: 1, rate: 1200, amount: 1200 },
      { description: "Brand Guidelines", quantity: 1, rate: 580, amount: 580 },
    ],
    subtotal: 5280,
    tax: 0,
    total: 5280,
    notes: "Thank you for your business. Payment due within 30 days.",
  };

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

  const handleExportPDF = () => {
    exportInvoiceToPDF(invoice);
    toast.success("Faktúra bola exportovaná do PDF");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <CustomLink href="/invoices">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Button>
        </CustomLink>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {invoice.id}
            </h1>
            <Badge
              className={`mt-2 ${statusConfig[invoice.status as keyof typeof statusConfig].className}`}
            >
              {statusConfig[invoice.status as keyof typeof statusConfig].label}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Mail className="w-4 h-4" />
              Odoslať
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportPDF}
            >
              <Download className="w-4 h-4" />
              Stiahnuť PDF
            </Button>
            <CustomLink href={`/invoices/${invoice.id}/edit`}>
              <Button className="gap-2">
                <Edit className="w-4 h-4" />
                Upraviť
              </Button>
            </CustomLink>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 bg-gradient-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    OD
                  </h3>
                  <p className="font-semibold text-foreground">
                    Vaša spoločnosť
                  </p>
                  <p className="text-muted-foreground">Vaša ulica 456</p>
                  <p className="text-muted-foreground">Mesto 12345</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    PRE
                  </h3>
                  <p className="font-semibold text-foreground">
                    {invoice.client.name}
                  </p>
                  <p className="text-muted-foreground">
                    {invoice.client.email}
                  </p>
                  <p className="text-muted-foreground">
                    {invoice.client.address}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Dátum vystavenia
                  </p>
                  <p className="font-semibold text-foreground">
                    {invoice.date}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Dátum splatnosti
                  </p>
                  <p className="font-semibold text-foreground">
                    {invoice.dueDate}
                  </p>
                </div>
              </div>

              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-semibold text-muted-foreground">
                      Popis
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-muted-foreground">
                      Mn.
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-muted-foreground">
                      Cena
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-muted-foreground">
                      Suma
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="py-4 text-foreground">
                        {item.description}
                      </td>
                      <td className="py-4 text-right text-foreground">
                        {item.quantity}
                      </td>
                      <td className="py-4 text-right text-foreground">
                        €{item.rate.toFixed(2)}
                      </td>
                      <td className="py-4 text-right font-semibold text-foreground">
                        €{item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medzisúčet</span>
                    <span className="font-semibold text-foreground">
                      €{invoice.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DPH</span>
                    <span className="font-semibold text-foreground">
                      €{invoice.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-lg font-bold text-foreground">
                      Celkom
                    </span>
                    <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      €{invoice.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {invoice.notes && (
              <Card className="p-6 bg-gradient-card">
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Poznámky
                </h3>
                <p className="text-muted-foreground">{invoice.notes}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
