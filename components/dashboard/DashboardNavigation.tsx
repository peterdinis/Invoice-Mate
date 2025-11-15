"use client";

import { FC, Suspense, memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../shared/ModeToggle";
import { usePathname, useRouter } from "next/navigation";
import CustomLink from "../shared/CustomLink";
import dynamic from "next/dynamic";
import { Spinner } from "../ui/spinner";
import { useSession } from "@/hooks/auth/useSession";

// Lazy load heavy components
const ProfileDropdown = dynamic(() => import("../auth/ProfileDropdown"), { ssr: false });

// Memoized NavItem to avoid re-renders
interface NavItemProps {
  path: string;
  label: string;
  Icon: FC<React.SVGProps<SVGSVGElement>>;
  isActive: boolean;
}
const NavItem: FC<NavItemProps> = memo(({ path, label, Icon, isActive }) => (
  <CustomLink href={path}>
    <Button
      variant={isActive ? "default" : "ghost"}
      className={cn("gap-2", !isActive && "text-muted-foreground hover:text-foreground")}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Button>
  </CustomLink>
));

const DashboardNavigation: FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading, isError } = useSession();

  // Redirect if session fails
  if (isError || (!isLoading && !data?.user)) {
    if (typeof window !== "undefined") router.push("/");
    return null;
  }

  // Navigation items memoized
  const navItems = useMemo(
    () => [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/invoices", label: "Faktúry", icon: FileText },
      { path: "/clients", label: "Klienti", icon: Users },
    ],
    []
  );

  // Show spinner while loading
  if (isLoading) {
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

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl bg-gradient-primary bg-clip-text">
              Invoice Mate
            </span>
          </div>

          {/* Nav Items */}
          <div className="flex items-center gap-2">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive =
                pathname === path || (path !== "/" && pathname.startsWith(path));
              return (
                <NavItem key={path} path={path} label={label} Icon={Icon} isActive={isActive} />
              );
            })}
            <ModeToggle />
            <Suspense fallback={<Spinner />}>
              <ProfileDropdown />
            </Suspense>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default memo(DashboardNavigation);
