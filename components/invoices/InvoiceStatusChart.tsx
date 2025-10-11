"use client";

import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  PieLabelRenderProps,
} from "recharts";

const data = [
  { name: "Zaplatené", value: 92, color: "#22c55e" },
  { name: "Čakajúce", value: 48, color: "#eab308" },
  { name: "Po splatnosti", value: 16, color: "#ef4444" },
];

export const InvoiceStatusChart = () => {
  return (
    <Card style={{ padding: "1.5rem" }}>
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          marginBottom: "1rem",
        }}
      >
        Stav faktúr
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: PieLabelRenderProps) => {
              const value = Number(percent ?? 0);
              return `${name ?? ""} ${(value * 100).toFixed(0)}%`;
            }}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
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
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};
