"use client";

import { useState } from "react";
import type { BookingDatosCliente } from "../booking-reducer";
import { GlassCard } from "../components/GlassCard";
import { GoldButton } from "../components/GoldButton";
import { StepHeading } from "../components/StepHeading";

interface StepDatosProps {
  datos: BookingDatosCliente;
  onChange: (patch: Partial<BookingDatosCliente>) => void;
  onSubmit: () => Promise<void>;
  submitting: boolean;
  errorMensaje: string | null;
}

export function StepDatos({
  datos,
  onChange,
  onSubmit,
  submitting,
  errorMensaje,
}: StepDatosProps) {
  const [errores, setErrores] = useState<
    Partial<Record<keyof BookingDatosCliente, string>>
  >({});

  function validar(): boolean {
    const nuevos: Partial<Record<keyof BookingDatosCliente, string>> = {};
    if (datos.nombre.trim().length < 2) nuevos.nombre = "Nombre demasiado corto";
    if (!/^[+\d\s-]{6,20}$/.test(datos.telefono.trim()))
      nuevos.telefono = "Teléfono no válido";
    if (datos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email))
      nuevos.email = "Email no válido";
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    await onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-step-in flex flex-1 flex-col"
    >
      <StepHeading
        eyebrow="Paso 05 · Datos"
        title={
          <>
            Tus <em>datos</em>
          </>
        }
      />

      <GlassCard className="px-7 py-9">
        <div className="space-y-7">
          <Field
            label="Nombre"
            value={datos.nombre}
            onChange={(v) => onChange({ nombre: v })}
            error={errores.nombre}
            autoComplete="name"
          />
          <Field
            label="Teléfono móvil"
            value={datos.telefono}
            onChange={(v) => onChange({ telefono: v })}
            error={errores.telefono}
            type="tel"
            autoComplete="tel"
          />
          <Field
            label="Email (opcional)"
            value={datos.email}
            onChange={(v) => onChange({ email: v })}
            error={errores.email}
            type="email"
            autoComplete="email"
          />
          <div>
            <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.34em] text-gold/90">
              Notas (opcional)
            </label>
            <textarea
              placeholder="Preferencias, referencias, etc."
              value={datos.notas}
              onChange={(e) => onChange({ notas: e.target.value })}
              rows={3}
              className="edge-tile w-full resize-none rounded-2xl p-4 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-gold/65 focus:shadow-[0_0_0_1px_rgba(196,164,98,0.25),0_10px_28px_-10px_rgba(196,164,98,0.3),inset_0_1px_0_rgba(255,240,210,0.12)]"
            />
          </div>
        </div>
      </GlassCard>

      <label className="mt-6 flex cursor-pointer items-center gap-3">
        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            type="checkbox"
            checked={datos.recordatorioWhatsapp}
            onChange={(e) =>
              onChange({ recordatorioWhatsapp: e.target.checked })
            }
            className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded border border-gold/60 bg-transparent transition-colors checked:border-gold checked:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          />
          <svg
            className="pointer-events-none absolute h-3.5 w-3.5 text-black opacity-0 peer-checked:opacity-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
          </svg>
        </span>
        <span className="select-none text-[13px] tracking-wide text-white/85">
          Quiero recordatorio por WhatsApp 24h antes
        </span>
      </label>

      {errorMensaje && (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-900/20 p-3 text-sm text-red-300">
          {errorMensaje}
        </p>
      )}

      <div className="mt-auto pt-8">
        <GoldButton type="submit" disabled={submitting}>
          {submitting ? "Confirmando…" : "Confirmar reserva"}
        </GoldButton>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: FieldProps) {
  return (
    <div>
      <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.34em] text-gold/90">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="line-input"
      />
      {error && (
        <p className="mt-1.5 text-[11px] uppercase tracking-[0.15em] text-red-400/90">
          {error}
        </p>
      )}
    </div>
  );
}
