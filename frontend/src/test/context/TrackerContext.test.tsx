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

    // Inicialmente pendiente
    expect(result.current.estados[1] || 'pendiente').toBe('pendiente');

    // 1er click -> regular
    act(() => {
      result.current.toggleMateriaEstado(1);
    });
    expect(result.current.estados[1]).toBe('regular');
    expect(result.current.stats.regularesCount).toBe(1);

    // 2do click -> aprobada
    act(() => {
      result.current.toggleMateriaEstado(1);
    });
    expect(result.current.estados[1]).toBe('aprobada');
    expect(result.current.stats.aprobadasCount).toBe(1);
    expect(result.current.stats.regularesCount).toBe(0);

    // 3er click -> pendiente
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
    const fisica2 = MATERIAS_MAP[10]; // Requiere Análisis I (1) y Física I (3) regulares

    // Inicialmente Física II no es cursable
    expect(result.current.esMateriaCursable(fisica2)).toBe(false);

    // Regularizamos Análisis I y luego Física I
    act(() => {
      result.current.toggleMateriaEstado(1); // AM I -> regular
    });
    act(() => {
      result.current.toggleMateriaEstado(3); // Física I -> regular
    });

    // Ahora Física II debe ser cursable
    expect(result.current.esMateriaCursable(fisica2)).toBe(true);
  });

  it('debe calcular promedios con y sin aplazos correctamente', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    // Aprobamos materia 1 con nota 8
    act(() => {
      result.current.toggleMateriaEstado(1); // regular
    });
    act(() => {
      result.current.toggleMateriaEstado(1); // aprobada
    });
    act(() => {
      result.current.setNotaMateria(1, { nota: 8 });
    });

    // Aprobamos materia 2 con nota 6
    act(() => {
      result.current.toggleMateriaEstado(2); // regular
    });
    act(() => {
      result.current.toggleMateriaEstado(2); // aprobada
    });
    act(() => {
      result.current.setNotaMateria(2, { nota: 6 });
    });

    // Promedio de 8 y 6 = 7.00
    expect(result.current.stats.promedioSinAplazos).toBe(7);
    expect(result.current.stats.promedioConAplazos).toBe(7);
  });

  it('debe gestionar metas de examen (alta, consulta y baja)', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    expect(result.current.stats.metasCount).toBe(0);

    // Dar de alta una meta
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

    // Remover la meta
    act(() => {
      result.current.removeMetaExamen(1);
    });

    expect(result.current.stats.metasCount).toBe(0);
    expect(result.current.metasExamen[1]).toBeUndefined();
  });

  it('resetAll debe reiniciar todo el estado a valores iniciales', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    act(() => {
      result.current.toggleMateriaEstado(1); // regular
    });
    act(() => {
      result.current.toggleMateriaEstado(1); // aprobada
    });
    act(() => {
      result.current.setNotaMateria(1, { nota: 9 });
      result.current.setPpsHoras(50);
    });

    expect(result.current.stats.aprobadasCount).toBe(1);
    expect(result.current.ppsHoras).toBe(50);

    act(() => {
      result.current.resetAll();
    });

    expect(result.current.stats.aprobadasCount).toBe(0);
    expect(result.current.ppsHoras).toBe(0);
    expect(result.current.estados).toEqual({});
  });
});
