import { describe, it, expect } from 'vitest';
import { MATERIAS_TRONCALES, MATERIAS_ELECTIVAS, MATERIAS_MAP, ELECTIVAS_MAP } from '../../data/plan2023';

describe('Plan 2023 - Estructura de Datos y Correlatividades', () => {
  it('debe tener las 37 materias oficiales en el catálogo troncal (36 asignaturas + Seminario ADUSI)', () => {
    expect(MATERIAS_TRONCALES).toHaveLength(37);
  });

  it('cada materia troncal debe tener propiedades válidas y obligatorias', () => {
    MATERIAS_TRONCALES.forEach((materia) => {
      expect(materia.id).toBeGreaterThan(0);
      expect(materia.nombre).toBeTruthy();
      expect(materia.nombreCompleto).toBeTruthy();
      expect(materia.nivel).toBeGreaterThanOrEqual(1);
      expect(materia.nivel).toBeLessThanOrEqual(5);
      expect(materia.horas).toBeGreaterThan(0);
      expect(Array.isArray(materia.reqRegular)).toBe(true);
      expect(Array.isArray(materia.reqAprobada) || materia.reqAprobada === 'TODAS').toBe(true);
      if (materia.reqRendirAprobada) {
        expect(Array.isArray(materia.reqRendirAprobada) || materia.reqRendirAprobada === 'TODAS').toBe(true);
      }
    });
  });

  it('no debe haber IDs duplicados entre materias troncales ni con electivas', () => {
    const troncalesIds = MATERIAS_TRONCALES.map((m) => m.id);
    const electivasIds = MATERIAS_ELECTIVAS.map((e) => e.id);
    const todosIds = [...troncalesIds, ...electivasIds];

    const uniqueTroncales = new Set(troncalesIds);
    expect(uniqueTroncales.size).toBe(troncalesIds.length);

    const uniqueTodos = new Set(todosIds);
    expect(uniqueTodos.size).toBe(todosIds.length);
  });

  it('debe distribuir las materias correctamente en los 5 niveles', () => {
    for (let nivel = 1; nivel <= 5; nivel++) {
      const materiasNivel = MATERIAS_TRONCALES.filter((m) => m.nivel === nivel);
      expect(materiasNivel.length).toBeGreaterThanOrEqual(6);
    }
  });

  it('MATERIAS_MAP y ELECTIVAS_MAP deben indexar correctamente todas las materias', () => {
    MATERIAS_TRONCALES.forEach((m) => {
      expect(MATERIAS_MAP[m.id]).toBeDefined();
      expect(MATERIAS_MAP[m.id].nombre).toBe(m.nombre);
    });

    MATERIAS_ELECTIVAS.forEach((e) => {
      expect(ELECTIVAS_MAP[e.id]).toBeDefined();
      expect(ELECTIVAS_MAP[e.id].nombre).toBe(e.nombre);
    });
  });

  it('todas las correlatividades numéricas deben referenciar a IDs de materias existentes', () => {
    MATERIAS_TRONCALES.forEach((materia) => {
      materia.reqRegular.forEach((corrId) => {
        expect(MATERIAS_MAP[corrId], `reqRegular ${corrId} de materia ${materia.id} no existe`).toBeDefined();
      });
      if (Array.isArray(materia.reqAprobada)) {
        materia.reqAprobada.forEach((corrId) => {
          expect(MATERIAS_MAP[corrId], `reqAprobada ${corrId} de materia ${materia.id} no existe`).toBeDefined();
        });
      }
      if (Array.isArray(materia.reqRendirAprobada)) {
        materia.reqRendirAprobada.forEach((corrId) => {
          expect(MATERIAS_MAP[corrId], `reqRendirAprobada ${corrId} de materia ${materia.id} no existe`).toBeDefined();
        });
      }
    });
  });

  it('el grafo de correlatividades no debe contener ciclos dirigidos', () => {
    const adj = new Map<number, number[]>();
    MATERIAS_TRONCALES.forEach((m) => {
      const deps: number[] = [...m.reqRegular];
      if (Array.isArray(m.reqAprobada)) {
        deps.push(...m.reqAprobada);
      }
      if (Array.isArray(m.reqRendirAprobada)) {
        deps.push(...m.reqRendirAprobada);
      }
      adj.set(m.id, Array.from(new Set(deps)));
    });

    const visited = new Set<number>();
    const recStack = new Set<number>();

    function hasCycle(nodeId: number): boolean {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adj.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    }

    MATERIAS_TRONCALES.forEach((m) => {
      if (!visited.has(m.id)) {
        expect(hasCycle(m.id)).toBe(false);
      }
    });
  });

  it('las materias de 1er nivel no deben tener correlatividades previas', () => {
    const nivel1 = MATERIAS_TRONCALES.filter((m) => m.nivel === 1);
    nivel1.forEach((m) => {
      expect(m.reqRegular).toHaveLength(0);
      expect(m.reqAprobada).toEqual([]);
      expect(m.reqRendirAprobada).toBeUndefined();
    });
  });
});
