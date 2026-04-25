"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { listarEmpleados } from "@/lib/actions/admin";
import type { Empleado } from "@/lib/types";
import { EmpleadoEditSheet } from "./EmpleadoEditSheet";

interface EmpleadosAdminListProps {
  iniciales: Empleado[];
  currentUserId: string;
  esPropietario: boolean;
}

export function EmpleadosAdminList({
  iniciales,
  currentUserId,
  esPropietario,
}: EmpleadosAdminListProps) {
  const [empleados, setEmpleados] = useState<Empleado[]>(iniciales);
  const [editando, setEditando] = useState<Empleado | null>(null);

  async function recargar() {
    const lista = await listarEmpleados().catch(() => [] as Empleado[]);
    setEmpleados(lista);
  }

  const visibles = esPropietario
    ? empleados
    : empleados.filter((e) => e.id === currentUserId);

  function puedeEditar(e: Empleado) {
    return esPropietario || e.id === currentUserId;
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="panel-label">Empleados</span>
        {!esPropietario && (
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            Solo tu perfil
          </span>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {visibles.map((e) => {
          const editable = puedeEditar(e);
          const esYo = e.id === currentUserId;
          return (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => editable && setEditando(e)}
                disabled={!editable}
                className="panel-card flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all active:scale-[0.99] hover:border-gold/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Avatar url={e.avatar_url} nombre={e.nombre} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-medium text-white">
                      {e.nombre}
                    </span>
                    {esYo && (
                      <span className="rounded-full border border-gold/35 bg-gold/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.2em] text-gold/80">
                        Tú
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-white/50">
                    <span className="uppercase tracking-[0.22em]">
                      {e.rol === "propietario" ? "Propietario" : "Barbero"}
                    </span>
                    {!e.activo && (
                      <span className="rounded-full border border-white/15 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white/50">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <EmpleadoEditSheet
        open={editando !== null}
        empleado={editando}
        canEditActive={esPropietario && editando?.id !== currentUserId}
        onClose={() => setEditando(null)}
        onSaved={recargar}
      />
    </section>
  );
}

function Avatar({ url, nombre }: { url: string | null; nombre: string }) {
  const inicial = nombre.trim().charAt(0).toUpperCase() || "?";

  if (url) {
    return (
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gold/30 bg-black/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={nombre}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 font-serif text-[17px] text-gold">
      {inicial || <UserRound className="h-5 w-5" strokeWidth={1.5} />}
    </div>
  );
}
