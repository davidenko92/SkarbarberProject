"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendReservaEmails } from "@/lib/email/sendReservaEmails";
import { phoneSchema } from "@/lib/validation/phone";
import type { Empleado, HorarioLaboral, HorarioTramo, Servicio } from "@/lib/types";

const DIAS_SEMANA: Array<keyof HorarioLaboral> = [
  "dom",
  "lun",
  "mar",
  "mie",
  "jue",
  "vie",
  "sab",
];

export async function getBarberosActivos(): Promise<Empleado[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empleados")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getServiciosActivos(): Promise<Servicio[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .eq("activo", true)
    .order("orden")
    .order("nombre");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getHorarioLaboral(): Promise<HorarioLaboral> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("negocio")
    .select("horario_laboral")
    .limit(1)
    .single();

  if (error) throw new Error(error.message);
  return data.horario_laboral as HorarioLaboral;
}

function nowMadridIsoLocal(): string {
  return new Date().toLocaleString("sv-SE", { timeZone: "Europe/Madrid" });
}

function generarSlotsDelTramo(
  fecha: string,
  tramo: HorarioTramo,
  duracionMin: number,
): string[] {
  const slots: string[] = [];
  const [aperturaH, aperturaM] = tramo.apertura.split(":").map(Number);
  const [cierreH, cierreM] = tramo.cierre.split(":").map(Number);

  const cursor = new Date(`${fecha}T00:00:00`);
  cursor.setHours(aperturaH, aperturaM, 0, 0);

  const limite = new Date(`${fecha}T00:00:00`);
  limite.setHours(cierreH, cierreM, 0, 0);
  limite.setMinutes(limite.getMinutes() - duracionMin);

  while (cursor <= limite) {
    const hh = String(cursor.getHours()).padStart(2, "0");
    const mm = String(cursor.getMinutes()).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
    cursor.setMinutes(cursor.getMinutes() + 30);
  }

  return slots;
}

export interface SlotsInput {
  empleadoId: string;
  fecha: string; // YYYY-MM-DD
  duracionMin: number;
}

export async function getSlotsDisponibles(input: SlotsInput): Promise<string[]> {
  const { empleadoId, fecha, duracionMin } = input;

  const horario = await getHorarioLaboral();
  const diaSemana = DIAS_SEMANA[new Date(`${fecha}T00:00:00`).getDay()];
  const tramos = horario[diaSemana];
  if (!tramos || tramos.length === 0) return [];

  const todosSlots = tramos.flatMap((tramo) =>
    generarSlotsDelTramo(fecha, tramo, duracionMin),
  );

  const supabase = await createClient();
  const { data: citas, error } = await supabase.rpc("citas_ocupadas_del_dia", {
    p_empleado_id: empleadoId,
    p_fecha: fecha,
  });

  if (error) throw new Error(error.message);

  const ocupados = ((citas ?? []) as Array<{ inicio: string; fin: string }>).map(
    (c) => ({
      inicio: new Date(c.inicio).getTime(),
      fin: new Date(c.fin).getTime(),
    }),
  );

  const ahoraMadrid = nowMadridIsoLocal();

  return todosSlots.filter((slot) => {
    const slotIsoMadrid = `${fecha} ${slot}:00`;
    if (slotIsoMadrid < ahoraMadrid) return false;

    const inicioSlot = new Date(`${fecha}T${slot}:00`).getTime();
    const finSlot = inicioSlot + duracionMin * 60_000;

    return !ocupados.some(
      (cita: { inicio: number; fin: number }) =>
        inicioSlot < cita.fin && finSlot > cita.inicio,
    );
  });
}

export interface DisponibilidadInput {
  empleadoId: string;
  duracionMin: number;
  diasAFuturo?: number;
}

export async function getDiasLlenos(
  input: DisponibilidadInput,
): Promise<string[]> {
  const { empleadoId, duracionMin, diasAFuturo = 28 } = input;

  const horario = await getHorarioLaboral();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hasta = new Date(hoy);
  hasta.setDate(hoy.getDate() + diasAFuturo - 1);

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("citas_empleado_rango", {
    p_empleado_id: empleadoId,
    p_desde: fmt(hoy),
    p_hasta: fmt(hasta),
  });

  if (error) throw new Error(error.message);

  const ocupadosPorDia = new Map<string, Array<{ inicio: number; fin: number }>>();
  for (const c of (data ?? []) as Array<{ inicio: string; fin: string }>) {
    const clave = fmt(new Date(c.inicio));
    const arr = ocupadosPorDia.get(clave) ?? [];
    arr.push({
      inicio: new Date(c.inicio).getTime(),
      fin: new Date(c.fin).getTime(),
    });
    ocupadosPorDia.set(clave, arr);
  }

  const ahoraMadrid = nowMadridIsoLocal();
  const diasLlenos: string[] = [];

  for (let i = 0; i < diasAFuturo; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    const fecha = fmt(d);
    const diaSemana = DIAS_SEMANA[d.getDay()];
    const tramos = horario[diaSemana];
    if (!tramos || tramos.length === 0) continue;

    const slots = tramos.flatMap((tramo) =>
      generarSlotsDelTramo(fecha, tramo, duracionMin),
    );

    const ocupados = ocupadosPorDia.get(fecha) ?? [];

    const hayHueco = slots.some((slot) => {
      const slotIsoMadrid = `${fecha} ${slot}:00`;
      if (slotIsoMadrid < ahoraMadrid) return false;
      const inicioSlot = new Date(`${fecha}T${slot}:00`).getTime();
      const finSlot = inicioSlot + duracionMin * 60_000;
      return !ocupados.some(
        (c) => inicioSlot < c.fin && finSlot > c.inicio,
      );
    });

    if (!hayHueco) diasLlenos.push(fecha);
  }

  return diasLlenos;
}

const reservaSchema = z.object({
  empleadoId: z.string().uuid(),
  servicioId: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().regex(/^\d{2}:\d{2}$/),
  cliente: z.object({
    nombre: z.string().trim().min(2).max(100),
    telefono: phoneSchema,
    email: z.string().trim().email().optional().or(z.literal("")),
    notas: z.string().trim().max(500).optional(),
  }),
});

export type ReservaInput = z.infer<typeof reservaSchema>;

export interface ReservaResult {
  success: boolean;
  citaId?: string;
  error?: string;
}

export async function crearReserva(input: ReservaInput): Promise<ReservaResult> {
  const parsed = reservaSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de reserva no válidos" };
  }

  const { empleadoId, servicioId, fecha, hora, cliente } = parsed.data;
  const supabase = await createClient();

  const [{ data: servicio, error: servicioError }, { data: barbero }] =
    await Promise.all([
      supabase
        .from("servicios")
        .select("nombre, duracion, precio, activo")
        .eq("id", servicioId)
        .single(),
      supabase
        .from("empleados")
        .select("nombre")
        .eq("id", empleadoId)
        .single(),
    ]);

  if (servicioError || !servicio?.activo) {
    return { success: false, error: "Servicio no disponible" };
  }

  const slotsLibres = await getSlotsDisponibles({
    empleadoId,
    fecha,
    duracionMin: servicio.duracion,
  });

  if (!slotsLibres.includes(hora)) {
    return { success: false, error: "Esa hora ya no está disponible" };
  }

  const inicio = new Date(`${fecha}T${hora}:00`);
  const fin = new Date(inicio.getTime() + servicio.duracion * 60_000);

  const { data: citaId, error: rpcError } = await supabase.rpc(
    "crear_reserva_publica",
    {
      p_empleado_id: empleadoId,
      p_servicio_id: servicioId,
      p_inicio: inicio.toISOString(),
      p_fin: fin.toISOString(),
      p_nombre: cliente.nombre,
      p_telefono: cliente.telefono,
      p_email: cliente.email || null,
      p_notas: cliente.notas || null,
    },
  );

  if (rpcError || !citaId) {
    const raw = rpcError?.message ?? "";
    const slotConflict =
      raw.includes("SLOT_OCUPADO") || raw.includes("citas_no_solape_excl");
    const rateLimited = raw.includes("RATE_LIMIT_EXCEEDED");
    let error = "No se pudo crear la reserva. Inténtalo de nuevo.";
    if (slotConflict) {
      error = "Esa hora acaba de ocuparse. Elige otra, por favor.";
    } else if (rateLimited) {
      error =
        "Has hecho varias reservas recientemente. Espera un poco antes de crear otra.";
    }
    return { success: false, error };
  }

  // Fire-and-forget: el envío de emails no debe bloquear la respuesta al cliente.
  void sendReservaEmails({
    clienteNombre: cliente.nombre,
    clienteTelefono: cliente.telefono,
    clienteEmail: cliente.email || null,
    barberoNombre: barbero?.nombre ?? "Skar Barber",
    barberoEmail: null, // TODO: cuando Raúl/Darío tengan cuenta, leer auth.users.email vía RPC SECURITY DEFINER
    servicioNombre: servicio.nombre,
    precio: servicio.precio,
    inicio,
    notas: cliente.notas || null,
  }).catch((err) => {
    console.error("[reserva] email fallido pero cita creada:", err);
  });

  return { success: true, citaId: citaId as string };
}
