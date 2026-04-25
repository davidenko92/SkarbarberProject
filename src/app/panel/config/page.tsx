import {
  getNegocio,
  getUsuarioActual,
  listarEmpleados,
} from "@/lib/actions/admin";
import { PageHeader } from "../components/PageHeader";
import { NegocioForm } from "../components/NegocioForm";
import { EmpleadosAdminList } from "../components/EmpleadosAdminList";

export default async function ConfigPage() {
  const [negocio, empleados, usuario] = await Promise.all([
    getNegocio(),
    listarEmpleados(),
    getUsuarioActual(),
  ]);

  const esPropietario = usuario.rol === "propietario";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Ajustes"
        title={
          <>
            Config <em className="not-italic text-gold">·</em>
          </>
        }
        subtitle={esPropietario ? "Negocio y equipo" : "Tu perfil y consulta"}
      />

      {negocio && (
        <NegocioForm negocio={negocio} readOnly={!esPropietario} />
      )}

      <EmpleadosAdminList
        iniciales={empleados}
        currentUserId={usuario.id}
        esPropietario={esPropietario}
      />
    </div>
  );
}
