import type { LucideIcon } from "lucide-react";
import { BarberChairIcon } from "./BarberChairIcon";

interface EmptyStateProps {
  icon?: LucideIcon;
  variant?: "default" | "shrine";
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  variant,
  title,
  description,
  action,
}: EmptyStateProps) {
  const resolvedVariant = variant ?? (Icon ? "default" : "shrine");
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-14 text-center">
      {resolvedVariant === "shrine" ? (
        <span className="empty-shrine text-gold/85">
          <BarberChairIcon size={84} />
          <span className="star" style={{ top: "12%", left: "18%" }} />
          <span
            className="star"
            style={{ top: "20%", right: "14%", width: 3, height: 3 }}
          />
          <span
            className="star"
            style={{ bottom: "16%", left: "22%", width: 3, height: 3 }}
          />
          <span
            className="star"
            style={{ bottom: "10%", right: "20%", width: 5, height: 5 }}
          />
          <span
            className="star"
            style={{ top: "50%", right: "6%", width: 2.5, height: 2.5 }}
          />
        </span>
      ) : Icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/25 bg-gold/5">
          <Icon className="h-6 w-6 text-gold/70" strokeWidth={1.5} />
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-serif text-[22px] leading-none text-white">
          {title}
        </h3>
        {description && (
          <p className="max-w-[260px] text-[13px] leading-relaxed text-white/55">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
