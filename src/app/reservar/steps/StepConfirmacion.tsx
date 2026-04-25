import type { Empleado, Servicio } from "@/lib/types";
import { GlassCard } from "../components/GlassCard";

interface StepConfirmacionProps {
  barbero: Empleado | null;
  servicio: Servicio | null;
  fecha: string;
  hora: string;
  onReset: () => void;
}

export function StepConfirmacion({
  barbero,
  servicio,
  fecha,
  hora,
  onReset,
}: StepConfirmacionProps) {
  const fechaLegible = new Date(`${fecha}T00:00:00`).toLocaleDateString(
    "es-ES",
    { weekday: "long", day: "numeric", month: "long" },
  );

  return (
    <div className="animate-step-in flex flex-1 flex-col items-center gap-8 py-6">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 animate-[pop_0.6s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards] rounded-full border border-gold/60 bg-gradient-to-b from-gold/20 to-gold-dark/10 shadow-[0_0_60px_rgba(196,164,98,0.35)]" />
        <svg
          className="relative h-10 w-10 text-gold"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M5 13l4 4L19 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="text-center">
        <span className="eyebrow">Confirmada</span>
        <h1 className="display-serif mt-4 text-[clamp(38px,10vw,44px)] text-white">
          Cita <em>reservada</em>
        </h1>
        <div className="hairline-short mx-auto mt-4" />
      </div>

      <GlassCard className="w-full px-8 py-9">
        <dl className="divide-y divide-gold/10">
          {barbero && <Row label="Barbero" value={barbero.nombre} />}
          {servicio && (
            <>
              <Row label="Servicio" value={servicio.nombre} />
              <Row
                label="Precio"
                value={`${Number(servicio.precio).toFixed(0)}€`}
                strong
              />
            </>
          )}
          <Row label="Día" value={fechaLegible} capitalize />
          <Row label="Hora" value={hora} strong />
        </dl>
      </GlassCard>

      <p className="text-center text-[13px] tracking-[0.1em] text-white/65">
        Te esperamos en Skarbarber,
        <br />
        Alcalá de Henares.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="text-[11px] uppercase tracking-[0.28em] text-white/50 transition-colors hover:text-gold"
      >
        Reservar otra cita
      </button>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  capitalize,
}: {
  label: string;
  value: string;
  strong?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-[18px] first:pt-0 last:pb-0">
      <span className="eyebrow">{label}</span>
      <span
        className={[
          "text-right",
          strong ? "font-serif text-[26px] leading-none tracking-tight text-gold drop-shadow-[0_0_16px_rgba(196,164,98,0.3)]" : "text-[17px] font-light text-white/95",
          capitalize ? "capitalize" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </span>
    </div>
  );
}
