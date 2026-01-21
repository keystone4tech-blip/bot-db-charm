import { cn } from "@/lib/utils";

type GlassOptions = {
  border?: boolean;
  hover3d?: boolean;
  noise?: boolean;
};

export function glassClass({ border = true, hover3d = true, noise = false }: GlassOptions = {}) {
  return cn(
    "glass",
    border && "glass-border",
    hover3d && "hover-3d",
    noise && "bg-noise",
  );
}

export function gradientGoldClass() {
  return "gradient-gold";
}

export function glowGoldClass() {
  return "glow-gold";
}
