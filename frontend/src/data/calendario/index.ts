import type { TurnoExamenOficial, HitoAcademico } from './types';
import { generarFeriadosFijos } from './feriadosFijos';
import { CALENDARIO_2026 } from './anios/2026';
import { CALENDARIO_2027 } from './anios/2027';

// Exportación unificada de tipos y reglas
export * from './types';
export * from './reglas';
export * from './feriadosFijos';

// Registro de ciclos académicos activos
const CICLOS_ACTIVOS = [CALENDARIO_2026, CALENDARIO_2027];

/**
 * Catálogo consolidado de todos los turnos de examen oficiales registrados.
 */
export const TURNOS_EXAMEN: TurnoExamenOficial[] = CICLOS_ACTIVOS.flatMap(c => c.turnos);

/**
 * Catálogo consolidado de hitos académicos, recesos, asuetos y feriados ordenados cronológicamente.
 */
export const HITOS_ACADEMICOS: HitoAcademico[] = CICLOS_ACTIVOS.flatMap(c => [
  ...c.hitosBase,
  ...c.feriadosMoviles,
  ...generarFeriadosFijos(c.anio)
]).sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));

// Alias para garantizar retrocompatibilidad total con código existente
export const TURNOS_EXAMEN_2026 = TURNOS_EXAMEN;
export const HITOS_ACADEMICOS_2026 = HITOS_ACADEMICOS;
