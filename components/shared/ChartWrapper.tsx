"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartPoint } from "@/lib/types/shared";

interface ChartWrapperProps {
  title: string;
  data: ChartPoint[];
  color?: string;
}

export function ChartWrapper({ title, data, color = "var(--accent)" }: ChartWrapperProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <p className="mb-4 text-sm font-medium text-foreground">{title}</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--muted)" />
            <YAxis tick={{ fontSize: 12 }} stroke="var(--muted)" />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
