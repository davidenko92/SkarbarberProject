"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DateRangeCalendarProps {
  desde: string | null;
  hasta: string | null;
  onApply: (desde: string, hasta: string) => void;
  onClear: () => void;
}

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

const MES_CORTO = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const DIA_LETRA = ["L", "M", "X", "J", "V", "S", "D"];

function fmtISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISO(s: string | null): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return new Date(`${s}T00:00:00`);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function fmtCorto(d: Date): string {
  return `${d.getDate()} ${MES_CORTO[d.getMonth()]}`;
}

function diaSemanaLunIdx(d: Date) {
  const dow = d.getDay();
  return dow === 0 ? 6 : dow - 1;
}

export function DateRangeCalendar({
  desde,
  hasta,
  onApply,
  onClear,
}: DateRangeCalendarProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const desdeDate = parseISO(desde);
  const hastaDate = parseISO(hasta);

  const [draftDesde, setDraftDesde] = useState<Date | null>(desdeDate);
  const [draftHasta, setDraftHasta] = useState<Date | null>(hastaDate);
  const [mesActual, setMesActual] = useState<Date>(
    () => startOfMonth(desdeDate ?? new Date()),
  );
  const [hoverDay, setHoverDay] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function recompute() {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const margin = 12;
      const desiredWidth = Math.max(r.width, 340);
      const maxWidth = window.innerWidth - margin * 2;
      const width = Math.min(desiredWidth, maxWidth);
      let left = r.left;
      if (left + width > window.innerWidth - margin) {
        left = Math.max(margin, window.innerWidth - margin - width);
      }
      const top = r.bottom + 8;
      setCoords({ top, left, width });
    }
    recompute();
    window.addEventListener("scroll", recompute, true);
    window.addEventListener("resize", recompute);
    return () => {
      window.removeEventListener("scroll", recompute, true);
      window.removeEventListener("resize", recompute);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setDraftDesde(desdeDate);
      setDraftHasta(hastaDate);
      setMesActual(startOfMonth(desdeDate ?? new Date()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleDayClick(d: Date) {
    if (!draftDesde || (draftDesde && draftHasta)) {
      setDraftDesde(d);
      setDraftHasta(null);
    } else if (d < draftDesde) {
      setDraftDesde(d);
      setDraftHasta(null);
    } else {
      setDraftHasta(d);
    }
  }

  const semanas = useMemo(() => {
    const inicio = startOfMonth(mesActual);
    const offset = diaSemanaLunIdx(inicio);
    const grid: Array<Array<Date | null>> = [];
    let cursor = new Date(inicio);
    cursor.setDate(cursor.getDate() - offset);
    for (let s = 0; s < 6; s++) {
      const fila: Array<Date | null> = [];
      for (let d = 0; d < 7; d++) {
        fila.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      grid.push(fila);
    }
    return grid;
  }, [mesActual]);

  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  function isInRange(d: Date): boolean {
    if (!draftDesde) return false;
    const fin = draftHasta ?? hoverDay;
    if (!fin) return false;
    const lo = draftDesde < fin ? draftDesde : fin;
    const hi = draftDesde < fin ? fin : draftDesde;
    return d > lo && d < hi;
  }

  function isStart(d: Date): boolean {
    return Boolean(draftDesde && fmtISO(d) === fmtISO(draftDesde));
  }

  function isEnd(d: Date): boolean {
    return Boolean(draftHasta && fmtISO(d) === fmtISO(draftHasta));
  }

  function shiftMes(delta: number) {
    setMesActual(
      new Date(mesActual.getFullYear(), mesActual.getMonth() + delta, 1),
    );
  }

  function aplicar() {
    if (!draftDesde || !draftHasta) return;
    onApply(fmtISO(draftDesde), fmtISO(draftHasta));
    setOpen(false);
  }

  function limpiar() {
    setDraftDesde(null);
    setDraftHasta(null);
    onClear();
  }

  function setRangoRapido(dias: number) {
    const fin = new Date(hoy);
    const ini = new Date(hoy);
    ini.setDate(ini.getDate() - (dias - 1));
    setDraftDesde(ini);
    setDraftHasta(fin);
    setMesActual(startOfMonth(ini));
  }

  const triggerLabel =
    desdeDate && hastaDate
      ? `${fmtCorto(desdeDate)} → ${fmtCorto(hastaDate)}`
      : "Selecciona un rango";

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-[13px] transition-colors ${
          desdeDate && hastaDate
            ? "border-gold/55 bg-gold/8 text-gold"
            : "border-white/10 bg-black/40 text-white/65 hover:border-gold/40"
        }`}
      >
        <span className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" strokeWidth={1.85} />
          {triggerLabel}
        </span>
        {desdeDate && hastaDate && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Limpiar rango"
            onClick={(e) => {
              e.stopPropagation();
              limpiar();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                limpiar();
              }
            }}
            className="flex h-5 w-5 items-center justify-center rounded-full text-gold/70 hover:bg-gold/15 hover:text-gold"
          >
            <X className="h-3 w-3" strokeWidth={2.2} />
          </span>
        )}
      </button>

      {open &&
        mounted &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            className="calendar-popover"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 1000,
            }}
          >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMes(-1)}
              aria-label="Mes anterior"
              className="dial-arrow !h-9 !w-9"
            >
              <ChevronLeft className="h-[16px] w-[16px]" strokeWidth={1.85} />
            </button>
            <span className="font-serif text-[17px] tracking-tight text-white">
              {MES_LARGO[mesActual.getMonth()]}{" "}
              <span className="text-gold/80">{mesActual.getFullYear()}</span>
            </span>
            <button
              type="button"
              onClick={() => shiftMes(1)}
              aria-label="Mes siguiente"
              className="dial-arrow !h-9 !w-9"
            >
              <ChevronRight className="h-[16px] w-[16px]" strokeWidth={1.85} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 px-1 pb-1.5">
            {DIA_LETRA.map((l) => (
              <span
                key={l}
                className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/55"
              >
                {l}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 px-1">
            {semanas.flat().map((d, i) => {
              if (!d)
                return <span key={i} className="aspect-square" />;
              const fueraMes = d.getMonth() !== mesActual.getMonth();
              const esHoy = fmtISO(d) === fmtISO(hoy);
              const start = isStart(d);
              const end = isEnd(d);
              const inRange = isInRange(d);
              const selected = start || end;

              let cls = "calendar-day";
              if (selected) cls += " calendar-day--selected";
              else if (inRange) cls += " calendar-day--range";
              if (esHoy && !selected) cls += " calendar-day--today";
              if (fueraMes) cls += " calendar-day--out";

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDayClick(d)}
                  onMouseEnter={() => setHoverDay(d)}
                  onMouseLeave={() => setHoverDay(null)}
                  className={cls}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 px-1">
            <button
              type="button"
              onClick={() => setRangoRapido(7)}
              className="filter-pill"
              style={{ fontSize: 11 }}
            >
              7 días
            </button>
            <button
              type="button"
              onClick={() => setRangoRapido(30)}
              className="filter-pill"
              style={{ fontSize: 11 }}
            >
              30 días
            </button>
            <button
              type="button"
              onClick={() => setRangoRapido(90)}
              className="filter-pill"
              style={{ fontSize: 11 }}
            >
              90 días
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-gold/12 pt-3 px-1">
            <button
              type="button"
              onClick={() => {
                setDraftDesde(null);
                setDraftHasta(null);
              }}
              className="text-[11.5px] uppercase tracking-[0.22em] text-white/55 hover:text-gold/85"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={aplicar}
              disabled={!draftDesde || !draftHasta}
              className={`filter-pill ${
                draftDesde && draftHasta ? "filter-pill--active" : ""
              }`}
              style={{
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontSize: 11,
              }}
            >
              Aplicar
            </button>
          </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
