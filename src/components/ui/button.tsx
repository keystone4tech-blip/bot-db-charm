import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "button-press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-card-gold hover:-translate-y-0.5 hover:shadow-3d active:translate-y-0",
        secondary:
          "bg-secondary text-secondary-foreground shadow-card hover:-translate-y-0.5 hover:shadow-3d active:translate-y-0",
        outline:
          "border border-input bg-background/50 backdrop-blur-sm hover:bg-accent/20 hover:text-foreground hover:-translate-y-0.5 hover:shadow-3d",
        ghost: "hover:bg-accent/20 hover:text-foreground",
        gradient:
          "text-white shadow-card-gold hover:-translate-y-0.5 hover:shadow-3d active:translate-y-0 bg-[var(--gradient-gold)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:-translate-y-0.5 hover:shadow-3d",
        link: "text-primary underline-offset-4 hover:underline",

        default:
          "bg-primary text-primary-foreground shadow-card-gold hover:-translate-y-0.5 hover:shadow-3d active:translate-y-0",
        gold:
          "text-white shadow-card-gold hover:-translate-y-0.5 hover:shadow-3d active:translate-y-0 bg-[var(--gradient-gold)]",
        glass:
          "glass glass-border text-foreground shadow-card hover:-translate-y-0.5 hover:shadow-3d active:translate-y-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, loadingText, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="animate-spin" /> : null}
        {isLoading && loadingText ? loadingText : children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
