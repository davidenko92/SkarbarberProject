"use client";

import { Plus, X } from "lucide-react";
import type { HorarioLaboral, HorarioTramo } from "@/lib/types";

type Dia = keyof HorarioLaboral;

const DIAS: { key: Dia; label: string }[] = [
  { key: "lun", label: "Lunes" },
  { key: "mar", label: "Martes" },
  { key: "mie", label: "Miércoles" },
  { key: "jue", label: "Jueves" },
  { key: "vie", label: "Viernes" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

interface HorarioEditorProps {
  value: HorarioLaboral;
  onChange: (h: HorarioLaboral) => void;
  readOnly?: boolean;
}

export function HorarioEditor({ value, onChange, readOnly }: HorarioEditorProps) {
  function setDia(dia: Dia, tramos: HorarioTramo[] | null) {
    onChange({ ...value, [dia]: tramos });
  }

  function toggleAbierto(dia: Dia) {
    const actual = value[dia];
    if (actual && actual.length > 0) {
      setDia(dia, null);
    } else {
      setDia(dia, [{ apertura: "10:00", cierre: "14:00" }]);
    }
  }

  function addTramo(dia: Dia) {
    const actual = value[dia] ?? [];
    setDia(dia, [...actual, { apertura: "16:00", cierre: "20:00" }]);
  }

  function removeTramo(dia: Dia, idx: number) {
    const actual = value[dia] ?? [];
    const nuevos = actual.filter((_, i) => i !== idx);
    setDia(dia, nuevos.length > 0 ? nuevos : null);
  }

  function updateTramo(
    dia: Dia,
    idx: number,
    patch: Partial<HorarioTramo>,
  ) {
    const actual = value[dia] ?? [];
    const nuevos = actual.map((t, i) => (i === idx ? { ...t, ...patch } : t));
    setDia(dia, nuevos);
  }

  return (
    <div className="flex flex-col gap-2">
      {DIAS.map(({ key, label }) => {
        const tramos = value[key];
        const abierto = Array.isArray(tramos) && tramos.length > 0;
        return (
          <div
            key={key}
            className="rounded-2xl border border-white/10 bg-black/40 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[14px] font-medium text-white">
                {label}
              </span>
              <button
                type="button"
                disabled={readOnly}
                role="switch"
                aria-checked={abierto}
                onClick={() => toggleAbierto(key)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition-colors disabled:opacity-40 ${
                  abierto
                    ? "border-gold/50 bg-gradient-to-r from-gold-light to-gold-dark"
                    : "border-white/10 bg-white/15"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.35)] transition-transform duration-200 ${
                    abierto ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {abierto && tramos && (
              <div className="mt-3 flex flex-col gap-2">
                {tramos.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/30 px-2.5 py-2"
                  >
                    <TimeInput
                      value={t.apertura}
                      onChange={(v) => updateTramo(key, i, { apertura: v })}
                      readOnly={readOnly}
                    />
                    <span className="text-white/40">–</span>
                    <TimeInput
                      value={t.cierre}
                      onChange={(v) => updateTramo(key, i, { cierre: v })}
                      readOnly={readOnly}
                    />
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => removeTramo(key, i)}
                        aria-label="Quitar tramo"
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/50 hover:border-red-400/40 hover:text-red-300"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    )}
                  </div>
                ))}
                {!readOnly && tramos.length < 3 && (
                  <button
                    type="button"
                    onClick={() => addTramo(key)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gold/30 py-1.5 text-[11px] uppercase tracking-[0.22em] text-gold/70 hover:border-gold/60 hover:text-gold"
                  >
                    <Plus className="h-3 w-3" strokeWidth={2.25} />
                    Añadir tramo
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TimeInput({
  value,
  onChange,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      step={900}
      className="rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 text-[13px] tabular-nums text-white focus:border-gold/50 focus:outline-none disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
    />
  );
}
