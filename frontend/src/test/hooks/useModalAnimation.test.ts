import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModalAnimation } from '../../hooks/useModalAnimation';

describe('useModalAnimation Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe iniciar no montado ni visible cuando isOpen es false', () => {
    const { result } = renderHook(() => useModalAnimation(false, 200));

    expect(result.current.isMounted).toBe(false);
    expect(result.current.isVisible).toBe(false);
  });

  it('debe montar y hacer visible al abrir', () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) => useModalAnimation(isOpen, 200),
      { initialProps: { isOpen: false } }
    );

    rerender({ isOpen: true });

    expect(result.current.isMounted).toBe(true);

    // Avanzar frame de animación
    act(() => {
      vi.advanceTimersByTime(20);
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('debe apagar isVisible inmediatamente y desmontar tras durationMs al cerrar', () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) => useModalAnimation(isOpen, 200),
      { initialProps: { isOpen: true } }
    );

    act(() => {
      vi.advanceTimersByTime(20);
    });
    expect(result.current.isMounted).toBe(true);
    expect(result.current.isVisible).toBe(true);

    // Cerrar
    rerender({ isOpen: false });

    // isVisible debe ser false inmediatamente para disparar animación de salida
    expect(result.current.isVisible).toBe(false);
    // Pero sigue montado en el DOM
    expect(result.current.isMounted).toBe(true);

    // Avanzar la mitad del tiempo
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.isMounted).toBe(true);

    // Completar el tiempo total de la animación de salida
    act(() => {
      vi.advanceTimersByTime(105);
    });
    expect(result.current.isMounted).toBe(false);
  });

  it('debe cancelar el desmontaje si se vuelve a abrir antes de expirar el timer', () => {
    const { result, rerender } = renderHook(
      ({ isOpen }) => useModalAnimation(isOpen, 200),
      { initialProps: { isOpen: true } }
    );

    act(() => {
      vi.advanceTimersByTime(20);
    });

    // Cerrar
    rerender({ isOpen: false });
    expect(result.current.isVisible).toBe(false);

    // Avanzar 100ms
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Reabrir antes de los 200ms
    rerender({ isOpen: true });
    expect(result.current.isMounted).toBe(true);

    act(() => {
      vi.advanceTimersByTime(20);
    });
    expect(result.current.isVisible).toBe(true);

    // Avanzar más tiempo para confirmar que no se desmonta
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.isMounted).toBe(true);
    expect(result.current.isVisible).toBe(true);
  });
});
