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

  it('debe calcular promedio académico de materias aprobadas correctamente', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    act(() => {
      result.current.setEstadoDirecto(1, 'regular');
    });
    act(() => {
      result.current.setEstadoDirecto(1, 'aprobada');
    });
    act(() => {
      result.current.setEstadoDirecto(2, 'regular');
    });
    act(() => {
      result.current.setEstadoDirecto(2, 'aprobada');
    });

    act(() => {
      result.current.setNotaMateria(1, { nota: 8 });
    });
    act(() => {
      result.current.setNotaMateria(2, { nota: 6 });
    });

    expect(result.current.stats.promedio).toBe(7);
    expect(result.current.stats.promedioSinAplazos).toBe(7);
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

    // 2do toggle: regular -> aprobada
    act(() => {
      result.current.toggleElectivaEstado(201);
    });
    expect(result.current.estadosElectivas[201]).toBe('aprobada');

    // 3er toggle: aprobada -> pendiente
    act(() => {
      result.current.toggleElectivaEstado(201);
    });
    expect(result.current.estadosElectivas[201]).toBe('pendiente');

    act(() => {
      result.current.setDimApproved(true);
      result.current.setCriticalChainActive(true);
    });
    expect(result.current.dimApproved).toBe(true);
    expect(result.current.criticalChainActive).toBe(true);
  });

  it('debe calcular countdown de meta derivando fecha desde el turno cuando fechaEstimada no está seteada', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    act(() => {
      result.current.setEstadoDirecto(1, 'regular');
      result.current.setMetaExamen(1, {
        materiaId: 1,
        turnoId: 'feb-2026-l1',
        turnoNombre: 'Febrero 1° Llamado'
      });
    });

    expect(result.current.metasExamen[1]).toBeDefined();
    expect(result.current.stats.proximaMeta).toBeDefined();

    act(() => {
      result.current.removeMetaExamen(1);
    });
    expect(result.current.metasExamen[1]).toBeUndefined();
  });

  it('al eliminar una meta debe emitir un Toast con acción Deshacer y permitir restaurarla', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    act(() => {
      result.current.setMetaExamen(1, {
        materiaId: 1,
        turnoId: 'feb-2026-l1',
        turnoNombre: 'Febrero 1° Llamado',
        fechaEstimada: '2026-02-16'
      });
    });

    expect(result.current.metasExamen[1]).toBeDefined();

    act(() => {
      result.current.removeMetaExamen(1);
    });

    expect(result.current.metasExamen[1]).toBeUndefined();
    // Debe existir un toast con acción Deshacer
    const toastConUndo = result.current.toasts.find(t => t.action?.label === 'Deshacer');
    expect(toastConUndo).toBeDefined();

    // Ejecutar el Deshacer
    act(() => {
      toastConUndo?.action?.onClick();
    });

    // La meta debe quedar restaurada
    expect(result.current.metasExamen[1]).toBeDefined();
    expect(result.current.metasExamen[1].turnoId).toBe('feb-2026-l1');
  });

  it('al resetear una materia a pendiente debe emitir Toast con Deshacer y permitir restaurar', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    // Aprobamos una materia sin correlativas complejas
    act(() => {
      result.current.setEstadoDirecto(3, 'regular');
    });
    act(() => {
      result.current.setEstadoDirecto(3, 'aprobada'); // Física I
    });
    expect(result.current.estados[3]).toBe('aprobada');

    act(() => {
      result.current.setEstadoDirecto(3, 'pendiente');
    });

    expect(result.current.estados[3]).toBe('pendiente');
    const toastUndo = result.current.toasts.find(t => t.action?.label === 'Deshacer');
    expect(toastUndo).toBeDefined();

    // Ejecutamos Deshacer
    act(() => {
      toastUndo?.action?.onClick();
    });

    expect(result.current.estados[3]).toBe('aprobada');
  });

  it('debe abrir cascadeConfirmDialog cuando desaprobar una materia afecta a más de 3 correlativas', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    // 1. Regularizamos 1, 2 y 3
    act(() => { result.current.setEstadoDirecto(1, 'regular'); });
    act(() => { result.current.setEstadoDirecto(2, 'regular'); });
    act(() => { result.current.setEstadoDirecto(3, 'regular'); });

    // 2. Aprobamos 1, 2 y 3
    act(() => { result.current.setEstadoDirecto(1, 'aprobada'); });
    act(() => { result.current.setEstadoDirecto(2, 'aprobada'); });
    act(() => { result.current.setEstadoDirecto(3, 'aprobada'); });

    // 3. Regularizamos las 4 correlativas que dependen de 1: 9, 10, 17 y 18
    act(() => { result.current.setEstadoDirecto(9, 'regular'); });
    act(() => { result.current.setEstadoDirecto(10, 'regular'); });
    act(() => { result.current.setEstadoDirecto(17, 'regular'); });
    act(() => { result.current.setEstadoDirecto(18, 'regular'); });

    // 4. Aprobamos las 4 correlativas
    act(() => { result.current.setEstadoDirecto(9, 'aprobada'); });
    act(() => { result.current.setEstadoDirecto(10, 'aprobada'); });
    act(() => { result.current.setEstadoDirecto(17, 'aprobada'); });
    act(() => { result.current.setEstadoDirecto(18, 'aprobada'); });

    expect(result.current.estados[1]).toBe('aprobada');
    expect(result.current.estados[9]).toBe('aprobada');
    expect(result.current.estados[10]).toBe('aprobada');
    expect(result.current.estados[17]).toBe('aprobada');
    expect(result.current.estados[18]).toBe('aprobada');

    // Intentamos resetear Análisis 1 (id 1). Desaprobarla afecta a 9, 10, 17 y 18 (4 materias > 3):
    act(() => {
      result.current.toggleMateriaEstado(1);
    });

    // Como afecta a más de 3 materias, abre el diálogo de confirmación
    expect(result.current.cascadeConfirmDialog).not.toBeNull();
    expect(result.current.cascadeConfirmDialog?.isOpen).toBe(true);
    expect(result.current.cascadeConfirmDialog?.totalAfectadas).toBe(4);

    // Si cancela:
    act(() => {
      result.current.closeCascadeConfirmDialog();
    });
    expect(result.current.cascadeConfirmDialog).toBeNull();
    expect(result.current.estados[1]).toBe('aprobada'); // Se mantiene aprobada

    // Si confirma:
    act(() => {
      result.current.toggleMateriaEstado(1);
    });
    expect(result.current.cascadeConfirmDialog?.isOpen).toBe(true);
    act(() => {
      result.current.cascadeConfirmDialog?.onConfirm();
    });

    // Ahora sí se resetean en cascada
    expect(result.current.estados[1]).toBe('pendiente');
    expect(result.current.estados[9]).toBe('pendiente');
    expect(result.current.estados[10]).toBe('pendiente');
    expect(result.current.estados[17]).toBe('pendiente');
    expect(result.current.estados[18]).toBe('pendiente');
  });

  it('cuando una materia tiene nota y cambia de estado preserva la nota pero no computa en promedio hasta volver a aprobada', () => {
    const { result } = renderHook(() => useTracker(), { wrapper });

    // Regularizamos y aprobamos Sistemas y Procesos (id 8)
    act(() => {
      result.current.setEstadoDirecto(8, 'regular');
    });
    act(() => {
      result.current.setEstadoDirecto(8, 'aprobada');
    });
    // Le asignamos una calificación
    act(() => {
      result.current.setNotaMateria(8, { nota: 9 });
    });

    expect(result.current.estados[8]).toBe('aprobada');
    expect(result.current.notas[8]?.nota).toBe(9);
    expect(result.current.stats.promedio).toBe(9);

    // Al apretarla (toggle de aprobada -> pendiente):
    act(() => {
      result.current.toggleMateriaEstado(8);
    });

    expect(result.current.estados[8]).toBe('pendiente');
    // La nota se preserva pero el promedio no la computa por estar pendiente
    expect(result.current.notas[8]?.nota).toBe(9);
    expect(result.current.stats.promedio).toBeNull();

    // Si vuelve a marcarla como regular y luego aprobada, vuelve a computar automáticamente
    act(() => {
      result.current.setEstadoDirecto(8, 'regular');
    });
    expect(result.current.stats.promedio).toBeNull();

    act(() => {
      result.current.setEstadoDirecto(8, 'aprobada');
    });
    expect(result.current.stats.promedio).toBe(9);

    // Si se elimina explícitamente la nota
    act(() => {
      result.current.setNotaMateria(8, { nota: undefined });
    });
    expect(result.current.notas[8]).toBeUndefined();
    expect(result.current.stats.promedio).toBeNull();
  });
});
