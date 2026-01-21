import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

type Datum = Record<string, number | string>;

interface BarChartAnimatedProps<T extends Datum> {
  className?: string;
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  height?: number;
  label?: string;
}

function PremiumTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;

  return (
    <div className="glass glass-border rounded-xl px-3 py-2 shadow-3d">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground">{typeof v === "number" ? v.toLocaleString("ru-RU") : v}</div>
    </div>
  );
}

export function BarChartAnimated<T extends Datum>({ className, data, xKey, yKey, height = 180, label }: BarChartAnimatedProps<T>) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const gradientId = useMemo(() => `barGrad-${String(xKey)}-${String(yKey)}`, [xKey, yKey]);

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.95} />
              <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 8" stroke="hsl(var(--border) / 0.4)" vertical={false} />
          <XAxis dataKey={String(xKey)} axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={40} />
          <Tooltip content={<PremiumTooltip />} cursor={{ fill: "hsl(var(--gold) / 0.06)" }} />
          {label ? (
            <Legend
              verticalAlign="top"
              height={28}
              formatter={() => <span className="text-xs text-muted-foreground">{label}</span>}
            />
          ) : null}
          <Bar
            dataKey={String(yKey)}
            fill={`url(#${gradientId})`}
            radius={[10, 10, 10, 10]}
            animationDuration={650}
            onMouseEnter={(_d, idx) => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
            opacity={1}
            shape={(props: any) => {
              const { x, y, width, height, index } = props;
              const isActive = activeIndex === null || activeIndex === index;
              const opacity = isActive ? 1 : 0.35;
              return (
                <g>
                  <rect x={x} y={y} width={width} height={height} rx={10} ry={10} fill={`url(#${gradientId})`} opacity={opacity} />
                </g>
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
