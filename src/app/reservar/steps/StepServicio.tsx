import type { Servicio } from "@/lib/types";
import { GlassCard } from "../components/GlassCard";
import { StepHeading } from "../components/StepHeading";

interface StepServicioProps {
  servicios: Servicio[];
  onSelect: (servicioId: string) => void;
}

export function StepServicio({ servicios, onSelect }: StepServicioProps) {
  return (
    <div className="animate-step-in flex flex-1 flex-col">
      <StepHeading
        eyebrow="Paso 02 · Servicio"
        title={
          <>
            ¿Qué te <em>hacemos</em>?
          </>
        }
      />

      <GlassCard className="overflow-hidden p-0">
        <ul className="divide-y divide-gold/10">
          {servicios.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                className="group relative flex w-full items-center justify-between gap-4 px-6 py-6 text-left transition-colors duration-300 hover:bg-gold/[0.06]"
              >
                <span className="pointer-events-none absolute inset-y-4 left-0 w-[2px] origin-center scale-y-0 rounded-full bg-gradient-to-b from-gold-light via-gold to-gold-dark opacity-0 shadow-[0_0_8px_rgba(229,193,113,0.5)] transition-all duration-300 group-hover:scale-y-100 group-hover:opacity-100" />
                <div className="min-w-0 flex-1">
                  <h2 className="display-serif text-[26px] leading-[1.05] text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.7)] transition-colors duration-300 group-hover:text-gold">
                    {s.nombre}
                  </h2>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/55 transition-colors duration-300 group-hover:text-gold/80">
                    {s.duracion} min
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-serif text-[34px] leading-none tracking-tight text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.7)] transition-all duration-300 group-hover:text-gold group-hover:drop-shadow-[0_0_22px_rgba(196,164,98,0.45)]">
                    {Number(s.precio).toFixed(0)}
                    <span className="ml-0.5 text-[22px] font-light">€</span>
                  </span>
                  <span className="text-gold/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gold">
                    →
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
