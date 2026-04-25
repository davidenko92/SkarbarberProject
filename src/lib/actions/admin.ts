"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Empleado, HorarioLaboral, Negocio, Servicio } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");
  return { supabase, user };
}

async function requirePropietario() {
  const { supabase, user } = await requireUser();
  const { data: empleado, error } = await supabase
    .from("empleados")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!empleado || empleado.rol !== "propietario") {
    throw new Error("Solo el propietario puede realizar esta acción");
  }
  return { supabase, user };
}

// ============================================
// SERVICIOS
// ============================================

export async function listarServicios(): Promise<Servicio[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .order("orden")
    .order("nombre");
  if (error) throw new Error(error.message);
  return data ?? [];
}

const servicioSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  duracion: z.number().int().min(10).max(240),
  precio: z.number().min(0).max(9999),
  activo: z.boolean().default(true),
  orden: z.number().int().min(0).max(999).default(0),
});

const crearServicioSchema = servicioSchema;
const actualizarServicioSchema = servicioSchema.extend({
  id: z.string().uuid(),
});

export type CrearServicioInput = z.input<typeof crearServicioSchema>;
export type ActualizarServicioInput = z.input<typeof actualizarServicioSchema>;

export async function crearServicio(
  input: CrearServicioInput,
): Promise<{ success: boolean; error?: string }> {
  const parsed = crearServicioSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos no válidos" };

  const { supabase } = await requireUser();
  const { error } = await supabase.from("servicios").insert(parsed.data);
  if (error) return { success: false, error: error.message };
  revalidatePath("/panel/servicios");
  revalidatePath("/reservar");
  return { success: true };
}

export async function actualizarServicio(
  input: ActualizarServicioInput,
): Promise<{ success: boolean; error?: string }> {
  const parsed = actualizarServicioSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos no válidos" };

  const { id, ...rest } = parsed.data;
  const { supabase } = await requireUser();
  const { error } = await supabase.from("servicios").update(rest).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/panel/servicios");
  revalidatePath("/reservar");
  return { success: true };
}

export async function eliminarServicio(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const uuid = z.string().uuid().parse(id);
  const { supabase } = await requireUser();
  const { error } = await supabase.from("servicios").delete().eq("id", uuid);
  if (error) return { success: false, error: error.message };
  revalidatePath("/panel/servicios");
  revalidatePath("/reservar");
  return { success: true };
}

// ============================================
// EMPLEADOS
// ============================================

export async function listarEmpleados(): Promise<Empleado[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("empleados")
    .select("*")
    .order("rol", { ascending: true })
    .order("nombre");
  if (error) throw new Error(error.message);
  return data ?? [];
}

const actualizarEmpleadoSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().trim().min(2).max(80),
  telefono: z.string().trim().min(6).max(20).optional().or(z.literal("")),
  avatar_url: z.string().trim().url().optional().or(z.literal("")),
  activo: z.boolean(),
});

export type ActualizarEmpleadoInput = z.input<typeof actualizarEmpleadoSchema>;

export async function actualizarEmpleado(
  input: ActualizarEmpleadoInput,
): Promise<{ success: boolean; error?: string }> {
  const parsed = actualizarEmpleadoSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos no válidos" };

  try {
    const { supabase, user } = await requireUser();
    const { data: actor } = await supabase
      .from("empleados")
      .select("rol")
      .eq("id", user.id)
      .maybeSingle();

    const editandoOtro = parsed.data.id !== user.id;
    if (editandoOtro && actor?.rol !== "propietario") {
      return {
        success: false,
        error: "Solo el propietario puede editar a otros empleados",
      };
    }

    const { id, ...rest } = parsed.data;
    const payload = {
      nombre: rest.nombre,
      telefono: rest.telefono || null,
      avatar_url: rest.avatar_url || null,
      activo: rest.activo,
    };

    const { data, error } = await supabase
      .from("empleados")
      .update(payload)
      .eq("id", id)
      .select("id");
    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) {
      return { success: false, error: "No se aplicó ningún cambio (permisos)" };
    }
    revalidatePath("/panel/config");
    revalidatePath("/reservar");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}

// ============================================
// NEGOCIO
// ============================================

export async function getNegocio(): Promise<Negocio | null> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("negocio")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

const horarioTramoSchema = z.object({
  apertura: z.string().regex(/^\d{2}:\d{2}$/),
  cierre: z.string().regex(/^\d{2}:\d{2}$/),
});

const horarioLaboralSchema = z.object({
  lun: z.array(horarioTramoSchema).nullable(),
  mar: z.array(horarioTramoSchema).nullable(),
  mie: z.array(horarioTramoSchema).nullable(),
  jue: z.array(horarioTramoSchema).nullable(),
  vie: z.array(horarioTramoSchema).nullable(),
  sab: z.array(horarioTramoSchema).nullable(),
  dom: z.array(horarioTramoSchema).nullable(),
});

const actualizarNegocioSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().trim().min(2).max(100),
  telefono: z.string().trim().min(6).max(20).optional().or(z.literal("")),
  direccion: z.string().trim().max(200).optional().or(z.literal("")),
  horario_laboral: horarioLaboralSchema,
});

export type ActualizarNegocioInput = z.input<typeof actualizarNegocioSchema>;

export async function actualizarNegocio(
  input: ActualizarNegocioInput,
): Promise<{ success: boolean; error?: string }> {
  const parsed = actualizarNegocioSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos no válidos" };

  try {
    const { supabase } = await requirePropietario();
    const { id, nombre, telefono, direccion, horario_laboral } = parsed.data;
    const { data, error } = await supabase
      .from("negocio")
      .update({
        nombre,
        telefono: telefono || null,
        direccion: direccion || null,
        horario_laboral: horario_laboral as HorarioLaboral,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id");
    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) {
      return { success: false, error: "No se aplicó ningún cambio (permisos)" };
    }
    revalidatePath("/panel/config");
    revalidatePath("/reservar");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}

export async function getRolUsuario(): Promise<"propietario" | "barbero" | null> {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("empleados")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();
  return (data?.rol ?? null) as "propietario" | "barbero" | null;
}

export async function getUsuarioActual(): Promise<{
  id: string;
  rol: "propietario" | "barbero" | null;
}> {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("empleados")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();
  return {
    id: user.id,
    rol: (data?.rol ?? null) as "propietario" | "barbero" | null,
  };
}
