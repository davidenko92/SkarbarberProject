"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { CalendarRange, Sparkles, X } from "lucide-react";
import type { Empleado } from "@/lib/types";
import type { PeriodoMetricas } from "@/lib/metricas/periodos";
import { DateRangeCalendar } from "./DateRangeCalendar";

interface MetricasFiltersProps {
  empleados: Empleado[];
  periodo: PeriodoMetricas;
  empleadoId: string | null;
  desde: string | null;
  hasta: string | null;
}

const PERIODOS: Array<{ value: PeriodoMetricas; label: string }> = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
  { value: "mes_anterior", label: "Mes pasado" },
  { value: "anio", label: "Año" },
];

export function MetricasFilters({
  empleados,
  periodo,
  empleadoId,
  desde,
  hasta,
}: MetricasFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const rangoActivo = Boolean(desde && hasta);
  const filtrosActivos =
    Number(periodo !== "mes") + Number(empleadoId != null) + Number(rangoActivo);

  function update(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value == null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/panel/metricas?${qs}` : "/panel/metricas", {
        scroll: false,
      });
    });
  }

  function aplicarRango(d: string, h: string) {
    update({ desde: d, hasta: h, periodo: null });
  }

  function limpiarRango() {
    update({ desde: null, hasta: null });
  }

  function resetTodo() {
    update({ desde: null, hasta: null, periodo: null, empleado: null });
  }

  return (
    <section
      className={`filter-card flex flex-col gap-5 transition-opacity ${
        pending ? "opacity-60" : ""
      }`}
    >
      <header className="filter-card-header">
        <div className="flex flex-col gap-1">
          <span className="panel-label flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" strokeWidth={1.75} />
            Filtros
          </span>
          <span className="filter-card-title">
            Ajusta el <em>resumen</em>
          </span>
        </div>
        {filtrosActivos > 0 && (
          <button
            type="button"
            onClick={resetTodo}
            className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10.5px] uppercase tracking-[0.22em] text-white/55 transition-colors hover:border-gold/40 hover:text-gold/85"
          >
            <X className="h-3 w-3" strokeWidth={2} />
            Limpiar
          </button>
        )}
      </header>

      <div className="flex flex-col gap-2.5">
        <span className="panel-label">Periodo</span>
        <div className="-mx-1 flex flex-wrap gap-1.5 px-1">
          {PERIODOS.map((p) => {
            const active = !rangoActivo && periodo === p.value;
            const cls = `filter-pill${active ? " filter-pill--active" : ""}${
              rangoActivo && !active ? " filter-pill--dimmed" : ""
            }`;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() =>
                  update({
                    periodo: p.value === "mes" ? null : p.value,
                    desde: null,
                    hasta: null,
                  })
                }
                className={cls}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="panel-label flex items-center gap-1.5">
          <CalendarRange className="h-3 w-3" strokeWidth={1.75} />
          Rango personalizado
        </span>
        <DateRangeCalendar
          desde={desde}
          hasta={hasta}
          onApply={aplicarRango}
          onClear={limpiarRango}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="panel-label">Barbero</span>
        <div className="-mx-1 flex flex-wrap gap-1.5 px-1">
          <button
            type="button"
            onClick={() => update({ empleado: null })}
            className={`filter-pill${empleadoId == null ? " filter-pill--active" : ""}`}
          >
            Todos
          </button>
          {empleados.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => update({ empleado: e.id })}
              className={`filter-pill${empleadoId === e.id ? " filter-pill--active" : ""}`}
            >
              {e.nombre}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
