"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { actualizarEmpleado } from "@/lib/actions/admin";
import type { Empleado } from "@/lib/types";

interface EmpleadoEditSheetProps {
  open: boolean;
  empleado: Empleado | null;
  canEditActive: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  nombre: string;
  telefono: string;
  avatar_url: string;
  activo: boolean;
}

function toForm(e: Empleado): FormState {
  return {
    nombre: e.nombre,
    telefono: e.telefono ?? "",
    avatar_url: e.avatar_url ?? "",
    activo: e.activo,
  };
}

export function EmpleadoEditSheet({
  open,
  empleado,
  canEditActive,
  onClose,
  onSaved,
}: EmpleadoEditSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && empleado) {
      setMounted(true);
      document.body.style.overflow = "hidden";
      setForm(toForm(empleado));
      setError(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, empleado]);

  if (!open || !empleado || !form) return null;

  const canSubmit = form.nombre.trim().length >= 2;

  async function onSubmit() {
    if (!canSubmit || !empleado || !form) return;
    setSubmitting(true);
    setError(null);
    const res = await actualizarEmpleado({
      id: empleado.id,
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      avatar_url: form.avatar_url.trim(),
      activo: form.activo,
    });
    setSubmitting(false);
    if (res.success) {
      onSaved();
      onClose();
    } else {
      setError(res.error ?? "No se pudo guardar");
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
          <div className="relative flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[28px] border-t border-gold/30 bg-gradient-to-b from-[#141108]/95 via-black/95 to-black/98 shadow-[0_-20px_60px_-8px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/20" />

            <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-gold/40 hover:text-gold"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-semibold uppercase tracking-[0.32em] text-gold/75">
                  {empleado.rol === "propietario" ? "Propietario" : "Barbero"}
                </span>
                <span className="font-serif text-[15px] leading-none text-white">
                  {empleado.nombre}
                </span>
              </div>
              <div className="h-9 w-9" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="flex flex-col gap-3 pt-2">
                <LabeledInput
                  label="Nombre"
                  value={form.nombre}
                  onChange={(v) => setForm((f) => f && { ...f, nombre: v })}
                />
                <LabeledInput
                  label="Teléfono"
                  value={form.telefono}
                  onChange={(v) => setForm((f) => f && { ...f, telefono: v })}
                  inputMode="tel"
                  placeholder="+34 …"
                />
                <LabeledInput
                  label="Foto (URL)"
                  value={form.avatar_url}
                  onChange={(v) => setForm((f) => f && { ...f, avatar_url: v })}
                  placeholder="https://…"
                />

                {canEditActive && (
                  <label className="mt-1 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-white">
                        Activo
                      </span>
                      <span className="text-[11px] text-white/50">
                        Visible en el flujo de reservas
                      </span>
                    </div>
                    <Toggle
                      checked={form.activo}
                      onChange={(v) => setForm((f) => f && { ...f, activo: v })}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="border-t border-white/5 bg-black/40 px-5 py-4">
              {error && (
                <div className="mb-3 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
                  {error}
                </div>
              )}
              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit || submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-light via-gold to-gold-dark py-3.5 text-[14px] font-semibold tracking-wide text-black shadow-[0_10px_30px_-8px_rgba(229,193,113,0.55)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={2.25} />
                )}
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-0.5 transition-colors ${
        checked
          ? "border-gold/50 bg-gradient-to-r from-gold-light to-gold-dark"
          : "border-white/10 bg-white/15"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.35)] transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "tel" | "email" | "text";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-gold/75">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:shadow-[0_0_0_1px_rgba(229,193,113,0.35)]"
      />
    </label>
  );
}
