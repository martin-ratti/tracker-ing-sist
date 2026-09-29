import { describe, it, expect } from 'vitest';
import { MATERIAS_TRONCALES, MATERIAS_ELECTIVAS } from '../data/plan2023.js';

describe('plan2023 - Integridad del Catálogo Académico', () => {
  it('debe contener las 37 materias oficiales (36 troncales de grado + Seminario ADUSI)', () => {
    expect(MATERIAS_TRONCALES).toHaveLength(37);
  });

  it('todas las materias troncales deben tener identificadores válidos y nombres completos', () => {
    const ids = MATERIAS_TRONCALES.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(37);
    MATERIAS_TRONCALES.forEach(m => {
      expect(m.id).toBeGreaterThan(0);
      expect(m.nombre).toBeDefined();
      expect(m.nombreCompleto).toBeDefined();
      expect(m.nivel).toBeGreaterThanOrEqual(1);
      expect(m.nivel).toBeLessThanOrEqual(5);
    });
  });

  it('todas las electivas deben tener IDs mayores o iguales a 200 y carga horaria definida', () => {
    expect(MATERIAS_ELECTIVAS.length).toBeGreaterThan(0);
    MATERIAS_ELECTIVAS.forEach(el => {
      expect(el.id).toBeGreaterThanOrEqual(200);
      expect(el.horas).toBeGreaterThan(0);
      expect(el.nivel).toBeGreaterThanOrEqual(2);
      expect(el.nivel).toBeLessThanOrEqual(5);
    });
  });

  it('todas las correlatividades de cursado y final deben apuntar a IDs numéricos existentes', () => {
    const todosIds = new Set([...MATERIAS_TRONCALES.map(m => m.id), ...MATERIAS_ELECTIVAS.map(e => e.id)]);

    MATERIAS_TRONCALES.forEach(m => {
      m.reqRegular.forEach(id => {
        expect(todosIds.has(id)).toBe(true);
      });
      m.reqAprobada.forEach(id => {
        expect(todosIds.has(id)).toBe(true);
      });
    });
  });
});
