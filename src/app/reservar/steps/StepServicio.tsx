import type { Servicio } from "@/lib/types";
import { GlassCard } from "../components/GlassCard";

interface StepServicioProps {
  servicios: Servicio[];
  onSelect: (servicioId: string) => void;
}

export function StepServicio({ servicios, onSelect }: StepServicioProps) {
  return (
    <div className="animate-step-in flex flex-1 flex-col">
      <header className="mb-8">
        <span className="eyebrow">Paso 02 · Servicio</span>
        <h1 className="display-serif mt-3 text-[44px] text-white">
          ¿Qué te <em>hacemos</em>?
        </h1>
      </header>

      <GlassCard className="overflow-hidden p-0">
        <ul className="divide-y divide-gold/10">
          {servicios.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                className="group relative flex w-full items-center justify-between gap-4 px-6 py-[22px] text-left transition-colors hover:bg-gold/[0.055]"
              >
                <span className="pointer-events-none absolute inset-y-4 left-0 w-[2px] origin-center scale-y-0 bg-gradient-to-b from-gold-light via-gold to-gold-dark opacity-0 transition-all duration-300 group-hover:scale-y-100 group-hover:opacity-100" />
                <div className="min-w-0 flex-1">
                  <h2 className="display-serif text-[26px] font-medium leading-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)] transition-colors group-hover:text-gold">
                    {s.nombre}
                  </h2>
                  <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.28em] text-white/55 transition-colors group-hover:text-gold/75">
                    {s.duracion} min
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[34px] font-light leading-none tracking-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)] transition-colors group-hover:text-gold group-hover:drop-shadow-[0_0_18px_rgba(196,164,98,0.35)]">
                    {Number(s.precio).toFixed(0)}
                    <span className="ml-0.5 text-[22px] font-light">€</span>
                  </span>
                  <span className="text-gold/40 transition-all group-hover:translate-x-1 group-hover:text-gold">
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
