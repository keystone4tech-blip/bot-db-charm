import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.ComponentProps<"input">;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border border-input bg-background/60 backdrop-blur-sm px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:shadow-[0_0_0_6px_hsl(var(--gold)_/_0.08)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

interface InputWithIconProps extends InputProps {
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, icon, iconPosition = "left", ...props }, ref) => {
    return (
      <div className="relative">
        {icon ? (
          <div
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
              iconPosition === "left" ? "left-4" : "right-4",
            )}
          >
            {icon}
          </div>
        ) : null}
        <Input
          ref={ref}
          className={cn(icon ? (iconPosition === "left" ? "pl-11" : "pr-11") : "", className)}
          {...props}
        />
      </div>
    );
  },
);
InputWithIcon.displayName = "InputWithIcon";

interface FloatingLabelInputProps extends Omit<InputProps, "placeholder"> {
  label: string;
  icon?: React.ReactNode;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ className, label, icon, id, ...props }, ref) => {
    const inputId = id ?? React.useId();

    return (
      <div className="relative">
        <Input
          ref={ref}
          id={inputId}
          placeholder=" "
          className={cn(icon ? "pl-11" : "", "peer", className)}
          {...props}
        />
        {icon ? (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        ) : null}
        <label
          htmlFor={inputId}
          className="pointer-events-none absolute left-4 top-3 text-sm text-muted-foreground transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-foreground"
          style={icon ? { left: "2.75rem" } : undefined}
        >
          {label}
        </label>
      </div>
    );
  },
);
FloatingLabelInput.displayName = "FloatingLabelInput";

export { Input, InputWithIcon, FloatingLabelInput };
