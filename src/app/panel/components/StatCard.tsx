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
    <PanelCard className="p-4 flex items-start justify-between gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="panel-label">{label}</span>
        <span
          className={`text-3xl font-light tracking-tight ${
            accent ? "text-gold" : "text-white"
          }`}
        >
          {value}
        </span>
      </div>
      {Icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-gold/5">
          <Icon className="h-4 w-4 text-gold" strokeWidth={1.5} />
        </div>
      )}
    </PanelCard>
  );
}
