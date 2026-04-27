"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  Search,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import type { Cliente, Empleado, Servicio } from "@/lib/types";
import { getServiciosActivos, getSlotsDisponibles } from "@/lib/actions/reservas";
import {
  buscarClientes,
  crearCitaManual,
  type CrearCitaManualInput,
} from "@/lib/actions/citas";

interface CrearCitaSheetProps {
  open: boolean;
  empleados: Empleado[];
  fechaInicial?: string;
  onClose: () => void;
  onCreated: () => void;
}

type Paso = 1 | 2 | 3 | 4 | 5;
type TipoCliente = "existente" | "nuevo" | "walkin";

interface DraftCliente {
  tipo: TipoCliente;
  existente: Cliente | null;
  nuevo: { nombre: string; telefono: string; email: string };
  walkin: { nombre: string };
}

const EMPTY_DRAFT: DraftCliente = {
  tipo: "existente",
  existente: null,
  nuevo: { nombre: "", telefono: "", email: "" },
  walkin: { nombre: "" },
};

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDia(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return {
    dia: d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", ""),
    numero: d.getDate(),
    mes: d.toLocaleDateString("es-ES", { month: "short" }).replace(".", ""),
  };
}

export function CrearCitaSheet({
  open,
  empleados,
  fechaInicial,
  onClose,
  onCreated,
}: CrearCitaSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [paso, setPaso] = useState<Paso>(1);
  const [empleadoId, setEmpleadoId] = useState<string | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [servicioId, setServicioId] = useState<string | null>(null);
  const [fecha, setFecha] = useState<string>(fechaInicial ?? toISODate(new Date()));
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [hora, setHora] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftCliente>(EMPTY_DRAFT);
  const [notas, setNotas] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setPaso(1);
      setEmpleadoId(null);
      setServicioId(null);
      setHora(null);
      setDraft(EMPTY_DRAFT);
      setNotas("");
      setError(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    getServiciosActivos()
      .then(setServicios)
      .catch(() => setServicios([]));
  }, [open]);

  const servicio = useMemo(
    () => servicios.find((s) => s.id === servicioId) ?? null,
    [servicios, servicioId],
  );

  useEffect(() => {
    if (paso !== 4 || !empleadoId || !servicio) return;
    setLoadingSlots(true);
    getSlotsDisponibles({
      empleadoId,
      fecha,
      duracionMin: servicio.duracion,
    })
      .then((res) => setSlots(res))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [paso, empleadoId, servicio, fecha]);

  const dias = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return toISODate(d);
    });
  }, []);

  const canProceed = useMemo(() => {
    if (paso === 1) return Boolean(empleadoId);
    if (paso === 2) return Boolean(servicioId);
    if (paso === 3) return Boolean(fecha);
    if (paso === 4) return Boolean(hora);
    if (paso === 5) {
      if (draft.tipo === "existente") return Boolean(draft.existente);
      if (draft.tipo === "nuevo") {
        return (
          draft.nuevo.nombre.trim().length >= 2 &&
          draft.nuevo.telefono.trim().length >= 6
        );
      }
      return draft.walkin.nombre.trim().length >= 2;
    }
    return false;
  }, [paso, empleadoId, servicioId, fecha, hora, draft]);

  function siguiente() {
    setError(null);
    if (paso < 5) setPaso((p) => (p + 1) as Paso);
  }

  function atras() {
    setError(null);
    if (paso > 1) setPaso((p) => (p - 1) as Paso);
  }

  async function enviar() {
    if (!empleadoId || !servicioId || !hora) return;
    setSubmitting(true);
    setError(null);

    let clientePayload: CrearCitaManualInput["cliente"];
    if (draft.tipo === "existente" && draft.existente) {
      clientePayload = { tipo: "existente", clienteId: draft.existente.id };
    } else if (draft.tipo === "nuevo") {
      clientePayload = {
        tipo: "nuevo",
        nombre: draft.nuevo.nombre.trim(),
        telefono: draft.nuevo.telefono.trim(),
        email: draft.nuevo.email.trim() || "",
      };
    } else {
      clientePayload = {
        tipo: "walkin",
        nombre: draft.walkin.nombre.trim(),
      };
    }

    const res = await crearCitaManual({
      empleadoId,
      servicioId,
      fecha,
      hora,
      notas: notas.trim() || undefined,
      cliente: clientePayload,
    });

    setSubmitting(false);
    if (res.success) {
      onCreated();
      onClose();
    } else {
      setError(res.error ?? "No se pudo crear la cita");
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
          <div
            className="relative flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[28px] border-t border-gold/30 bg-gradient-to-b from-[#141108]/95 via-black/95 to-black/98 shadow-[0_-20px_60px_-8px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          >
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/20" />

            <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
              <button
                type="button"
                onClick={paso === 1 ? onClose : atras}
                aria-label={paso === 1 ? "Cerrar" : "Atrás"}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-gold/40 hover:text-gold"
              >
                {paso === 1 ? (
                  <X className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                )}
              </button>
              <StepIndicator paso={paso} />
              <div className="h-9 w-9" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {paso === 1 && (
                <PasoBarbero
                  empleados={empleados}
                  selected={empleadoId}
                  onSelect={setEmpleadoId}
                />
              )}
              {paso === 2 && (
                <PasoServicio
                  servicios={servicios}
                  selected={servicioId}
                  onSelect={setServicioId}
                />
              )}
              {paso === 3 && (
                <PasoDia dias={dias} selected={fecha} onSelect={setFecha} />
              )}
              {paso === 4 && (
                <PasoHora
                  slots={slots}
                  selected={hora}
                  loading={loadingSlots}
                  onSelect={setHora}
                />
              )}
              {paso === 5 && (
                <PasoCliente
                  draft={draft}
                  onChange={setDraft}
                  notas={notas}
                  onNotas={setNotas}
                />
              )}
            </div>

            <div className="border-t border-white/5 bg-black/40 px-5 py-4">
              {error && (
                <div className="mb-3 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
                  {error}
                </div>
              )}
              {paso < 5 ? (
                <button
                  type="button"
                  onClick={siguiente}
                  disabled={!canProceed}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-light via-gold to-gold-dark py-3.5 text-[14px] font-semibold tracking-wide text-black shadow-[0_10px_30px_-8px_rgba(229,193,113,0.55)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={enviar}
                  disabled={!canProceed || submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-light via-gold to-gold-dark py-3.5 text-[14px] font-semibold tracking-wide text-black shadow-[0_10px_30px_-8px_rgba(229,193,113,0.55)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                  ) : (
                    <Check className="h-4 w-4" strokeWidth={2.25} />
                  )}
                  Confirmar cita
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PASO_LABELS: Record<Paso, string> = {
  1: "Barbero",
  2: "Servicio",
  3: "Día",
  4: "Hora",
  5: "Cliente",
};

function StepIndicator({ paso }: { paso: Paso }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-semibold uppercase tracking-[0.32em] text-gold/75">
        Paso {paso} / 5
      </span>
      <span className="font-serif text-[15px] leading-none text-white">
        {PASO_LABELS[paso]}
      </span>
    </div>
  );
}

function PasoBarbero({
  empleados,
  selected,
  onSelect,
}: {
  empleados: Empleado[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 pt-2">
      {empleados.map((e) => {
        const active = e.id === selected;
        return (
          <button
            key={e.id}
            type="button"
            onClick={() => onSelect(e.id)}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all active:scale-[0.99] ${
              active
                ? "border-gold bg-gold/10 shadow-[0_0_0_1px_rgba(229,193,113,0.4),0_8px_24px_-8px_rgba(229,193,113,0.3)]"
                : "border-white/10 bg-black/40 hover:border-gold/40"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-serif text-[15px] ${
                active
                  ? "bg-gradient-to-br from-gold-light to-gold-dark text-black"
                  : "border border-white/15 bg-black/50 text-white/70"
              }`}
            >
              {e.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-[15px] font-medium text-white">
                {e.nombre}
              </span>
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                {e.rol}
              </span>
            </div>
            {active && <Check className="h-4 w-4 text-gold" strokeWidth={2.25} />}
          </button>
        );
      })}
    </div>
  );
}

function PasoServicio({
  servicios,
  selected,
  onSelect,
}: {
  servicios: Servicio[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 pt-2">
      {servicios.map((s) => {
        const active = s.id === selected;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all active:scale-[0.99] ${
              active
                ? "border-gold bg-gold/10 shadow-[0_0_0_1px_rgba(229,193,113,0.4),0_8px_24px_-8px_rgba(229,193,113,0.3)]"
                : "border-white/10 bg-black/40 hover:border-gold/40"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-white">
                {s.nombre}
              </span>
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                {s.duracion} min
              </span>
            </div>
            <span
              className={`font-serif text-[22px] ${active ? "text-gold" : "text-white/80"}`}
            >
              {Number(s.precio)}€
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PasoDia({
  dias,
  selected,
  onSelect,
}: {
  dias: string[];
  selected: string;
  onSelect: (d: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 pt-2">
      {dias.map((iso) => {
        const active = iso === selected;
        const { dia, numero, mes } = formatDia(iso);
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelect(iso)}
            className={`flex flex-col items-center gap-0.5 rounded-2xl border py-3 text-center transition-all active:scale-[0.97] ${
              active
                ? "border-gold bg-gradient-to-br from-gold-light via-gold to-gold-dark text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_20px_-4px_rgba(229,193,113,0.45)]"
                : "border-white/10 bg-black/40 text-white/85 hover:border-gold/40"
            }`}
          >
            <span
              className={`text-[10px] uppercase tracking-[0.22em] ${active ? "text-black/70" : "text-white/45"}`}
            >
              {dia}
            </span>
            <span className="font-serif text-[20px] leading-none">
              {numero}
            </span>
            <span
              className={`text-[9px] uppercase tracking-[0.22em] ${active ? "text-black/70" : "text-white/45"}`}
            >
              {mes}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PasoHora({
  slots,
  selected,
  loading,
  onSelect,
}: {
  slots: string[];
  selected: string | null;
  loading: boolean;
  onSelect: (h: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2
          className="h-6 w-6 animate-spin text-gold"
          strokeWidth={1.75}
        />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <span className="font-serif text-[18px] text-white">
          Sin huecos libres
        </span>
        <span className="text-[12px] text-white/50">
          Prueba con otro día o barbero.
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 pt-2">
      {slots.map((s) => {
        const active = s === selected;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onSelect(s)}
            className={`rounded-2xl border py-2.5 text-[15px] font-medium transition-all active:scale-[0.97] ${
              active
                ? "border-gold bg-gradient-to-br from-gold-light via-gold to-gold-dark text-black shadow-[0_0_20px_-4px_rgba(229,193,113,0.5)]"
                : "border-white/10 bg-black/40 text-white/85 hover:border-gold/40"
            }`}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

function PasoCliente({
  draft,
  onChange,
  notas,
  onNotas,
}: {
  draft: DraftCliente;
  onChange: (d: DraftCliente) => void;
  notas: string;
  onNotas: (v: string) => void;
}) {
  const tabs: { id: TipoCliente; label: string; icon: typeof Search }[] = [
    { id: "existente", label: "Buscar", icon: Search },
    { id: "nuevo", label: "Nuevo", icon: UserPlus },
    { id: "walkin", label: "Sin datos", icon: UserRound },
  ];

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-1">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = draft.tipo === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange({ ...draft, tipo: id })}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-medium transition-all ${
                active
                  ? "bg-gradient-to-br from-gold-light via-gold to-gold-dark text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {label}
            </button>
          );
        })}
      </div>

      {draft.tipo === "existente" && (
        <BuscarClienteInline
          selected={draft.existente}
          onSelect={(c) => onChange({ ...draft, existente: c })}
        />
      )}

      {draft.tipo === "nuevo" && (
        <div className="flex flex-col gap-2.5">
          <LabeledInput
            label="Nombre"
            value={draft.nuevo.nombre}
            onChange={(v) =>
              onChange({ ...draft, nuevo: { ...draft.nuevo, nombre: v } })
            }
            placeholder="Nombre y apellido"
          />
          <LabeledInput
            label="Teléfono"
            value={draft.nuevo.telefono}
            onChange={(v) =>
              onChange({ ...draft, nuevo: { ...draft.nuevo, telefono: v } })
            }
            placeholder="+34 600 000 000"
            inputMode="tel"
          />
          <LabeledInput
            label="Email (opcional)"
            value={draft.nuevo.email}
            onChange={(v) =>
              onChange({ ...draft, nuevo: { ...draft.nuevo, email: v } })
            }
            placeholder="correo@ejemplo.com"
            inputMode="email"
          />
        </div>
      )}

      {draft.tipo === "walkin" && (
        <LabeledInput
          label="Nombre"
          value={draft.walkin.nombre}
          onChange={(v) =>
            onChange({ ...draft, walkin: { nombre: v } })
          }
          placeholder="Solo nombre (sin teléfono)"
        />
      )}

      <div className="mt-2 flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-gold/75">
          Notas (opcional)
        </span>
        <textarea
          value={notas}
          onChange={(e) => onNotas(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Alergias, preferencias…"
          className="resize-none rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:shadow-[0_0_0_1px_rgba(229,193,113,0.35)]"
        />
      </div>
    </div>
  );
}

function BuscarClienteInline({
  selected,
  onSelect,
}: {
  selected: Cliente | null;
  onSelect: (c: Cliente | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (selected || q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(() => {
      buscarClientes({ query: q, limit: 8 })
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 220);
    return () => clearTimeout(handle);
  }, [query, selected]);

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-gold bg-gold/10 px-4 py-3">
        <div className="flex flex-col">
          <span className="text-[15px] font-medium text-white">
            {selected.nombre}
          </span>
          <span className="text-[12px] text-white/55">
            {selected.telefono ?? "Sin teléfono"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-label="Cambiar cliente"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/70 hover:border-gold/50 hover:text-gold"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
          strokeWidth={1.75}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o teléfono"
          className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-10 pr-3 text-[14px] text-white placeholder:text-white/35 focus:border-gold/50 focus:outline-none"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-3">
          <Loader2 className="h-4 w-4 animate-spin text-gold" strokeWidth={1.75} />
        </div>
      )}

      {!loading && query.trim().length >= 2 && results.length === 0 && (
        <span className="px-1 text-[12px] text-white/45">
          Sin coincidencias
        </span>
      )}

      {!loading && results.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-left transition-colors hover:border-gold/40 hover:bg-gold/5"
              >
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-white">
                    {c.nombre}
                  </span>
                  {c.telefono && (
                    <span className="text-[11px] text-white/50">
                      {c.telefono}
                    </span>
                  )}
                </div>
                <ChevronRight
                  className="h-4 w-4 text-white/35"
                  strokeWidth={1.75}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
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
        type={inputMode === "email" ? "email" : inputMode === "tel" ? "tel" : "text"}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/30 focus:border-gold/50 focus:outline-none focus:shadow-[0_0_0_1px_rgba(229,193,113,0.35)]"
      />
    </label>
  );
}
