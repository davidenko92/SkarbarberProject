import type { OcupacionDia } from "@/lib/actions/metricas";

interface OcupacionSemanalProps {
  dias: OcupacionDia[];
}

export function OcupacionSemanal({ dias }: OcupacionSemanalProps) {
  const max = Math.max(1, ...dias.map((d) => d.porcentaje));

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="panel-label">Ocupación semanal</span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">
          Lun – Dom
        </span>
      </div>
      <div className="panel-card p-4">
        <div className="grid grid-cols-7 gap-2">
          {dias.map((d) => {
            const cerrado = d.capacidad === 0;
            const altura = cerrado
              ? 4
              : Math.max(6, (d.porcentaje / max) * 100);
            return (
              <div
                key={d.fecha}
                className="flex flex-col items-center gap-2"
                title={
                  cerrado
                    ? "Cerrado"
                    : `${d.porcentaje}% — ${d.ocupados} / ${d.capacidad} min`
                }
              >
                <div className="relative flex h-24 w-full items-end">
                  <div
                    className={
                      cerrado
                        ? "w-full rounded-md bg-white/5"
                        : "w-full rounded-md bg-gradient-to-t from-gold-dark via-gold to-gold-light shadow-[0_0_18px_-4px_rgba(229,193,113,0.55)]"
                    }
                    style={{ height: `${altura}%` }}
                  />
                </div>
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-white/55">
                  {d.diaCorto}
                </span>
                <span
                  className={`text-[10px] tabular-nums ${
                    cerrado ? "text-white/30" : "text-gold/80"
                  }`}
                >
                  {cerrado ? "—" : `${d.porcentaje}%`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
