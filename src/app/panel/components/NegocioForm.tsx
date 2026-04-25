"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { actualizarNegocio } from "@/lib/actions/admin";
import type { HorarioLaboral, Negocio } from "@/lib/types";
import { HorarioEditor } from "./HorarioEditor";

interface NegocioFormProps {
  negocio: Negocio;
  readOnly?: boolean;
}

interface FormState {
  nombre: string;
  telefono: string;
  direccion: string;
  horario: HorarioLaboral;
}

function toForm(n: Negocio): FormState {
  return {
    nombre: n.nombre,
    telefono: n.telefono ?? "",
    direccion: n.direccion ?? "",
    horario: n.horario_laboral,
  };
}

export function NegocioForm({ negocio, readOnly }: NegocioFormProps) {
  const [form, setForm] = useState<FormState>(toForm(negocio));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
    setMessage(null);
  }

  async function onSave() {
    if (readOnly) return;
    setSaving(true);
    setMessage(null);
    const res = await actualizarNegocio({
      id: negocio.id,
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
      horario_laboral: form.horario,
    });
    setSaving(false);
    if (res.success) {
      setDirty(false);
      setMessage({ type: "ok", text: "Guardado" });
    } else {
      setMessage({ type: "error", text: res.error ?? "No se pudo guardar" });
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="panel-label">Negocio</span>
        {readOnly && (
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            Solo lectura
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <LabeledInput
          label="Nombre"
          value={form.nombre}
          onChange={(v) => update("nombre", v)}
          readOnly={readOnly}
        />
        <div className="grid grid-cols-1 gap-2.5">
          <LabeledInput
            label="Teléfono"
            value={form.telefono}
            onChange={(v) => update("telefono", v)}
            readOnly={readOnly}
            inputMode="tel"
            placeholder="+34 …"
          />
          <LabeledInput
            label="Dirección"
            value={form.direccion}
            onChange={(v) => update("direccion", v)}
            readOnly={readOnly}
            placeholder="Calle, número, ciudad"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <span className="panel-label">Horario laboral</span>
        <HorarioEditor
          value={form.horario}
          onChange={(h) => update("horario", h)}
          readOnly={readOnly}
        />
      </div>

      {!readOnly && (
        <div className="sticky bottom-[calc(env(safe-area-inset-bottom,0px)+68px)] mt-2 flex flex-col gap-2">
          {message && (
            <div
              className={`rounded-xl border px-3 py-2 text-[12px] ${
                message.type === "ok"
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-red-400/40 bg-red-500/10 text-red-200"
              }`}
            >
              {message.text}
            </div>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || saving}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-light via-gold to-gold-dark py-3.5 text-[14px] font-semibold tracking-wide text-black shadow-[0_10px_30px_-8px_rgba(229,193,113,0.55)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
            ) : (
              <Check className="h-4 w-4" strokeWidth={2.25} />
            )}
            Guardar cambios
          </button>
        </div>
      )}
    </section>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  readOnly,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
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
        readOnly={readOnly}
        placeholder={placeholder}
        inputMode={inputMode}
        className="rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:shadow-[0_0_0_1px_rgba(229,193,113,0.35)] read-only:opacity-80 read-only:focus:border-white/10 read-only:focus:shadow-none"
      />
    </label>
  );
}
