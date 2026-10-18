import { describe, it, expect } from 'vitest';
import { calculateDaysRemaining, formatFriendlyDate } from '../services/reminderService.js';

describe('Reminder Service', () => {
  describe('calculateDaysRemaining', () => {
    it('debe devolver 7 si la fecha objetivo es en 7 días', () => {
      const ref = new Date('2026-11-10T12:00:00Z');
      const target = '2026-11-17';
      expect(calculateDaysRemaining(target, ref)).toBe(7);
    });

    it('debe devolver 0 si es el mismo día', () => {
      const ref = new Date('2026-11-10T08:00:00Z');
      const target = '2026-11-10';
      expect(calculateDaysRemaining(target, ref)).toBe(0);
    });

    it('debe devolver un número negativo si la fecha ya pasó', () => {
      const ref = new Date('2026-11-15T12:00:00Z');
      const target = '2026-11-10';
      expect(calculateDaysRemaining(target, ref)).toBe(-5);
    });

    it('debe devolver NaN para formatos de fecha inválidos', () => {
      expect(calculateDaysRemaining('fecha-invalida')).toBeNaN();
    });
  });

  describe('formatFriendlyDate', () => {
    it('formatea la fecha en español correctamente', () => {
      const formatted = formatFriendlyDate('2026-11-24');
      expect(formatted.toLowerCase()).toContain('24');
      expect(formatted.toLowerCase()).toContain('noviembre');
      expect(formatted).toContain('2026');
    });

    it('devuelve el string original si no se puede formatear', () => {
      expect(formatFriendlyDate('fecha-rara')).toBe('fecha-rara');
    });
  });
});
