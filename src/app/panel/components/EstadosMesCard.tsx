import { CheckCircle2, XCircle, UserX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PanelCard } from "./PanelCard";
import type { EstadosCitas } from "@/lib/actions/metricas";

interface EstadosMesCardProps {
  estados: EstadosCitas;
  periodoLabel?: string;
}

interface Cell {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "green" | "red" | "amber";
}

const TONE_CLASS: Record<Cell["tone"], { ring: string; icon: string; value: string }> = {
  green: {
    ring: "border-emerald-400/35 bg-emerald-400/5",
    icon: "text-emerald-300",
    value: "text-emerald-200",
  },
  red: {
    ring: "border-red-400/35 bg-red-400/5",
    icon: "text-red-300",
    value: "text-red-200",
  },
  amber: {
    ring: "border-amber-400/40 bg-amber-400/5",
    icon: "text-amber-300",
    value: "text-amber-200",
  },
};

export function EstadosMesCard({
  estados,
  periodoLabel = "mes",
}: EstadosMesCardProps) {
  const cells: Cell[] = [
    {
      label: "Completadas",
      value: estados.completadas,
      icon: CheckCircle2,
      tone: "green",
    },
    {
      label: "Canceladas",
      value: estados.canceladas,
      icon: XCircle,
      tone: "red",
    },
    {
      label: "No asistió",
      value: estados.noAsistio,
      icon: UserX,
      tone: "amber",
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="panel-label">Estado de citas · {periodoLabel}</span>
      </div>
      <PanelCard className="grid grid-cols-3 divide-x divide-white/8">
        {cells.map((c) => {
          const Icon = c.icon;
          const tone = TONE_CLASS[c.tone];
          return (
            <div
              key={c.label}
              className="flex flex-col items-center gap-2 px-2 py-4"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border ${tone.ring}`}
              >
                <Icon className={`h-4 w-4 ${tone.icon}`} strokeWidth={1.75} />
              </span>
              <span
                className={`font-serif text-[26px] leading-none ${tone.value}`}
              >
                {c.value}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/55">
                {c.label}
              </span>
            </div>
          );
        })}
      </PanelCard>
    </section>
  );
}
