import React from "react";
import { cn } from "@/lib/utils";

interface LightRaysProps {
  className?: string;
  intensity?: number;
}

export function LightRays({ className, intensity = 1 }: LightRaysProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{
        opacity: 0.85,
      }}
    >
      <div
        className="absolute -inset-[40%] animate-spin-slow"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, transparent 0%, hsl(var(--gold) / 0.18) 18%, transparent 40%, hsl(var(--gold) / 0.1) 58%, transparent 75%, hsl(var(--gold) / 0.16) 92%, transparent 100%)",
          filter: `blur(${22 * intensity}px)`,
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px circle at 50% 30%, hsl(var(--gold) / 0.16), transparent 60%)",
          filter: `blur(${14 * intensity}px)`,
          opacity: 0.65,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
