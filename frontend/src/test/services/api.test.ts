import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getStoredToken,
  getStoredUser,
  saveAuthSession,
  clearAuthSession,
  loginApi,
  registerApi,
  checkAuthMe,
  fetchProgress,
  persistProgress,
  clearProgress,
  getLocalProgress
} from '../../services/api';

describe('Frontend API & Storage Service (api.ts)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Gestión de Tokens y Sesión Local', () => {
    it('debe guardar, leer y limpiar tokens y usuario', () => {
      expect(getStoredToken()).toBeNull();
      expect(getStoredUser()).toBeNull();

      saveAuthSession('token-abc-123', { id: 'u1', email: 'estudiante@utn.edu.ar' });
      expect(getStoredToken()).toBe('token-abc-123');
      expect(getStoredUser()).toEqual({ id: 'u1', email: 'estudiante@utn.edu.ar' });

      clearAuthSession();
      expect(getStoredToken()).toBeNull();
      expect(getStoredUser()).toBeNull();
    });

    it('debe recuperarse de JSON corrupto en el usuario almacenado', () => {
      localStorage.setItem('utn_auth_user', 'JSON_CORRUPTO');
      expect(getStoredUser()).toBeNull();
    });
  });

  describe('Endpoints de Autenticación (loginApi, registerApi, checkAuthMe)', () => {
    it('loginApi: debe enviar credenciales y guardar sesión al responder 200', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ token: 'tok-login', user: { id: 'u2', email: 'test@utn.edu.ar' } })
      });

      const res = await loginApi('test@utn.edu.ar', '123456');
      expect(res.token).toBe('tok-login');
      expect(getStoredToken()).toBe('tok-login');
    });

    it('loginApi: debe lanzar error cuando res.ok es false', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Credenciales inválidas' })
      });

      await expect(loginApi('test@utn.edu.ar', 'wrong')).rejects.toThrow('Credenciales inválidas');
    });

    it('registerApi: debe registrar y guardar sesión al responder 200', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ token: 'tok-reg', user: { id: 'u3', email: 'nuevo@utn.edu.ar' } })
      });

      const res = await registerApi('nuevo@utn.edu.ar', '123456');
      expect(res.token).toBe('tok-reg');
      expect(getStoredToken()).toBe('tok-reg');
    });

    it('registerApi: debe lanzar error cuando el registro falla', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Email en uso' })
      });

      await expect(registerApi('duplicado@utn.edu.ar', '123456')).rejects.toThrow('Email en uso');
    });

    it('checkAuthMe: debe validar token y devolver usuario o null', async () => {
      expect(await checkAuthMe()).toBeNull();

      saveAuthSession('token-valido', { id: 'u4', email: 'auth@utn.edu.ar' });
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: { id: 'u4', email: 'auth@utn.edu.ar' } })
      });

      const user = await checkAuthMe();
      expect(user?.email).toBe('auth@utn.edu.ar');
    });
  });

  describe('Endpoints de Progreso (fetchProgress, persistProgress, clearProgress)', () => {
    it('fetchProgress: debe obtener datos del backend si responde OK', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          estados: { 1: 'aprobada' },
          estadosElectivas: {},
          notas: {},
          ppsHoras: 40,
          perfil: { nombre: 'Test', legajo: '123' },
          metasExamen: {}
        })
      });

      const prog = await fetchProgress();
      expect(prog.estados[1]).toBe('aprobada');
    });

    it('fetchProgress: debe usar fallback a localStorage si el backend falla', async () => {
      localStorage.setItem('utn-sistemas-tracker-2023', JSON.stringify({
        estados: { 2: 'regular' },
        ppsHoras: 0
      }));

      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const prog = await fetchProgress();
      expect(prog.estados[2]).toBe('regular');
    });

    it('persistProgress: debe enviar al backend y actualizar localStorage', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await persistProgress({
        estados: { 1: 'aprobada' },
        ppsHoras: 100
      });

      const local = getLocalProgress();
      expect(local.estados[1]).toBe('aprobada');
      expect(local.ppsHoras).toBe(100);
    });

    it('clearProgress: debe resetear tanto backend como localStorage', async () => {
      localStorage.setItem('utn-sistemas-tracker-2023', JSON.stringify({
        estados: { 1: 'aprobada' }
      }));

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await clearProgress();
      const local = getLocalProgress();
      expect(local.estados).toEqual({});
    });
  });
});
