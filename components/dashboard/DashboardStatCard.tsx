import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  variant?: "default" | "success" | "warning";
}

export const DashboardStatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  variant = "default",
}: DashboardStatCardProps) => {
  const variantClasses = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <Card className="p-6 bg-gradient-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-sm font-medium",
                trendUp ? "text-success" : "text-muted-foreground"
              )}
            >
              {trend}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", variantClasses[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
