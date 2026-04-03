import { format, parseISO, differenceInDays, getMonth, getDate } from "date-fns";
import { es } from "date-fns/locale";

export function formatFecha(fecha: string) {
  return format(parseISO(fecha), "d MMM yyyy", { locale: es });
}

export function diasHastaVencimiento(fecha: string | null): number | null {
  if (!fecha) return null;
  return differenceInDays(parseISO(fecha), new Date());
}

export function esCumpleanosHoy(fechaNacimiento: string): boolean {
  const bd = parseISO(fechaNacimiento);
  const hoy = new Date();
  return getMonth(bd) === getMonth(hoy) && getDate(bd) === getDate(hoy);
}

export function cumpleanosEsteMes(fechaNacimiento: string): boolean {
  const bd = parseISO(fechaNacimiento);
  return getMonth(bd) === getMonth(new Date());
}

export function formatMoneda(monto: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency", currency: "PEN",
  }).format(monto);
}
