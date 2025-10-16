import { LucideIcon } from "lucide-react";

export interface DashboardStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  variant?: "default" | "success" | "warning";
}