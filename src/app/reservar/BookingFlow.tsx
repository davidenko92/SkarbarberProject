"use client";

import { crearReserva } from "@/lib/actions/reservas";
import type { Empleado, HorarioLaboral, Servicio } from "@/lib/types";
import { useEffect, useReducer, useState } from "react";
import {
  bookingReducer,
  INITIAL_STATE,
  selectBooking,
  TOTAL_STEPS,
  type BookingState,
} from "./booking-reducer";
import { ReservarShell } from "./components/ReservarShell";
import { StepBarbero } from "./steps/StepBarbero";
import { StepConfirmacion } from "./steps/StepConfirmacion";
import { StepDatos } from "./steps/StepDatos";
import { StepDia } from "./steps/StepDia";
import { StepHora } from "./steps/StepHora";
import { StepLanding } from "./steps/StepLanding";
import { StepServicio } from "./steps/StepServicio";

const STORAGE_KEY = "skarbarber-booking-v1";

interface BookingFlowProps {
  barberos: Empleado[];
  servicios: Servicio[];
  horario: HorarioLaboral;
}

function loadPersistedState(): BookingState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as BookingState;
    if (parsed.step === "confirmacion") return INITIAL_STATE;
    return parsed;
  } catch {
    return INITIAL_STATE;
  }
}

export function BookingFlow({ barberos, servicios, horario }: BookingFlowProps) {
  const [state, dispatch] = useReducer(bookingReducer, INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const restored = loadPersistedState();
    if (restored.step !== "landing") {
      dispatch({ type: "HYDRATE", state: restored });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const { barbero, servicio } = selectBooking(state, barberos, servicios);
  const stepIndex =
    ["landing", "barbero", "servicio", "dia", "hora", "datos", "confirmacion"].indexOf(state.step) + 1;

  async function submitReserva() {
    if (!state.barberoId || !state.servicioId || !state.fecha || !state.hora) {
      setError("Falta información para completar la reserva");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await crearReserva({
        empleadoId: state.barberoId,
        servicioId: state.servicioId,
        fecha: state.fecha,
        hora: state.hora,
        cliente: {
          nombre: state.datos.nombre.trim(),
          telefono: state.datos.telefono.trim(),
          email: state.datos.email.trim() || "",
          notas: state.datos.notas.trim() || undefined,
        },
      });
      if (!result.success || !result.citaId) {
        setError(result.error ?? "No se pudo crear la cita");
        return;
      }
      dispatch({ type: "CONFIRMAR", reservaId: result.citaId });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ReservarShell
      step={stepIndex}
      totalSteps={TOTAL_STEPS}
      onBack={
        state.step === "landing" || state.step === "confirmacion"
          ? undefined
          : () => dispatch({ type: "BACK" })
      }
      showHeader={state.step !== "landing"}
    >
      {state.step === "landing" && (
        <StepLanding onStart={() => dispatch({ type: "NEXT" })} />
      )}

      {state.step === "barbero" && (
        <StepBarbero
          barberos={barberos}
          onSelect={(id, cualquiera) =>
            dispatch({ type: "SELECT_BARBERO", barberoId: id, cualquiera })
          }
        />
      )}

      {state.step === "servicio" && (
        <StepServicio
          servicios={servicios}
          onSelect={(id) => dispatch({ type: "SELECT_SERVICIO", servicioId: id })}
        />
      )}

      {state.step === "dia" && state.barberoId && servicio && (
        <StepDia
          horario={horario}
          empleadoId={state.barberoId}
          duracionMin={servicio.duracion}
          fechaSeleccionada={state.fecha}
          onSelect={(f) => dispatch({ type: "SELECT_FECHA", fecha: f })}
          onContinue={() => dispatch({ type: "NEXT" })}
        />
      )}

      {state.step === "hora" && state.barberoId && state.fecha && servicio && (
        <StepHora
          empleadoId={state.barberoId}
          fecha={state.fecha}
          duracionMin={servicio.duracion}
          horaSeleccionada={state.hora}
          onSelect={(h) => dispatch({ type: "SELECT_HORA", hora: h })}
          onContinue={() => dispatch({ type: "NEXT" })}
        />
      )}

      {state.step === "datos" && (
        <StepDatos
          datos={state.datos}
          onChange={(patch) => dispatch({ type: "SET_DATOS", datos: patch })}
          onSubmit={submitReserva}
          submitting={submitting}
          errorMensaje={error}
        />
      )}

      {state.step === "confirmacion" && state.fecha && state.hora && (
        <StepConfirmacion
          barbero={barbero}
          servicio={servicio}
          fecha={state.fecha}
          hora={state.hora}
          onReset={() => {
            window.sessionStorage.removeItem(STORAGE_KEY);
            dispatch({ type: "RESET" });
          }}
        />
      )}
    </ReservarShell>
  );
}
