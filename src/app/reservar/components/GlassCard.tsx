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
  const variants = {
    subtle: "",
    default: "",
    solid:
      "!bg-[linear-gradient(180deg,rgba(20,17,10,0.82),rgba(8,8,9,0.88))] !border-gold/30",
  } as const;

  return (
    <div
      className={cn(
        "edge-card",
        interactive && "edge-card-interactive cursor-pointer",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
