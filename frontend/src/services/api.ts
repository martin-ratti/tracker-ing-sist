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
    ppsHoras: 0,
    perfil: { nombre: '', legajo: '' },
    metasExamen: {}
  };
}

export function getLocalProgress(): ProgresoUsuario {
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // Ignorar
    }
  }
  return {
    estados: {},
    estadosElectivas: {},
    notas: {},
    ppsHoras: 0,
    perfil: { nombre: '', legajo: '' },
    metasExamen: {}
  };
}

export function mergeProgress(local: ProgresoUsuario, cloud: ProgresoUsuario): ProgresoUsuario {
  const rank: Record<string, number> = { aprobada: 3, regular: 2, pendiente: 1 };

  // Estados troncales
  const allTroncalKeys = Array.from(new Set([
    ...Object.keys(local.estados || {}),
    ...Object.keys(cloud.estados || {})
  ])).map(Number);

  const mergedEstados: Record<number, any> = {};
  allTroncalKeys.forEach(id => {
    const estL = local.estados?.[id] || 'pendiente';
    const estC = cloud.estados?.[id] || 'pendiente';
    mergedEstados[id] = (rank[estL] || 1) >= (rank[estC] || 1) ? estL : estC;
  });

  // Estados electivas
  const allElectivaKeys = Array.from(new Set([
    ...Object.keys(local.estadosElectivas || {}),
    ...Object.keys(cloud.estadosElectivas || {})
  ])).map(Number);

  const mergedElectivas: Record<number, any> = {};
  allElectivaKeys.forEach(id => {
    const estL = local.estadosElectivas?.[id] || 'pendiente';
    const estC = cloud.estadosElectivas?.[id] || 'pendiente';
    mergedElectivas[id] = (rank[estL] || 1) >= (rank[estC] || 1) ? estL : estC;
  });

  // Notas
  const allNotasKeys = Array.from(new Set([
    ...Object.keys(local.notas || {}),
    ...Object.keys(cloud.notas || {})
  ])).map(Number);

  const mergedNotas: Record<number, any> = {};
  allNotasKeys.forEach(id => {
    const notaL = local.notas?.[id];
    const notaC = cloud.notas?.[id];
    if (notaL && notaC) {
      // Preferir la nota más alta o con mayor detalle
      mergedNotas[id] = (notaL.nota || 0) >= (notaC.nota || 0) ? { ...notaC, ...notaL } : { ...notaL, ...notaC };
    } else {
      mergedNotas[id] = notaL || notaC;
    }
  });

  // Metas de examen
  const mergedMetas = {
    ...(cloud.metasExamen || {}),
    ...(local.metasExamen || {})
  };

  // Perfil
  const mergedPerfil = {
    nombre: local.perfil?.nombre || cloud.perfil?.nombre || '',
    legajo: local.perfil?.legajo || cloud.perfil?.legajo || ''
  };

  return {
    estados: mergedEstados,
    estadosElectivas: mergedElectivas,
    notas: mergedNotas,
    ppsHoras: Math.max(local.ppsHoras || 0, cloud.ppsHoras || 0),
    perfil: mergedPerfil,
    metasExamen: mergedMetas,
    actualizadoEn: new Date().toISOString()
  };
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export async function persistProgress(progress: Partial<ProgresoUsuario>): Promise<void> {
  let current: ProgresoUsuario = getLocalProgress();

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
