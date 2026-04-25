"use client";

import { useEffect, useState } from "react";
import { Check, Phone, MessageCircle, X, UserX, Loader2 } from "lucide-react";
import type { Cita, CitaConDetalles } from "@/lib/types";
import { actualizarEstadoCita } from "@/lib/actions/agenda";

interface CitaDetailSheetProps {
  cita: CitaConDetalles | null;
  onClose: () => void;
  onUpdated: () => void;
}

function formatHora(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function telefonoLimpio(tel: string | null | undefined) {
  if (!tel) return null;
  return tel.replace(/[^\d+]/g, "");
}

const ESTADO_LABEL: Record<Cita["estado"], string> = {
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
};

const ESTADO_COLOR: Record<Cita["estado"], string> = {
  confirmada: "text-gold border-gold/40 bg-gold/10",
  completada: "text-emerald-300 border-emerald-400/35 bg-emerald-400/10",
  cancelada: "text-red-300 border-red-400/35 bg-red-400/10",
  no_asistio: "text-orange-300 border-orange-400/35 bg-orange-400/10",
};

export function CitaDetailSheet({
  cita,
  onClose,
  onUpdated,
}: CitaDetailSheetProps) {
  const [saving, setSaving] = useState<Cita["estado"] | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (cita) {
      setMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cita]);

  if (!cita) return null;

  const tel = telefonoLimpio(cita.cliente?.telefono);

  async function accion(nuevoEstado: Cita["estado"]) {
    if (!cita) return;
    setSaving(nuevoEstado);
    const res = await actualizarEstadoCita({
      citaId: cita.id,
      estado: nuevoEstado,
    });
    setSaving(null);
    if (res.success) {
      onUpdated();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          mounted ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto w-full max-w-md">
          <div
            className="relative overflow-hidden rounded-t-[28px] border-t border-gold/30 bg-gradient-to-b from-[#141108]/95 via-black/95 to-black/98 shadow-[0_-20px_60px_-8px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          >
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/20" />

            <div className="flex items-start justify-between gap-3 px-6 pb-2 pt-5">
              <div className="flex flex-col gap-1">
                <span className="panel-label">Cita</span>
                <h2 className="font-serif text-[26px] leading-tight text-white">
                  {cita.cliente?.nombre ?? "Cliente"}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-gold/40 hover:text-gold"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="px-6">
              <span
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${
                  ESTADO_COLOR[cita.estado]
                }`}
              >
                {ESTADO_LABEL[cita.estado]}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 px-6">
              <DetailItem
                label="Hora"
                value={`${formatHora(cita.inicio)} – ${formatHora(cita.fin)}`}
              />
              <DetailItem
                label="Precio"
                value={`${Number(cita.servicio?.precio ?? 0)}€`}
                accent
              />
              <DetailItem
                label="Servicio"
                value={cita.servicio?.nombre ?? "—"}
              />
              <DetailItem
                label="Barbero"
                value={cita.empleado?.nombre ?? "—"}
              />
            </div>

            <div className="mt-2 px-6">
              <DetailItem label="Día" value={formatFecha(cita.inicio)} />
            </div>

            {cita.notas && (
              <div className="mx-6 mt-4 rounded-2xl border border-gold/15 bg-black/40 p-3 text-[13px] text-white/70">
                <span className="mb-1 block text-[9px] uppercase tracking-[0.28em] text-gold/70">
                  Notas
                </span>
                {cita.notas}
              </div>
            )}

            {tel && (
              <div className="mt-5 flex gap-2 px-6">
                <a
                  href={`tel:${tel}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-black/40 py-3 text-[13px] font-medium tracking-wide text-white transition-all hover:border-gold/60 hover:bg-gold/10 hover:text-gold active:scale-[0.98]"
                >
                  <Phone className="h-4 w-4" strokeWidth={1.75} />
                  Llamar
                </a>
                <a
                  href={`https://wa.me/${tel.replace(/^\+/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-black/40 py-3 text-[13px] font-medium tracking-wide text-white transition-all hover:border-gold/60 hover:bg-gold/10 hover:text-gold active:scale-[0.98]"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                  WhatsApp
                </a>
              </div>
            )}

            <div className="mt-5 border-t border-white/5 bg-black/30 px-6 py-4">
              <span className="panel-label mb-3 block">Acciones</span>
              <div className="grid grid-cols-3 gap-2">
                <ActionButton
                  icon={Check}
                  label="Completar"
                  color="emerald"
                  loading={saving === "completada"}
                  disabled={
                    cita.estado === "completada" ||
                    cita.estado === "cancelada" ||
                    saving !== null
                  }
                  onClick={() => accion("completada")}
                />
                <ActionButton
                  icon={UserX}
                  label="No vino"
                  color="orange"
                  loading={saving === "no_asistio"}
                  disabled={
                    cita.estado === "no_asistio" ||
                    cita.estado === "completada" ||
                    saving !== null
                  }
                  onClick={() => accion("no_asistio")}
                />
                <ActionButton
                  icon={X}
                  label="Cancelar"
                  color="red"
                  loading={saving === "cancelada"}
                  disabled={
                    cita.estado === "cancelada" ||
                    cita.estado === "completada" ||
                    saving !== null
                  }
                  onClick={() => accion("cancelada")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-gold/70">
        {label}
      </span>
      <span
        className={`text-[15px] leading-snug ${accent ? "font-serif text-[20px] text-gold" : "text-white/90"}`}
      >
        {value}
      </span>
    </div>
  );
}

interface ActionButtonProps {
  icon: typeof Check;
  label: string;
  color: "emerald" | "orange" | "red";
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

function ActionButton({
  icon: Icon,
  label,
  color,
  loading,
  disabled,
  onClick,
}: ActionButtonProps) {
  const palette = {
    emerald:
      "hover:border-emerald-400/60 hover:bg-emerald-400/10 hover:text-emerald-300",
    orange:
      "hover:border-orange-400/60 hover:bg-orange-400/10 hover:text-orange-300",
    red: "hover:border-red-400/60 hover:bg-red-400/10 hover:text-red-300",
  }[color];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-black/40 py-3 text-[11px] font-medium tracking-wide text-white/75 transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30 ${palette}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
      ) : (
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      )}
      <span>{label}</span>
    </button>
  );
}
