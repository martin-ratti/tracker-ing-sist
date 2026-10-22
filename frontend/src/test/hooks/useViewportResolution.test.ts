import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { getResolutionTier, useViewportResolution } from '../../hooks/useViewportResolution';

describe('useViewportResolution Hook', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getResolutionTier', () => {
    it('debe clasificar como mobile cuando el ancho es menor a 640px', () => {
      expect(getResolutionTier(375, 812)).toBe('mobile');
      expect(getResolutionTier(639, 1080)).toBe('mobile');
    });

    it('debe clasificar como 720p en alturas reducidas (laptops o 720p)', () => {
      expect(getResolutionTier(1280, 720)).toBe('720p');
      expect(getResolutionTier(1366, 760)).toBe('720p');
    });

    it('debe clasificar como 1080p en monitores Full HD estándar (1920x1080)', () => {
      expect(getResolutionTier(1920, 1080)).toBe('1080p');
      expect(getResolutionTier(1920, 920)).toBe('1080p'); // Altura típica con barra de tareas de Windows
      expect(getResolutionTier(1280, 800)).toBe('1080p');
    });

    it('debe clasificar como 1440p en pantallas 2K QHD (2560x1440)', () => {
      expect(getResolutionTier(2560, 1440)).toBe('1440p');
      expect(getResolutionTier(2560, 1300)).toBe('1440p');
    });

    it('debe clasificar como 2160p en pantallas Ultra HD 4K (3840x2160 o ultrapanorámicas)', () => {
      expect(getResolutionTier(3840, 2160)).toBe('2160p');
      expect(getResolutionTier(3440, 1440)).toBe('2160p');
    });
  });

  describe('hook en ejecución y respuesta a resize', () => {
    it('debe inicializarse con las dimensiones de window y detectar resize debounced', () => {
      vi.stubGlobal('innerWidth', 1920);
      vi.stubGlobal('innerHeight', 900);

      vi.useFakeTimers();
      const { result } = renderHook(() => useViewportResolution());

      expect(result.current.tier).toBe('1080p');
      expect(result.current.isStandardHeight).toBe(true);
      expect(result.current.isCompactHeight).toBe(false);

      // Simular cambio a 2K (1440p)
      act(() => {
        vi.stubGlobal('innerWidth', 2560);
        vi.stubGlobal('innerHeight', 1350);
        window.dispatchEvent(new Event('resize'));
        vi.advanceTimersByTime(100);
      });

      expect(result.current.tier).toBe('1440p');
      expect(result.current.is2K).toBe(true);

      // Simular cambio a pantalla baja (720p)
      act(() => {
        vi.stubGlobal('innerWidth', 1366);
        vi.stubGlobal('innerHeight', 700);
        window.dispatchEvent(new Event('resize'));
        vi.advanceTimersByTime(100);
      });

      expect(result.current.tier).toBe('720p');
      expect(result.current.isCompactHeight).toBe(true);

      vi.useRealTimers();
    });
  });
});
