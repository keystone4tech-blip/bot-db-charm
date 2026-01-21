import React, { useMemo } from "react";
import { animated, useSpring } from "@react-spring/web";
import { cn } from "@/lib/utils";

interface NumberCounterProps {
  value: number;
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
}

export function NumberCounter({
  value,
  className,
  decimals = 0,
  prefix = "",
  suffix = "",
  durationMs = 900,
}: NumberCounterProps) {
  const formatter = useMemo(() => {
    return new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, [decimals]);

  const spring = useSpring({
    from: { n: 0 },
    to: { n: value },
    config: { duration: durationMs },
    reset: false,
  });

  return (
    <animated.span className={cn("tabular-nums", className)}>
      {spring.n.to((n) => `${prefix}${formatter.format(n)}${suffix}`)}
    </animated.span>
  );
}
