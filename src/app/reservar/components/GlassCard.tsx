import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "subtle" | "default" | "solid";
  interactive?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = "default",
  interactive = false,
  ...rest
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "edge-card",
        variant === "solid" && "edge-card--solid",
        variant === "subtle" && "edge-card--subtle",
        interactive && "edge-card-interactive cursor-pointer",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
