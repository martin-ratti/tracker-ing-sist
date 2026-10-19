import { MATERIAS_MAP, MATERIAS_TRONCALES } from '../../../data/plan2023';

export const MATERIAS_GRAFO = MATERIAS_TRONCALES.filter(m => !m.esAdusiSolo);

export interface DependenciesTreeResult {
  ancestors: Set<number>;
  ancestorsRegular: Set<number>;
  ancestorsAprobada: Set<number>;
  descendants: Set<number>;
  descendantsRegular: Set<number>;
  descendantsAprobada: Set<number>;
}

/**
 * Calcula recursivamente las correlativas previas (ancestros) y las materias posteriores que destraba (descendientes),
 * clasificadas según requieran regularidad o aprobación.
 */
export function buildDependenciesTree(focusedSubjectId: number | null): DependenciesTreeResult | null {
  if (!focusedSubjectId) return null;

  const ancestors = new Set<number>();
  const ancestorsRegular = new Set<number>();
  const ancestorsAprobada = new Set<number>();

  const descendants = new Set<number>();
  const descendantsRegular = new Set<number>();
  const descendantsAprobada = new Set<number>();

  // 1. Ancestros (Correlativas previas)
  function traceAncestors(currId: number, isApprovalRequired: boolean) {
    const m = MATERIAS_MAP[currId];
    if (!m) return;

    ancestors.add(currId);

    if (isApprovalRequired) {
      ancestorsAprobada.add(currId);
      ancestorsRegular.delete(currId);
    } else if (!ancestorsAprobada.has(currId)) {
      ancestorsRegular.add(currId);
    }

    const aprs = [
      ...(Array.isArray(m.reqAprobada) ? m.reqAprobada : []),
      ...(Array.isArray(m.reqRendirAprobada) ? m.reqRendirAprobada : [])
    ];
    aprs.forEach(r => {
      traceAncestors(r, true);
    });

    m.reqRegular.forEach(r => {
      traceAncestors(r, isApprovalRequired);
    });
  }

  const focusedMateria = MATERIAS_MAP[focusedSubjectId];
  if (focusedMateria) {
    const directApr = [
      ...(Array.isArray(focusedMateria.reqAprobada) ? focusedMateria.reqAprobada : []),
      ...(Array.isArray(focusedMateria.reqRendirAprobada) ? focusedMateria.reqRendirAprobada : [])
    ];
    directApr.forEach(r => traceAncestors(r, true));

    focusedMateria.reqRegular.forEach(r => {
      traceAncestors(r, false);
    });
  }

  // 2. Descendientes (Materias posteriores que destraba)
  MATERIAS_GRAFO.forEach(candidate => {
    const reqApr = (Array.isArray(candidate.reqAprobada) && candidate.reqAprobada.includes(focusedSubjectId)) ||
      (Array.isArray(candidate.reqRendirAprobada) && candidate.reqRendirAprobada.includes(focusedSubjectId));
    const reqReg = candidate.reqRegular.includes(focusedSubjectId);

    if (reqApr) {
      descendants.add(candidate.id);
      descendantsAprobada.add(candidate.id);
    } else if (reqReg) {
      descendants.add(candidate.id);
      descendantsRegular.add(candidate.id);
    }
  });

  function expandDescendants(currId: number, isApprovalChain: boolean) {
    MATERIAS_GRAFO.forEach(candidate => {
      const reqApr = (Array.isArray(candidate.reqAprobada) && candidate.reqAprobada.includes(currId)) ||
        (Array.isArray(candidate.reqRendirAprobada) && candidate.reqRendirAprobada.includes(currId));
      const reqReg = candidate.reqRegular.includes(currId);

      if (reqApr || reqReg) {
        const nextIsApproval = isApprovalChain || reqApr;
        descendants.add(candidate.id);

        if (nextIsApproval) {
          if (!descendantsAprobada.has(candidate.id)) {
            descendantsAprobada.add(candidate.id);
            descendantsRegular.delete(candidate.id);
            expandDescendants(candidate.id, true);
          }
        } else {
          if (!descendantsAprobada.has(candidate.id) && !descendantsRegular.has(candidate.id)) {
            descendantsRegular.add(candidate.id);
            expandDescendants(candidate.id, false);
          }
        }
      }
    });
  }

  Array.from(descendantsAprobada).forEach(id => expandDescendants(id, true));
  Array.from(descendantsRegular).forEach(id => expandDescendants(id, false));

  return {
    ancestors,
    ancestorsRegular,
    ancestorsAprobada,
    descendants,
    descendantsRegular,
    descendantsAprobada
  };
}
