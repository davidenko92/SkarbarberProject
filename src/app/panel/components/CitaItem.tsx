"use client";

import type { Cita, CitaConDetalles } from "@/lib/types";

interface CitaItemProps {
  cita: CitaConDetalles;
  proxima: boolean;
  onClick: () => void;
}

function formatHora(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const ESTADO_STYLE: Record<
  Cita["estado"],
  { card: string; price: string; badge: string | null }
> = {
  confirmada: {
    card: "",
    price: "text-gold",
    badge: null,
  },
  completada: {
    card: "opacity-70",
    price: "text-emerald-300/90 line-through decoration-emerald-400/40",
    badge: "Completada",
  },
  cancelada: {
    card: "opacity-50 grayscale",
    price: "text-red-300/70 line-through decoration-red-400/60",
    badge: "Cancelada",
  },
  no_asistio: {
    card: "opacity-60",
    price: "text-orange-300/80",
    badge: "No vino",
  },
};

export function CitaItem({ cita, proxima, onClick }: CitaItemProps) {
  const style = ESTADO_STYLE[cita.estado];
  const activo = proxima && cita.estado === "confirmada";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`panel-card relative flex w-full items-center gap-4 px-4 py-3.5 text-left transition-all active:scale-[0.99] ${
        activo ? "pulse-gold" : ""
      } ${style.card}`}
    >
      <div className="flex min-w-[58px] flex-col items-center justify-center border-r border-gold/15 pr-4">
        <span className="font-serif text-xl leading-none text-white">
          {formatHora(cita.inicio)}
        </span>
        <span className="mt-1 text-[9px] uppercase tracking-[0.22em] text-white/40">
          {cita.servicio?.duracion ?? 30}min
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[15px] font-medium text-white">
          {cita.cliente?.nombre ?? "Cliente"}
        </span>
        <span className="truncate text-[12px] text-white/55">
          {cita.servicio?.nombre ?? "Servicio"} · {cita.empleado?.nombre ?? "—"}
        </span>
        {style.badge && (
          <span className="mt-1 inline-flex w-fit rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] text-white/55">
            {style.badge}
          </span>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className={`font-serif text-base leading-none ${style.price}`}>
          {Number(cita.servicio?.precio ?? 0)}€
        </span>
        {activo && (
          <span className="text-[9px] uppercase tracking-[0.22em] text-gold/80">
            Siguiente
          </span>
        )}
      </div>
    </button>
  );
}
