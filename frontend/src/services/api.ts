import type { EstadoMateria, NotaMateria, ProgresoUsuario, MetaExamen } from '../types/plan';
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
  const safeToken = typeof token === 'string' ? token.trim().slice(0, 2048) : '';
  const safeUser: UserAuth = {
    id: typeof user?.id === 'string' ? user.id.slice(0, 100) : '',
    email: typeof user?.email === 'string' ? user.email.slice(0, 255) : ''
  };
  localStorage.setItem(AUTH_TOKEN_KEY, safeToken); // NOSONAR
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser)); // NOSONAR
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

export async function sendWelcomeEmailApi(email: string, name?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/mail/welcome', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, name })
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --- API PROGRESO Y SANITIZACIÓN (CWE-502 / CWE-79) ---

const VALID_ESTADOS: ReadonlySet<EstadoMateria> = new Set(['pendiente', 'regular', 'aprobada']);

/**
 * Sanitiza cadenas de texto libre eliminando caracteres de control, scripts,
 * tags HTML y comillas que puedan utilizarse en ataques de inyección o envenenamiento de almacenamiento.
 */
function sanitizeSafeText(raw: unknown, maxLength: number): string {
  if (typeof raw !== 'string') return '';
  return Array.from(raw)
    .filter(char => !/[<>"'`\\$]/.test(char) && char.charCodeAt(0) >= 32)
    .slice(0, maxLength)
    .join('')
    .trim();
}

/**
 * Sanitiza identificadores y códigos alfanuméricos simples (legajos, IDs de turnos, libros, folios).
 */
function sanitizeAlphanumericCode(raw: unknown, maxLength: number): string {
  if (typeof raw !== 'string') return '';
  return Array.from(raw)
    .filter(char => /^[a-zA-Z0-9_\-\s.]$/.test(char))
    .slice(0, maxLength)
    .join('')
    .trim();
}

/**
 * Sanitiza nombres de personas permitiendo únicamente letras, tildes, diéresis, espacios y signos seguros.
 */
function sanitizePersonName(raw: unknown, maxLength: number): string {
  if (typeof raw !== 'string') return '';
  return Array.from(raw)
    .filter(char => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]$/.test(char))
    .slice(0, maxLength)
    .join('')
    .trim();
}

/**
 * Sanitiza y valida exhaustivamente un objeto desconocido para asegurar
 * que cumple estrictamente el tipo ProgresoUsuario antes de guardarlo en almacenamiento
 * local o memoria, mitigando Browser Storage Poisoning.
 */
export function sanitizeProgress(raw: unknown): ProgresoUsuario {
  const fallback: ProgresoUsuario = {
    estados: {},
    estadosElectivas: {},
    notas: {},
    ppsHoras: 0,
    perfil: { nombre: '', legajo: '' },
    metasExamen: {}
  };

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return fallback;
  }

  const src = raw as Record<string, unknown>;

  // 1. Estados troncales (IDs numéricos válidos y valores en allowlist)
  const safeEstados: Record<number, EstadoMateria> = {};
  if (src.estados && typeof src.estados === 'object' && !Array.isArray(src.estados)) {
    for (const [key, value] of Object.entries(src.estados)) {
      const id = Number(key);
      if (Number.isInteger(id) && id > 0 && id < 100000 && typeof value === 'string' && VALID_ESTADOS.has(value as EstadoMateria)) {
        safeEstados[id] = value as EstadoMateria;
      }
    }
  }

  // 2. Estados electivas
  const safeElectivas: Record<number, EstadoMateria> = {};
  if (src.estadosElectivas && typeof src.estadosElectivas === 'object' && !Array.isArray(src.estadosElectivas)) {
    for (const [key, value] of Object.entries(src.estadosElectivas)) {
      const id = Number(key);
      if (Number.isInteger(id) && id > 0 && id < 100000 && typeof value === 'string' && VALID_ESTADOS.has(value as EstadoMateria)) {
        safeElectivas[id] = value as EstadoMateria;
      }
    }
  }

  // 3. Notas
  const safeNotas: Record<number, NotaMateria> = {};
  if (src.notas && typeof src.notas === 'object' && !Array.isArray(src.notas)) {
    for (const [key, value] of Object.entries(src.notas)) {
      const id = Number(key);
      if (Number.isInteger(id) && id > 0 && id < 100000 && value && typeof value === 'object' && !Array.isArray(value)) {
        const n = value as Record<string, unknown>;
        const safeNota: NotaMateria = {};
        if (typeof n.nota === 'number' && Number.isFinite(n.nota) && n.nota >= 1 && n.nota <= 10) {
          safeNota.nota = Math.round(n.nota);
        }
        safeNotas[id] = safeNota;
      }
    }
  }

  // 4. Horas PPS
  let safePps = 0;
  if (typeof src.ppsHoras === 'number' && Number.isFinite(src.ppsHoras) && src.ppsHoras >= 0) {
    safePps = Math.min(Math.floor(src.ppsHoras), 10000);
  }

  // 5. Perfil
  const srcPerfil = (src.perfil && typeof src.perfil === 'object' && !Array.isArray(src.perfil))
    ? (src.perfil as Record<string, unknown>)
    : {};
  const safePerfil = {
    nombre: sanitizePersonName(srcPerfil.nombre, 100),
    legajo: sanitizeAlphanumericCode(srcPerfil.legajo, 50)
  };

  // 6. Metas de examen
  const safeMetas: Record<number, MetaExamen> = {};
  if (src.metasExamen && typeof src.metasExamen === 'object' && !Array.isArray(src.metasExamen)) {
    for (const [key, value] of Object.entries(src.metasExamen)) {
      const id = Number(key);
      if (Number.isInteger(id) && id > 0 && id < 100000 && value && typeof value === 'object' && !Array.isArray(value)) {
        const m = value as Record<string, unknown>;
        safeMetas[id] = {
          materiaId: id,
          turnoId: sanitizeAlphanumericCode(m.turnoId, 50),
          turnoNombre: sanitizeSafeText(m.turnoNombre, 100),
          fechaEstimada: typeof m.fechaEstimada === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(m.fechaEstimada.trim()) ? m.fechaEstimada.trim().slice(0, 30) : undefined,
          llamado: typeof m.llamado === 'number' && Number.isFinite(m.llamado) ? Math.min(Math.max(1, Math.floor(m.llamado)), 5) : undefined,
          comentario: typeof m.comentario === 'string' ? sanitizeSafeText(m.comentario, 500) : undefined,
          notificado7Dias: typeof m.notificado7Dias === 'boolean' ? m.notificado7Dias : undefined
        };
      }
    }
  }

  return {
    estados: safeEstados,
    estadosElectivas: safeElectivas,
    notas: safeNotas,
    ppsHoras: safePps,
    perfil: safePerfil,
    metasExamen: safeMetas,
    actualizadoEn: typeof src.actualizadoEn === 'string' ? src.actualizadoEn.slice(0, 50) : new Date().toISOString()
  };
}

export function safeSaveProgressToStorage(progress: ProgresoUsuario): void {
  const safe = sanitizeProgress(progress);
  try {
    const serialized = JSON.stringify(safe);
    localStorage.setItem(LOCAL_STORAGE_KEY, serialized); // NOSONAR
  } catch (err: unknown) {
    console.warn('No se pudo guardar el progreso en localStorage:', err);
  }
}

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
      const rawFirestore = await fetchProgressFromFirestore(uid);
      if (rawFirestore) {
        const cloudData = sanitizeProgress(rawFirestore);
        const merged = mergeProgress(localData, cloudData);
        safeSaveProgressToStorage(merged);
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
        const rawJson: unknown = await res.json();
        const cloudData: ProgresoUsuario = sanitizeProgress(rawJson);
        const merged = mergeProgress(localData, cloudData);
        safeSaveProgressToStorage(merged);
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
      const rawFirestore = await fetchProgressFromFirestore(auth.currentUser.uid);
      if (rawFirestore) {
        const cloudData = sanitizeProgress(rawFirestore);
        const merged = mergeProgress(localData, cloudData);
        safeSaveProgressToStorage(merged);
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
        const rawJson: unknown = await res.json();
        const cloudData: ProgresoUsuario = sanitizeProgress(rawJson);
        const merged = mergeProgress(localData, cloudData);
        safeSaveProgressToStorage(merged);
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
      const parsed = JSON.parse(local);
      return sanitizeProgress(parsed);
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
    nombre: sanitizePersonName(local.perfil?.nombre || cloud.perfil?.nombre || '', 100),
    legajo: sanitizeAlphanumericCode(local.perfil?.legajo || cloud.perfil?.legajo || '', 50)
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
  safeSaveProgressToStorage(updated);

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
