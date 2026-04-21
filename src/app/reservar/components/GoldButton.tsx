"use client";

import { cn } from "@/lib/utils";
import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline";
}

export function GoldButton({
  children,
  className,
  variant = "primary",
  onClick,
  disabled,
  type = "button",
  ...rest
}: GoldButtonProps) {
  const [clicked, setClicked] = useState(false);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    setClicked(true);
    window.setTimeout(() => setClicked(false), 220);
    onClick?.(e);
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      data-state={clicked ? "clicked" : undefined}
      className={cn(
        "glow-btn",
        variant === "outline" && "glow-btn-outline",
        className,
      )}
      {...rest}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
