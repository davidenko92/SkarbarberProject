import type { OcupacionResultado } from "@/lib/actions/metricas";

interface OcupacionGraficoProps {
  ocupacion: OcupacionResultado;
}

export function OcupacionSemanal({ ocupacion }: OcupacionGraficoProps) {
  const { puntos, titulo } = ocupacion;
  const max = Math.max(1, ...puntos.map((p) => p.porcentaje));
  const cantidad = puntos.length;

  const isWeekLetters = cantidad === 7 && ocupacion.modo === "dia-letra";
  const showPercent = cantidad <= 7;
  const compactLabel = cantidad > 14;

  const gridStyle: React.CSSProperties = isWeekLetters
    ? {}
    : {
        gridTemplateColumns: `repeat(${cantidad}, minmax(0, 1fr))`,
      };
  const gapClass = cantidad > 21 ? "gap-0.5" : cantidad > 10 ? "gap-1" : "gap-1.5";

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="panel-label">{titulo}</span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">
          {cantidad} {cantidad === 1 ? "punto" : "puntos"}
        </span>
      </div>
      <div className="panel-card p-4">
        <div
          className={`grid ${gapClass} ${
            isWeekLetters ? "grid-cols-7" : ""
          }`}
          style={gridStyle}
        >
          {puntos.map((p) => {
            const altura = p.cerrado
              ? 4
              : Math.max(6, (p.porcentaje / max) * 100);
            return (
              <div
                key={p.key}
                className="flex min-w-0 flex-col items-center gap-1.5"
                title={
                  p.cerrado
                    ? "Cerrado"
                    : `${p.porcentaje}% — ${Math.round(p.ocupados)} / ${Math.round(p.capacidad)} min`
                }
              >
                <div className="relative flex h-24 w-full items-end">
                  <div
                    className={
                      p.cerrado
                        ? "w-full rounded-md bg-white/5"
                        : "w-full rounded-md bg-gradient-to-t from-gold-dark via-gold to-gold-light shadow-[0_0_18px_-4px_rgba(229,193,113,0.55)]"
                    }
                    style={{ height: `${altura}%` }}
                  />
                </div>
                <span
                  className={`truncate font-semibold uppercase tabular-nums tracking-tight text-white/55 ${
                    compactLabel ? "text-[8.5px]" : "text-[10.5px]"
                  }`}
                  style={{ maxWidth: "100%" }}
                >
                  {p.etiqueta}
                </span>
                {showPercent && (
                  <span
                    className={`text-[10px] tabular-nums ${
                      p.cerrado ? "text-white/30" : "text-gold/80"
                    }`}
                  >
                    {p.cerrado ? "—" : `${p.porcentaje}%`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
