"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateNavigatorProps {
  fecha: string;
  onChange: (fecha: string) => void;
}

function formatISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getHoyISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return formatISO(d);
}

function shiftDays(fecha: string, delta: number) {
  const d = new Date(`${fecha}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return formatISO(d);
}

function formatLegible(fecha: string) {
  const d = new Date(`${fecha}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (d.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  if (diffDays === -1) return "Ayer";

  return d.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatSubtitulo(fecha: string) {
  const d = new Date(`${fecha}T00:00:00`);
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function DateNavigator({ fecha, onChange }: DateNavigatorProps) {
  const esHoy = fecha === getHoyISO();
  const etiqueta = formatLegible(fecha);
  const subtitulo = formatSubtitulo(fecha);

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => onChange(shiftDays(fecha, -1))}
        aria-label="Día anterior"
        className="dial-arrow shrink-0"
      >
        <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </button>

      <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-[26px] leading-none text-white">
            {etiqueta}
          </span>
          {!esHoy && (
            <button
              type="button"
              onClick={() => onChange(getHoyISO())}
              className="rounded-full border border-gold/30 bg-gold/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-gold/90 transition-colors hover:border-gold/60 hover:bg-gold/10"
            >
              Hoy
            </button>
          )}
        </div>
        <span className="truncate text-[10.5px] uppercase tracking-[0.28em] text-gold/65">
          {subtitulo}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onChange(shiftDays(fecha, 1))}
        aria-label="Día siguiente"
        className="dial-arrow shrink-0"
      >
        <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </button>
    </div>
  );
}
