export type PeriodoMetricas =
  | "hoy"
  | "semana"
  | "mes"
  | "mes_anterior"
  | "anio";

export interface RangoFechas {
  desde: Date;
  hasta: Date; // exclusivo
  label: string;
}

function inicioDelDia(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function inicioSemanaLunes(d: Date) {
  const x = inicioDelDia(d);
  const dow = x.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  x.setDate(x.getDate() + diff);
  return x;
}

function inicioMes(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function inicioMesSiguiente(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
}

export interface FiltroRango {
  periodo?: PeriodoMetricas;
  desde?: string; // YYYY-MM-DD inclusivo
  hasta?: string; // YYYY-MM-DD inclusivo
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function formatLegibleCorto(d: Date): string {
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year:
      d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export function resolverRango(
  filtro: FiltroRango,
  ref: Date = new Date(),
): RangoFechas {
  if (
    filtro.desde &&
    filtro.hasta &&
    ISO_DATE_RE.test(filtro.desde) &&
    ISO_DATE_RE.test(filtro.hasta)
  ) {
    const desde = new Date(`${filtro.desde}T00:00:00`);
    const hastaFin = new Date(`${filtro.hasta}T00:00:00`);
    hastaFin.setDate(hastaFin.getDate() + 1);
    const label = `${formatLegibleCorto(desde)} – ${formatLegibleCorto(
      new Date(`${filtro.hasta}T00:00:00`),
    )}`;
    return { desde, hasta: hastaFin, label };
  }
  return rangoDePeriodo(filtro.periodo ?? "mes", ref);
}

export function rangoDePeriodo(
  periodo: PeriodoMetricas,
  ref: Date = new Date(),
): RangoFechas {
  if (periodo === "hoy") {
    const desde = inicioDelDia(ref);
    const hasta = new Date(desde.getTime() + 24 * 60 * 60 * 1000);
    return { desde, hasta, label: "Hoy" };
  }
  if (periodo === "semana") {
    const desde = inicioSemanaLunes(ref);
    const hasta = new Date(desde.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { desde, hasta, label: "Esta semana" };
  }
  if (periodo === "mes_anterior") {
    const desde = new Date(ref.getFullYear(), ref.getMonth() - 1, 1, 0, 0, 0, 0);
    const hasta = inicioMes(ref);
    return { desde, hasta, label: "Mes pasado" };
  }
  if (periodo === "anio") {
    const desde = new Date(ref.getFullYear(), 0, 1, 0, 0, 0, 0);
    const hasta = new Date(ref.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
    return { desde, hasta, label: "Este año" };
  }
  return {
    desde: inicioMes(ref),
    hasta: inicioMesSiguiente(ref),
    label: "Este mes",
  };
}
