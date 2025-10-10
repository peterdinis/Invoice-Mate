"use client";

import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UrlObject } from "url";
import { FC } from "react";
import { ModeToggle } from "../shared/ModeToggle";
import { usePathname } from "next/navigation";

const DashboardNavigation: FC = () => {
  const pathname = usePathname();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/invoices", label: "Faktúry", icon: FileText },
    { path: "/clients", label: "Klienti", icon: Users },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl bg-gradient-primary bg-clip-text">
              Invoice Mate
            </span>
          </Link>

          <div className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.path ||
                (item.path !== "/" && pathname.startsWith(item.path));

              return (
                <Link key={item.path} href={item.path as unknown as UrlObject}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "gap-2",
                      !isActive &&
                        "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavigation;
