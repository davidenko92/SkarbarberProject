import { z } from "zod";

/**
 * Validación de teléfono permisiva pero sensata.
 * Acepta + inicial, dígitos, espacios, guiones y paréntesis.
 * Exige entre 6 y 15 dígitos reales (ITU-T E.164 max 15).
 * No fuerza prefijo +34: España + extranjeros pueden reservar igual.
 */
const PHONE_REGEX = /^\+?[\d\s().-]{6,30}$/;

export const phoneSchema = z
  .string()
  .trim()
  .regex(PHONE_REGEX, "Teléfono no válido")
  .refine(
    (v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 6 && digits.length <= 15;
    },
    { message: "Debe tener entre 6 y 15 dígitos" },
  );

export const phoneSchemaOptional = phoneSchema.optional().or(z.literal(""));

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s().-]/g, "");
}
