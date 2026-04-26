import "server-only";

interface ReservaEmailData {
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string | null;
  barberoNombre: string;
  servicioNombre: string;
  precio?: number | null;
  fechaLegible: string;
  horaLegible: string;
  notas?: string | null;
}

const BRAND_GOLD = "#c4a462";
const BG = "#0a0a0a";
const SURFACE = "#141414";

function shell(title: string, inner: string): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#fff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${SURFACE};border:1px solid rgba(196,164,98,.25);border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 28px 4px 28px;">
          <p style="margin:0;font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:${BRAND_GOLD};font-weight:600;">Skar Barber · Alcalá de Henares</p>
        </td></tr>
        ${inner}
        <tr><td style="padding:18px 28px 28px 28px;border-top:1px solid rgba(255,255,255,.08);">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,.45);line-height:1.5;">
            Calle Mayor s/n · Alcalá de Henares · Madrid<br>
            Si necesitas modificar la cita, contesta a este email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.5);width:140px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:15px;color:#fff;vertical-align:top;">${value}</td>
  </tr>`;
}

export function emailClienteConfirmacion(d: ReservaEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Cita confirmada · ${d.fechaLegible} a las ${d.horaLegible}`;
  const inner = `
    <tr><td style="padding:8px 28px 8px 28px;">
      <h1 style="margin:8px 0 6px 0;font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:30px;line-height:1.1;color:#fff;">
        Cita <em style="font-style:italic;color:${BRAND_GOLD};">confirmada</em>
      </h1>
      <p style="margin:0 0 18px 0;font-size:14px;color:rgba(255,255,255,.7);line-height:1.55;">
        Hola ${d.clienteNombre}, te esperamos en Skar Barber.
      </p>
    </td></tr>
    <tr><td style="padding:0 28px 4px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Día", d.fechaLegible)}
        ${infoRow("Hora", d.horaLegible)}
        ${infoRow("Barbero", d.barberoNombre)}
        ${infoRow("Servicio", d.servicioNombre + (d.precio != null ? ` · ${d.precio}€` : ""))}
        ${d.notas ? infoRow("Notas", d.notas) : ""}
      </table>
    </td></tr>
    <tr><td style="padding:20px 28px 8px 28px;">
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,.6);line-height:1.55;">
        Te recomendamos llegar 5 minutos antes. Si no puedes venir, avísanos respondiendo a este email.
      </p>
    </td></tr>`;
  const html = shell(subject, inner);
  const text = `Cita confirmada en Skar Barber\n\n${d.fechaLegible} · ${d.horaLegible}\nBarbero: ${d.barberoNombre}\nServicio: ${d.servicioNombre}${d.precio != null ? ` (${d.precio}€)` : ""}\n${d.notas ? `Notas: ${d.notas}\n` : ""}\nTe esperamos.`;
  return { subject, html, text };
}

export function emailBarberoNuevaCita(d: ReservaEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Nueva cita · ${d.fechaLegible} ${d.horaLegible} · ${d.clienteNombre}`;
  const inner = `
    <tr><td style="padding:8px 28px 8px 28px;">
      <h1 style="margin:8px 0 6px 0;font-family:'Playfair Display',Georgia,serif;font-weight:400;font-size:30px;line-height:1.1;color:#fff;">
        Nueva <em style="font-style:italic;color:${BRAND_GOLD};">reserva</em>
      </h1>
      <p style="margin:0 0 18px 0;font-size:14px;color:rgba(255,255,255,.7);line-height:1.55;">
        Un cliente acaba de reservar contigo.
      </p>
    </td></tr>
    <tr><td style="padding:0 28px 4px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Día", d.fechaLegible)}
        ${infoRow("Hora", d.horaLegible)}
        ${infoRow("Cliente", d.clienteNombre)}
        ${infoRow("Teléfono", `<a href="tel:${d.clienteTelefono}" style="color:${BRAND_GOLD};text-decoration:none;">${d.clienteTelefono}</a>`)}
        ${d.clienteEmail ? infoRow("Email", `<a href="mailto:${d.clienteEmail}" style="color:${BRAND_GOLD};text-decoration:none;">${d.clienteEmail}</a>`) : ""}
        ${infoRow("Servicio", d.servicioNombre + (d.precio != null ? ` · ${d.precio}€` : ""))}
        ${d.notas ? infoRow("Notas", d.notas) : ""}
      </table>
    </td></tr>`;
  const html = shell(subject, inner);
  const text = `Nueva reserva en Skar Barber\n\n${d.fechaLegible} · ${d.horaLegible}\nCliente: ${d.clienteNombre}\nTel: ${d.clienteTelefono}${d.clienteEmail ? `\nEmail: ${d.clienteEmail}` : ""}\nServicio: ${d.servicioNombre}${d.precio != null ? ` (${d.precio}€)` : ""}${d.notas ? `\nNotas: ${d.notas}` : ""}`;
  return { subject, html, text };
}
