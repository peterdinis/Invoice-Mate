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
    <Card style={{ padding: "1.5rem" }}>
      <h3 style={{ 
        fontSize: "1.125rem", 
        fontWeight: 600, 
        marginBottom: "1rem" 
      }}>
        Vývoj príjmov
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb"
            opacity={0.3}
          />

          <XAxis
            dataKey="month"
            stroke="#e5e7eb"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            tickLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            stroke="#e5e7eb"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            tickLine={{ stroke: "#e5e7eb" }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelStyle={{
              color: "#111827",
              fontWeight: 600,
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "#8b5cf6",
            }}
            formatter={(value: number) => `€${value.toLocaleString()}`}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#8b5cf6"
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