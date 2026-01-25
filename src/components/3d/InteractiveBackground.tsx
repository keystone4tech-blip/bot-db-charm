import React, { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

interface InteractiveBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: number;
}

export function InteractiveBackground({ className, children, intensity = 1 }: InteractiveBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);

  const supportsFinePointer = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia?.("(pointer: fine)")?.matches ?? true;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !supportsFinePointer) return;

    let raf = 0;

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        el.style.setProperty("--mx", `${x}`);
        el.style.setProperty("--my", `${y}`);
      });
    };

    el.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
    };
  }, [supportsFinePointer]);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={
        (supportsFinePointer
          ? undefined
          : ({
              ["--mx" as never]: "0.5",
              ["--my" as never]: "0.5",
            } as React.CSSProperties))
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(
              900px circle at calc(var(--mx, 0.5) * 100%) calc(var(--my, 0.5) * 100%),
              hsl(var(--gold) / ${0.18 * intensity}),
              transparent 55%
            ),
            radial-gradient(
              650px circle at calc((1 - var(--mx, 0.5)) * 100%) calc((1 - var(--my, 0.5)) * 100%),
              hsl(var(--accent) / ${0.12 * intensity}),
              transparent 58%
            ),
            linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background)) 100%)
          `,
          filter: "blur(0px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 mix-blend-overlay"
        style={{
          background: `linear-gradient(135deg, transparent 0%, hsl(var(--gold) / ${0.08 * intensity}) 35%, transparent 70%)`,
          transform: "translate3d(0,0,0)",
        }}
      />

      <div className="relative">{children}</div>
    </div>
  );
}

// Компонент с резервным вариантом для случаев ошибок
export const SafeInteractiveBackground = ({ className, children, intensity = 1 }: InteractiveBackgroundProps) => {
  try {
    return <InteractiveBackground className={className} children={children} intensity={intensity} />;
  } catch (error) {
    console.error("InteractiveBackground error:", error);
    // Возвращаем простой фон вместо 3D эффекта
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-background to-secondary/20" />
        <div className="relative">{children}</div>
      </div>
    );
  }
};
