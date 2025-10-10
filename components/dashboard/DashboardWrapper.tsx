import { FC } from "react";
import DashboardNavigation from "./DashboardNavigation";
import { Button } from "../ui/button";
import Link from "next/link";
import { Clock, DollarSign, Download, FileText, Plus, TrendingUp } from "lucide-react";
import { DashboardStatCard } from "./DashboardStatCard";
import { RevenueChart } from "./RevenueChart";
import { InvoiceStatusChart } from "./InvoiceStatusChart";

const DashboardWrapper: FC = () => {
    return (
        <>
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
                            <Button variant="outline" className="gap-2">
                                <Download className="w-5 h-5" />
                                Stiahnuť report
                            </Button>
                            <Link href="/invoices/new">
                                <Button className="gap-2" size="lg">
                                    <Plus className="w-5 h-5" />
                                    Nová faktúra
                                </Button>
                            </Link>
                        </nav>
                    </header>

                    <section aria-labelledby="stats-heading">
                        <h2 id="stats-heading" className="sr-only">
                            Štatistiky
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <DashboardStatCard
                                title="Celkový príjem"
                                value="€48,574"
                                icon={DollarSign}
                                trend="+12.5%"
                                trendUp={true}
                            />
                            <DashboardStatCard
                                title="Čakajúce"
                                value="€12,340"
                                icon={Clock}
                                trend="8 faktúr"
                                variant="warning"
                            />
                            <DashboardStatCard
                                title="Zaplatené tento mesiac"
                                value="€28,450"
                                icon={TrendingUp}
                                trend="+8.2%"
                                trendUp={true}
                                variant="success"
                            />
                            <DashboardStatCard
                                title="Celkom faktúr"
                                value="156"
                                icon={FileText}
                                trend="+23 tento mesiac"
                            />
                        </div>
                    </section>

                <div className="grid grid-cols-1  lg:grid-cols-2 gap-6 mb-8">
                    <RevenueChart />
                    <InvoiceStatusChart />
                </div>
                </section>
            </main>
        </>
    )
}

export default DashboardWrapper;
