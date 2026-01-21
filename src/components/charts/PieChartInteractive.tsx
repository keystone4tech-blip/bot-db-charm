import React, { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { cn } from "@/lib/utils";

type PieDatum = {
  name: string;
  value: number;
  color?: string;
};

interface PieChartInteractiveProps {
  className?: string;
  data: PieDatum[];
  height?: number;
}

export function PieChartInteractive({ className, data, height = 220 }: PieChartInteractiveProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const palette = useMemo(
    () => [
      "hsl(var(--gold))",
      "hsl(var(--accent))",
      "hsl(var(--success))",
      "hsl(var(--warning))",
      "hsl(var(--muted-foreground))",
    ],
    [],
  );

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="46%"
            innerRadius={48}
            outerRadius={78}
            paddingAngle={2}
            onMouseEnter={(_, idx) => setActiveIndex(idx)}
            activeIndex={activeIndex}
            activeShape={(props: any) => {
              const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
              return (
                <g>
                  <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 10}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                  />
                  <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={outerRadius + 12}
                    outerRadius={outerRadius + 14}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    opacity={0.35}
                  />
                </g>
              );
            }}
            animationDuration={650}
          >
            {data.map((entry, idx) => (
              <Cell key={`${entry.name}-${idx}`} fill={entry.color ?? palette[idx % palette.length]} opacity={idx === activeIndex ? 1 : 0.75} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {data.map((item, idx) => {
          const c = item.color ?? palette[idx % palette.length];
          const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
          const pct = Math.round((item.value / total) * 100);
          const isActive = idx === activeIndex;

          return (
            <button
              key={item.name}
              type="button"
              className={cn(
                "glass glass-border rounded-xl px-3 py-2 text-left transition-all",
                isActive ? "shadow-3d" : "opacity-90 hover:opacity-100",
              )}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                  <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                </div>
                <span className="text-xs font-semibold">{pct}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
