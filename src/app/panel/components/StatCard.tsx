import type { LucideIcon } from "lucide-react";
import { PanelCard } from "./PanelCard";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  accent?: boolean;
}

export function StatCard({ label, value, icon: Icon, accent = false }: StatCardProps) {
  return (
    <PanelCard className="p-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-2">
        <span className="panel-label">{label}</span>
        <span
          className={`font-serif text-[34px] leading-none tracking-tight ${
            accent ? "text-gold" : "text-white"
          }`}
        >
          {value}
        </span>
      </div>
      {Icon && (
        <span className="stat-ring shrink-0">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </span>
      )}
    </PanelCard>
  );
}
