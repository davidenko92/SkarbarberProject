import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "subtle" | "default" | "solid" | "feature";
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
        variant === "feature" && "edge-card--feature",
        interactive && "edge-card-interactive cursor-pointer",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
