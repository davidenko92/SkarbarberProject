import { CalendarCheck, CalendarRange, Coins, UserPlus } from "lucide-react";
import {
  getKpis,
  getOcupacionSemanal,
  getTopClientes,
  getTopServiciosMes,
} from "@/lib/actions/metricas";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { OcupacionSemanal } from "../components/OcupacionSemanal";
import { TopClientesList } from "../components/TopClientesList";
import { TopServiciosList } from "../components/TopServiciosList";

export const dynamic = "force-dynamic";

export default async function MetricasPage() {
  const [kpis, ocupacion, topClientes, topServicios] = await Promise.all([
    getKpis(),
    getOcupacionSemanal(),
    getTopClientes(5),
    getTopServiciosMes(5),
  ]);

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

      <OcupacionSemanal dias={ocupacion} />

      <TopClientesList clientes={topClientes} />

      <TopServiciosList servicios={topServicios} />
    </div>
  );
}
