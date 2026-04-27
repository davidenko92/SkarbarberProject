"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, ChevronRight, Loader2, UserRound } from "lucide-react";
import { listarClientes, type ClienteConStats } from "@/lib/actions/citas";
import { EmptyState } from "./EmptyState";

interface ClientesListProps {
  iniciales: ClienteConStats[];
}

function formatUltimaVisita(iso: string | null): string {
  if (!iso) return "Sin visitas";
  const fecha = new Date(iso);
  const hoy = new Date();
  const diffDias = Math.floor(
    (hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDias < 0) {
    return fecha.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  }
  if (diffDias === 0) return "Hoy";
  if (diffDias === 1) return "Ayer";
  if (diffDias < 7) return `Hace ${diffDias} días`;
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} sem`;
  if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} meses`;
  return `Hace ${Math.floor(diffDias / 365)} años`;
}

export function ClientesList({ iniciales }: ClientesListProps) {
  const [query, setQuery] = useState("");
  const [clientes, setClientes] = useState<ClienteConStats[]>(iniciales);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    const handle = setTimeout(() => {
      setLoading(true);
      listarClientes({ query: q || undefined, limit: 40 })
        .then(setClientes)
        .catch(() => setClientes([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
          strokeWidth={1.75}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o teléfono"
          className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-10 pr-3 text-[14px] text-white placeholder:text-white/35 focus:border-gold/50 focus:outline-none"
        />
        {loading && (
          <Loader2
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gold"
            strokeWidth={1.75}
          />
        )}
      </div>

      {clientes.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title={query ? "Sin coincidencias" : "Sin clientes"}
          description={
            query
              ? "Prueba con otro nombre o número."
              : "Los clientes se crean desde las reservas o desde el FAB."
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {clientes.map((c) => (
            <li key={c.id}>
              <Link
                href={`/panel/clientes/${c.id}`}
                className="panel-card flex items-center gap-3 px-4 py-3 transition-all active:scale-[0.99] hover:border-gold/40"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/50 font-serif text-[17px] text-gold/90">
                  {c.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[15px] font-medium text-white">
                    {c.nombre}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-white/50">
                    <span>{formatUltimaVisita(c.ultima_visita)}</span>
                    {c.total_citas > 0 && (
                      <>
                        <span className="text-white/20">·</span>
                        <span>
                          {c.total_citas} cita{c.total_citas === 1 ? "" : "s"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {c.total_gastado > 0 && (
                  <span className="font-serif text-[14px] text-gold/80">
                    {c.total_gastado}€
                  </span>
                )}
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-white/30"
                  strokeWidth={1.75}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
