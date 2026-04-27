"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Clock, Calendar, TrendingUp } from "lucide-react";
import type { CitaConDetalles, Empleado } from "@/lib/types";
import { getCitasDelDia } from "@/lib/actions/agenda";
import { StatCard } from "./StatCard";
import { EmptyState } from "./EmptyState";
import { FabPlus } from "./FabPlus";
import { DateNavigator } from "./DateNavigator";
import { EmployeeFilterTabs } from "./EmployeeFilterTabs";
import { CitaItem } from "./CitaItem";
import { CitaDetailSheet } from "./CitaDetailSheet";
import { CrearCitaSheet } from "./CrearCitaSheet";

interface AgendaClientProps {
  fechaInicial: string;
  citasIniciales: CitaConDetalles[];
  empleados: Empleado[];
}

export function AgendaClient({
  fechaInicial,
  citasIniciales,
  empleados,
}: AgendaClientProps) {
  const [fecha, setFecha] = useState(fechaInicial);
  const [empleadoId, setEmpleadoId] = useState<string | null>(null);
  const [citas, setCitas] = useState<CitaConDetalles[]>(citasIniciales);
  const [citaSeleccionada, setCitaSeleccionada] =
    useState<CitaConDetalles | null>(null);
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [pending, startTransition] = useTransition();

  function recargar(f: string, e: string | null) {
    startTransition(async () => {
      const data = await getCitasDelDia({ fecha: f, empleadoId: e });
      setCitas(data);
    });
  }

  useEffect(() => {
    recargar(fecha, empleadoId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha, empleadoId]);

  const visibles = useMemo(
    () => citas.filter((c) => c.estado !== "cancelada" || true),
    [citas],
  );

  const activas = useMemo(
    () =>
      visibles.filter(
        (c) => c.estado === "confirmada" || c.estado === "completada",
      ),
    [visibles],
  );

  const ingresos = activas.reduce(
    (sum, c) => sum + Number(c.servicio?.precio ?? 0),
    0,
  );

  const ahora = Date.now();
  const proximaId =
    visibles.find(
      (c) =>
        c.estado === "confirmada" && new Date(c.inicio).getTime() >= ahora,
    )?.id ?? null;

  return (
    <div className="flex flex-col gap-5">
      <DateNavigator fecha={fecha} onChange={setFecha} />

      <EmployeeFilterTabs
        empleados={empleados}
        selectedId={empleadoId}
        onChange={setEmpleadoId}
      />

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Citas" value={activas.length} icon={Calendar} />
        <StatCard
          label="Ingresos"
          value={`${ingresos}€`}
          icon={TrendingUp}
          accent
        />
      </div>

      {pending && visibles.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
        </div>
      ) : visibles.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Sin citas"
          description="No hay citas para este día con el filtro activo."
        />
      ) : (
        <section
          className={`flex flex-col gap-3 transition-opacity ${pending ? "opacity-60" : ""}`}
        >
          <div className="flex items-center justify-between">
            <span className="panel-label">Jornada</span>
            <span className="text-[11px] text-white/40">
              {visibles.length} {visibles.length === 1 ? "cita" : "citas"}
            </span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {visibles.map((c) => (
              <li key={c.id}>
                <CitaItem
                  cita={c}
                  proxima={c.id === proximaId}
                  onClick={() => setCitaSeleccionada(c)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <FabPlus onClick={() => setCrearAbierto(true)} />

      <CitaDetailSheet
        cita={citaSeleccionada}
        onClose={() => setCitaSeleccionada(null)}
        onUpdated={() => recargar(fecha, empleadoId)}
      />

      <CrearCitaSheet
        open={crearAbierto}
        empleados={empleados}
        fechaInicial={fecha}
        onClose={() => setCrearAbierto(false)}
        onCreated={() => recargar(fecha, empleadoId)}
      />
    </div>
  );
}
