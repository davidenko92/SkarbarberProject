"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Cita, CitaConDetalles } from "@/lib/types";

const fechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const uuidSchema = z.string().uuid();
const estadoSchema = z.enum([
  "confirmada",
  "completada",
  "cancelada",
  "no_asistio",
]);

export interface AgendaInput {
  fecha: string;
  empleadoId?: string | null;
}

export async function getCitasDelDia(
  input: AgendaInput,
): Promise<CitaConDetalles[]> {
  const fecha = fechaSchema.parse(input.fecha);
  const empleadoId = input.empleadoId
    ? uuidSchema.parse(input.empleadoId)
    : null;

  const supabase = await createClient();

  const inicioDia = new Date(`${fecha}T00:00:00`).toISOString();
  const finDia = new Date(
    new Date(`${fecha}T00:00:00`).getTime() + 24 * 60 * 60 * 1000,
  ).toISOString();

  let query = supabase
    .from("citas")
    .select(
      "*, cliente:clientes(*), servicio:servicios(*), empleado:empleados(*)",
    )
    .gte("inicio", inicioDia)
    .lt("inicio", finDia)
    .order("inicio", { ascending: true });

  if (empleadoId) query = query.eq("empleado_id", empleadoId);

  const { data, error } = await query.returns<CitaConDetalles[]>();

  if (error) throw new Error(error.message);
  return data ?? [];
}

export interface ActualizarEstadoInput {
  citaId: string;
  estado: Cita["estado"];
}

export async function actualizarEstadoCita(
  input: ActualizarEstadoInput,
): Promise<{ success: boolean; error?: string }> {
  const citaId = uuidSchema.parse(input.citaId);
  const estado = estadoSchema.parse(input.estado);

  const supabase = await createClient();
  const { error } = await supabase
    .from("citas")
    .update({ estado })
    .eq("id", citaId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/panel");
  return { success: true };
}
