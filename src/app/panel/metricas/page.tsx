import { CalendarCheck, CalendarRange, Coins, UserPlus } from "lucide-react";
import {
  getEstadosCitas,
  getKpis,
  getOcupacion,
  getTopClientes,
  getTopServiciosMes,
} from "@/lib/actions/metricas";
import {
  resolverRango,
  type PeriodoMetricas,
} from "@/lib/metricas/periodos";
import { listarEmpleados } from "@/lib/actions/admin";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { EstadosMesCard } from "../components/EstadosMesCard";
import { MetricasFilters } from "../components/MetricasFilters";
import { OcupacionSemanal } from "../components/OcupacionSemanal";
import { TopClientesList } from "../components/TopClientesList";
import { TopServiciosList } from "../components/TopServiciosList";

export const dynamic = "force-dynamic";

const PERIODOS_VALIDOS: PeriodoMetricas[] = [
  "hoy",
  "semana",
  "mes",
  "mes_anterior",
  "anio",
];

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface MetricasPageProps {
  searchParams: Promise<{
    periodo?: string;
    empleado?: string;
    desde?: string;
    hasta?: string;
  }>;
}

export default async function MetricasPage({ searchParams }: MetricasPageProps) {
  const params = await searchParams;
  const periodo: PeriodoMetricas =
    params.periodo && PERIODOS_VALIDOS.includes(params.periodo as PeriodoMetricas)
      ? (params.periodo as PeriodoMetricas)
      : "mes";
  const empleadoId = params.empleado || null;
  const desde =
    params.desde && ISO_DATE_RE.test(params.desde) ? params.desde : null;
  const hasta =
    params.hasta && ISO_DATE_RE.test(params.hasta) ? params.hasta : null;
  const filtros = {
    periodo,
    empleadoId,
    desde: desde ?? undefined,
    hasta: hasta ?? undefined,
  };
  const periodoLabel = resolverRango(filtros).label.toLowerCase();

  const [kpis, empleados, estados, ocupacion, topClientes, topServicios] =
    await Promise.all([
      getKpis(),
      listarEmpleados(),
      getEstadosCitas(filtros),
      getOcupacion(filtros),
      getTopClientes(5),
      getTopServiciosMes(5, filtros),
    ]);

  const empleadosActivos = empleados.filter((e) => e.activo);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Métricas"
        title={
          <>
            Stats <em className="not-italic text-gold">·</em>
          </>
        }
        subtitle="Resumen del negocio"
      />

      <section className="grid grid-cols-2 gap-2.5">
        <StatCard label="Hoy" value={kpis.citasHoy} icon={CalendarCheck} />
        <StatCard
          label="Esta semana"
          value={kpis.citasSemana}
          icon={CalendarRange}
        />
        <StatCard
          label="Ingresos mes"
          value={
            kpis.ingresosMes === null ? "—" : `${Math.round(kpis.ingresosMes)}€`
          }
          icon={Coins}
          accent
        />
        <StatCard
          label="Clientes nuevos"
          value={kpis.clientesNuevosMes}
          icon={UserPlus}
        />
      </section>

      <MetricasFilters
        empleados={empleadosActivos}
        periodo={periodo}
        empleadoId={empleadoId}
        desde={desde}
        hasta={hasta}
      />

      <EstadosMesCard estados={estados} periodoLabel={periodoLabel} />

      <OcupacionSemanal ocupacion={ocupacion} />

      <TopClientesList clientes={topClientes} />

      <TopServiciosList servicios={topServicios} />
    </div>
  );
}
