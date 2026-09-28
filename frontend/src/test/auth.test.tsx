import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import {
  getStoredToken,
  getStoredUser,
  saveAuthSession,
  clearAuthSession,
  getLocalProgress,
  persistProgress,
  clearProgress,
  loginApi,
  registerApi,
  checkAuthMe,
} from '../services/api';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('Autenticación y Servicios API (AuthContext y api.ts)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('api.ts - Manejo de Sesión Local y Persistencia', () => {
    it('debe almacenar y recuperar tokens y usuarios correctamente', () => {
      expect(getStoredToken()).toBeNull();
      expect(getStoredUser()).toBeNull();

      const mockUser = { id: 'usr-123', email: 'estudiante@utn.edu.ar' };
      saveAuthSession('token-xyz', mockUser);

      expect(getStoredToken()).toBe('token-xyz');
      expect(getStoredUser()).toEqual(mockUser);

      clearAuthSession();
      expect(getStoredToken()).toBeNull();
      expect(getStoredUser()).toBeNull();
    });

    it('debe persistir el progreso en localStorage y recuperarlo', () => {
      const mockProgreso = {
        estados: { 1: 'aprobada' as const },
        estadosElectivas: {},
        notas: { 1: { nota: 9 } },
        ppsHoras: 80,
      };

      persistProgress(mockProgreso);
      const recuperado = getLocalProgress();

      expect(recuperado.estados?.[1]).toBe('aprobada');
      expect(recuperado.ppsHoras).toBe(80);

      clearProgress();
      const trasBorrar = getLocalProgress();
      expect(trasBorrar.estados).toEqual({});
    });

    it('loginApi y registerApi deben enviar solicitudes correctas', async () => {
      const mockResponse = { token: 'jwt-123', user: { id: 'u1', email: 'test@utn.edu' } };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const resLogin = await loginApi('test@utn.edu', 'pass123');
      expect(resLogin.token).toBe('jwt-123');

      const resRegister = await registerApi('test@utn.edu', 'pass123');
      expect(resRegister.token).toBe('jwt-123');

      const resMe = await checkAuthMe();
      expect(resMe).toEqual(mockResponse.user);
    });
  });

  describe('AuthContext', () => {
    it('debe inicializar sin usuario autenticado si no hay sesión previa', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthModalOpen).toBe(false);
    });

    it('debe abrir y cerrar el modal de autenticación con openAuthModal y closeAuthModal', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.openAuthModal();
      });
      expect(result.current.isAuthModalOpen).toBe(true);

      act(() => {
        result.current.closeAuthModal();
      });
      expect(result.current.isAuthModalOpen).toBe(false);
    });

    it('debe actualizar el estado de usuario con completeAuth y limpiarlo con logout', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const mockUser = { id: 'usr-456', email: 'alumno@frro.utn.edu.ar' };
      act(() => {
        result.current.completeAuth(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
    });

    it('debe soportar login y register en AuthContext', async () => {
      const mockResponse = { token: 'jwt-456', user: { id: 'u2', email: 'hola@utn.edu' } };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('hola@utn.edu', 'pass');
      });
      expect(result.current.user?.email).toBe('hola@utn.edu');

      await act(async () => {
        await result.current.register('nuevo@utn.edu', 'pass');
      });
      expect(result.current.user).not.toBeNull();
    });
  });
});
