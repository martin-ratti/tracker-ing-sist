import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportFichaCurricularPDF } from '../../utils/pdfExporter';
import * as jspdfModule from 'jspdf';
import type { AcademicStats } from '../../utils/academicCalculations';

const OriginalJsPDF = jspdfModule.jsPDF;

describe('pdfExporter (exportFichaCurricularPDF)', () => {
  let savedFilename = '';

  beforeEach(() => {
    savedFilename = '';
    vi.restoreAllMocks();
  });

  const mockStats: AcademicStats = {
    totalTroncales: 38,
    aprobadasCount: 15,
    regularesCount: 10,
    cursablesCount: 5,
    porcentajeCarrera: 39,
    promedio: 8.45,
    horasElectivasAprobadas: 8,
    horasElectivasRegulares: 4,
    nivelMasAvanzado: 3
  };

  it('debe generar y descargar el PDF con los datos del alumno y materias', () => {
    const saveSpy = vi.fn((filename: string) => {
      savedFilename = filename;
    });

    vi.spyOn(jspdfModule, 'jsPDF').mockImplementation(function (...args: any[]) {
      const actualDoc = new OriginalJsPDF(...(args as [any]));
      actualDoc.save = saveSpy;
      return actualDoc;
    } as any);

    exportFichaCurricularPDF({
      perfil: { nombre: 'Martín Test', legajo: '54321' },
      estados: { 1: 'aprobada', 2: 'regular', 3: 'pendiente' },
      estadosElectivas: { 201: 'aprobada' },
      notas: { 1: { nota: 9, fecha: '2024-12-10' } },
      ppsHoras: 100,
      stats: mockStats,
      metasExamen: {
        2: {
          materiaId: 2,
          turnoId: 'feb-2026-l1',
          turnoNombre: 'Febrero 1° Llamado',
          fechaEstimada: '2026-02-18'
        }
      }
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(savedFilename).toBe('Ficha_Curricular_UTN_ISI_54321.pdf');
  });

  it('debe usar nombre de archivo por defecto cuando no hay legajo', () => {
    const saveSpy = vi.fn((filename: string) => {
      savedFilename = filename;
    });

    vi.spyOn(jspdfModule, 'jsPDF').mockImplementation(function (...args: any[]) {
      const actualDoc = new OriginalJsPDF(...(args as [any]));
      actualDoc.save = saveSpy;
      return actualDoc;
    } as any);

    exportFichaCurricularPDF({
      perfil: {},
      estados: {},
      estadosElectivas: {},
      notas: {},
      ppsHoras: 0,
      stats: { ...mockStats, horasElectivasAprobadas: 0 },
      metasExamen: {}
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(savedFilename).toBe('Ficha_Curricular_UTN_ISI_Plan2023.pdf');
  });
});
