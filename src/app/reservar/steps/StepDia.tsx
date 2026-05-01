"use client";

import { getDiasLlenos, getSlotsDisponibles } from "@/lib/actions/reservas";
import type { HorarioLaboral } from "@/lib/types";
import { useEffect, useState } from "react";
import { GoldButton } from "../components/GoldButton";
import { StepHeading } from "../components/StepHeading";
import { BookingCalendar } from "../components/BookingCalendar";

interface StepDiaProps {
  horario: HorarioLaboral;
  empleadoId: string;
  duracionMin: number;
  fechaSeleccionada: string | null;
  horaSeleccionada: string | null;
  onSelectFecha: (fecha: string) => void;
  onSelectHora: (hora: string) => void;
  onContinue: () => void;
}

const DIAS_FUTURO = 60;

export function StepDia({
  horario,
  empleadoId,
  duracionMin,
  fechaSeleccionada,
  horaSeleccionada,
  onSelectFecha,
  onSelectHora,
  onContinue,
}: StepDiaProps) {
  const [diasLlenos, setDiasLlenos] = useState<Set<string>>(new Set());
  const [slots, setSlots] = useState<string[] | null>(null);
  const [errorSlots, setErrorSlots] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    getDiasLlenos({ empleadoId, duracionMin, diasAFuturo: DIAS_FUTURO })
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

  useEffect(() => {
    if (!fechaSeleccionada) {
      setSlots(null);
      setErrorSlots(null);
      return;
    }
    let cancelado = false;
    setSlots(null);
    setErrorSlots(null);
    getSlotsDisponibles({ empleadoId, fecha: fechaSeleccionada, duracionMin })
      .then((res) => {
        if (!cancelado) setSlots(res);
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          const msg = e instanceof Error ? e.message : "Error cargando horas";
          setErrorSlots(msg);
          setSlots([]);
        }
      });
    return () => {
      cancelado = true;
    };
  }, [empleadoId, fechaSeleccionada, duracionMin]);

  const manana = (slots ?? []).filter((s) => Number(s.slice(0, 2)) < 14);
  const tarde = (slots ?? []).filter((s) => Number(s.slice(0, 2)) >= 14);

  const fechaLegible = fechaSeleccionada
    ? new Date(`${fechaSeleccionada}T00:00:00`).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <div className="animate-step-in flex flex-1 flex-col">
      <StepHeading
        eyebrow="Paso 03 · Día y hora"
        title={
          <>
            ¿Qué día <em>y hora</em>?
          </>
        }
      />

      <section className="step-block">
        <div className="step-block-header">
          <span className="step-block-eyebrow">01 · Día</span>
          <span className="step-block-title">Elige una fecha</span>
        </div>
        <BookingCalendar
          fechaSeleccionada={fechaSeleccionada}
          horario={horario}
          diasLlenos={diasLlenos}
          diasFuturos={DIAS_FUTURO}
          onSelect={onSelectFecha}
        />
      </section>

      {fechaSeleccionada && (
        <>
          <div className="step-block-divider" aria-hidden />

          <section className="step-block step-block--accent">
            <div className="step-block-header">
              <span className="step-block-eyebrow">02 · Hora</span>
              <span className="step-block-title">
                Horas <em>disponibles</em>
              </span>
              {fechaLegible && (
                <span className="step-block-meta">{fechaLegible}</span>
              )}
            </div>

            {slots === null && (
              <p className="py-6 text-center text-[12.5px] uppercase tracking-[0.18em] text-white/50">
                Cargando horas…
              </p>
            )}

            {slots !== null && slots.length === 0 && !errorSlots && (
              <p className="py-6 text-center text-[13px] tracking-[0.05em] text-white/65">
                No quedan huecos ese día. Prueba otra fecha.
              </p>
            )}

            {errorSlots && (
              <p className="py-6 text-center text-sm text-red-400">{errorSlots}</p>
            )}

            {slots && slots.length > 0 && (
              <div className="space-y-7">
                {manana.length > 0 && (
                  <div>
                    <div className="section-label">
                      <span className="section-label-text">Mañana</span>
                      <span className="section-label-line" />
                    </div>
                    <SlotGrid
                      slots={manana}
                      seleccionada={horaSeleccionada}
                      onSelect={onSelectHora}
                    />
                  </div>
                )}
                {tarde.length > 0 && (
                  <div>
                    <div className="section-label">
                      <span className="section-label-text">Tarde</span>
                      <span className="section-label-line" />
                    </div>
                    <SlotGrid
                      slots={tarde}
                      seleccionada={horaSeleccionada}
                      onSelect={onSelectHora}
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}

      <div className="mt-auto pt-8">
        <GoldButton
          onClick={onContinue}
          disabled={!fechaSeleccionada || !horaSeleccionada}
        >
          Continuar
        </GoldButton>
      </div>
    </div>
  );
}

interface SlotGridProps {
  slots: string[];
  seleccionada: string | null;
  onSelect: (h: string) => void;
}

function SlotGrid({ slots, seleccionada, onSelect }: SlotGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {slots.map((h) => {
        const activo = h === seleccionada;
        return (
          <button
            key={h}
            type="button"
            onClick={() => onSelect(h)}
            className={[
              "edge-tile rounded-full py-3 font-serif text-[16px] font-normal leading-none tracking-wide",
              activo ? "edge-tile--soft-gold" : "text-white/90",
            ].join(" ")}
          >
            {h}
          </button>
        );
      })}
    </div>
  );
}
