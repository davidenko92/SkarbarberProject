// Tipos de base de datos - coinciden con el schema de Supabase

export type Negocio = {
  id: string;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  zona_horaria: string;
  horario_laboral: HorarioLaboral;
  creado_en: string;
  actualizado_en: string;
};

export type HorarioLaboral = {
  lun: HorarioTramo[] | null;
  mar: HorarioTramo[] | null;
  mie: HorarioTramo[] | null;
  jue: HorarioTramo[] | null;
  vie: HorarioTramo[] | null;
  sab: HorarioTramo[] | null;
  dom: HorarioTramo[] | null;
};

export type HorarioTramo = {
  apertura: string; // "10:00"
  cierre: string;   // "14:00"
};

export type Empleado = {
  id: string;
  nombre: string;
  rol: "propietario" | "barbero";
  telefono: string | null;
  avatar_url: string | null;
  activo: boolean;
  creado_en: string;
};

export type Cliente = {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
};

export type Servicio = {
  id: string;
  nombre: string;
  duracion: number;  // minutos
  precio: number;    // euros
  activo: boolean;
  orden: number;
  creado_en: string;
};

export type Cita = {
  id: string;
  cliente_id: string;
  empleado_id: string;
  servicio_id: string;
  inicio: string;
  fin: string;
  estado: "confirmada" | "completada" | "cancelada" | "no_asistio";
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
};

export type Recordatorio = {
  id: string;
  cita_id: string;
  canal: "whatsapp" | "email" | "sms";
  estado: "pendiente" | "enviado" | "fallido" | "entregado";
  programado_para: string;
  enviado_en: string | null;
  mensaje_error: string | null;
  creado_en: string;
};

// Tipos con relaciones para la UI
export type CitaConDetalles = Cita & {
  cliente: Cliente;
  servicio: Servicio;
  empleado: Empleado;
};
