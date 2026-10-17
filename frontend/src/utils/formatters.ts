/**
 * Utilidades de formateo para fechas, calificaciones y unidades académicas.
 * Adaptado a la normativa y convenciones de UTN FRRo (notación decimal con coma, DD/MM/YYYY).
 */

/**
 * Convierte una fecha en formato ISO (YYYY-MM-DD o ISO string) a formato local argentino (DD/MM/YYYY).
 * Es seguro contra problemas de desfasaje de zona horaria UTC (descomposición por cadena).
 */
export function formatFechaLocal(fechaStr?: string | null): string {
  if (!fechaStr) return '—';
  
  // Si viene en formato ISO completo con tiempo (ej. 2026-03-15T00:00:00)
  const soloFecha = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
  const parts = soloFecha.split('-');
  
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  // Si ya viene con barras o formato diferente, devolver tal cual
  return fechaStr;
}

/**
 * Formatea un rango de fechas de inicio y fin (ej. 2026-02-18 al 2026-02-24)
 * a un formato legible universitario:
 * - Mismo año: "18/02 al 24/02/2026"
 * - Distinto año: "28/12/2025 al 04/01/2026"
 */
export function formatRangoFechas(inicioStr?: string | null, finStr?: string | null): string {
  if (!inicioStr) return '—';
  if (!finStr || inicioStr === finStr) return formatFechaLocal(inicioStr);

  const iniParts = (inicioStr.includes('T') ? inicioStr.split('T')[0] : inicioStr).split('-');
  const finParts = (finStr.includes('T') ? finStr.split('T')[0] : finStr).split('-');

  if (iniParts.length === 3 && finParts.length === 3) {
    const [iniY, iniM, iniD] = iniParts;
    const [finY, finM, finD] = finParts;

    if (iniY === finY) {
      return `${iniD}/${iniM} al ${finD}/${finM}/${finY}`;
    }
    return `${iniD}/${iniM}/${iniY} al ${finD}/${finM}/${finY}`;
  }

  return `${formatFechaLocal(inicioStr)} al ${formatFechaLocal(finStr)}`;
}

/**
 * Formatea un promedio académico a 2 decimales con coma (convención UTN), ej: 8.5 -> "8,50".
 * Si es nulo o indefinido devuelve "—".
 */
export function formatPromedio(promedio: number | null | undefined): string {
  if (promedio === null || promedio === undefined || Number.isNaN(promedio)) {
    return '—';
  }
  return promedio.toFixed(2).replace('.', ',');
}

/**
 * Formatea una nota numérica individual (0-10) o devuelve guion si no existe.
 */
export function formatNota(nota?: number | null): string {
  if (nota === null || nota === undefined) return '—';
  return nota.toString();
}
