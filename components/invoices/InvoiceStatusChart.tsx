"use client";

import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const data = [
  { name: "Zaplatené", value: 92, color: "hsl(var(--success))" },
  { name: "Čakajúce", value: 48, color: "hsl(var(--warning))" },
  { name: "Po splatnosti", value: 16, color: "hsl(var(--destructive))" },
];

export const InvoiceStatusChart = () => {
  return (
    <Card className="p-6 bg-gradient-card">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Stav faktúr
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
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
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};
