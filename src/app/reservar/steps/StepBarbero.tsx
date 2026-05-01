import type { Empleado } from "@/lib/types";
import { GlassCard } from "../components/GlassCard";
import { StepHeading } from "../components/StepHeading";

interface StepBarberoProps {
  barberos: Empleado[];
  onSelect: (barberoId: string, cualquiera: boolean) => void;
}

export function StepBarbero({ barberos, onSelect }: StepBarberoProps) {
  const elegibles = barberos.filter(
    (b) => b.rol === "barbero" || b.rol === "propietario",
  );

  return (
    <div className="animate-step-in flex flex-1 flex-col">
      <StepHeading
        eyebrow="Paso 01 · Barbero"
        title={
          <>
            ¿Con quién
            <br />
            te <em>cortas</em>?
          </>
        }
      />

      <div className="flex flex-col gap-3">
        {elegibles.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelect(b.id, false)}
            className="group text-left"
          >
            <GlassCard
              interactive
              className="flex items-center justify-between gap-4 px-6 py-[22px]"
            >
              <div className="flex flex-col gap-1">
                <span className="eyebrow">
                  {b.rol === "propietario" ? "Propietario" : "Barbero"}
                </span>
                <p className="display-serif text-[22px] text-white transition-colors duration-300 group-hover:text-gold-light">
                  {b.nombre}
                </p>
              </div>
              <span className="text-gold/55 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gold">
                →
              </span>
            </GlassCard>
          </button>
        ))}

        {elegibles.length >= 2 && (
          <button
            type="button"
            onClick={() => onSelect(elegibles[0].id, true)}
            className="group mt-1 text-left"
          >
            <GlassCard
              interactive
              className="flex items-center justify-between gap-4 px-6 py-[22px]"
            >
              <div className="flex flex-col gap-1">
                <span className="eyebrow">Sin preferencia</span>
                <p className="display-serif text-[19px] text-white/85 transition-colors duration-300 group-hover:text-gold-light">
                  Me da igual
                </p>
              </div>
              <span className="text-gold/45 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gold">
                →
              </span>
            </GlassCard>
          </button>
        )}
      </div>
    </div>
  );
}
