import type { HTMLAttributes, ReactNode } from "react";

interface PanelCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  active?: boolean;
  selected?: boolean;
}

export function PanelCard({
  children,
  active = false,
  selected = false,
  className = "",
  ...rest
}: PanelCardProps) {
  const classes = [
    "panel-card",
    active ? "pulse-gold" : "",
    selected ? "conic-border" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
