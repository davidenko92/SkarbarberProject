"use server";

import { createClient } from "@/lib/supabase/server";
import type { HorarioLaboral } from "@/lib/types";
import { resolverRango } from "@/lib/metricas/periodos";
import type { FiltroRango } from "@/lib/metricas/periodos";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");
  return { supabase, user };
}

async function getRol(): Promise<"propietario" | "barbero" | null> {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("empleados")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();
  return (data?.rol ?? null) as "propietario" | "barbero" | null;
}

function fmtISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function inicioDelDia(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function inicioSemanaLunes(d: Date) {
  const x = inicioDelDia(d);
  const dow = x.getDay(); // 0=dom, 1=lun, ...
  const diff = dow === 0 ? -6 : 1 - dow;
  x.setDate(x.getDate() + diff);
  return x;
}

function inicioMes(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function inicioMesSiguiente(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
}


const DIAS_KEYS: Array<keyof HorarioLaboral> = [
  "dom",
  "lun",
  "mar",
  "mie",
  "jue",
  "vie",
  "sab",
];

export interface KpisDashboard {
  citasHoy: number;
  citasSemana: number;
  ingresosMes: number | null; // null = sin permiso
  clientesNuevosMes: number;
}

export async function getKpis(): Promise<KpisDashboard> {
  const { supabase } = await requireUser();
  const rol = await getRol();
  const ahora = new Date();

  const hoyIni = inicioDelDia(ahora);
  const hoyFin = new Date(hoyIni.getTime() + 24 * 60 * 60 * 1000);

  const semanaIni = inicioSemanaLunes(ahora);
  const semanaFin = new Date(semanaIni.getTime() + 7 * 24 * 60 * 60 * 1000);

  const mesIni = inicioMes(ahora);
  const mesFin = inicioMesSiguiente(ahora);

  const [citasHoyRes, citasSemanaRes, clientesNuevosRes] = await Promise.all([
    supabase
      .from("citas")
      .select("id", { count: "exact", head: true })
      .gte("inicio", hoyIni.toISOString())
      .lt("inicio", hoyFin.toISOString())
      .in("estado", ["confirmada", "completada"]),
    supabase
      .from("citas")
      .select("id", { count: "exact", head: true })
      .gte("inicio", semanaIni.toISOString())
      .lt("inicio", semanaFin.toISOString())
      .in("estado", ["confirmada", "completada"]),
    supabase
      .from("clientes")
      .select("id", { count: "exact", head: true })
      .gte("creado_en", mesIni.toISOString())
      .lt("creado_en", mesFin.toISOString()),
  ]);

  let ingresosMes: number | null = null;
  if (rol === "propietario") {
    const { data: completadas } = await supabase
      .from("citas")
      .select("servicio:servicios(precio)")
      .gte("inicio", mesIni.toISOString())
      .lt("inicio", mesFin.toISOString())
      .eq("estado", "completada")
      .returns<Array<{ servicio: { precio: number } | null }>>();
    ingresosMes = (completadas ?? []).reduce(
      (acc, row) => acc + Number(row.servicio?.precio ?? 0),
      0,
    );
  }

  return {
    citasHoy: citasHoyRes.count ?? 0,
    citasSemana: citasSemanaRes.count ?? 0,
    ingresosMes,
    clientesNuevosMes: clientesNuevosRes.count ?? 0,
  };
}

export interface OcupacionPunto {
  key: string;
  etiqueta: string;
  ocupados: number;
  capacidad: number;
  porcentaje: number;
  cerrado: boolean;
}

export type OcupacionModo = "dia-letra" | "dia-fecha" | "semana" | "mes";

export interface OcupacionResultado {
  puntos: OcupacionPunto[];
  modo: OcupacionModo;
  titulo: string;
}

const DIA_LETRA = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MES_CORTO = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function diaSemanaLunIdx(d: Date) {
  const dow = d.getDay();
  return dow === 0 ? 6 : dow - 1;
}

export async function getOcupacion(
  filtros: MetricasFiltros = {},
): Promise<OcupacionResultado> {
  const { supabase } = await requireUser();
  const { desde, hasta } = resolverRango(filtros);

  const totalDias = Math.max(
    1,
    Math.round((hasta.getTime() - desde.getTime()) / (24 * 60 * 60 * 1000)),
  );

  let barberosQuery = supabase
    .from("empleados")
    .select("id")
    .eq("activo", true);
  if (filtros.empleadoId) barberosQuery = barberosQuery.eq("id", filtros.empleadoId);

  let citasQuery = supabase
    .from("citas")
    .select("inicio, fin, estado")
    .gte("inicio", desde.toISOString())
    .lt("inicio", hasta.toISOString())
    .in("estado", ["confirmada", "completada"]);
  if (filtros.empleadoId)
    citasQuery = citasQuery.eq("empleado_id", filtros.empleadoId);

  const [{ data: negocio }, { data: barberos }, { data: citas }] =
    await Promise.all([
      supabase
        .from("negocio")
        .select("horario_laboral")
        .limit(1)
        .maybeSingle()
        .returns<{ horario_laboral: HorarioLaboral } | null>(),
      barberosQuery.returns<Array<{ id: string }>>(),
      citasQuery.returns<Array<{ inicio: string; fin: string; estado: string }>>(),
    ]);

  const horario = negocio?.horario_laboral;
  const numBarberos = (barberos ?? []).length || 1;

  const minutosPorDia = new Map<string, number>();
  for (const c of citas ?? []) {
    const ini = new Date(c.inicio);
    const fin = new Date(c.fin);
    const clave = fmtISO(ini);
    const min = (fin.getTime() - ini.getTime()) / 60_000;
    minutosPorDia.set(clave, (minutosPorDia.get(clave) ?? 0) + min);
  }

  function capacidadDia(d: Date): number {
    const dow = d.getDay();
    const tramos = horario?.[DIAS_KEYS[dow]] ?? null;
    if (!Array.isArray(tramos) || tramos.length === 0) return 0;
    let cap = 0;
    for (const t of tramos) {
      const [ah, am] = t.apertura.split(":").map(Number);
      const [ch, cm] = t.cierre.split(":").map(Number);
      cap += ch * 60 + cm - (ah * 60 + am);
    }
    return cap * numBarberos;
  }

  let modo: OcupacionModo;
  if (totalDias <= 14) {
    const esSemanaCompleta =
      totalDias === 7 && diaSemanaLunIdx(desde) === 0;
    modo = esSemanaCompleta ? "dia-letra" : "dia-fecha";
  } else if (totalDias <= 92) {
    modo = "semana";
  } else {
    modo = "mes";
  }

  const puntos: OcupacionPunto[] = [];

  if (modo === "dia-letra" || modo === "dia-fecha") {
    const compactaDia = totalDias > 3;
    for (let i = 0; i < totalDias; i++) {
      const d = new Date(desde);
      d.setDate(desde.getDate() + i);
      const key = fmtISO(d);
      const cap = capacidadDia(d);
      const ocup = minutosPorDia.get(key) ?? 0;
      const pct = cap > 0 ? Math.min(100, Math.round((ocup / cap) * 100)) : 0;
      let etiqueta: string;
      if (modo === "dia-letra") {
        etiqueta = DIA_LETRA[diaSemanaLunIdx(d)];
      } else if (compactaDia) {
        etiqueta = String(d.getDate());
      } else {
        etiqueta = `${d.getDate()} ${MES_CORTO[d.getMonth()]}`;
      }
      puntos.push({
        key,
        etiqueta,
        ocupados: ocup,
        capacidad: cap,
        porcentaje: pct,
        cerrado: cap === 0,
      });
    }
  } else if (modo === "semana") {
    let cursor = new Date(desde);
    const offset = diaSemanaLunIdx(cursor);
    cursor.setDate(cursor.getDate() - offset);
    while (cursor < hasta) {
      let cap = 0;
      let ocup = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(cursor);
        d.setDate(cursor.getDate() + i);
        if (d < desde || d >= hasta) continue;
        cap += capacidadDia(d);
        ocup += minutosPorDia.get(fmtISO(d)) ?? 0;
      }
      const pct = cap > 0 ? Math.min(100, Math.round((ocup / cap) * 100)) : 0;
      puntos.push({
        key: fmtISO(cursor),
        etiqueta: `${cursor.getDate()}${MES_CORTO[cursor.getMonth()]}`,
        ocupados: ocup,
        capacidad: cap,
        porcentaje: pct,
        cerrado: cap === 0,
      });
      cursor = new Date(cursor);
      cursor.setDate(cursor.getDate() + 7);
    }
  } else {
    let cursor = new Date(desde.getFullYear(), desde.getMonth(), 1);
    while (cursor < hasta) {
      const finMes = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      let cap = 0;
      let ocup = 0;
      const d = new Date(cursor);
      while (d < finMes && d < hasta) {
        if (d >= desde) {
          cap += capacidadDia(d);
          ocup += minutosPorDia.get(fmtISO(d)) ?? 0;
        }
        d.setDate(d.getDate() + 1);
      }
      const pct = cap > 0 ? Math.min(100, Math.round((ocup / cap) * 100)) : 0;
      puntos.push({
        key: `${cursor.getFullYear()}-${cursor.getMonth() + 1}`,
        etiqueta: MES_CORTO[cursor.getMonth()].toUpperCase(),
        ocupados: ocup,
        capacidad: cap,
        porcentaje: pct,
        cerrado: cap === 0,
      });
      cursor = finMes;
    }
  }

  const titulo =
    modo === "dia-letra"
      ? "Ocupación semanal"
      : modo === "dia-fecha"
        ? "Ocupación por día"
        : modo === "semana"
          ? "Ocupación por semana"
          : "Ocupación por mes";

  return { puntos, modo, titulo };
}

export interface TopCliente {
  id: string;
  nombre: string;
  telefono: string | null;
  citas: number;
  totalGastado: number;
  ultimaVisita: string | null;
}

export async function getTopClientes(limit = 5): Promise<TopCliente[]> {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("citas")
    .select(
      "inicio, estado, cliente:clientes(id, nombre, telefono), servicio:servicios(precio)",
    )
    .in("estado", ["confirmada", "completada"])
    .returns<
      Array<{
        inicio: string;
        estado: string;
        cliente: { id: string; nombre: string; telefono: string | null } | null;
        servicio: { precio: number } | null;
      }>
    >();
  if (error) throw new Error(error.message);

  const acc = new Map<string, TopCliente>();
  for (const row of data ?? []) {
    if (!row.cliente) continue;
    const cur = acc.get(row.cliente.id) ?? {
      id: row.cliente.id,
      nombre: row.cliente.nombre,
      telefono: row.cliente.telefono,
      citas: 0,
      totalGastado: 0,
      ultimaVisita: null,
    };
    cur.citas += 1;
    if (row.estado === "completada") {
      cur.totalGastado += Number(row.servicio?.precio ?? 0);
    }
    if (!cur.ultimaVisita || row.inicio > cur.ultimaVisita) {
      cur.ultimaVisita = row.inicio;
    }
    acc.set(row.cliente.id, cur);
  }

  return [...acc.values()]
    .sort((a, b) => b.citas - a.citas || b.totalGastado - a.totalGastado)
    .slice(0, limit);
}

export interface TopServicio {
  id: string;
  nombre: string;
  duracion: number;
  precio: number;
  veces: number;
  ingresos: number;
}

export async function getTopServiciosMes(
  limit = 5,
  filtros: MetricasFiltros = {},
): Promise<TopServicio[]> {
  const { supabase } = await requireUser();
  const { desde, hasta } = resolverRango(filtros);

  let query = supabase
    .from("citas")
    .select(
      "estado, servicio:servicios(id, nombre, duracion, precio)",
    )
    .gte("inicio", desde.toISOString())
    .lt("inicio", hasta.toISOString())
    .in("estado", ["confirmada", "completada"]);
  if (filtros.empleadoId) query = query.eq("empleado_id", filtros.empleadoId);

  const { data, error } = await query.returns<
    Array<{
      estado: string;
      servicio: {
        id: string;
        nombre: string;
        duracion: number;
        precio: number;
      } | null;
    }>
  >();
  if (error) throw new Error(error.message);

  const acc = new Map<string, TopServicio>();
  for (const row of data ?? []) {
    if (!row.servicio) continue;
    const s = row.servicio;
    const cur = acc.get(s.id) ?? {
      id: s.id,
      nombre: s.nombre,
      duracion: s.duracion,
      precio: Number(s.precio),
      veces: 0,
      ingresos: 0,
    };
    cur.veces += 1;
    if (row.estado === "completada") {
      cur.ingresos += Number(s.precio);
    }
    acc.set(s.id, cur);
  }

  return [...acc.values()]
    .sort((a, b) => b.veces - a.veces || b.ingresos - a.ingresos)
    .slice(0, limit);
}

export interface EstadosCitas {
  completadas: number;
  canceladas: number;
  noAsistio: number;
}

export interface MetricasFiltros extends FiltroRango {
  empleadoId?: string | null;
}

export async function getEstadosCitas(
  filtros: MetricasFiltros = {},
): Promise<EstadosCitas> {
  const { supabase } = await requireUser();
  const { desde, hasta } = resolverRango(filtros);

  const base = () => {
    let q = supabase
      .from("citas")
      .select("id", { count: "exact", head: true })
      .gte("inicio", desde.toISOString())
      .lt("inicio", hasta.toISOString());
    if (filtros.empleadoId) q = q.eq("empleado_id", filtros.empleadoId);
    return q;
  };

  const [completadasRes, canceladasRes, noShowRes] = await Promise.all([
    base().eq("estado", "completada"),
    base().eq("estado", "cancelada"),
    base().eq("estado", "no_asistio"),
  ]);

  return {
    completadas: completadasRes.count ?? 0,
    canceladas: canceladasRes.count ?? 0,
    noAsistio: noShowRes.count ?? 0,
  };
}

export async function getRolMetricas(): Promise<"propietario" | "barbero" | null> {
  return await getRol();
}
