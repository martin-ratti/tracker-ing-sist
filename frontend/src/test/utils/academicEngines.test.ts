import { describe, it, expect } from 'vitest';
import { MATERIAS_MAP, ELECTIVAS_MAP } from '../../data/plan2023';
import {
  cumpleReqsCursada,
  puedeRegularMateria,
  puedeAprobarMateria,
  esMateriaCursable,
  esMateriaRendible,
  puedeRegularElectiva,
  esElectivaCursable
} from '../../utils/correlativesEngine';
import { applyCascade } from '../../utils/cascadeEngine';
import { computeAcademicStats, findUpcomingExamMeta } from '../../utils/academicCalculations';
import { parseBackupJson } from '../../utils/backupManager';
import type { EstadoMateria, MetaExamen } from '../../types/plan';

describe('Academic Engines (correlativesEngine, cascadeEngine, academicCalculations, backupManager)', () => {
  describe('correlativesEngine', () => {
    it('debe permitir cursar materias de 1er nivel sin requisitos', () => {
      const am1 = MATERIAS_MAP[1]; // Análisis Matemático I
      const getEstado = () => 'pendiente' as EstadoMateria;

      expect(cumpleReqsCursada(am1, getEstado)).toBe(true);
      expect(puedeRegularMateria(am1, getEstado)).toBe(true);
      expect(esMateriaCursable(am1, getEstado)).toBe(true);
      expect(esMateriaRendible(am1, getEstado)).toBe(false);
      expect(puedeAprobarMateria(am1, getEstado)).toBe(false); // No está regular
      expect(puedeAprobarMateria(am1, () => 'regular')).toBe(true);
    });

    it('debe bloquear materias de niveles superiores si faltan requisitos', () => {
      const am2 = MATERIAS_MAP[9]; // AM II requiere regular AM1 (1) y Álgebra (2)
      const estados: Record<number, EstadoMateria> = { 1: 'regular' }; // Falta Álgebra
      const getEstado = (id: number) => estados[id] || 'pendiente';

      expect(cumpleReqsCursada(am2, getEstado)).toBe(false);
      expect(esMateriaCursable(am2, getEstado)).toBe(false);

      // Ahora regulariza Álgebra
      estados[2] = 'regular';
      expect(cumpleReqsCursada(am2, getEstado)).toBe(true);
      expect(esMateriaCursable(am2, getEstado)).toBe(true);
    });

    it('debe validar electivas correctamente', () => {
      const electiva = ELECTIVAS_MAP[201]; // Entornos Gráficos
      const estados: Record<number, EstadoMateria> = {
        5: 'regular',
        6: 'aprobada',
        8: 'aprobada'
      };
      const getEstado = (id: number) => estados[id] || 'pendiente';
      const getEstadoElectiva = () => 'pendiente' as EstadoMateria;

      expect(puedeRegularElectiva(electiva, getEstado)).toBe(true);
      expect(esElectivaCursable(electiva, getEstadoElectiva, getEstado)).toBe(true);
    });
  });

  describe('cascadeEngine', () => {
    it('debe propagar en cascada cuando una materia base vuelve a pendiente', () => {
      // Estado: AM1 y Álgebra aprobadas, AM2 regular
      const initialEstados: Record<number, EstadoMateria> = {
        1: 'aprobada',
        2: 'aprobada',
        9: 'regular' // AM2
      };
      const initialElectivas: Record<number, EstadoMateria> = {};

      // Si AM1 vuelve a pendiente, AM2 debe caer a pendiente
      const estadosModificados = { ...initialEstados, 1: 'pendiente' as EstadoMateria };
      const { newEstados } = applyCascade(estadosModificados, initialElectivas);

      expect(newEstados[9]).toBe('pendiente');
    });
  });

  describe('academicCalculations', () => {
    it('debe calcular estadísticas y promedios con exactitud', () => {
      const estados: Record<number, EstadoMateria> = {
        1: 'aprobada',
        2: 'aprobada',
        3: 'regular'
      };
      const notas = {
        1: { nota: 8 },
        2: { nota: 10 }
      };

      const stats = computeAcademicStats(
        estados,
        {},
        notas,
        50,
        {},
        m => m.id === 4
      );

      expect(stats.aprobadasCount).toBe(2);
      expect(stats.regularesCount).toBe(1);
      expect(stats.promedio).toBe(9);
      expect(stats.adusiCumplido).toBe(false);
      expect(stats.ingenieroCumplido).toBe(false);
    });

    it('debe detectar la próxima meta de examen futura', () => {
      const metas: Record<number, MetaExamen> = {
        1: {
          materiaId: 1,
          turnoId: 'test-turno',
          turnoNombre: 'Turno Test',
          fechaEstimada: '2027-12-01'
        }
      };
      const getEstado = () => 'regular' as EstadoMateria;
      const meta = findUpcomingExamMeta(metas, getEstado, new Date('2027-11-01'));

      expect(meta).not.toBeNull();
      expect(meta?.materiaId).toBe(1);
      expect(meta?.turnoNombre).toBe('Turno Test');
    });
  });

  describe('backupManager', () => {
    it('debe validar y parsear backup JSON correctamente', () => {
      const valid = JSON.stringify({ version: '1.0', estados: { 1: 'aprobada' } });
      const parsed = parseBackupJson(valid);
      expect(parsed).not.toBeNull();
      expect(parsed?.estados?.[1]).toBe('aprobada');

      const invalid = 'not a json';
      expect(parseBackupJson(invalid)).toBeNull();
    });
  });
});
