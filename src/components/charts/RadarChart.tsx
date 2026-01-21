import React, { useMemo } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

type Datum = Record<string, number | string>;

interface RadarChartProps<T extends Datum> {
  className?: string;
  data: T[];
  labelKey: keyof T;
  valueKey: keyof T;
  height?: number;
}

export function RadarChart<T extends Datum>({ className, data, labelKey, valueKey, height = 260 }: RadarChartProps<T>) {
  const gradientId = useMemo(() => `radarGrad-${String(labelKey)}-${String(valueKey)}`, [labelKey, valueKey]);

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <defs>
            <radialGradient id={gradientId} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity={0.05} />
            </radialGradient>
          </defs>
          <PolarGrid stroke="hsl(var(--border) / 0.45)" />
          <PolarAngleAxis dataKey={String(labelKey)} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
          <PolarRadiusAxis angle={90} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
          <Radar
            dataKey={String(valueKey)}
            stroke="hsl(var(--gold))"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            dot={{ r: 3, fill: "hsl(var(--gold))" }}
            isAnimationActive
            animationDuration={650}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
