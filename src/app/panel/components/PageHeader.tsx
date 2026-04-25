import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="flex items-end justify-between gap-4 pb-4">
      <div className="flex flex-col gap-1.5">
        {eyebrow && <span className="panel-label">{eyebrow}</span>}
        <h1 className="panel-title">{title}</h1>
        {subtitle && (
          <span className="text-[12px] text-white/50">{subtitle}</span>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
