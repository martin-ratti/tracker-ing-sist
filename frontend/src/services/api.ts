import type { EstadoMateria, NotaMateria, ProgresoUsuario } from '../types/plan';
import { 
  auth, 
  isFirebaseConfigured, 
  saveProgressToFirestore, 
  fetchProgressFromFirestore 
} from './firebase';

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

export function hasAnyData(data?: ProgresoUsuario | null): boolean {
  if (!data) return false;
  const hasEstados = Object.values(data.estados || {}).some(e => e !== 'pendiente');
  const hasElectivas = Object.values(data.estadosElectivas || {}).some(e => e !== 'pendiente');
  const hasNotas = Object.keys(data.notas || {}).length > 0;
  const hasPerfil = Boolean(data.perfil?.nombre?.trim() || data.perfil?.legajo?.trim());
  const hasMetas = Object.keys(data.metasExamen || {}).length > 0;
  const hasPps = (data.ppsHoras || 0) > 0;
  return hasEstados || hasElectivas || hasNotas || hasPerfil || hasMetas || hasPps;
}

export async function syncUserProgressOnAuth(userId?: string): Promise<ProgresoUsuario> {
  const localData = getLocalProgress();
  const uid = userId || auth?.currentUser?.uid;

  if (isFirebaseConfigured && uid) {
    try {
      const cloudData = await fetchProgressFromFirestore(uid);
      if (cloudData) {
        const merged = mergeProgress(localData, cloudData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        await saveProgressToFirestore(uid, merged).catch(() => {});
        return merged;
      } else if (hasAnyData(localData)) {
        await saveProgressToFirestore(uid, localData).catch(() => {});
        return localData;
      }
    } catch (err: unknown) {
      console.warn('Error al sincronizar con Firestore en autenticación:', err);
    }
  }

  const token = getStoredToken();
  if (token) {
    try {
      const res = await fetch('/api/progress', { headers: getAuthHeaders() });
      if (res.ok) {
        const cloudData: ProgresoUsuario = await res.json();
        const merged = mergeProgress(localData, cloudData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        await fetch('/api/progress', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(merged)
        }).catch(() => {});
        return merged;
      }
    } catch {
      // Ignorar fallback
    }
  }

  return localData;
}

export async function fetchProgress(): Promise<ProgresoUsuario> {
  const localData = getLocalProgress();

  // 1. Intentar desde Cloud Firestore si hay usuario activo en Firebase
  if (isFirebaseConfigured && auth?.currentUser?.uid) {
    try {
      const firestoreData = await fetchProgressFromFirestore(auth.currentUser.uid);
      if (firestoreData) {
        const merged = mergeProgress(localData, firestoreData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      } else if (hasAnyData(localData)) {
        saveProgressToFirestore(auth.currentUser.uid, localData).catch(() => {});
        return localData;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('Error al cargar progreso de Firestore, probando fallback:', message);
    }
  }

  // 2. Si hay sesión activa en backend Express (token JWT)
  const token = getStoredToken();
  if (token) {
    try {
      const res = await fetch('/api/progress', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const cloudData: ProgresoUsuario = await res.json();
        const merged = mergeProgress(localData, cloudData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('Backend no disponible, cargando desde localStorage:', message);
    }
  }

  // 3. Fallback / Modo Local: LocalStorage
  return localData;
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

  const mergedEstados: Record<number, EstadoMateria> = {};
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

  const mergedElectivas: Record<number, EstadoMateria> = {};
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

  const mergedNotas: Record<number, NotaMateria> = {};
  allNotasKeys.forEach(id => {
    const notaL = local.notas?.[id];
    const notaC = cloud.notas?.[id];
    if (notaL && notaC) {
      // Preferir la nota más alta o con mayor detalle
      mergedNotas[id] = (notaL.nota || 0) >= (notaC.nota || 0) ? { ...notaC, ...notaL } : { ...notaL, ...notaC };
    } else {
      const nota = notaL || notaC;
      if (nota) {
        mergedNotas[id] = nota;
      }
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
  const current: ProgresoUsuario = getLocalProgress();

  const updated: ProgresoUsuario = {
    ...current,
    ...progress,
    actualizadoEn: new Date().toISOString()
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  // 1. Sincronización en la nube con Firestore en tiempo real
  if (isFirebaseConfigured && auth?.currentUser?.uid) {
    saveProgressToFirestore(auth.currentUser.uid, updated).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('No se pudo persistir en Firestore (offline):', message);
    });
  }

  // 2. Sincronización secundaria con backend Express si hay sesión autenticada
  const token = getStoredToken();
  if (token) {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      fetch('/api/progress', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(updated)
      }).catch(() => {
        // Ignorar fallo de backend tradicional cuando está en modo serverless
      });
    }, 400);
  }
}

export async function clearProgress(): Promise<void> {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  localStorage.removeItem(LOCAL_STORAGE_KEY);

  const emptyProgress: ProgresoUsuario = {
    estados: {},
    estadosElectivas: {},
    notas: {},
    ppsHoras: 0,
    perfil: { nombre: '', legajo: '' },
    metasExamen: {},
    actualizadoEn: new Date().toISOString()
  };

  if (isFirebaseConfigured && auth?.currentUser?.uid) {
    saveProgressToFirestore(auth.currentUser.uid, emptyProgress).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('No se pudo resetear en Firestore:', message);
    });
  }

  const token = getStoredToken();
  if (token) {
    try {
      await fetch('/api/progress/reset', {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch {
      // Ignorar
    }
  }
}
