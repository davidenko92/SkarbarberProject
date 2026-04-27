import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/25 bg-gold/5">
          <Icon className="h-6 w-6 text-gold/70" strokeWidth={1.5} />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-serif text-white">{title}</h3>
        {description && (
          <p className="text-sm text-white/55 max-w-[260px]">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
