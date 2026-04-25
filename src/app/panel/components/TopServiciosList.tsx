import { Scissors, Clock } from "lucide-react";
import type { TopServicio } from "@/lib/actions/metricas";

interface TopServiciosListProps {
  servicios: TopServicio[];
}

export function TopServiciosList({ servicios }: TopServiciosListProps) {
  if (servicios.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <span className="panel-label">Top servicios — este mes</span>
        <p className="panel-card p-4 text-[12px] text-white/50">
          Aún no hay datos del mes.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <span className="panel-label">Top servicios — este mes</span>
      <ul className="flex flex-col gap-2">
        {servicios.map((s, i) => (
          <li
            key={s.id}
            className="panel-card flex items-center gap-3 px-4 py-3"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-gold/10 font-serif text-[12px] text-gold">
              {i + 1}
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-black/40 text-gold">
              <Scissors className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[14px] font-medium text-white">
                {s.nombre}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-white/50">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" strokeWidth={1.75} />
                  {s.duracion} min
                </span>
                <span>·</span>
                <span>
                  {s.veces} {s.veces === 1 ? "vez" : "veces"}
                </span>
              </div>
            </div>
            <span className="font-serif text-[16px] tabular-nums text-gold/90">
              {Math.round(s.ingresos)}€
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
