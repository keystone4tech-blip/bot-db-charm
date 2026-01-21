import React, { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

type Datum = Record<string, number | string>;

interface LiveLineChartProps<T extends Datum> {
  className?: string;
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  height?: number;
}

function PremiumTooltip<T extends Datum>({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;

  return (
    <div className="glass glass-border rounded-xl px-3 py-2 shadow-3d">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground">{typeof v === "number" ? v.toFixed(2) : v}</div>
    </div>
  );
}

export function LiveLineChart<T extends Datum>({ className, data, xKey, yKey, height = 140 }: LiveLineChartProps<T>) {
  const gradientId = useMemo(() => `lineGrad-${String(xKey)}-${String(yKey)}`, [xKey, yKey]);

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.32} />
              <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 8" stroke="hsl(var(--border) / 0.4)" vertical={false} />
          <XAxis
            dataKey={String(xKey)}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            width={40}
          />
          <Tooltip content={<PremiumTooltip />} cursor={{ stroke: "hsl(var(--gold) / 0.25)", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey={String(yKey)}
            fill={`url(#${gradientId})`}
            stroke="none"
            isAnimationActive
            animationDuration={650}
          />
          <Line
            type="monotone"
            dataKey={String(yKey)}
            stroke="hsl(var(--gold))"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(var(--gold))" }}
            animationDuration={650}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
