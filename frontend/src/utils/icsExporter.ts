import { MATERIAS_MAP } from '../data/plan2023';
import { TURNOS_EXAMEN_2026, getFechaExactaMesa } from '../data/calendario2026';
import type { MetaExamen } from '../types/plan';

/**
 * Formatea una fecha YYYY-MM-DD a formato iCalendar YYYYMMDD
 */
function formatDateToICS(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

/**
 * Formatea un objeto Date a UTC timestamp YYYYMMDDTHHMMSSZ
 */
function formatTimestampToICS(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const h = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  const s = pad(d.getUTCSeconds());
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

/**
 * Calcula el día siguiente en formato YYYY-MM-DD para el DTEND de un evento de día completo
 */
function getNextDayStr(dateStr: string): string {
  const parts = dateStr.split('-');
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  d.setDate(d.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

/**
 * Genera el contenido iCalendar (.ics) estándar RFC 5545 para las metas de examen
 */
export function generateICSContent(metas: MetaExamen[]): string {
  const nowStr = formatTimestampToICS(new Date());

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UTN FRRo ISI//Tracker Plan 2023//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Exámenes Finales ISI - UTN FRRo',
    'X-WR-TIMEZONE:America/Argentina/Buenos_Aires'
  ];

  for (const meta of metas) {
    const materia = MATERIAS_MAP[meta.materiaId];
    const materiaNombre = materia ? materia.nombreCompleto : `Materia #${meta.materiaId}`;
    const materiaCorta = materia ? materia.nombre : `#${meta.materiaId}`;

    let fechaStr = meta.fechaEstimada;
    let diaNombre = '';

    const turno = TURNOS_EXAMEN_2026.find(t => t.id === meta.turnoId);
    if (turno) {
      const fechaExacta = getFechaExactaMesa(meta.materiaId, turno);
      if (fechaExacta) {
        fechaStr = fechaExacta.fechaExactaStr;
        diaNombre = fechaExacta.diaNombre;
      } else if (!fechaStr) {
        fechaStr = turno.fechaInicio;
      }
    }

    if (!fechaStr) continue;

    const dtStart = formatDateToICS(fechaStr);
    const dtEnd = getNextDayStr(fechaStr);
    const uid = `final-${meta.materiaId}-${dtStart}@tracker-isi.utn`;
    const turnoDesc = meta.turnoNombre || turno?.nombre || 'Turno oficial';

    let desc = `Examen Final de ${materiaNombre}.\\nTurno: ${turnoDesc}`;
    if (diaNombre) desc += ` (${diaNombre})`;
    if (meta.comentario) desc += `\\nNotas de estudio: ${meta.comentario}`;
    desc += '\\nFacultad Regional Rosario - Plan 2023 ISI.\\nVerificá aula y horario en Sysacad.';

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowStr}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `SUMMARY:Examen Final: ${materiaCorta} (UTN FRRo)`,
      `DESCRIPTION:${desc}`,
      'LOCATION:UTN Facultad Regional Rosario, Zeballos 1341, Rosario, Santa Fe',
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      // Alarma 7 días antes
      'BEGIN:VALARM',
      'TRIGGER:-P7D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Recordatorio: En 7 días rendís ${materiaCorta}`,
      'END:VALARM',
      // Alarma 1 día antes
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Recordatorio: ¡Mañana rendís ${materiaCorta}!`,
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Descarga el archivo .ics en el navegador del usuario
 */
export function exportMetasToICS(metas: MetaExamen[]): boolean {
  if (!metas || metas.length === 0) return false;

  const content = generateICSContent(metas);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `finales-utn-frro-${new Date().getFullYear()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return true;
}
