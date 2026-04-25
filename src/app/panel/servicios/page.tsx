import { listarServicios } from "@/lib/actions/admin";
import { PageHeader } from "../components/PageHeader";
import { ServiciosList } from "../components/ServiciosList";

export default async function ServiciosPage() {
  const servicios = await listarServicios();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Catálogo"
        title={
          <>
            Servicios <em>·</em>
          </>
        }
        subtitle={`${servicios.length} en total`}
      />
      <ServiciosList iniciales={servicios} />
    </div>
  );
}
