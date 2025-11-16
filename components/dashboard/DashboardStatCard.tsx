import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DashboardStatCardProps } from "@/types/DashboardTypes";

const VARIANT_CLASSES = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

export const DashboardStatCard = memo(
  ({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    variant = "default",
  }: DashboardStatCardProps) => {
    const trendClass = trendUp ? "text-success" : "text-muted-foreground";

    return (
      <Card className="p-6 bg-gradient-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <p className={cn("text-sm font-medium", trendClass)}>{trend}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", VARIANT_CLASSES[variant])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </Card>
    );
  },
);
