import type { EstadoMateria } from '../types/plan';
import { MATERIAS_TRONCALES, MATERIAS_ELECTIVAS } from '../data/plan2023';

export interface CascadeResult {
  newEstados: Record<number, EstadoMateria>;
  newElectivas: Record<number, EstadoMateria>;
}

/**
 * Propaga en cascada el reseteo de correlatividades cuando una materia vuelve a estado 'pendiente'.
 * Si una materia dependiente (regular o aprobada por cursado/promoción) ya no satisface
 * sus correlativas requeridas para cursar, se degrada automáticamente a 'pendiente'.
 */
export function applyCascade(
  currentEstados: Record<number, EstadoMateria>,
  currentElectivas: Record<number, EstadoMateria>
): CascadeResult {
  const newEstados = { ...currentEstados };
  const newElectivas = { ...currentElectivas };

  let changed = true;
  while (changed) {
    changed = false;

    // Troncales
    MATERIAS_TRONCALES.forEach(m => {
      const est = newEstados[m.id] || 'pendiente';
      if (est === 'pendiente') return;

      const regularOk = m.reqRegular.every(c => {
        const e = newEstados[c] || 'pendiente';
        return e === 'regular' || e === 'aprobada';
      });
      const aprobadaOk = m.reqAprobada === 'TODAS'
        ? MATERIAS_TRONCALES.filter(x => x.id !== m.id).every(x => (newEstados[x.id] || 'pendiente') === 'aprobada')
        : m.reqAprobada.every(c => (newEstados[c] || 'pendiente') === 'aprobada');

      if (!regularOk || !aprobadaOk) {
        newEstados[m.id] = 'pendiente';
        changed = true;
      }
    });

    // Electivas
    MATERIAS_ELECTIVAS.forEach(e => {
      const est = newElectivas[e.id] || 'pendiente';
      if (est === 'pendiente') return;

      const regOk = e.reqRegular.every(c => {
        const s = newEstados[c] || 'pendiente';
        return s === 'regular' || s === 'aprobada';
      });
      const aprOk = e.reqAprobada.every(c => (newEstados[c] || 'pendiente') === 'aprobada');

      if (!regOk || !aprOk) {
        newElectivas[e.id] = 'pendiente';
        changed = true;
      }
    });
  }

  return { newEstados, newElectivas };
}
