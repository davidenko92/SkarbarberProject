"use client";

import type { Empleado } from "@/lib/types";

interface EmployeeFilterTabsProps {
  empleados: Empleado[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
}

export function EmployeeFilterTabs({
  empleados,
  selectedId,
  onChange,
}: EmployeeFilterTabsProps) {
  const opciones: Array<{ id: string | null; label: string }> = [
    { id: null, label: "Todos" },
    ...empleados.map((e) => ({ id: e.id, label: e.nombre.split(" ")[0] })),
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {opciones.map((op) => {
        const activo = op.id === selectedId;
        return (
          <button
            key={op.id ?? "all"}
            type="button"
            onClick={() => onChange(op.id)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-[12px] font-medium tracking-wide transition-all active:scale-95 ${
              activo
                ? "border-gold bg-gradient-to-b from-gold-light via-gold to-gold-dark text-black shadow-[0_0_16px_rgba(196,164,98,0.35),inset_0_1px_0_rgba(255,255,255,0.35)]"
                : "border-gold/20 bg-black/35 text-white/70 hover:border-gold/45 hover:bg-black/55 hover:text-white"
            }`}
          >
            {op.label}
          </button>
        );
      })}
    </div>
  );
}
