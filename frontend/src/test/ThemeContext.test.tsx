import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, useTheme, THEMES } from '../context/ThemeContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext - Manejo de Temas y Modos de Color', () => {
  it('debe iniciar con el tema por defecto y modo oscuro', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('cyber');
    expect(result.current.colorMode).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('cyber');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('debe cambiar de tema y reflejarlo en el DOM y en themeConfig', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('synthwave');
    });

    expect(result.current.theme).toBe('synthwave');
    expect(result.current.themeConfig.name).toBe(THEMES.synthwave.name);
    expect(document.documentElement.getAttribute('data-theme')).toBe('synthwave');
    expect(localStorage.getItem('utn_tracker_theme')).toBe('synthwave');
  });

  it('debe alternar entre modo oscuro y claro correctamente', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setColorMode('light');
    });

    expect(result.current.colorMode).toBe('light');
    expect(document.documentElement.getAttribute('data-mode')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('utn_tracker_colormode')).toBe('light');

    act(() => {
      result.current.setColorMode('dark');
    });

    expect(result.current.colorMode).toBe('dark');
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('utn_tracker_colormode')).toBe('dark');
  });
});
