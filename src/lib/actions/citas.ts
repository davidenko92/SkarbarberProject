"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Cita, Cliente, CitaConDetalles } from "@/lib/types";
import { getSlotsDisponibles } from "./reservas";

const uuidSchema = z.string().uuid();

export interface ClienteConStats extends Cliente {
  ultima_visita: string | null;
  total_citas: number;
  total_gastado: number;
}

const listarClientesSchema = z.object({
  query: z.string().trim().max(60).optional(),
  limit: z.number().int().min(1).max(50).default(30),
});

export type ListarClientesInput = z.input<typeof listarClientesSchema>;

export async function listarClientes(
  input: ListarClientesInput = {},
): Promise<ClienteConStats[]> {
  const { query, limit } = listarClientesSchema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  let q = supabase
    .from("clientes")
    .select(
      "*, citas(inicio, estado, servicio:servicios(precio))",
    )
    .order("actualizado_en", { ascending: false })
    .limit(limit);

  if (query && query.length >= 1) {
    const like = `%${query.replace(/[%_]/g, "")}%`;
    q = q.or(`nombre.ilike.${like},telefono.ilike.${like}`);
  }

  type ClienteConCitas = Cliente & {
    citas: Array<{
      inicio: string;
      estado: Cita["estado"];
      servicio: { precio: number } | null;
    }>;
  };

  const { data, error } = await q.returns<ClienteConCitas[]>();
  if (error) throw new Error(error.message);

  return (data ?? []).map((c) => {
    const completadas = c.citas.filter((cita) => cita.estado === "completada");
    const visitas = c.citas
      .filter((cita) => cita.estado === "completada" || cita.estado === "confirmada")
      .map((cita) => cita.inicio);
    const ultima =
      visitas.length > 0
        ? visitas.reduce((a, b) => (a > b ? a : b))
        : null;
    const total = completadas.reduce(
      (sum, cita) => sum + Number(cita.servicio?.precio ?? 0),
      0,
    );
    return {
      id: c.id,
      nombre: c.nombre,
      telefono: c.telefono,
      email: c.email,
      notas: c.notas,
      creado_en: c.creado_en,
      actualizado_en: c.actualizado_en,
      ultima_visita: ultima,
      total_citas: c.citas.length,
      total_gastado: total,
    };
  });
}

export async function getClienteConHistorial(
  id: string,
): Promise<{ cliente: Cliente; historial: CitaConDetalles[] } | null> {
  const clienteId = uuidSchema.parse(id);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data: cliente, error: clienteError } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", clienteId)
    .maybeSingle();

  if (clienteError) throw new Error(clienteError.message);
  if (!cliente) return null;

  const { data: historial, error: histError } = await supabase
    .from("citas")
    .select(
      "*, cliente:clientes(*), servicio:servicios(*), empleado:empleados(*)",
    )
    .eq("cliente_id", clienteId)
    .order("inicio", { ascending: false })
    .returns<CitaConDetalles[]>();

  if (histError) throw new Error(histError.message);
  return { cliente, historial: historial ?? [] };
}

const actualizarClienteSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().trim().min(2).max(100),
  telefono: z.string().trim().min(6).max(20).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  notas: z.string().trim().max(500).optional().or(z.literal("")),
});

export type ActualizarClienteInput = z.infer<typeof actualizarClienteSchema>;

export async function actualizarCliente(
  input: ActualizarClienteInput,
): Promise<{ success: boolean; error?: string }> {
  const parsed = actualizarClienteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos no válidos" };

  const { id, nombre, telefono, email, notas } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const { error } = await supabase
    .from("clientes")
    .update({
      nombre,
      telefono: telefono || null,
      email: email || null,
      notas: notas || null,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/panel/clientes");
  revalidatePath(`/panel/clientes/${id}`);
  return { success: true };
}

export async function eliminarCliente(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const clienteId = uuidSchema.parse(id);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const { error } = await supabase.from("clientes").delete().eq("id", clienteId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/panel/clientes");
  return { success: true };
}

const buscarClientesSchema = z.object({
  query: z.string().trim().min(1).max(60),
  limit: z.number().int().min(1).max(20).default(8),
});

export type BuscarClientesInput = z.infer<typeof buscarClientesSchema>;

export async function buscarClientes(
  input: BuscarClientesInput,
): Promise<Cliente[]> {
  const { query, limit } = buscarClientesSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const like = `%${query.replace(/[%_]/g, "")}%`;

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .or(`nombre.ilike.${like},telefono.ilike.${like}`)
    .order("actualizado_en", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

const citaManualSchema = z
  .object({
    empleadoId: z.string().uuid(),
    servicioId: z.string().uuid(),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    hora: z.string().regex(/^\d{2}:\d{2}$/),
    notas: z.string().trim().max(500).optional(),
    cliente: z.discriminatedUnion("tipo", [
      z.object({
        tipo: z.literal("existente"),
        clienteId: z.string().uuid(),
      }),
      z.object({
        tipo: z.literal("nuevo"),
        nombre: z.string().trim().min(2).max(100),
        telefono: z.string().trim().min(6).max(20),
        email: z
          .string()
          .trim()
          .email()
          .optional()
          .or(z.literal("")),
      }),
      z.object({
        tipo: z.literal("walkin"),
        nombre: z.string().trim().min(2).max(100),
      }),
    ]),
  })
  .strict();

export type CrearCitaManualInput = z.infer<typeof citaManualSchema>;

export interface CrearCitaManualResult {
  success: boolean;
  citaId?: string;
  error?: string;
}

export async function crearCitaManual(
  input: CrearCitaManualInput,
): Promise<CrearCitaManualResult> {
  const parsed = citaManualSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos no válidos" };
  }

  const { empleadoId, servicioId, fecha, hora, notas, cliente } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const { data: servicio, error: servicioError } = await supabase
    .from("servicios")
    .select("duracion, activo")
    .eq("id", servicioId)
    .single();

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

  let clienteId: string | null = null;

  if (cliente.tipo === "existente") {
    clienteId = cliente.clienteId;
  } else if (cliente.tipo === "nuevo") {
    const telefono = cliente.telefono.trim();

    const { data: existente } = await supabase
      .from("clientes")
      .select("id")
      .eq("telefono", telefono)
      .maybeSingle();

    if (existente) {
      clienteId = existente.id;
      await supabase
        .from("clientes")
        .update({
          nombre: cliente.nombre,
          email: cliente.email || null,
          actualizado_en: new Date().toISOString(),
        })
        .eq("id", existente.id);
    } else {
      const { data: nuevo, error: insertError } = await supabase
        .from("clientes")
        .insert({
          nombre: cliente.nombre,
          telefono,
          email: cliente.email || null,
        })
        .select("id")
        .single();

      if (insertError || !nuevo) {
        return {
          success: false,
          error: insertError?.message ?? "No se pudo registrar el cliente",
        };
      }
      clienteId = nuevo.id;
    }
  } else {
    const { data: walkin, error: walkinError } = await supabase
      .from("clientes")
      .insert({
        nombre: cliente.nombre,
        telefono: null,
        email: null,
      })
      .select("id")
      .single();

    if (walkinError || !walkin) {
      return {
        success: false,
        error: walkinError?.message ?? "No se pudo registrar el walk-in",
      };
    }
    clienteId = walkin.id;
  }

  if (!clienteId) {
    return { success: false, error: "Cliente no identificado" };
  }

  const inicio = new Date(`${fecha}T${hora}:00`);
  const fin = new Date(inicio.getTime() + servicio.duracion * 60_000);

  const { data: cita, error: citaError } = await supabase
    .from("citas")
    .insert({
      cliente_id: clienteId,
      empleado_id: empleadoId,
      servicio_id: servicioId,
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      estado: "confirmada",
      notas: notas || null,
    })
    .select("id")
    .single();

  if (citaError || !cita) {
    return {
      success: false,
      error: citaError?.message ?? "No se pudo crear la cita",
    };
  }

  revalidatePath("/panel");
  return { success: true, citaId: cita.id };
}

export async function getClienteById(id: string): Promise<Cliente | null> {
  const clienteId = uuidSchema.parse(id);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", clienteId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
