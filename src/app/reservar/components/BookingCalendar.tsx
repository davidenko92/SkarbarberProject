"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HorarioLaboral } from "@/lib/types";

interface BookingCalendarProps {
  fechaSeleccionada: string | null;
  horario: HorarioLaboral;
  diasLlenos: Set<string>;
  diasFuturos: number;
  onSelect: (fecha: string) => void;
}

const DIAS_KEYS_DOW: Array<keyof HorarioLaboral> = [
  "dom",
  "lun",
  "mar",
  "mie",
  "jue",
  "vie",
  "sab",
];

const MES_LARGO = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DIA_LETRA = ["L", "M", "X", "J", "V", "S", "D"];

function fmtISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function diaSemanaLunIdx(d: Date) {
  const dow = d.getDay();
  return dow === 0 ? 6 : dow - 1;
}

export function BookingCalendar({
  fechaSeleccionada,
  horario,
  diasLlenos,
  diasFuturos,
  onSelect,
}: BookingCalendarProps) {
  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const limite = useMemo(() => {
    const d = new Date(hoy);
    d.setDate(d.getDate() + diasFuturos);
    return d;
  }, [hoy, diasFuturos]);

  const inicialMes = useMemo(
    () =>
      fechaSeleccionada
        ? startOfMonth(new Date(`${fechaSeleccionada}T00:00:00`))
        : startOfMonth(hoy),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [mesActual, setMesActual] = useState<Date>(inicialMes);

  const semanas = useMemo(() => {
    const inicio = startOfMonth(mesActual);
    const offset = diaSemanaLunIdx(inicio);
    const grid: Array<Array<Date>> = [];
    const cursor = new Date(inicio);
    cursor.setDate(cursor.getDate() - offset);
    for (let s = 0; s < 6; s++) {
      const fila: Array<Date> = [];
      for (let d = 0; d < 7; d++) {
        fila.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      grid.push(fila);
    }
    return grid;
  }, [mesActual]);

  function shiftMes(delta: number) {
    setMesActual(
      new Date(mesActual.getFullYear(), mesActual.getMonth() + delta, 1),
    );
  }

  const mesPrevDisabled = startOfMonth(mesActual) <= startOfMonth(hoy);
  const mesNextDisabled =
    new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1) > limite;

  return (
    <div className="booking-calendar">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMes(-1)}
          disabled={mesPrevDisabled}
          aria-label="Mes anterior"
          className="dial-arrow !h-10 !w-10 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={1.85} />
        </button>
        <span className="font-serif text-[19px] tracking-tight text-white">
          {MES_LARGO[mesActual.getMonth()]}{" "}
          <span className="text-gold/85">{mesActual.getFullYear()}</span>
        </span>
        <button
          type="button"
          onClick={() => shiftMes(1)}
          disabled={mesNextDisabled}
          aria-label="Mes siguiente"
          className="dial-arrow !h-10 !w-10 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.85} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 px-1 pb-2">
        {DIA_LETRA.map((l) => (
          <span
            key={l}
            className="text-center text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gold/55"
          >
            {l}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 px-1">
        {semanas.flat().map((d, i) => {
          const fueraMes = d.getMonth() !== mesActual.getMonth();
          const iso = fmtISO(d);
          const esHoy = iso === fmtISO(hoy);
          const pasado = d < hoy;
          const fueraRango = d > limite;
          const tramos = horario[DIAS_KEYS_DOW[d.getDay()]];
          const cerrado = !Array.isArray(tramos) || tramos.length === 0;
          const lleno = !cerrado && !pasado && !fueraRango && diasLlenos.has(iso);
          const disabled = pasado || fueraRango || cerrado || lleno;
          const seleccionado = iso === fechaSeleccionada;

          let cls = "calendar-day calendar-day--booking";
          if (seleccionado) cls += " calendar-day--selected";
          if (esHoy && !seleccionado) cls += " calendar-day--today";
          if (fueraMes && !seleccionado) cls += " calendar-day--out";
          if (cerrado || (lleno && !pasado))
            cls += " calendar-day--blocked";

          function handleClick() {
            if (disabled) return;
            if (fueraMes) setMesActual(startOfMonth(d));
            onSelect(iso);
          }

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={handleClick}
              title={
                cerrado
                  ? "Cerrado"
                  : lleno
                    ? "Sin huecos"
                    : pasado
                      ? "Pasado"
                      : undefined
              }
              className={cls}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[10.5px] uppercase tracking-[0.22em] text-white/55">
        Días tachados están cerrados o sin huecos
      </p>
    </div>
  );
}
