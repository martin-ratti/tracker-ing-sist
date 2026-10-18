import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { UIProvider, useUI } from '../../context/UIContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UIProvider>{children}</UIProvider>
);

describe('UIContext - Estado Visual Desacoplado', () => {
  it('useUI debe lanzar error si se utiliza fuera del UIProvider', () => {
    expect(() => renderHook(() => useUI())).toThrow(
      'useUI debe usarse dentro de un UIProvider'
    );
  });

  it('debe inicializar con los estados de UI por defecto', () => {
    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.calendarOpen).toBe(false);
    expect(result.current.reportOpen).toBe(false);
    expect(result.current.profileModalOpen).toBe(false);
    expect(result.current.statsModalOpen).toBe(false);
    expect(result.current.shareModalOpen).toBe(false);
    expect(result.current.electivasOpen).toBe(false);
    expect(result.current.mobileDrawerOpen).toBe(false);
    expect(result.current.gridFilter).toBe('todas');
    expect(result.current.edgeMode).toBe('ambos');
    expect(result.current.selectedSubjectId).toBeNull();
    expect(result.current.focusedSubjectId).toBeNull();
    expect(result.current.toasts).toEqual([]);
    expect(result.current.toastMessage).toBeNull();
  });

  it('debe permitir abrir y cerrar modales correctamente', () => {
    const { result } = renderHook(() => useUI(), { wrapper });

    act(() => {
      result.current.setCalendarOpen(true);
      result.current.setElectivasOpen(true);
      result.current.setProfileModalOpen(true);
    });

    expect(result.current.calendarOpen).toBe(true);
    expect(result.current.electivasOpen).toBe(true);
    expect(result.current.profileModalOpen).toBe(true);

    act(() => {
      result.current.setCalendarOpen(false);
      result.current.setElectivasOpen(false);
      result.current.setProfileModalOpen(false);
    });

    expect(result.current.calendarOpen).toBe(false);
    expect(result.current.electivasOpen).toBe(false);
    expect(result.current.profileModalOpen).toBe(false);
  });

  it('debe gestionar el drawer móvil y cambiar vistas de drawer', () => {
    const { result } = renderHook(() => useUI(), { wrapper });

    act(() => {
      result.current.openMobileDrawer('electivas');
    });

    expect(result.current.mobileDrawerOpen).toBe(true);
    expect(result.current.mobileDrawerView).toBe('electivas');

    act(() => {
      result.current.closeMobileDrawer();
    });

    expect(result.current.mobileDrawerOpen).toBe(false);
  });

  it('debe alternar modos de visualización, filtros y modos de aristas', () => {
    const { result } = renderHook(() => useUI(), { wrapper });

    act(() => {
      result.current.setViewMode('malla');
      result.current.setGridFilter('cursables');
      result.current.setEdgeMode('regular');
      result.current.setDimApproved(true);
      result.current.setCriticalChainActive(true);
    });

    expect(result.current.viewMode).toBe('malla');
    expect(result.current.gridFilter).toBe('cursables');
    expect(result.current.edgeMode).toBe('regular');
    expect(result.current.dimApproved).toBe(true);
    expect(result.current.criticalChainActive).toBe(true);
  });

  it('debe emitir y descartar notificaciones toast', () => {
    const { result } = renderHook(() => useUI(), { wrapper });

    act(() => {
      result.current.showToast('Test Toast', 'success');
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toastMessage).toBe('Test Toast');
    expect(result.current.toasts[0].variant).toBe('success');

    const toastId = result.current.toasts[0].id;
    act(() => {
      result.current.dismissToast(toastId);
    });

    expect(result.current.toasts.length).toBe(0);
    expect(result.current.toastMessage).toBeNull();
  });
});
