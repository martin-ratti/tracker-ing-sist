import type { ProgresoUsuario } from '../types/plan';

const LOCAL_STORAGE_KEY = 'utn-sistemas-tracker-2023';
const AUTH_TOKEN_KEY = 'utn_auth_token';
const AUTH_USER_KEY = 'utn_auth_user';

export interface UserAuth {
  id: string;
  email: string;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): UserAuth | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAuthSession(token: string, user: UserAuth): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// --- API AUTH ---

export async function loginApi(email: string, password: string): Promise<{ token: string; user: UserAuth }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }

  saveAuthSession(data.token, data.user);
  return data;
}

export async function registerApi(email: string, password: string): Promise<{ token: string; user: UserAuth }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al registrarse');
  }

  saveAuthSession(data.token, data.user);
  return data;
}

export async function checkAuthMe(): Promise<UserAuth | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch {
    // Si el backend no está disponible o falla, usamos la sesión local existente
  }
  return getStoredUser();
}

// --- API PROGRESO ---

export async function fetchProgress(): Promise<ProgresoUsuario> {
  try {
    const res = await fetch('/api/progress', {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data: ProgresoUsuario = await res.json();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.warn('Backend no disponible, cargando desde localStorage:', error);
  }

  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      console.warn('localStorage corrupto, usando estado vacío.');
    }
  }

  return {
    estados: {},
    estadosElectivas: {},
    notas: {},
    ppsHoras: 0
  };
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export async function persistProgress(progress: Partial<ProgresoUsuario>): Promise<void> {
  let current: ProgresoUsuario = { estados: {}, estadosElectivas: {}, notas: {}, ppsHoras: 0 };
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try {
      current = JSON.parse(local);
    } catch {
      console.warn('localStorage corrupto al persistir, usando estado vacío.');
    }
  }

  const updated: ProgresoUsuario = {
    ...current,
    ...progress,
    actualizadoEn: new Date().toISOString()
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.warn('No se pudo sincronizar con backend (offline):', err);
    }
  }, 400);
}

export async function clearProgress(): Promise<void> {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  try {
    await fetch('/api/progress/reset', {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (err) {
    console.warn('No se pudo resetear en backend:', err);
  }
}
