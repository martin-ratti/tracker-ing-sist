import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  getLocalProgress,
  mergeProgress,
  hasAnyData,
  syncUserProgressOnAuth,
  sanitizeProgress,
  safeSaveProgressToStorage
} from '../../services/api';

describe('Frontend API & Storage Service (api.ts)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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

    it('checkAuthMe: debe retornar sesión local si la petición fetch falla', async () => {
      saveAuthSession('token-valido', { id: 'u4', email: 'fallback@utn.edu.ar' });
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const user = await checkAuthMe();
      expect(user?.email).toBe('fallback@utn.edu.ar');
    });
  });

  describe('Endpoints de Progreso (fetchProgress, persistProgress, clearProgress)', () => {
    it('fetchProgress: debe obtener datos del backend si hay token y responde OK', async () => {
      saveAuthSession('token-backend-ok', { id: 'u5', email: 'u5@utn.edu.ar' });

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

    it('fetchProgress: debe usar fallback a localStorage si el backend falla cuando hay token', async () => {
      saveAuthSession('token-backend-fail', { id: 'u6', email: 'u6@utn.edu.ar' });
      localStorage.setItem('utn-sistemas-tracker-2023', JSON.stringify({
        estados: { 2: 'regular' },
        ppsHoras: 0
      }));

      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const prog = await fetchProgress();
      expect(prog.estados[2]).toBe('regular');
    });

    it('fetchProgress: debe leer directamente de localStorage sin llamar al backend si no hay sesión', async () => {
      localStorage.setItem('utn-sistemas-tracker-2023', JSON.stringify({
        estados: { 3: 'aprobada' },
        ppsHoras: 20
      }));

      const fetchSpy = vi.fn();
      globalThis.fetch = fetchSpy;

      const prog = await fetchProgress();
      expect(prog.estados[3]).toBe('aprobada');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('fetchProgress: debe manejar localStorage corrupto retornando estado vacío por defecto', async () => {
      localStorage.setItem('utn-sistemas-tracker-2023', 'CORRUPT_JSON_DATA');

      const prog = await fetchProgress();
      expect(prog.estados).toEqual({});
      expect(prog.ppsHoras).toBe(0);
    });

    it('fetchProgress: debe retornar objeto inicial vacío si no hay datos ni token', async () => {
      const prog = await fetchProgress();
      expect(prog.estados).toEqual({});
      expect(prog.ppsHoras).toBe(0);
      expect(prog.perfil?.nombre).toBe('');
    });

    it('persistProgress: debe enviar al backend si hay token y actualizar localStorage', async () => {
      saveAuthSession('token-persist', { id: 'u7', email: 'u7@utn.edu.ar' });
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      globalThis.fetch = fetchSpy;

      await persistProgress({
        estados: { 1: 'aprobada' },
        ppsHoras: 100
      });

      const local = getLocalProgress();
      expect(local.estados[1]).toBe('aprobada');
      expect(local.ppsHoras).toBe(100);

      // Avanzar temporizador de debounce
      vi.advanceTimersByTime(500);
      expect(fetchSpy).toHaveBeenCalledWith('/api/progress', expect.objectContaining({
        method: 'POST'
      }));
    });

    it('persistProgress: debe manejar fallo silencioso del backend', async () => {
      saveAuthSession('token-persist-fail', { id: 'u8', email: 'u8@utn.edu.ar' });
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Backend offline'));

      await persistProgress({ estados: { 5: 'regular' } });
      vi.advanceTimersByTime(500);

      expect(getLocalProgress().estados[5]).toBe('regular');
    });

    it('clearProgress: debe resetear backend y localStorage cuando hay sesión', async () => {
      saveAuthSession('token-clear', { id: 'u9', email: 'u9@utn.edu.ar' });
      localStorage.setItem('utn-sistemas-tracker-2023', JSON.stringify({
        estados: { 1: 'aprobada' }
      }));

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      globalThis.fetch = fetchSpy;

      await clearProgress();
      const local = getLocalProgress();
      expect(local.estados).toEqual({});
      expect(fetchSpy).toHaveBeenCalledWith('/api/progress/reset', expect.anything());
    });

    it('clearProgress: maneja fallo en reset sin lanzar excepción', async () => {
      saveAuthSession('token-clear-fail', { id: 'u10', email: 'u10@utn.edu.ar' });
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Reset error'));

      await expect(clearProgress()).resolves.not.toThrow();
      expect(getLocalProgress().estados).toEqual({});
    });

    it('getLocalProgress: maneja JSON corrupto retornando estado vacío', () => {
      localStorage.setItem('utn-sistemas-tracker-2023', 'MALFORMED');
      const local = getLocalProgress();
      expect(local.estados).toEqual({});
      expect(local.ppsHoras).toBe(0);
    });
  });

  describe('Fusión Inteligente de Progreso (mergeProgress)', () => {
    it('debe dar prioridad al estado más avanzado (aprobada > regular > pendiente)', () => {
      const local = {
        estados: { 1: 'aprobada' as const, 2: 'pendiente' as const },
        estadosElectivas: { 201: 'regular' as const },
        notas: {},
        ppsHoras: 50,
        perfil: { nombre: 'Martín', legajo: '123' },
        metasExamen: {}
      };

      const cloud = {
        estados: { 1: 'regular' as const, 2: 'aprobada' as const, 3: 'regular' as const },
        estadosElectivas: { 201: 'aprobada' as const, 202: 'regular' as const },
        notas: {},
        ppsHoras: 100,
        perfil: { nombre: '', legajo: '999' },
        metasExamen: {}
      };

      const merged = mergeProgress(local, cloud);

      expect(merged.estados[1]).toBe('aprobada');
      expect(merged.estados[2]).toBe('aprobada');
      expect(merged.estados[3]).toBe('regular');
      expect(merged.estadosElectivas[201]).toBe('aprobada');
      expect(merged.estadosElectivas[202]).toBe('regular');
      expect(merged.ppsHoras).toBe(100);
      expect(merged.perfil?.nombre).toBe('Martín');
      expect(merged.perfil?.legajo).toBe('123');
    });

    it('debe fusionar notas combinando la calificación más alta y detalles', () => {
      const local = {
        estados: {},
        estadosElectivas: {},
        notas: {
          1: { nota: 8, fecha: '2026-03-01', libro: 'L1', folio: 'F1' },
          2: { nota: 7 }
        },
        ppsHoras: 0,
        perfil: { nombre: '', legajo: '' },
        metasExamen: {}
      };

      const cloud = {
        estados: {},
        estadosElectivas: {},
        notas: {
          1: { nota: 9, fecha: '2026-03-15', libro: 'L2', folio: 'F2' },
          3: { nota: 10, fecha: '2026-02-10' }
        },
        ppsHoras: 0,
        perfil: { nombre: '', legajo: '' },
        metasExamen: {}
      };

      const merged = mergeProgress(local, cloud);
      expect(merged.notas[1].nota).toBe(9);
      expect(merged.notas[2].nota).toBe(7);
      expect(merged.notas[3].nota).toBe(10);
    });

    it('debe fusionar metas de examen y preservar perfiles faltantes', () => {
      const local = {
        estados: {},
        estadosElectivas: {},
        notas: {},
        ppsHoras: 0,
        perfil: { nombre: '', legajo: '' },
        metasExamen: { 1: { turnoId: 't1', turnoNombre: 'Turno Feb', fechaTentativa: '2026-02-20' } }
      };

      const cloud = {
        estados: {},
        estadosElectivas: {},
        notas: {},
        ppsHoras: 0,
        perfil: { nombre: 'Estudiante Nube', legajo: '9999' },
        metasExamen: { 2: { turnoId: 't2', turnoNombre: 'Turno Mar', fechaTentativa: '2026-03-10' } }
      };

      const merged = mergeProgress(local, cloud);
      expect(merged.metasExamen[1].turnoId).toBe('t1');
      expect(merged.metasExamen[2].turnoId).toBe('t2');
      expect(merged.perfil?.nombre).toBe('Estudiante Nube');
      expect(merged.perfil?.legajo).toBe('9999');
    });
  });

  describe('Detección y Sincronización de Datos (hasAnyData, syncUserProgressOnAuth)', () => {
    it('hasAnyData debe detectar correctamente cuando hay perfil, electivas o notas cargadas', () => {
      expect(hasAnyData(null)).toBe(false);
      expect(hasAnyData({
        estados: {},
        estadosElectivas: {},
        notas: {},
        ppsHoras: 0,
        perfil: { nombre: '', legajo: '' },
        metasExamen: {}
      })).toBe(false);

      expect(hasAnyData({
        estados: {},
        estadosElectivas: {},
        notas: {},
        ppsHoras: 0,
        perfil: { nombre: 'Martín', legajo: '' },
        metasExamen: {}
      })).toBe(true);

      expect(hasAnyData({
        estados: {},
        estadosElectivas: { 101: 'aprobada' },
        notas: {},
        ppsHoras: 0,
        perfil: { nombre: '', legajo: '' },
        metasExamen: {}
      })).toBe(true);

      expect(hasAnyData({
        estados: {},
        estadosElectivas: {},
        notas: { 1: { nota: 8 } },
        ppsHoras: 0,
        perfil: { nombre: '', legajo: '' },
        metasExamen: {}
      })).toBe(true);
    });

    it('syncUserProgressOnAuth debe sincronizar con el backend si hay token activo', async () => {
      saveAuthSession('token-sync-1', { id: 'u-sync', email: 'sync@utn.edu.ar' });
      localStorage.setItem('utn-sistemas-tracker-2023', JSON.stringify({
        estados: { 1: 'regular' },
        estadosElectivas: {},
        notas: {},
        ppsHoras: 0,
        perfil: { nombre: 'Marto', legajo: '123' },
        metasExamen: {}
      }));

      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if (url === '/api/progress') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              estados: { 1: 'aprobada', 2: 'regular' },
              estadosElectivas: {},
              notas: {},
              ppsHoras: 0,
              perfil: { nombre: '', legajo: '' },
              metasExamen: {}
            })
          });
        }
        return Promise.reject(new Error('Unknown url'));
      });

      const synced = await syncUserProgressOnAuth();
      expect(synced.estados[1]).toBe('aprobada');
      expect(synced.estados[2]).toBe('regular');
      expect(synced.perfil?.nombre).toBe('Marto');
      expect(synced.perfil?.legajo).toBe('123');
    });
  });

  describe('Sanitización y Prevención de Browser Storage Poisoning (CWE-502 / CWE-79)', () => {
    it('sanitizeProgress debe retornar estructura por defecto segura ante datos nulos o corruptos', () => {
      const empty1 = sanitizeProgress(null);
      expect(empty1.estados).toEqual({});
      expect(empty1.ppsHoras).toBe(0);

      const empty2 = sanitizeProgress('STRING_NO_VALIDO');
      expect(empty2.estados).toEqual({});
      expect(empty2.perfil?.nombre).toBe('');

      const empty3 = sanitizeProgress([1, 2, 3]);
      expect(empty3.estados).toEqual({});
    });

    it('sanitizeProgress debe filtrar estados maliciosos fuera del allowlist y claves no numéricas', () => {
      const malicious = {
        estados: {
          1: 'aprobada',
          2: 'invalido_malicioso',
          '__proto__': 'hack',
          'constructor': 'hack',
          'abc': 'regular'
        },
        estadosElectivas: {
          201: 'regular',
          202: 'ataque_xss'
        },
        ppsHoras: -50,
        perfil: {
          nombre: 'A'.repeat(300),
          legajo: '  12345  '
        }
      };

      const clean = sanitizeProgress(malicious);
      expect(clean.estados[1]).toBe('aprobada');
      expect((clean.estados as Record<string, unknown>)[2]).toBeUndefined();
      expect((clean.estados as Record<string, unknown>)['abc']).toBeUndefined();
      expect(clean.estadosElectivas[201]).toBe('regular');
      expect((clean.estadosElectivas as Record<string, unknown>)[202]).toBeUndefined();
      expect(clean.ppsHoras).toBe(0);
      expect(clean.perfil?.nombre.length).toBe(100);
      expect(clean.perfil?.legajo).toBe('12345');
    });

    it('safeSaveProgressToStorage debe sanitizar y almacenar de forma segura en localStorage', () => {
      safeSaveProgressToStorage({
        estados: { 1: 'aprobada' },
        estadosElectivas: {},
        notas: {},
        ppsHoras: 200,
        perfil: { nombre: 'Estudiante', legajo: '999' },
        metasExamen: {}
      });

      const stored = getLocalProgress();
      expect(stored.estados[1]).toBe('aprobada');
      expect(stored.ppsHoras).toBe(200);
      expect(stored.perfil?.nombre).toBe('Estudiante');
    });
  });
});
