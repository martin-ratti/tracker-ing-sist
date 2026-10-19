import type { EstadoMateria, Materia, Electiva } from '../types/plan';
import { MATERIAS_TRONCALES } from '../data/plan2023';

export type EstadoGetter = (id: number) => EstadoMateria;

/**
 * Determina si se cumplen los requisitos para cursar una materia troncal.
 */
export function cumpleReqsCursada(m: Materia, getEstado: EstadoGetter): boolean {
  const regularOk = m.reqRegular.every(c => {
    const e = getEstado(c);
    return e === 'regular' || e === 'aprobada';
  });

  let aprobadaOk = false;
  if (m.reqAprobada === 'TODAS') {
    aprobadaOk = MATERIAS_TRONCALES.filter(x => x.id !== m.id).every(x => getEstado(x.id) === 'aprobada');
  } else {
    aprobadaOk = m.reqAprobada.every(c => getEstado(c) === 'aprobada');
  }

  return regularOk && aprobadaOk;
}

/**
 * Valida si una materia puede ser regularizada.
 */
export function puedeRegularMateria(m: Materia, getEstado: EstadoGetter): boolean {
  return cumpleReqsCursada(m, getEstado);
}

/**
 * Valida si una materia puede ser aprobada (debe estar regular y cumplir correlativas de aprobación).
 */
export function puedeAprobarMateria(m: Materia, getEstado: EstadoGetter): boolean {
  const est = getEstado(m.id);
  if (est !== 'regular') return false;

  if (m.reqRendirAprobada) {
    if (m.reqRendirAprobada === 'TODAS') {
      const todasLasDemas = MATERIAS_TRONCALES.filter(x => x.id !== m.id);
      return todasLasDemas.every(x => getEstado(x.id) === 'aprobada');
    }
    return m.reqRendirAprobada.every(c => getEstado(c) === 'aprobada');
  }
  return true;
}

/**
 * Determina si una materia troncal está habilitada para cursar (pendiente y con correlativas cumplidas).
 */
export function esMateriaCursable(m: Materia, getEstado: EstadoGetter): boolean {
  return getEstado(m.id) === 'pendiente' && cumpleReqsCursada(m, getEstado);
}

/**
 * Determina si una materia troncal está habilitada para rendir final (regular y con correlativas de final).
 */
export function esMateriaRendible(m: Materia, getEstado: EstadoGetter): boolean {
  return getEstado(m.id) === 'regular' && puedeAprobarMateria(m, getEstado);
}

/**
 * Valida si una electiva puede regularizarse según las troncales previas.
 */
export function puedeRegularElectiva(e: Electiva, getEstado: EstadoGetter): boolean {
  const regOk = e.reqRegular.every(c => {
    const est = getEstado(c);
    return est === 'regular' || est === 'aprobada';
  });
  const aprOk = e.reqAprobada.every(c => getEstado(c) === 'aprobada');
  return regOk && aprOk;
}

/**
 * Determina si una electiva está lista para ser cursada.
 */
export function esElectivaCursable(
  e: Electiva,
  getEstadoElectiva: EstadoGetter,
  getEstado: EstadoGetter
): boolean {
  return getEstadoElectiva(e.id) === 'pendiente' && puedeRegularElectiva(e, getEstado);
}
