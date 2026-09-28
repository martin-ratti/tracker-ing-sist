import { describe, it, expect, vi } from 'vitest';
import { generateICSContent, exportMetasToICS } from '../utils/icsExporter';
import { encodeProgress, decodeProgress, type SharedData } from '../utils/share';
import type { MetaExamen } from '../types/plan';

describe('Utilidades del Sistema', () => {
  describe('Exportador de Calendario .ics (RFC 5545)', () => {
    const mockMetas: MetaExamen[] = [
      {
        materiaId: 1, // Análisis Matemático I
        turnoId: 'feb-2026-l1',
        turnoNombre: 'Febrero Llamado 1',
        fechaEstimada: '2026-02-16',
        comentario: 'Repasar integrales y series',
        createdAt: '2026-02-01T12:00:00.000Z',
      },
      {
        materiaId: 2, // Álgebra y Geometría Analítica
        turnoId: 'feb-2026-l2',
        turnoNombre: 'Febrero Llamado 2',
        fechaEstimada: '2026-02-24',
        createdAt: '2026-02-01T12:00:00.000Z',
      },
      {
        materiaId: 99999, // Sin día asignado
        turnoId: 'feb-2026-l1',
        turnoNombre: 'Febrero Llamado 1',
        createdAt: '2026-02-01T12:00:00.000Z',
      },
    ];

    it('debe generar la cabecera estándar VCALENDAR', () => {
      const ics = generateICSContent(mockMetas);
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('PRODID:-//UTN FRRo ISI//Tracker Plan 2023//ES');
      expect(ics).toContain('CALSCALE:GREGORIAN');
      expect(ics).toContain('X-WR-CALNAME:Exámenes Finales ISI - UTN FRRo');
      expect(ics).toContain('END:VCALENDAR');
    });

    it('debe generar los bloques VEVENT con alarmas de 7 días y 1 día antes', () => {
      const ics = generateICSContent(mockMetas);
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('SUMMARY:Examen Final: AM I (UTN FRRo)');
      expect(ics).toContain('LOCATION:UTN Facultad Regional Rosario');
      expect(ics).toContain('Repasar integrales y series');
      expect(ics).toContain('TRIGGER:-P7D');
      expect(ics).toContain('TRIGGER:-P1D');
      expect(ics).toContain('END:VEVENT');
    });

    it('exportMetasToICS debe retornar false si no se envían metas', () => {
      expect(exportMetasToICS([])).toBe(false);
    });

    it('exportMetasToICS debe crear y descargar el blob en el DOM', () => {
      // Mock de URL.createObjectURL y URL.revokeObjectURL
      const createObjectURLMock = vi.fn(() => 'blob:mock-url');
      const revokeObjectURLMock = vi.fn();
      globalThis.URL.createObjectURL = createObjectURLMock;
      globalThis.URL.revokeObjectURL = revokeObjectURLMock;

      const clickMock = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const el = originalCreateElement(tagName);
        if (tagName === 'a') {
          el.click = clickMock;
        }
        return el;
      });

      const resultado = exportMetasToICS(mockMetas);
      expect(resultado).toBe(true);
      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('Compresión y Descompresión de Progreso Compartido (share.ts)', () => {
    it('debe codificar y decodificar el estado de forma idéntica y simétrica', () => {
      const dataOriginal: SharedData = {
        estados: {
          1: 'aprobada',
          2: 'aprobada',
          3: 'regular',
          5: 'aprobada',
          6: 'regular',
        },
        estadosElectivas: {
          201: 'aprobada',
          207: 'regular',
        },
        perfil: {
          nombre: 'Martín Ratti',
          legajo: '',
        },
        ppsHoras: 120,
      };

      const hash = encodeProgress(dataOriginal);
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
      // No debe contener caracteres problemáticos en URLs
      expect(hash).not.toContain('+');
      expect(hash).not.toContain('/');
      expect(hash).not.toContain('=');

      const dataDecodificada = decodeProgress(hash);
      expect(dataDecodificada).not.toBeNull();
      expect(dataDecodificada?.perfil.nombre).toBe('Martín Ratti');
      expect(dataDecodificada?.ppsHoras).toBe(120);
      expect(dataDecodificada?.estados).toEqual(dataOriginal.estados);
      expect(dataDecodificada?.estadosElectivas).toEqual(dataOriginal.estadosElectivas);
    });

    it('debe manejar estados vacíos o por defecto sin fallar', () => {
      const dataVacia: SharedData = {
        estados: {},
        estadosElectivas: {},
        perfil: { nombre: '', legajo: '' },
        ppsHoras: 0,
      };

      const hash = encodeProgress(dataVacia);
      const decodificado = decodeProgress(hash);
      expect(decodificado).not.toBeNull();
      expect(decodificado?.estados).toEqual({});
      expect(decodificado?.estadosElectivas).toEqual({});
      expect(decodificado?.ppsHoras).toBe(0);
    });

    it('debe retornar null ante hashes inválidos o corruptos', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const decodificado = decodeProgress('!#%^&*corrupto_string_invalido');
      expect(decodificado).toBeNull();
      consoleSpy.mockRestore();
    });
  });
});
