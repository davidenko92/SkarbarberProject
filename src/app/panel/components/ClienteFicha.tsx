"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Pencil,
  Check,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import type { Cliente, CitaConDetalles } from "@/lib/types";
import { actualizarCliente, eliminarCliente } from "@/lib/actions/citas";

interface ClienteFichaProps {
  cliente: Cliente;
  historial: CitaConDetalles[];
}

function telefonoLimpio(tel: string | null): string | null {
  if (!tel) return null;
  return tel.replace(/[^\d+]/g, "");
}

function formatFechaCorta(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatHora(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const ESTADO_COLOR: Record<string, string> = {
  confirmada: "text-gold bg-gold/10 border-gold/30",
  completada: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30",
  cancelada: "text-red-300 bg-red-400/10 border-red-400/30",
  no_asistio: "text-orange-300 bg-orange-400/10 border-orange-400/30",
};

const ESTADO_LABEL: Record<string, string> = {
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No vino",
};

export function ClienteFicha({ cliente, historial }: ClienteFichaProps) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    nombre: cliente.nombre,
    telefono: cliente.telefono ?? "",
    email: cliente.email ?? "",
    notas: cliente.notas ?? "",
  });

  const stats = useMemo(() => {
    const completadas = historial.filter((c) => c.estado === "completada");
    const total = completadas.reduce(
      (sum, c) => sum + Number(c.servicio?.precio ?? 0),
      0,
    );
    return {
      total_citas: historial.length,
      completadas: completadas.length,
      total_gastado: total,
    };
  }, [historial]);

  const tel = telefonoLimpio(cliente.telefono);

  async function guardar() {
    setSaving(true);
    setError(null);
    const res = await actualizarCliente({
      id: cliente.id,
      nombre: form.nombre,
      telefono: form.telefono,
      email: form.email,
      notas: form.notas,
    });
    setSaving(false);
    if (res.success) {
      setEditando(false);
      router.refresh();
    } else {
      setError(res.error ?? "No se pudo guardar");
    }
  }

  async function eliminar() {
    setSaving(true);
    const res = await eliminarCliente(cliente.id);
    setSaving(false);
    if (res.success) {
      router.replace("/panel/clientes");
    } else {
      setError(res.error ?? "No se pudo eliminar");
      setConfirmDelete(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/panel/clientes"
          aria-label="Volver"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-gold/40 hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        </Link>
        <span className="panel-label">Ficha cliente</span>
        <button
          type="button"
          onClick={() => {
            setEditando((v) => !v);
            setError(null);
          }}
          aria-label={editando ? "Cancelar" : "Editar"}
          className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
            editando
              ? "border-red-400/40 text-red-300 hover:border-red-400/60"
              : "border-white/10 text-white/60 hover:border-gold/40 hover:text-gold"
          }`}
        >
          {editando ? (
            <X className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Pencil className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      <div className="panel-card flex flex-col items-center gap-3 px-6 py-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gradient-to-br from-[#1a1408] via-black to-black font-serif text-[28px] text-gold shadow-[0_0_24px_-4px_rgba(229,193,113,0.35)]">
          {cliente.nombre.charAt(0).toUpperCase()}
        </div>
        {editando ? (
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-center font-serif text-[22px] text-white focus:border-gold/50 focus:outline-none"
          />
        ) : (
          <h1 className="text-center font-serif text-[26px] leading-tight text-white">
            {cliente.nombre}
          </h1>
        )}

        {!editando && tel && (
          <div className="flex gap-2">
            <a
              href={`tel:${tel}`}
              className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-black/40 px-3 py-1.5 text-[12px] font-medium text-white hover:border-gold/60 hover:text-gold active:scale-95"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
              Llamar
            </a>
            <a
              href={`https://wa.me/${tel.replace(/^\+/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-black/40 px-3 py-1.5 text-[12px] font-medium text-white hover:border-gold/60 hover:text-gold active:scale-95"
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
              WhatsApp
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <StatBox label="Visitas" value={stats.completadas} />
        <StatBox label="Citas" value={stats.total_citas} />
        <StatBox label="Gastado" value={`${stats.total_gastado}€`} accent />
      </div>

      {editando ? (
        <div className="panel-card flex flex-col gap-3 px-5 py-4">
          <FieldEdit
            label="Teléfono"
            value={form.telefono}
            onChange={(v) => setForm({ ...form, telefono: v })}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+34 600 000 000"
          />
          <FieldEdit
            label="Email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            type="email"
            placeholder="correo@ejemplo.com"
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-gold/75">
              Notas internas
            </span>
            <textarea
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              rows={3}
              maxLength={500}
              placeholder="Preferencias, alergias, detalles…"
              className="resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[14px] text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={guardar}
            disabled={saving || form.nombre.trim().length < 2}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-light via-gold to-gold-dark py-3 text-[14px] font-semibold text-black transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
            ) : (
              <Check className="h-4 w-4" strokeWidth={2.25} />
            )}
            Guardar cambios
          </button>

          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/5 py-2.5 text-[13px] font-medium text-red-300 transition-colors hover:border-red-400/60 hover:bg-red-500/10 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Eliminar cliente
          </button>
        </div>
      ) : (
        <div className="panel-card flex flex-col gap-2.5 px-5 py-4">
          <FieldView label="Teléfono" value={cliente.telefono ?? "—"} />
          <FieldView label="Email" value={cliente.email ?? "—"} />
          {cliente.notas && (
            <div className="flex flex-col gap-1 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-gold/75">
                Notas internas
              </span>
              <span className="text-[13px] leading-relaxed text-white/80">
                {cliente.notas}
              </span>
            </div>
          )}
        </div>
      )}

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="panel-label">Historial</span>
          <span className="text-[11px] text-white/40">
            {historial.length} {historial.length === 1 ? "cita" : "citas"}
          </span>
        </div>
        {historial.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-6 text-center text-[13px] text-white/50">
            Sin citas registradas
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {historial.map((c) => (
              <li key={c.id}>
                <div className="panel-card flex items-center gap-4 px-4 py-3">
                  <div className="flex min-w-[58px] flex-col items-center border-r border-gold/15 pr-4">
                    <span className="font-serif text-[15px] leading-none text-white">
                      {formatHora(c.inicio)}
                    </span>
                    <span className="mt-1 text-[9px] uppercase tracking-[0.22em] text-white/40">
                      {formatFechaCorta(c.inicio)}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-[14px] font-medium text-white">
                      {c.servicio?.nombre ?? "Servicio"}
                    </span>
                    <span className="truncate text-[11px] text-white/55">
                      {c.empleado?.nombre ?? "—"}
                    </span>
                    <span
                      className={`mt-1 inline-flex w-fit rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] ${ESTADO_COLOR[c.estado]}`}
                    >
                      {ESTADO_LABEL[c.estado]}
                    </span>
                  </div>
                  <span className="shrink-0 font-serif text-[14px] text-gold/80">
                    {Number(c.servicio?.precio ?? 0)}€
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {confirmDelete && (
        <ConfirmDialog
          title="¿Eliminar este cliente?"
          description="Se eliminarán también sus citas. Esta acción no se puede deshacer."
          onConfirm={eliminar}
          onCancel={() => setConfirmDelete(false)}
          loading={saving}
        />
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="panel-card flex flex-col gap-1 px-3 py-3">
      <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-gold/70">
        {label}
      </span>
      <span
        className={`font-serif leading-none ${accent ? "text-[22px] text-gold" : "text-[22px] text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}

function FieldView({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/70">
        {label}
      </span>
      <span className="text-[14px] text-white/90">{value}</span>
    </div>
  );
}

function FieldEdit({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  inputMode?: "tel" | "email" | "text" | "numeric" | "url";
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-gold/75">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-[14px] text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none"
      />
    </label>
  );
}

function ConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCancel}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-sm rounded-3xl border border-gold/30 bg-gradient-to-b from-[#141108]/95 via-black/95 to-black p-6 shadow-[0_20px_60px_-8px_rgba(0,0,0,0.9)]">
        <h3 className="font-serif text-[20px] text-white">{title}</h3>
        <p className="mt-2 text-[13px] text-white/60">{description}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-2xl border border-white/15 bg-black/40 py-2.5 text-[13px] font-medium text-white/80 hover:border-white/30"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-red-400/40 bg-red-500/20 py-2.5 text-[13px] font-semibold text-red-200 hover:border-red-400/70 hover:bg-red-500/30 disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
            ) : (
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
