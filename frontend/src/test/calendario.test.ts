import { describe, it, expect } from 'vitest';
import {
  TURNOS_EXAMEN,
  HITOS_ACADEMICOS,
  REGLA_SYSACAD_EXAMEN,
  DIAS_MESA_POR_MATERIA,
  getFechaExactaMesa,
  isFechaEnTurno,
  isPastDate,
  generarFeriadosFijos,
} from '../data/calendario';

describe('Calendario Académico y Mesas de Examen', () => {
  describe('Turnos de Examen', () => {
    it('debe tener registrados turnos oficiales de examen', () => {
      expect(TURNOS_EXAMEN.length).toBeGreaterThan(0);
    });

    it('cada turno debe poseer identificador único y coherencia en sus fechas', () => {
      const ids = new Set<string>();
      TURNOS_EXAMEN.forEach((t) => {
        expect(ids.has(t.id), `ID duplicado: ${t.id}`).toBe(false);
        ids.add(t.id);

        expect(t.nombre).toBeTruthy();
        expect(t.fechaInicio).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(t.fechaFin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(t.fechaInicio <= t.fechaFin).toBe(true);

        if (t.diasEspecificos) {
          expect(Array.isArray(t.diasEspecificos)).toBe(true);
          t.diasEspecificos.forEach((d) => {
            expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          });
        }
      });
    });

    it('debe contener turnos tanto de 2026 como de 2027', () => {
      const turnos2026 = TURNOS_EXAMEN.filter((t) => t.id.includes('2026'));
      const turnos2027 = TURNOS_EXAMEN.filter((t) => t.id.includes('2027'));

      expect(turnos2026.length).toBeGreaterThanOrEqual(7);
      expect(turnos2027.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Hitos Académicos y Feriados', () => {
    it('debe listar hitos académicos ordenados cronológicamente', () => {
      expect(HITOS_ACADEMICOS.length).toBeGreaterThan(0);
      for (let i = 1; i < HITOS_ACADEMICOS.length; i++) {
        expect(HITOS_ACADEMICOS[i].fechaInicio >= HITOS_ACADEMICOS[i - 1].fechaInicio).toBe(true);
      }
    });

    it('debe generar feriados fijos de la República Argentina para cualquier año dado', () => {
      const feriados2026 = generarFeriadosFijos(2026);
      expect(feriados2026.some((f) => f.titulo.includes('Trabajador') && f.fechaInicio === '2026-05-01')).toBe(true);
      expect(feriados2026.some((f) => f.titulo.includes('Revolución de Mayo') && f.fechaInicio === '2026-05-25')).toBe(true);
      expect(feriados2026.some((f) => f.titulo.includes('Independencia') && f.fechaInicio === '2026-07-09')).toBe(true);
      expect(feriados2026.some((f) => f.titulo.includes('Navidad') && f.fechaInicio === '2026-12-25')).toBe(true);
    });
  });

  describe('Días de Mesa y Reglas de Sysacad', () => {
    it('debe contener la regla oficial de Sysacad sobre el cierre de inscripción', () => {
      expect(REGLA_SYSACAD_EXAMEN.descripcion).toContain('18:00 hs');
      expect(REGLA_SYSACAD_EXAMEN.descripcion).toContain('penúltimo día hábil');
    });

    it('debe mapear materias troncales a los días de mesa correctos según la cartilla oficial', () => {
      expect(DIAS_MESA_POR_MATERIA[1]).toBe('Lunes'); // Análisis Matemático I
      expect(DIAS_MESA_POR_MATERIA[2]).toBe('Martes'); // Álgebra
      expect(DIAS_MESA_POR_MATERIA[3]).toBe('Martes'); // Física I
      expect(DIAS_MESA_POR_MATERIA[5]).toBe('Miércoles'); // Lógica
      expect(DIAS_MESA_POR_MATERIA[6]).toBe('Miércoles'); // Algoritmos
      expect(DIAS_MESA_POR_MATERIA[13]).toBe('Jueves'); // Sintaxis
      expect(DIAS_MESA_POR_MATERIA[18]).toBe('Viernes'); // Economía
      expect(DIAS_MESA_POR_MATERIA[36]).toBe('Lunes'); // Proyecto Final
    });

    it('getFechaExactaMesa debe calcular correctamente la fecha exacta para una semana estándar', () => {
      const turnoSemanal = TURNOS_EXAMEN.find((t) => !t.diasEspecificos || t.diasEspecificos.length === 0);
      expect(turnoSemanal).toBeDefined();

      if (turnoSemanal) {
        const mesaLunes = getFechaExactaMesa(1, turnoSemanal); // Análisis I (Lunes)
        expect(mesaLunes).not.toBeNull();
        expect(mesaLunes?.diaNombre).toBe('Lunes');
        expect(mesaLunes?.fechaExactaStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        const mesaMartes = getFechaExactaMesa(2, turnoSemanal); // Álgebra (Martes)
        expect(mesaMartes).not.toBeNull();
        expect(mesaMartes?.diaNombre).toBe('Martes');

        // El martes debe ser exactamente el día posterior al lunes
        const dateLunes = new Date(mesaLunes!.fechaExactaStr + 'T00:00:00');
        const dateMartes = new Date(mesaMartes!.fechaExactaStr + 'T00:00:00');
        const diffMs = dateMartes.getTime() - dateLunes.getTime();
        expect(diffMs).toBe(24 * 60 * 60 * 1000);
      }
    });

    it('getFechaExactaMesa debe resolver turnos con diasEspecificos', () => {
      const turnoConDias = TURNOS_EXAMEN.find((t) => t.diasEspecificos && t.diasEspecificos.length > 0);
      if (turnoConDias) {
        const mesa = getFechaExactaMesa(1, turnoConDias);
        expect(mesa).not.toBeNull();
      }
    });

    it('getFechaExactaMesa debe retornar null si la materia no tiene día de mesa asignado', () => {
      const turnoSemanal = TURNOS_EXAMEN[0];
      const resultado = getFechaExactaMesa(999999, turnoSemanal);
      expect(resultado).toBeNull();
    });

    it('isFechaEnTurno debe verificar pertenencia de fecha dentro o fuera del rango del turno', () => {
      const turno = TURNOS_EXAMEN[0];
      expect(isFechaEnTurno(turno.fechaInicio, turno)).toBe(true);
      expect(isFechaEnTurno(turno.fechaFin, turno)).toBe(true);
      expect(isFechaEnTurno('1990-01-01', turno)).toBe(false);
      expect(isFechaEnTurno('2099-12-31', turno)).toBe(false);
    });

    it('isPastDate debe determinar correctamente si una fecha ya finalizó', () => {
      expect(isPastDate('2000-01-01')).toBe(true);
      expect(isPastDate('2099-01-01')).toBe(false);
    });
  });
});
