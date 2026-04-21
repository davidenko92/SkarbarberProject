import {
  getBarberosActivos,
  getHorarioLaboral,
  getServiciosActivos,
} from "@/lib/actions/reservas";
import { BookingFlow } from "./BookingFlow";

export const dynamic = "force-dynamic";

export default async function ReservarPage() {
  const [barberos, servicios, horario] = await Promise.all([
    getBarberosActivos(),
    getServiciosActivos(),
    getHorarioLaboral(),
  ]);

  return (
    <BookingFlow
      barberos={barberos}
      servicios={servicios}
      horario={horario}
    />
  );
}
