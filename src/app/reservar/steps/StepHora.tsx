"use client";

import { getSlotsDisponibles } from "@/lib/actions/reservas";
import { useEffect, useState } from "react";
import { GoldButton } from "../components/GoldButton";

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
      <header className="mb-8">
        <span className="eyebrow">Paso 04 · Hora</span>
        <h1 className="display-serif mt-3 text-[44px] text-white">
          ¿A qué <em>hora</em>?
        </h1>
        <p className="mt-3 text-[13px] capitalize tracking-[0.1em] text-white/60">
          {fechaLegible}
        </p>
      </header>

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
                ? "rounded-full bg-gradient-to-b from-gold to-gold-dark py-3 text-[15px] font-semibold tracking-wide text-black shadow-[0_0_22px_rgba(196,164,98,0.45)]"
                : "rounded-full border border-gold/20 bg-black/30 py-3 text-[15px] font-medium tracking-wide text-white/90 transition-all duration-200 hover:-translate-y-[1px] hover:border-gold/60 hover:bg-black/55 hover:text-gold-light hover:shadow-[0_6px_18px_-8px_rgba(196,164,98,0.4)]"
            }
          >
            {h}
          </button>
        );
      })}
    </div>
  );
}
