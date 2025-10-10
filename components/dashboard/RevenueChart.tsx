
"use client";  

import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Máj", revenue: 12400 },
  { month: "Jún", revenue: 18200 },
  { month: "Júl", revenue: 15800 },
  { month: "Aug", revenue: 22100 },
  { month: "Sep", revenue: 19500 },
  { month: "Okt", revenue: 28450 },
];

export const RevenueChart = () => {
  return (
    <Card className="p-6 bg-gradient-card">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Vývoj príjmov
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            opacity={0.3}
          />

          <XAxis
            dataKey="month"
            stroke="hsl(var(--border))"
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis
            stroke="hsl(var(--border))"
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--card-foreground))",
            }}
            labelStyle={{
              color: "hsl(var(--card-foreground))",
              fontWeight: 600,
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "hsl(var(--primary))",
            }}
            formatter={(value: number) => `€${value.toLocaleString()}`}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};