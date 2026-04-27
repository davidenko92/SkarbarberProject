"use server";

import { createClient } from "@/lib/supabase/server";
import type { HorarioLaboral } from "@/lib/types";

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

export interface OcupacionDia {
  fecha: string;
  diaCorto: string;
  ocupados: number;
  capacidad: number;
  porcentaje: number;
}

export async function getOcupacionSemanal(): Promise<OcupacionDia[]> {
  const { supabase } = await requireUser();
  const ahora = new Date();
  const semanaIni = inicioSemanaLunes(ahora);
  const semanaFin = new Date(semanaIni.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [{ data: negocio }, { data: barberos }, { data: citas }] =
    await Promise.all([
      supabase
        .from("negocio")
        .select("horario_laboral")
        .limit(1)
        .maybeSingle()
        .returns<{ horario_laboral: HorarioLaboral } | null>(),
      supabase
        .from("empleados")
        .select("id")
        .eq("activo", true)
        .returns<Array<{ id: string }>>(),
      supabase
        .from("citas")
        .select("inicio, fin, estado")
        .gte("inicio", semanaIni.toISOString())
        .lt("inicio", semanaFin.toISOString())
        .in("estado", ["confirmada", "completada"])
        .returns<Array<{ inicio: string; fin: string; estado: string }>>(),
    ]);

  const horario = negocio?.horario_laboral;
  const numBarberos = (barberos ?? []).length || 1;

  const minutosOcupadosPorDia = new Map<string, number>();
  for (const c of citas ?? []) {
    const ini = new Date(c.inicio);
    const fin = new Date(c.fin);
    const clave = fmtISO(ini);
    const min = (fin.getTime() - ini.getTime()) / 60_000;
    minutosOcupadosPorDia.set(
      clave,
      (minutosOcupadosPorDia.get(clave) ?? 0) + min,
    );
  }

  const dias: OcupacionDia[] = [];
  const cortos = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(semanaIni);
    d.setDate(semanaIni.getDate() + i);
    const fechaISO = fmtISO(d);
    const dow = d.getDay();
    const tramos = horario?.[DIAS_KEYS[dow]] ?? null;

    let capacidad = 0;
    if (Array.isArray(tramos) && tramos.length > 0) {
      for (const t of tramos) {
        const [ah, am] = t.apertura.split(":").map(Number);
        const [ch, cm] = t.cierre.split(":").map(Number);
        capacidad += (ch * 60 + cm) - (ah * 60 + am);
      }
    }
    capacidad *= numBarberos;

    const ocupados = minutosOcupadosPorDia.get(fechaISO) ?? 0;
    const porcentaje =
      capacidad > 0 ? Math.min(100, Math.round((ocupados / capacidad) * 100)) : 0;

    dias.push({
      fecha: fechaISO,
      diaCorto: cortos[i],
      ocupados,
      capacidad,
      porcentaje,
    });
  }

  return dias;
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

export async function getTopServiciosMes(limit = 5): Promise<TopServicio[]> {
  const { supabase } = await requireUser();
  const ahora = new Date();
  const mesIni = inicioMes(ahora);
  const mesFin = inicioMesSiguiente(ahora);

  const { data, error } = await supabase
    .from("citas")
    .select(
      "estado, servicio:servicios(id, nombre, duracion, precio)",
    )
    .gte("inicio", mesIni.toISOString())
    .lt("inicio", mesFin.toISOString())
    .in("estado", ["confirmada", "completada"])
    .returns<
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

export async function getRolMetricas(): Promise<"propietario" | "barbero" | null> {
  return await getRol();
}
