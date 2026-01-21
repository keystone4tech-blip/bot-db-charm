import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive/15 text-destructive",
        outline: "bg-transparent text-foreground border-border/60",
        gradient: "border-transparent text-white bg-[var(--gradient-gold)] shadow-card-gold",
        success: "border-transparent bg-success/15 text-success",
        warning: "border-transparent bg-warning/15 text-warning",
      },
      pulse: {
        true: "pulse-soft",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      pulse: false,
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, pulse, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, pulse }), className)} {...props} />;
}

export { Badge, badgeVariants };
