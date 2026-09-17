"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/types/shared";

interface ChartWrapperProps {
  title: string;
  data: ChartPoint[];
  color?: string;
  /** Defaults to "bar" — existing bar-chart callers are unaffected by this prop. */
  type?: "bar" | "line" | "pie";
}

const PIE_COLORS = [
  "var(--accent)",
  "var(--muted)",
  "#94a3b8",
  "#cbd5e1",
  "#64748b",
  "#334155",
];

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
};

export function ChartWrapper({ title, data, color = "var(--accent)", type = "bar" }: ChartWrapperProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <p className="mb-4 text-sm font-medium text-foreground">{title}</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--muted)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--muted)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          ) : type === "pie" ? (
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Pie data={data} dataKey="value" nameKey="label" outerRadius={90} label>
                {data.map((entry, index) => (
                  <Cell key={entry.label} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--muted)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--muted)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
