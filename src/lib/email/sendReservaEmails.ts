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

function stripHeaderNewlines(s: string): string {
  return s.replace(/[\r\n]+/g, " ").trim();
}

export async function sendReservaEmails(args: SendArgs): Promise<void> {
  const transport = getTransport();
  if (!transport) return;

  const data = {
    clienteNombre: stripHeaderNewlines(args.clienteNombre),
    clienteTelefono: stripHeaderNewlines(args.clienteTelefono),
    clienteEmail: args.clienteEmail
      ? stripHeaderNewlines(args.clienteEmail)
      : args.clienteEmail,
    barberoNombre: stripHeaderNewlines(args.barberoNombre),
    servicioNombre: stripHeaderNewlines(args.servicioNombre),
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
        to: stripHeaderNewlines(args.clienteEmail),
        subject: stripHeaderNewlines(c.subject),
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
        to: stripHeaderNewlines(barberoTo),
        replyTo: args.clienteEmail
          ? stripHeaderNewlines(args.clienteEmail)
          : undefined,
        subject: stripHeaderNewlines(b.subject),
        html: b.html,
        text: b.text,
      }),
    );
  }

  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === "rejected") {
      console.error("[email] envío fallido:", sanitizeError(r.reason));
    }
  }
}

function sanitizeError(reason: unknown): string {
  const raw =
    reason instanceof Error
      ? `${reason.name}: ${reason.message}`
      : typeof reason === "string"
        ? reason
        : "error desconocido";
  const userEnv = process.env.GMAIL_USER;
  const passEnv = process.env.GMAIL_APP_PASSWORD;
  let safe = raw;
  if (userEnv) safe = safe.split(userEnv).join("[GMAIL_USER]");
  if (passEnv) safe = safe.split(passEnv).join("[GMAIL_APP_PASSWORD]");
  // Headers Auth Plain/Login pueden venir base64 en el mensaje
  safe = safe.replace(/AUTH\s+(PLAIN|LOGIN)\s+[A-Za-z0-9+/=]+/gi, "AUTH $1 [redacted]");
  return safe;
}
