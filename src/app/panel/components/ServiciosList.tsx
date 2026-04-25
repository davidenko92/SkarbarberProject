"use client";

import { useState } from "react";
import { Clock, Scissors } from "lucide-react";
import { listarServicios } from "@/lib/actions/admin";
import type { Servicio } from "@/lib/types";
import { EmptyState } from "./EmptyState";
import { FabPlus } from "./FabPlus";
import { ServicioEditSheet } from "./ServicioEditSheet";

interface ServiciosListProps {
  iniciales: Servicio[];
}

export function ServiciosList({ iniciales }: ServiciosListProps) {
  const [servicios, setServicios] = useState<Servicio[]>(iniciales);
  const [editando, setEditando] = useState<Servicio | null>(null);
  const [creando, setCreando] = useState(false);

  async function recargar() {
    const lista = await listarServicios().catch(() => [] as Servicio[]);
    setServicios(lista);
  }

  const open = creando || editando !== null;

  return (
    <>
      {servicios.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="Sin servicios"
          description="Crea el primer servicio con el botón +"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {servicios.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setEditando(s)}
                className="panel-card flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all active:scale-[0.99] hover:border-gold/40"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
                    s.activo
                      ? "border-gold/35 bg-gold/10 text-gold"
                      : "border-white/10 bg-black/40 text-white/40"
                  }`}
                >
                  <Scissors className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-medium text-white">
                      {s.nombre}
                    </span>
                    {!s.activo && (
                      <span className="rounded-full border border-white/15 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white/50">
                        Oculto
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                    <Clock className="h-3 w-3" strokeWidth={1.75} />
                    <span>{s.duracion} min</span>
                  </div>
                </div>
                <span className="font-serif text-[20px] text-gold/90">
                  {Number(s.precio)}€
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <FabPlus
        ariaLabel="Nuevo servicio"
        onClick={() => {
          setEditando(null);
          setCreando(true);
        }}
      />

      <ServicioEditSheet
        open={open}
        servicio={editando}
        onClose={() => {
          setEditando(null);
          setCreando(false);
        }}
        onSaved={recargar}
      />
    </>
  );
}
