import { UserRound } from "lucide-react";
import type { TopCliente } from "@/lib/actions/metricas";

interface TopClientesListProps {
  clientes: TopCliente[];
}

export function TopClientesList({ clientes }: TopClientesListProps) {
  if (clientes.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <span className="panel-label">Top clientes</span>
        <p className="panel-card p-4 text-[12px] text-white/50">
          Aún no hay datos suficientes.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <span className="panel-label">Top clientes</span>
      <ul className="flex flex-col gap-2">
        {clientes.map((c, i) => (
          <li
            key={c.id}
            className="panel-card flex items-center gap-3 px-4 py-3"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-gold/10 font-serif text-[12px] text-gold">
              {i + 1}
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/55">
              <UserRound className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[14px] font-medium text-white">
                {c.nombre}
              </span>
              <span className="text-[11px] text-white/50">
                {c.citas} {c.citas === 1 ? "cita" : "citas"}
              </span>
            </div>
            <span className="font-serif text-[16px] tabular-nums text-gold/90">
              {Math.round(c.totalGastado)}€
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
