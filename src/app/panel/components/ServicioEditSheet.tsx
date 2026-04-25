"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Trash2, X } from "lucide-react";
import {
  actualizarServicio,
  crearServicio,
  eliminarServicio,
} from "@/lib/actions/admin";
import type { Servicio } from "@/lib/types";

interface ServicioEditSheetProps {
  open: boolean;
  servicio: Servicio | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  nombre: string;
  duracion: string;
  precio: string;
  activo: boolean;
  orden: string;
}

const EMPTY: FormState = {
  nombre: "",
  duracion: "30",
  precio: "",
  activo: true,
  orden: "0",
};

function toForm(s: Servicio): FormState {
  return {
    nombre: s.nombre,
    duracion: String(s.duracion),
    precio: String(Number(s.precio)),
    activo: s.activo,
    orden: String(s.orden ?? 0),
  };
}

export function ServicioEditSheet({
  open,
  servicio,
  onClose,
  onSaved,
}: ServicioEditSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(servicio);

  useEffect(() => {
    if (open) {
      setMounted(true);
      document.body.style.overflow = "hidden";
      setForm(servicio ? toForm(servicio) : EMPTY);
      setConfirmDelete(false);
      setError(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, servicio]);

  const canSubmit =
    form.nombre.trim().length >= 2 &&
    Number(form.duracion) >= 10 &&
    Number(form.duracion) <= 240 &&
    Number(form.precio) >= 0;

  async function onSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      nombre: form.nombre.trim(),
      duracion: Number(form.duracion),
      precio: Number(form.precio),
      activo: form.activo,
      orden: Number(form.orden) || 0,
    };

    const res = servicio
      ? await actualizarServicio({ id: servicio.id, ...payload })
      : await crearServicio(payload);

    setSubmitting(false);
    if (res.success) {
      onSaved();
      onClose();
    } else {
      setError(res.error ?? "No se pudo guardar");
    }
  }

  async function onDelete() {
    if (!servicio) return;
    setDeleting(true);
    setError(null);
    const res = await eliminarServicio(servicio.id);
    setDeleting(false);
    if (res.success) {
      onSaved();
      onClose();
    } else {
      setError(res.error ?? "No se pudo eliminar");
      setConfirmDelete(false);
    }
  }

  if (!open) return null;

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
                  {isEdit ? "Editar" : "Nuevo"}
                </span>
                <span className="font-serif text-[15px] leading-none text-white">
                  Servicio
                </span>
              </div>
              <div className="h-9 w-9" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="flex flex-col gap-3 pt-2">
                <LabeledInput
                  label="Nombre"
                  value={form.nombre}
                  onChange={(v) => setForm((f) => ({ ...f, nombre: v }))}
                  placeholder="Corte, Barba, Combo…"
                />
                <div className="grid grid-cols-2 gap-3">
                  <LabeledInput
                    label="Duración (min)"
                    value={form.duracion}
                    onChange={(v) => setForm((f) => ({ ...f, duracion: v }))}
                    inputMode="numeric"
                    placeholder="30"
                  />
                  <LabeledInput
                    label="Precio (€)"
                    value={form.precio}
                    onChange={(v) => setForm((f) => ({ ...f, precio: v }))}
                    inputMode="decimal"
                    placeholder="15"
                  />
                </div>
                <LabeledInput
                  label="Orden"
                  value={form.orden}
                  onChange={(v) => setForm((f) => ({ ...f, orden: v }))}
                  inputMode="numeric"
                  placeholder="0 = primero"
                />

                <label className="mt-1 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-white">
                      Activo
                    </span>
                    <span className="text-[11px] text-white/50">
                      Visible para los clientes
                    </span>
                  </div>
                  <Toggle
                    checked={form.activo}
                    onChange={(v) => setForm((f) => ({ ...f, activo: v }))}
                  />
                </label>

                {isEdit && (
                  <div className="mt-2">
                    {confirmDelete ? (
                      <div className="flex flex-col gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 p-3">
                        <span className="text-[12px] text-red-100">
                          ¿Eliminar este servicio? Las citas pasadas mantendrán
                          el registro.
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 rounded-xl border border-white/15 px-3 py-2 text-[12px] text-white/80"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={onDelete}
                            disabled={deleting}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500/80 px-3 py-2 text-[12px] font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                          >
                            {deleting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/5 py-2.5 text-[13px] text-red-200/80 hover:border-red-400/50 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Eliminar servicio
                      </button>
                    )}
                  </div>
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
                {isEdit ? "Guardar" : "Crear"}
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
  inputMode?: "numeric" | "decimal" | "tel" | "text" | "email";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-gold/75">
        {label}
      </span>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:shadow-[0_0_0_1px_rgba(229,193,113,0.35)]"
      />
    </label>
  );
}
