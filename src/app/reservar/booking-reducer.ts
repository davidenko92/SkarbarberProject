import type { Empleado, Servicio } from "@/lib/types";

export type StepId =
  | "landing"
  | "barbero"
  | "servicio"
  | "dia"
  | "datos"
  | "confirmacion";

export const STEP_ORDER: StepId[] = [
  "landing",
  "barbero",
  "servicio",
  "dia",
  "datos",
  "confirmacion",
];

export const TOTAL_STEPS = STEP_ORDER.length;

export interface BookingDatosCliente {
  nombre: string;
  telefono: string;
  email: string;
  notas: string;
  recordatorioWhatsapp: boolean;
}

export interface BookingState {
  step: StepId;
  barberoId: string | null;
  cualquierBarbero: boolean;
  servicioId: string | null;
  fecha: string | null; // YYYY-MM-DD
  hora: string | null; // HH:mm
  datos: BookingDatosCliente;
  reservaId: string | null;
}

export const INITIAL_STATE: BookingState = {
  step: "landing",
  barberoId: null,
  cualquierBarbero: false,
  servicioId: null,
  fecha: null,
  hora: null,
  datos: {
    nombre: "",
    telefono: "",
    email: "",
    notas: "",
    recordatorioWhatsapp: true,
  },
  reservaId: null,
};

export type BookingAction =
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "GOTO"; step: StepId }
  | { type: "HYDRATE"; state: BookingState }
  | { type: "SELECT_BARBERO"; barberoId: string; cualquiera: boolean }
  | { type: "SELECT_SERVICIO"; servicioId: string }
  | { type: "SELECT_FECHA"; fecha: string }
  | { type: "SELECT_HORA"; hora: string }
  | { type: "SET_DATOS"; datos: Partial<BookingDatosCliente> }
  | { type: "CONFIRMAR"; reservaId: string }
  | { type: "RESET" };

function nextStep(current: StepId): StepId {
  const idx = STEP_ORDER.indexOf(current);
  return STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)];
}

function prevStep(current: StepId): StepId {
  const idx = STEP_ORDER.indexOf(current);
  return STEP_ORDER[Math.max(idx - 1, 0)];
}

export function bookingReducer(
  state: BookingState,
  action: BookingAction,
): BookingState {
  switch (action.type) {
    case "NEXT":
      return { ...state, step: nextStep(state.step) };
    case "BACK":
      return { ...state, step: prevStep(state.step) };
    case "GOTO":
      return { ...state, step: action.step };
    case "HYDRATE":
      return action.state;
    case "SELECT_BARBERO":
      return {
        ...state,
        barberoId: action.barberoId,
        cualquierBarbero: action.cualquiera,
        step: nextStep(state.step),
      };
    case "SELECT_SERVICIO":
      return {
        ...state,
        servicioId: action.servicioId,
        step: nextStep(state.step),
      };
    case "SELECT_FECHA":
      return { ...state, fecha: action.fecha, hora: null };
    case "SELECT_HORA":
      return { ...state, hora: action.hora };
    case "SET_DATOS":
      return { ...state, datos: { ...state.datos, ...action.datos } };
    case "CONFIRMAR":
      return {
        ...state,
        reservaId: action.reservaId,
        step: "confirmacion",
      };
    case "RESET":
      return INITIAL_STATE;
    default:
      return state;
  }
}

export interface BookingSelection {
  barbero: Empleado | null;
  servicio: Servicio | null;
}

export function selectBooking(
  state: BookingState,
  barberos: Empleado[],
  servicios: Servicio[],
): BookingSelection {
  return {
    barbero: barberos.find((b) => b.id === state.barberoId) ?? null,
    servicio: servicios.find((s) => s.id === state.servicioId) ?? null,
  };
}
