import { describe, it, expect } from 'vitest';
import { formatFechaLocal, formatRangoFechas, formatPromedio, formatNota } from '../../utils/formatters';

describe('Formatters Utility', () => {
  describe('formatFechaLocal', () => {
    it('debe formatear correctamente una fecha YYYY-MM-DD a DD/MM/YYYY', () => {
      expect(formatFechaLocal('2026-03-15')).toBe('15/03/2026');
      expect(formatFechaLocal('2025-12-01')).toBe('01/12/2025');
    });

    it('debe manejar timestamps ISO con tiempo', () => {
      expect(formatFechaLocal('2026-02-23T14:30:00')).toBe('23/02/2026');
    });

    it('debe devolver guión para valores nulos o vacíos', () => {
      expect(formatFechaLocal(null)).toBe('—');
      expect(formatFechaLocal(undefined)).toBe('—');
      expect(formatFechaLocal('')).toBe('—');
    });
  });

  describe('formatRangoFechas', () => {
    it('debe formatear rangos del mismo año omitiendo el año inicial', () => {
      expect(formatRangoFechas('2026-02-18', '2026-02-24')).toBe('18/02 al 24/02/2026');
    });

    it('debe formatear rangos que cruzan año con ambos años', () => {
      expect(formatRangoFechas('2025-12-28', '2026-01-04')).toBe('28/12/2025 al 04/01/2026');
    });

    it('debe devolver fecha simple si inicio y fin coinciden', () => {
      expect(formatRangoFechas('2026-05-25', '2026-05-25')).toBe('25/05/2026');
    });
  });

  describe('formatPromedio', () => {
    it('debe formatear promedios con dos decimales y coma', () => {
      expect(formatPromedio(8.5)).toBe('8,50');
      expect(formatPromedio(8)).toBe('8,00');
      expect(formatPromedio(7.33333)).toBe('7,33');
    });

    it('debe devolver guión para promedios nulos o indefinidos', () => {
      expect(formatPromedio(null)).toBe('—');
      expect(formatPromedio(undefined)).toBe('—');
      expect(formatPromedio(Number.NaN)).toBe('—');
    });
  });

  describe('formatNota', () => {
    it('debe formatear notas numéricas o devolver guión', () => {
      expect(formatNota(10)).toBe('10');
      expect(formatNota(4)).toBe('4');
      expect(formatNota(null)).toBe('—');
      expect(formatNota(undefined)).toBe('—');
    });
  });
});
