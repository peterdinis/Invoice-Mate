"use client";

import { Card } from "@/components/ui/card";
import { Suspense } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  PieLabelRenderProps,
} from "recharts";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner";
import { useInvoiceStatus } from "@/hooks/invoices/useInvoiceStatus";

const fallbackData = [
  { name: "Zaplatené", value: 92, percentage: 50, color: "#22c55e" },
  { name: "Čakajúce", value: 48, percentage: 31, color: "#eab308" },
  { name: "Po splatnosti", value: 16, percentage: 10, color: "#ef4444" },
];

export const InvoiceStatusChart = () => {
  const { data, isLoading, error } = useInvoiceStatus();

  const chartData = data?.data || fallbackData;

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Stav faktúr</h3>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Načítavam dáta...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    console.error("Error loading invoice status:", error);
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-4 [--radius:1.2rem]">
          <Badge>
            <Spinner />
            Načítavam
          </Badge>
        </div>
      }
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Stav faktúr
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">
              Zobrazujem ukážkové dáta. {error.message}
            </p>
          </div>
        )}

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={120}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} faktúr`, 
                name
              ]}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                      <p className="font-medium">{data.name}</p>
                      <p className="text-sm text-gray-600">
                        {data.value} faktúr ({data.percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legenda a štatistiky */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {chartData.map((item) => (
            <div 
              key={item.name} 
              className="flex flex-col items-center p-3 rounded-lg border"
              style={{ borderColor: item.color }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-xs text-gray-500">{item.percentage}%</div>
            </div>
          ))}
        </div>

        {/* Celkový počet faktúr */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <span className="text-sm text-gray-600">Celkový počet faktúr: </span>
            <span className="text-sm font-semibold">
              {chartData.reduce((sum, item) => sum + item.value, 0)}
            </span>
          </div>
        </div>
      </Card>
    </Suspense>
  );
};