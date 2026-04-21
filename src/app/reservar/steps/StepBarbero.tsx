import type { Empleado } from "@/lib/types";
import { GlassCard } from "../components/GlassCard";

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
      <header className="mb-8">
        <span className="eyebrow">Paso 01 · Barbero</span>
        <h1 className="display-serif mt-3 text-[44px] text-white">
          ¿Con quién
          <br />
          te <em>cortas</em>?
        </h1>
      </header>

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
              className="flex h-[330px] flex-col overflow-hidden p-0"
            >
              <div className="relative flex-1 overflow-hidden">
                {b.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.avatar_url}
                    alt={b.nombre}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold-dark/35 via-black/60 to-black">
                    <span className="text-6xl font-light tracking-tight text-gold/90">
                      {iniciales(b.nombre)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l border-t border-gold/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b border-r border-gold/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="relative px-4 pb-4 pt-3.5">
                <span className="eyebrow">
                  {b.rol === "propietario" ? "Propietario" : "Barbero"}
                </span>
                <h2 className="display-serif mt-1.5 text-xl text-white transition-colors group-hover:text-gold-light">
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
          <GlassCard interactive className="flex items-center gap-4 px-6 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-black/40 text-gold shadow-[0_0_12px_rgba(196,164,98,0.12)] transition-all group-hover:border-gold group-hover:bg-gold/10 group-hover:shadow-[0_0_18px_rgba(196,164,98,0.28)]">
              <svg
                className="h-5 w-5"
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
              <p className="display-serif mt-1 text-lg text-white transition-colors group-hover:text-gold-light">
                Me da igual
              </p>
            </div>
            <span className="text-gold/50 transition-all group-hover:translate-x-1 group-hover:text-gold">
              →
            </span>
          </GlassCard>
        </button>
      )}
    </div>
  );
}
