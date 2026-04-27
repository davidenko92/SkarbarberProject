import { notFound } from "next/navigation";
import { getClienteConHistorial } from "@/lib/actions/citas";
import { ClienteFicha } from "../../components/ClienteFicha";

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getClienteConHistorial(id);

  if (!data) notFound();

  return <ClienteFicha cliente={data.cliente} historial={data.historial} />;
}
