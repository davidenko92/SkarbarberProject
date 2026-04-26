import "server-only";
import {
  getTransport,
  getFromAddress,
  getBarberoFallbackEmail,
} from "./transport";
import {
  emailClienteConfirmacion,
  emailBarberoNuevaCita,
} from "./templates";

interface SendArgs {
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string | null;
  barberoNombre: string;
  barberoEmail?: string | null;
  servicioNombre: string;
  precio?: number | null;
  inicio: Date;
  notas?: string | null;
}

const FECHA_FMT = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Europe/Madrid",
});

const HORA_FMT = new Intl.DateTimeFormat("es-ES", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Madrid",
});

export async function sendReservaEmails(args: SendArgs): Promise<void> {
  const transport = getTransport();
  if (!transport) return;

  const data = {
    clienteNombre: args.clienteNombre,
    clienteTelefono: args.clienteTelefono,
    clienteEmail: args.clienteEmail,
    barberoNombre: args.barberoNombre,
    servicioNombre: args.servicioNombre,
    precio: args.precio,
    fechaLegible: FECHA_FMT.format(args.inicio),
    horaLegible: HORA_FMT.format(args.inicio),
    notas: args.notas,
  };

  const from = getFromAddress();
  const barberoTo = args.barberoEmail || getBarberoFallbackEmail();

  const tasks: Array<Promise<unknown>> = [];

  if (args.clienteEmail) {
    const c = emailClienteConfirmacion(data);
    tasks.push(
      transport.sendMail({
        from,
        to: args.clienteEmail,
        subject: c.subject,
        html: c.html,
        text: c.text,
      }),
    );
  }

  if (barberoTo) {
    const b = emailBarberoNuevaCita(data);
    tasks.push(
      transport.sendMail({
        from,
        to: barberoTo,
        replyTo: args.clienteEmail || undefined,
        subject: b.subject,
        html: b.html,
        text: b.text,
      }),
    );
  }

  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[email] envío fallido:", r.reason);
    }
  }
}
