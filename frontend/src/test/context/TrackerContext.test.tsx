import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { TrackerProvider, useTracker } from '../../context/TrackerContext';
import { MATERIAS_MAP } from '../../data/plan2023';

vi.mock('../../services/api', () => ({
  fetchProgress: vi.fn().mockResolvedValue({
    estados: {},
    estadosElectivas: {},
    notas: {},
    ppsHoras: 0,
    perfil: { nombre: '', legajo: '' },
    metasExamen: {},
  }),
  getLocalProgress: vi.fn().mockReturnValue({
    estados: {},
    estadosElectivas: {},
    notas: {},
    ppsHoras: 0,
    perfil: { nombre: '', legajo: '' },
    metasExamen: {},
  }),
  persistProgress: vi.fn(),
  clearProgress: vi.fn(),
}));

vi.mock('../services/firebase', () => ({
  subscribeToUserProgress: vi.fn(),
  onFirebaseAuthStateChanged: vi.fn(() => () => {}),
  isFirebaseConfigured: false,
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TrackerProvider>{children}</TrackerProvider>
);

describe('TrackerContext - Lógica de Negocio y Progreso Académico', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('useTracker debe lanzar error si se utiliza fuera del TrackerProvider', () => {
    expect(() => renderHook(() => useTracker())).toThrow(
      'useTracker debe usarse dentro de un TrackerProvider'
    );
  });

  it('debe inicializar con estadísticas en cero y materias pendientes', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    expect(result.current.stats.aprobadasCount).toBe(0);
    expect(result.current.stats.regularesCount).toBe(0);
    expect(result.current.stats.porcentajeCarrera).toBe(0);
    expect(result.current.stats.promedioConAplazos).toBeNull();
    expect(result.current.stats.promedioSinAplazos).toBeNull();
  });

  it('debe alternar estados con toggleMateriaEstado (pendiente -> regular -> aprobada -> pendiente)', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    expect(result.current.estados[1] || 'pendiente').toBe('pendiente');

    act(() => {
      result.current.toggleMateriaEstado(1);
    });
    expect(result.current.estados[1]).toBe('regular');
    expect(result.current.stats.regularesCount).toBe(1);

    act(() => {
      result.current.toggleMateriaEstado(1);
    });
    expect(result.current.estados[1]).toBe('aprobada');
    expect(result.current.stats.aprobadasCount).toBe(1);
    expect(result.current.stats.regularesCount).toBe(0);

    act(() => {
      result.current.toggleMateriaEstado(1);
    });
    expect(result.current.estados[1]).toBe('pendiente');
    expect(result.current.stats.aprobadasCount).toBe(0);
  });

  it('debe permitir asignar estado regular y luego aprobada con setEstadoDirecto', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    act(() => {
      result.current.setEstadoDirecto(2, 'regular');
    });
    expect(result.current.estados[2]).toBe('regular');

    act(() => {
      result.current.setEstadoDirecto(2, 'aprobada');
    });
    expect(result.current.estados[2]).toBe('aprobada');
  });

  it('debe validar correlatividades para cursar materias de 2do nivel', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });
    const fisica2 = MATERIAS_MAP[10];

    expect(result.current.esMateriaCursable(fisica2)).toBe(false);

    act(() => {
      result.current.setEstadoDirecto(1, 'regular');
    });
    act(() => {
      result.current.setEstadoDirecto(3, 'regular');
    });

    expect(result.current.esMateriaCursable(fisica2)).toBe(true);
  });

  it('debe calcular promedios con y sin aplazos correctamente', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    act(() => {
      result.current.setNotaMateria(1, { nota: 8 });
    });
    act(() => {
      result.current.setNotaMateria(2, { nota: 6 });
    });

    expect(result.current.stats.promedioSinAplazos).toBe(7);
    expect(result.current.stats.promedioConAplazos).toBe(7);
  });

  it('debe gestionar metas de examen (alta, consulta y baja)', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    expect(result.current.stats.metasCount).toBe(0);

    act(() => {
      result.current.setMetaExamen(1, {
        materiaId: 1,
        turnoId: 'feb-2026-l1',
        turnoNombre: 'Febrero Llamado 1',
        fechaEstimada: '2026-02-16',
      });
    });

    expect(result.current.stats.metasCount).toBe(1);
    expect(result.current.metasExamen[1]).toBeDefined();
    expect(result.current.metasExamen[1].turnoId).toBe('feb-2026-l1');

    act(() => {
      result.current.removeMetaExamen(1);
    });

    expect(result.current.stats.metasCount).toBe(0);
    expect(result.current.metasExamen[1]).toBeUndefined();
  });

  it('resetAll debe reiniciar todo el estado a valores iniciales', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    act(() => {
      result.current.setEstadoDirecto(1, 'regular');
    });
    act(() => {
      result.current.setNotaMateria(1, { nota: 9 });
      result.current.setPpsHoras(50);
    });

    expect(result.current.stats.regularesCount).toBe(1);
    expect(result.current.ppsHoras).toBe(50);

    act(() => {
      result.current.resetAll();
    });

    expect(result.current.stats.aprobadasCount).toBe(0);
    expect(result.current.stats.regularesCount).toBe(0);
    expect(result.current.ppsHoras).toBe(0);
    expect(result.current.estados).toEqual({});
  });

  it('debe importar y exportar backup JSON correctamente', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:test');
    globalThis.URL.revokeObjectURL = vi.fn();

    act(() => {
      result.current.exportBackupJson();
    });

    const validJson = JSON.stringify({
      estados: { 1: 'aprobada', 2: 'regular' },
      estadosElectivas: { 201: 'aprobada' },
      notas: { 1: { nota: 10 } },
      ppsHoras: 100,
      perfil: { nombre: 'Martín', legajo: '48210' },
      metasExamen: {}
    });

    let success = false;
    act(() => {
      success = result.current.importBackupJson(validJson);
    });
    expect(success).toBe(true);
    expect(result.current.estados[1]).toBe('aprobada');
    expect(result.current.perfil.nombre).toBe('Martín');

    act(() => {
      success = result.current.importBackupJson('no es json');
    });
    expect(success).toBe(false);

    act(() => {
      success = result.current.importBackupJson('null');
    });
    expect(success).toBe(false);
  });

  it('debe gestionar electivas, dimApproved y criticalChainActive', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    // Habilitar correlativas de electiva 201: 5 regular, 6 y 8 aprobadas
    act(() => {
      result.current.setEstadoDirecto(5, 'regular');
    });
    act(() => {
      result.current.setEstadoDirecto(6, 'regular');
    });
    act(() => {
      result.current.setEstadoDirecto(6, 'aprobada');
    });
    act(() => {
      result.current.setEstadoDirecto(8, 'regular');
    });
    act(() => {
      result.current.setEstadoDirecto(8, 'aprobada');
    });

    act(() => {
      result.current.toggleElectivaEstado(201);
    });
    expect(result.current.estadosElectivas[201]).toBe('regular');

    act(() => {
      result.current.setDimApproved(true);
      result.current.setCriticalChainActive(true);
    });
    expect(result.current.dimApproved).toBe(true);
    expect(result.current.criticalChainActive).toBe(true);
  });
});
