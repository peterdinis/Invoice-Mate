"use client";

import { FC, Suspense } from "react";
import DashboardNavigation from "./DashboardNavigation";
import { Button } from "../ui/button";
import {
  Clock,
  DollarSign,
  Download,
  FileText,
  Plus,
  TrendingUp,
} from "lucide-react";
import { DashboardStatCard } from "./DashboardStatCard";
import { RevenueChart } from "./RevenueChart";
import { RecentInvoices } from "../invoices/RecentInvoices";
import { InvoiceStatusChart } from "../invoices/InvoiceStatusChart";
import CustomLink from "../shared/CustomLink";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Spinner } from "../ui/spinner";
import { useInvoiceStats } from "@/hooks/invoices/useInvoicesStats";

const reportData = [
  { faktura: "001", klient: "Firma A", suma: 1200, stav: "Zaplatené" },
  { faktura: "002", klient: "Firma B", suma: 800, stav: "Čaká" },
  { faktura: "003", klient: "Firma C", suma: 450, stav: "Zaplatené" },
];

const DashboardWrapper: FC = () => {
  const { data: stats, isLoading, isError } = useInvoiceStats();

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Report Faktúr", 14, 22);

    const headers = [["Faktúra", "Klient", "Suma", "Stav"]];
    const rows = reportData.map((r) => [r.faktura, r.klient, r.suma, r.stav]);

    let startY = 30;
    rows.forEach((row, index) => {
      doc.text(row.join(" | "), 14, startY + index * 10);
    });

    doc.save("report.pdf");
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "report.xlsx");
  };

  if (isLoading) {
    return (
      <Suspense fallback={<Spinner />}>
        <DashboardNavigation />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Spinner />
        </main>
      </Suspense>
    );
  }

  if (isError) {
    return (
      <Suspense fallback={<Spinner />}>
        <DashboardNavigation />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-destructive">Chyba pri načítaní štatistík</p>
        </main>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Spinner />}>
      <DashboardNavigation />
      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Komplexný prehľad vašich fakúr a príjmov
              </p>
            </div>
            <nav aria-label="dashboard actions" className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-5 h-5" />
                    Stiahnuť report
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={downloadPDF}>PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadExcel}>
                    Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <CustomLink href="/invoices/new">
                <Button className="gap-2" size="lg">
                  <Plus className="w-5 h-5" />
                  Nová faktúra
                </Button>
              </CustomLink>
            </nav>
          </header>

          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">
              Štatistiky
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardStatCard
                title="Celkový príjem"
                value={`€${stats?.totalRevenue.toLocaleString("sk-SK", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || "0"}`}
                icon={DollarSign}
                trend={`${stats?.revenueChange! > 0 ? "+" : ""}${stats?.revenueChange || 0}%`}
                trendUp={stats?.revenueChange! > 0}
              />
              <DashboardStatCard
                title="Čakajúce"
                value={`€${stats?.thisMonthRevenue.toLocaleString("sk-SK", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || "0"}`}
                icon={Clock}
                trend={`${stats?.thisMonthInvoices || 0} faktúr`}
                variant="warning"
              />
              <DashboardStatCard
                title="Zaplatené tento mesiac"
                value={`€${stats?.thisMonthRevenue.toLocaleString("sk-SK", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || "0"}`}
                icon={TrendingUp}
                trend={`${stats?.revenueChange! > 0 ? "+" : ""}${stats?.revenueChange || 0}%`}
                trendUp={stats?.revenueChange! > 0}
                variant="success"
              />
              <DashboardStatCard
                title="Celkom faktúr"
                value={`${stats?.totalInvoices || 0}`}
                icon={FileText}
                trend={`${stats?.invoiceChange! > 0 ? "+" : ""}${stats?.invoiceChange || 0} tento mesiac`}
              />
            </div>
          </section>

          <div className="grid grid-cols-1  lg:grid-cols-2 gap-6 mb-8">
            <RevenueChart />
            <InvoiceStatusChart />
          </div>

          <RecentInvoices />
        </section>
      </main>
    </Suspense>
  );
};

export default DashboardWrapper;
