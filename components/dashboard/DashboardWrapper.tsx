"use client";

import { FC, Suspense } from "react";
import DashboardNavigation from "./DashboardNavigation";
import { Button } from "../ui/button";
import { Clock, DollarSign, FileText, Plus, TrendingUp } from "lucide-react";
import { DashboardStatCard } from "./DashboardStatCard";
import { RevenueChart } from "./RevenueChart";
import { RecentInvoices } from "../invoices/RecentInvoices";
import { InvoiceStatusChart } from "../invoices/InvoiceStatusChart";
import CustomLink from "../shared/CustomLink";
import { Spinner } from "../ui/spinner";
import { useInvoiceStats } from "@/hooks/invoices/useInvoicesStats";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const DashboardWrapper: FC = () => {
  const { data: stats, isLoading, isError } = useInvoiceStats();

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
              <CustomLink href="/invoices/new">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="gap-2" size="lg">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Nová faktúra
                  </TooltipContent>
                </Tooltip>
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
              />
              <DashboardStatCard
                title="Čakajúce"
                value={`${stats?.thisMonthInvoices || 0} faktúr`}
                icon={Clock}
                variant="warning"
              />
              <DashboardStatCard
                title="Zaplatené tento mesiac"
                value={`€${stats?.thisMonthRevenue.toLocaleString("sk-SK", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || "0"}`}
                icon={TrendingUp}
                variant="success"
              />
              <DashboardStatCard
                title="Celkom faktúr"
                value={`${stats?.totalInvoices || 0}`}
                icon={FileText}
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
