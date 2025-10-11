"use client";

import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { FC, useEffect, useState } from "react";
import { ModeToggle } from "../shared/ModeToggle";
import { usePathname, useRouter } from "next/navigation";
import CustomLink from "../shared/CustomLink";
import ProfileDropdown from "../auth/ProfileDropdown";

const DashboardNavigation: FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/get-session");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setIsAuthenticated(true);
          } else {
            router.push("/auth");
          }
        } else {
          router.push("/auth");
        }
      } catch (err) {
        console.error("Auth check failed", err);
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/invoices", label: "Faktúry", icon: FileText },
    { path: "/clients", label: "Klienti", icon: Users },
  ];

  if (loading) {
    return (
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="w-32 h-8 bg-muted animate-pulse rounded" />
            <div className="w-64 h-8 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </nav>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <CustomLink href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl bg-gradient-primary bg-clip-text">
              Invoice Mate
            </span>
          </CustomLink>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.path ||
                (item.path !== "/" && pathname.startsWith(item.path));

              return (
                <CustomLink key={item.path} href={item.path}>
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
                </CustomLink>
              );
            })}
            <ModeToggle />
            {isAuthenticated && <ProfileDropdown />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavigation;