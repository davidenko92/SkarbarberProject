"use client";

import { getDiasLlenos } from "@/lib/actions/reservas";
import type { HorarioLaboral } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { GoldButton } from "../components/GoldButton";

interface StepDiaProps {
  horario: HorarioLaboral;
  empleadoId: string;
  duracionMin: number;
  fechaSeleccionada: string | null;
  onSelect: (fecha: string) => void;
  onContinue: () => void;
}

const DIAS_CORTOS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"] as const;
const DIAS_KEYS: Array<keyof HorarioLaboral> = [
  "dom",
  "lun",
  "mar",
  "mie",
  "jue",
  "vie",
  "sab",
];

function formatFechaISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function StepDia({
  horario,
  empleadoId,
  duracionMin,
  fechaSeleccionada,
  onSelect,
  onContinue,
}: StepDiaProps) {
  const [offsetSemana, setOffsetSemana] = useState(0);
  const [diasLlenos, setDiasLlenos] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelado = false;
    getDiasLlenos({ empleadoId, duracionMin, diasAFuturo: 28 })
      .then((fechas) => {
        if (!cancelado) setDiasLlenos(new Set(fechas));
      })
      .catch(() => {
        if (!cancelado) setDiasLlenos(new Set());
      });
    return () => {
      cancelado = true;
    };
  }, [empleadoId, duracionMin]);

  const dias = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const lista: Array<{
      fecha: string;
      dow: number;
      numero: number;
      cerrado: boolean;
      lleno: boolean;
    }> = [];
    for (let i = 0; i < 28; i++) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + i);
      const dow = d.getDay();
      const tramos = horario[DIAS_KEYS[dow]];
      const cerrado = !Array.isArray(tramos) || tramos.length === 0;
      const fecha = formatFechaISO(d);
      lista.push({
        fecha,
        dow,
        numero: d.getDate(),
        cerrado,
        lleno: !cerrado && diasLlenos.has(fecha),
      });
    }
    return lista;
  }, [horario, diasLlenos]);

  const diasVisibles = dias.slice(offsetSemana * 7, offsetSemana * 7 + 7);
  const hayMasAtras = offsetSemana > 0;
  const hayMasAdelante = (offsetSemana + 1) * 7 < dias.length;

  return (
    <div className="animate-step-in flex flex-1 flex-col">
      <header className="mb-8">
        <span className="eyebrow">Paso 03 · Día</span>
        <h1 className="display-serif mt-3 text-[44px] text-white">
          ¿Qué día
          <br />
          te <em>viene bien</em>?
        </h1>
      </header>

      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOffsetSemana((o) => Math.max(0, o - 1))}
          disabled={!hayMasAtras}
          aria-label="Semana anterior"
          className="group flex h-11 w-11 items-center justify-center rounded-full border border-gold/55 bg-black/40 text-gold backdrop-blur-sm shadow-[0_0_12px_rgba(196,164,98,0.15)] transition-all hover:border-gold hover:bg-gold/15 hover:shadow-[0_0_16px_rgba(196,164,98,0.3)] disabled:border-gold/15 disabled:bg-transparent disabled:opacity-30 disabled:shadow-none"
        >
          <svg
            className="h-5 w-5 transition-transform group-hover:-translate-x-0.5 group-disabled:translate-x-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M15 19l-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
          </svg>
        </button>
        <span className="text-[12px] font-semibold uppercase tracking-[0.32em] text-gold">
          Semana {offsetSemana + 1}
        </span>
        <button
          type="button"
          onClick={() => setOffsetSemana((o) => o + 1)}
          disabled={!hayMasAdelante}
          aria-label="Semana siguiente"
          className="group flex h-11 w-11 items-center justify-center rounded-full border border-gold/55 bg-black/40 text-gold backdrop-blur-sm shadow-[0_0_12px_rgba(196,164,98,0.15)] transition-all hover:border-gold hover:bg-gold/15 hover:shadow-[0_0_16px_rgba(196,164,98,0.3)] disabled:border-gold/15 disabled:bg-transparent disabled:opacity-30 disabled:shadow-none"
        >
          <svg
            className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-disabled:translate-x-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 5l7 7-7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {diasVisibles.map((d) => {
          const seleccionado = d.fecha === fechaSeleccionada;
          const disabled = d.cerrado || d.lleno;
          return (
            <button
              key={d.fecha}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(d.fecha)}
              title={
                d.cerrado
                  ? "Cerrado"
                  : d.lleno
                    ? "Sin huecos disponibles"
                    : undefined
              }
              className={[
                "relative flex h-[74px] flex-col items-center justify-center rounded-xl border transition-all",
                seleccionado
                  ? "border-gold bg-gradient-to-b from-gold to-gold-dark text-black shadow-[0_0_22px_rgba(196,164,98,0.4)]"
                  : "border-gold/15 bg-black/30 text-white hover:-translate-y-[1px] hover:border-gold/55 hover:bg-black/50 hover:shadow-[0_0_18px_-6px_rgba(196,164,98,0.35)]",
                disabled &&
                  "!border-white/10 !bg-black/20 !text-white/40 cursor-not-allowed hover:!border-white/10 hover:!bg-black/20 hover:!translate-y-0 hover:!shadow-none",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                className={[
                  "text-[9.5px] font-semibold tracking-[0.18em]",
                  seleccionado
                    ? "text-black/75"
                    : disabled
                      ? "text-white/45"
                      : "text-white/55",
                ].join(" ")}
              >
                {DIAS_CORTOS[d.dow]}
              </span>
              <span
                className={[
                  "text-xl font-medium",
                  disabled &&
                    "line-through decoration-white/60 decoration-[1.5px]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {d.numero}
              </span>
              {seleccionado && (
                <span className="pointer-events-none absolute inset-x-5 bottom-1 h-px bg-black/30" />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-center text-[11px] font-medium tracking-[0.2em] text-white/65 uppercase">
        Los días tachados están cerrados o sin huecos
      </p>

      <div className="mt-auto pt-8">
        <GoldButton onClick={onContinue} disabled={!fechaSeleccionada}>
          Continuar
        </GoldButton>
      </div>
    </div>
  );
}
