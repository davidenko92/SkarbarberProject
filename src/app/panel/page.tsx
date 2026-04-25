import { PageHeader } from "./components/PageHeader";
import { AgendaClient } from "./components/AgendaClient";
import { getCitasDelDia } from "@/lib/actions/agenda";
import { getBarberosActivos } from "@/lib/actions/reservas";

function getHoyISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function AgendaPage() {
  const fecha = getHoyISO();

  const [citasIniciales, empleados] = await Promise.all([
    getCitasDelDia({ fecha }),
    getBarberosActivos(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Panel · Skar Barber"
        title={
          <>
            Agenda <em className="not-italic text-gold">·</em>
          </>
        }
      />

      <AgendaClient
        fechaInicial={fecha}
        citasIniciales={citasIniciales}
        empleados={empleados.filter(
          (e) => e.rol === "barbero" || e.rol === "propietario",
        )}
      />
    </div>
  );
}
