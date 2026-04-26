import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

export function getTransport(): Transporter | null {
  if (cached) return cached;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn(
      "[email] GMAIL_USER / GMAIL_APP_PASSWORD no configurados. Emails desactivados.",
    );
    return null;
  }

  cached = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return cached;
}

export function getFromAddress(): string {
  const user = process.env.GMAIL_USER ?? "no-reply@skarbarber.local";
  const name = process.env.EMAIL_FROM_NAME ?? "Skarbarber";
  return `"${name}" <${user}>`;
}

export function getBarberoFallbackEmail(): string {
  return process.env.BARBERO_EMAIL_DEFAULT ?? process.env.GMAIL_USER ?? "";
}
