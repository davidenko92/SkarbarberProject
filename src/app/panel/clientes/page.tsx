import { PageHeader } from "../components/PageHeader";
import { ClientesList } from "../components/ClientesList";
import { listarClientes } from "@/lib/actions/citas";

export default async function ClientesPage() {
  const clientes = await listarClientes({});

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Base de datos"
        title={
          <>
            Clientes <em className="not-italic text-gold">·</em>
          </>
        }
        subtitle={`${clientes.length} registrados`}
      />
      <ClientesList iniciales={clientes} />
    </div>
  );
}
