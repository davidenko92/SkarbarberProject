"use client";

import { getDiasLlenos } from "@/lib/actions/reservas";
import type { HorarioLaboral } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { GoldButton } from "../components/GoldButton";
import { StepHeading } from "../components/StepHeading";

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
      <StepHeading
        eyebrow="Paso 03 · Día"
        title={
          <>
            ¿Qué día
            <br />
            te <em>viene bien</em>?
          </>
        }
      />

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
                "edge-tile relative flex h-[78px] flex-col items-center justify-center rounded-2xl",
                seleccionado && "edge-tile--selected",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                className={[
                  "text-[9.5px] font-semibold tracking-[0.22em]",
                  seleccionado ? "text-black/70" : "text-current opacity-65",
                ].join(" ")}
              >
                {DIAS_CORTOS[d.dow]}
              </span>
              <span
                className={[
                  "mt-0.5 font-serif text-[22px] font-normal leading-none",
                  disabled &&
                    "line-through decoration-white/45 decoration-[1.5px]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {d.numero}
              </span>
              {seleccionado && (
                <span className="pointer-events-none absolute inset-x-6 bottom-1.5 h-px bg-black/35" />
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
