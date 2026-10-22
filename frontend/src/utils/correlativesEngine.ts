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
 * Valida si una materia puede ser aprobada (por cursado/promoción directa o final).
 * En la UTN FRRo (Plan 2023), una materia puede aprobarse directamente por régimen
 * de promoción sin necesidad de haber quedado previamente en estado 'regular'
 * ni de contar con las correlativas de rendir final aprobadas.
 * Por lo tanto, la condición para aprobar una materia es poder cursarla (cumpleReqsCursada).
 */
export function puedeAprobarMateria(m: Materia, getEstado: EstadoGetter): boolean {
  return cumpleReqsCursada(m, getEstado);
}

/**
 * Valida si una materia cumple los requisitos para rendir examen final:
 * 1. Debe estar en estado 'regular'.
 * 2. Las materias requeridas regulares para cursada (reqRegular) deben estar APROBADAS.
 * 3. Las materias requeridas aprobadas para cursada (reqAprobada) deben estar APROBADAS.
 * 4. Requisitos adicionales específicos de rendir final (reqRendirAprobada), si existieren.
 */
export function puedeRendirFinal(m: Materia, getEstado: EstadoGetter): boolean {
  const est = getEstado(m.id);
  if (est !== 'regular') return false;

  // 1. Requisito de rendir final: materias de cursada deben estar APROBADAS
  const regularAprobadasOk = m.reqRegular.every(c => getEstado(c) === 'aprobada');
  if (!regularAprobadasOk) return false;

  // 2. Materias requeridas aprobadas para cursada también deben estar APROBADAS
  let aprobadaOk = false;
  if (m.reqAprobada === 'TODAS') {
    aprobadaOk = MATERIAS_TRONCALES.filter(x => x.id !== m.id).every(x => getEstado(x.id) === 'aprobada');
  } else {
    aprobadaOk = m.reqAprobada.every(c => getEstado(c) === 'aprobada');
  }
  if (!aprobadaOk) return false;

  // 3. Requisitos adicionales específicos de rendir final
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
  return puedeRendirFinal(m, getEstado);
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
 * Valida si una electiva puede aprobarse (por cursado/promoción o final).
 */
export function puedeAprobarElectiva(e: Electiva, getEstado: EstadoGetter): boolean {
  return puedeRegularElectiva(e, getEstado);
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
