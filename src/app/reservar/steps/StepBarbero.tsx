import type { Empleado } from "@/lib/types";
import { GlassCard } from "../components/GlassCard";
import { StepHeading } from "../components/StepHeading";

interface StepBarberoProps {
  barberos: Empleado[];
  onSelect: (barberoId: string, cualquiera: boolean) => void;
}

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

      <div className="grid grid-cols-2 gap-3">
        {elegibles.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelect(b.id, false)}
            className="group text-left"
          >
            <GlassCard
              interactive
              className="flex h-[340px] flex-col overflow-hidden p-0"
            >
              <div className="relative flex-1 overflow-hidden">
                {b.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.avatar_url}
                    alt={b.nombre}
                    className="h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.08]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold-dark/40 via-black/70 to-black">
                    <span className="font-serif text-6xl italic text-gold/90 drop-shadow-[0_2px_12px_rgba(196,164,98,0.35)]">
                      {iniciales(b.nombre)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
                <div className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l border-t border-gold/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b border-r border-gold/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="relative px-5 pb-[18px] pt-4">
                <span className="eyebrow">
                  {b.rol === "propietario" ? "Propietario" : "Barbero"}
                </span>
                <h2 className="display-serif mt-2 text-[22px] text-white transition-colors duration-300 group-hover:text-gold-light">
                  {b.nombre}
                </h2>
              </div>
            </GlassCard>
          </button>
        ))}
      </div>

      {elegibles.length >= 2 && (
        <button
          type="button"
          onClick={() => onSelect(elegibles[0].id, true)}
          className="group mt-4 text-left"
        >
          <GlassCard interactive className="flex items-center gap-4 px-6 py-[22px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/45 bg-black/50 text-gold shadow-[0_0_14px_rgba(196,164,98,0.15),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 group-hover:border-gold group-hover:bg-gold/10 group-hover:shadow-[0_0_22px_rgba(196,164,98,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]">
              <svg
                className="h-[18px] w-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M7 7h10M7 12h10M7 17h6" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="eyebrow">Sin preferencia</span>
              <p className="display-serif mt-1 text-[19px] text-white transition-colors duration-300 group-hover:text-gold-light">
                Me da igual
              </p>
            </div>
            <span className="text-gold/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gold">
              →
            </span>
          </GlassCard>
        </button>
      )}
    </div>
  );
}
