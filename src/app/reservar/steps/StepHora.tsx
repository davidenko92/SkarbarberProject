"use client";

import { getSlotsDisponibles } from "@/lib/actions/reservas";
import { useEffect, useState } from "react";
import { GoldButton } from "../components/GoldButton";
import { StepHeading } from "../components/StepHeading";

interface StepHoraProps {
  empleadoId: string;
  fecha: string;
  duracionMin: number;
  horaSeleccionada: string | null;
  onSelect: (hora: string) => void;
  onContinue: () => void;
}

export function StepHora({
  empleadoId,
  fecha,
  duracionMin,
  horaSeleccionada,
  onSelect,
  onContinue,
}: StepHoraProps) {
  const [slots, setSlots] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setSlots(null);
    setError(null);
    getSlotsDisponibles({ empleadoId, fecha, duracionMin })
      .then((res) => {
        if (!cancelado) setSlots(res);
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          const msg = e instanceof Error ? e.message : "Error cargando horas";
          setError(msg);
          setSlots([]);
        }
      });
    return () => {
      cancelado = true;
    };
  }, [empleadoId, fecha, duracionMin]);

  const manana = (slots ?? []).filter((s) => Number(s.slice(0, 2)) < 14);
  const tarde = (slots ?? []).filter((s) => Number(s.slice(0, 2)) >= 14);

  const fechaLegible = new Date(`${fecha}T00:00:00`).toLocaleDateString(
    "es-ES",
    { weekday: "long", day: "numeric", month: "long" },
  );

  return (
    <div className="animate-step-in flex flex-1 flex-col">
      <StepHeading
        eyebrow="Paso 04 · Hora"
        title={
          <>
            ¿A qué <em>hora</em>?
          </>
        }
        meta={fechaLegible}
      />

      {slots === null && (
        <p className="py-8 text-center text-[13px] uppercase tracking-[0.18em] text-white/50">
          Cargando horas…
        </p>
      )}

      {slots !== null && slots.length === 0 && !error && (
        <p className="py-8 text-center text-[13px] tracking-[0.05em] text-white/60">
          No quedan huecos ese día. Prueba otra fecha.
        </p>
      )}

      {error && (
        <p className="py-8 text-center text-sm text-red-400">{error}</p>
      )}

      {slots && slots.length > 0 && (
        <div className="space-y-8">
          {manana.length > 0 && (
            <section>
              <div className="section-label">
                <span className="section-label-text">Mañana</span>
                <span className="section-label-line" />
              </div>
              <SlotGrid
                slots={manana}
                seleccionada={horaSeleccionada}
                onSelect={onSelect}
              />
            </section>
          )}
          {tarde.length > 0 && (
            <section>
              <div className="section-label">
                <span className="section-label-text">Tarde</span>
                <span className="section-label-line" />
              </div>
              <SlotGrid
                slots={tarde}
                seleccionada={horaSeleccionada}
                onSelect={onSelect}
              />
            </section>
          )}
        </div>
      )}

      <div className="mt-auto pt-8">
        <GoldButton onClick={onContinue} disabled={!horaSeleccionada}>
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
            className={
              activo
                ? "rounded-full bg-gradient-to-b from-gold-light via-gold to-gold-dark py-3 text-[15px] font-semibold tracking-wide text-black shadow-[0_0_26px_rgba(196,164,98,0.5),inset_0_1px_0_rgba(255,255,255,0.4)]"
                : "rounded-full border border-gold/25 bg-black/35 py-3 text-[15px] font-medium tracking-wide text-white/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-[2px] hover:border-gold/65 hover:bg-black/55 hover:text-gold-light hover:shadow-[0_8px_20px_-8px_rgba(196,164,98,0.45)]"
            }
          >
            {h}
          </button>
        );
      })}
    </div>
  );
}
