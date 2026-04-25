import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ListItemProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  leadingIcon?: LucideIcon;
  trailing?: ReactNode;
  onClick?: () => void;
  href?: string;
  active?: boolean;
}

export function ListItem({
  title,
  subtitle,
  leading,
  leadingIcon: LeadingIcon,
  trailing,
  onClick,
  active = false,
}: ListItemProps) {
  const content = (
    <>
      {leading ||
        (LeadingIcon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/5">
            <LeadingIcon className="h-5 w-5 text-gold" strokeWidth={1.5} />
          </div>
        ))}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="text-[15px] font-medium text-white truncate">{title}</span>
        {subtitle && (
          <span className="text-[13px] text-white/55 truncate">{subtitle}</span>
        )}
      </div>
      {trailing || (
        <ChevronRight
          className="h-4 w-4 text-white/30 shrink-0"
          strokeWidth={1.5}
        />
      )}
    </>
  );

  const classes = `panel-card flex items-center gap-3 px-4 py-3 w-full text-left ${
    active ? "pulse-gold" : ""
  }`;

  return (
    <button type="button" className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
