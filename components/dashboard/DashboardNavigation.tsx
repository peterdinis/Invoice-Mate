"use client";

import { FC, Suspense, memo, useMemo, useState, SVGProps } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Users, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../shared/ModeToggle";
import { usePathname, useRouter } from "next/navigation";
import CustomLink from "../shared/CustomLink";
import dynamic from "next/dynamic";
import { Spinner } from "../ui/spinner";
import { useSession } from "@/hooks/auth/useSession";
import { motion, AnimatePresence } from "framer-motion";

const ProfileDropdown = dynamic(() => import("../auth/ProfileDropdown"), {
  ssr: false,
});

interface NavItemProps {
  path: string;
  label: string;
  Icon: FC<SVGProps<SVGSVGElement>>;
  isActive: boolean;
  onClick?: () => void;
}
const NavItem: FC<NavItemProps> = memo(
  ({ path, label, Icon, isActive, onClick }) => (
    <CustomLink href={path}>
      <Button
        onClick={onClick}
        variant={isActive ? "default" : "ghost"}
        className={cn(
          "gap-2 w-full justify-start md:w-auto",
          !isActive && "text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon className="w-4 h-4" />
        {label}
      </Button>
    </CustomLink>
  ),
);

const DashboardNavigation: FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading, isError } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);

  if (isError || (!isLoading && !data?.user)) {
    if (typeof window !== "undefined") router.push("/");
    return null;
  }

  const navItems = useMemo(
    () => [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/invoices", label: "Faktúry", icon: FileText },
      { path: "/clients", label: "Klienti", icon: Users },
    ],
    [],
  );

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive =
                pathname === path ||
                (path !== "/" && pathname.startsWith(path));

              return (
                <NavItem
                  key={path}
                  path={path}
                  label={label}
                  Icon={Icon}
                  isActive={isActive}
                />
              );
            })}

            <ModeToggle />

            <Suspense fallback={<Spinner />}>
              <ProfileDropdown />
            </Suspense>
          </div>

          {/* Mobile Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen((p) => !p)}
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* MOBILE MENU PANEL */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-border bg-card"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive =
                  pathname === path ||
                  (path !== "/" && pathname.startsWith(path));

                return (
                  <NavItem
                    key={path}
                    path={path}
                    label={label}
                    Icon={Icon}
                    isActive={isActive}
                    onClick={() => setMenuOpen(false)}
                  />
                );
              })}

              <div className="flex items-center justify-between pt-4">
                <ModeToggle />
                <Suspense fallback={<Spinner />}>
                  <ProfileDropdown />
                </Suspense>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default memo(DashboardNavigation);
