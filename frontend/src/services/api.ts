import type { EstadoMateria, NotaMateria, ProgresoUsuario, MetaExamen, MetaGlobalizador } from '../types/plan';
import { 
  auth, 
  isFirebaseConfigured, 
  saveProgressToFirestore, 
  fetchProgressFromFirestore,
  fetchProgressFromFirestoreServer,
  flushFirestorePendingWrites
} from './firebase';

const LOCAL_STORAGE_KEY = 'utn-sistemas-tracker-2023';
const AUTH_TOKEN_KEY = 'utn_auth_token';
const AUTH_USER_KEY = 'utn_auth_user';
const LINKED_ACCOUNT_KEY = 'utn_linked_account_uid';
const DIRTY_LOCAL_KEY = 'utn_dirty_local_writes';

export type SyncStatus = 'synced' | 'saving' | 'offline';
export type SyncResolutionChoice = 'cloud' | 'local' | 'merge';

export interface SyncConflictInfo {
  userId: string;
  localData: ProgresoUsuario;
  cloudData: ProgresoUsuario;
}

export interface SyncAuthOutcome {
  progress: ProgresoUsuario;
  conflict?: SyncConflictInfo;
}

export interface UserAuth {
  id: string;
  email: string;
}

type SyncStatusListener = (status: SyncStatus) => void;
const syncStatusListeners = new Set<SyncStatusListener>();
let currentSyncStatus: SyncStatus = typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'synced';

function emitSyncStatus(next: SyncStatus): void {
  currentSyncStatus = next;
  syncStatusListeners.forEach(cb => cb(currentSyncStatus));
}

export function getSyncStatus(): SyncStatus {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'offline';
  }
  return currentSyncStatus;
}

export function subscribeSyncStatus(listener: SyncStatusListener): () => void {
  syncStatusListeners.add(listener);
  return () => {
    syncStatusListeners.delete(listener);
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    emitSyncStatus(hasPendingLocalChanges() ? 'saving' : 'synced');
  });
  window.addEventListener('offline', () => {
    emitSyncStatus('offline');
  });
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

export function getLinkedAccountUid(): string | null {
  return localStorage.getItem(LINKED_ACCOUNT_KEY);
}

export function setLinkedAccountUid(uid: string | null): void {
  if (uid) {
    localStorage.setItem(LINKED_ACCOUNT_KEY, uid);
  } else {
    localStorage.removeItem(LINKED_ACCOUNT_KEY);
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
  localStorage.removeItem(LINKED_ACCOUNT_KEY);
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

function isJsonResponse(res: Response): boolean {
  const contentType = res.headers?.get?.('content-type');
  if (!contentType) return true; // En tests unitarios donde headers no se mockea, asumir JSON
  return contentType.toLowerCase().includes('application/json');
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
    if (res.ok && isJsonResponse(res)) {
      const data = await res.json();
      if (data?.user) {
        return data.user;
      }
    }
  } catch {
    // Si el backend no está disponible o falla, usamos la sesión local existente
  }
  return getStoredUser();
}

export async function sendWelcomeEmailApi(email: string, name?: string): Promise<boolean> {
  const mailApiUrl = (import.meta.env.VITE_MAIL_API_URL || '').trim();
  const isProdWithoutMailServer = Boolean(import.meta.env.PROD && !mailApiUrl);
  if (isProdWithoutMailServer) {
    return false;
  }

  const endpoint = mailApiUrl
    ? `${mailApiUrl.replace(/\/$/, '')}/api/mail/welcome`
    : '/api/mail/welcome';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, name })
    });
    if (!res.ok || !isJsonResponse(res)) {
      return false;
    }
    const data = await res.json().catch(() => null);
    return Boolean(data && typeof data === 'object' && 'success' in data && data.success === true);
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
    metasExamen: {},
    metasGlobalizador: {}
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

  // 3. Notas (acotadas entre 0 y 10)
  const safeNotas: Record<number, NotaMateria> = {};
  if (src.notas && typeof src.notas === 'object' && !Array.isArray(src.notas)) {
    for (const [key, value] of Object.entries(src.notas)) {
      const id = Number(key);
      if (Number.isInteger(id) && id > 0 && id < 100000 && value && typeof value === 'object' && !Array.isArray(value)) {
        const n = value as Record<string, unknown>;
        const safeNota: NotaMateria = {};
        if (typeof n.nota === 'number' && Number.isFinite(n.nota) && n.nota >= 0 && n.nota <= 10) {
          safeNota.nota = Math.round(n.nota * 100) / 100;
        }
        safeNotas[id] = safeNota;
      }
    }
  }

  // 4. Horas PPS (rango válido 0..500)
  let safePps = 0;
  if (typeof src.ppsHoras === 'number' && Number.isFinite(src.ppsHoras) && src.ppsHoras >= 0) {
    safePps = Math.min(Math.floor(src.ppsHoras), 500);
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

  // 7. Metas de globalizador
  const safeMetasGlobalizador: Record<number, MetaGlobalizador> = {};
  if (src.metasGlobalizador && typeof src.metasGlobalizador === 'object' && !Array.isArray(src.metasGlobalizador)) {
    for (const [key, value] of Object.entries(src.metasGlobalizador)) {
      const id = Number(key);
      if (Number.isInteger(id) && id > 0 && id < 100000 && value && typeof value === 'object' && !Array.isArray(value)) {
        const mg = value as Record<string, unknown>;
        if (typeof mg.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(mg.fecha.trim())) {
          safeMetasGlobalizador[id] = {
            materiaId: id,
            fecha: mg.fecha.trim().slice(0, 30),
            comentario: typeof mg.comentario === 'string' ? sanitizeSafeText(mg.comentario, 500) : undefined,
            notificado7Dias: typeof mg.notificado7Dias === 'boolean' ? mg.notificado7Dias : undefined
          };
        }
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
    metasGlobalizador: safeMetasGlobalizador,
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
  const hasMetas = Object.keys(data.metasExamen || {}).length > 0 || Object.keys(data.metasGlobalizador || {}).length > 0;
  const hasPps = (data.ppsHoras || 0) > 0;
  return hasEstados || hasElectivas || hasNotas || hasPerfil || hasMetas || hasPps;
}

/**
 * Compara si dos objetos de progreso tienen diferencias reales en su contenido académico
 */
export function isProgressDifferent(a: ProgresoUsuario, b: ProgresoUsuario): boolean {
  const normalize = (p: ProgresoUsuario) => {
    const cleanEstados: Record<number, EstadoMateria> = {};
    for (const [k, v] of Object.entries(p.estados || {})) {
      if (v && v !== 'pendiente') cleanEstados[Number(k)] = v;
    }
    const cleanElectivas: Record<number, EstadoMateria> = {};
    for (const [k, v] of Object.entries(p.estadosElectivas || {})) {
      if (v && v !== 'pendiente') cleanElectivas[Number(k)] = v;
    }
    return JSON.stringify({
      estados: cleanEstados,
      estadosElectivas: cleanElectivas,
      notas: p.notas || {},
      ppsHoras: p.ppsHoras || 0,
      perfil: {
        nombre: p.perfil?.nombre?.trim() || '',
        legajo: p.perfil?.legajo?.trim() || ''
      },
      metasExamen: p.metasExamen || {},
      metasGlobalizador: p.metasGlobalizador || {}
    });
  };
  return normalize(a) !== normalize(b);
}

/**
 * Sincroniza el progreso al iniciar sesión o vincular cuenta.
 * Si el usuario no tenía esta cuenta vinculada previamente y existen datos locales distintos a los de la nube,
 * devuelve también la información de conflicto para que la UI consulte al usuario qué desea hacer.
 */
export async function syncUserProgressOnAuthWithConflict(userId?: string): Promise<SyncAuthOutcome> {
  const localData = getLocalProgress();
  const uid = userId || auth?.currentUser?.uid;
  const previouslyLinkedUid = getLinkedAccountUid();
  const isFirstLinkForThisUser = previouslyLinkedUid !== uid;

  if (isFirebaseConfigured && uid) {
    try {
      const rawFirestore = await fetchProgressFromFirestore(uid);
      if (rawFirestore) {
        const cloudData = sanitizeProgress(rawFirestore);
        const cloudHasData = hasAnyData(cloudData);
        const localHasData = hasAnyData(localData);

        if (isFirstLinkForThisUser && localHasData && cloudHasData && isProgressDifferent(localData, cloudData)) {
          return {
            progress: cloudData,
            conflict: {
              userId: uid,
              localData,
              cloudData
            }
          };
        }

        if (!cloudHasData && localHasData) {
          setLinkedAccountUid(uid);
          await saveProgressToFirestore(uid, localData).catch(() => {});
          return { progress: localData };
        }

        setLinkedAccountUid(uid);
        safeSaveProgressToStorage(cloudData);
        return { progress: cloudData };
      } else if (hasAnyData(localData)) {
        setLinkedAccountUid(uid);
        await saveProgressToFirestore(uid, localData).catch(() => {});
        return { progress: localData };
      } else {
        setLinkedAccountUid(uid);
      }
    } catch (err: unknown) {
      console.warn('Error al sincronizar con Firestore en autenticación:', err);
    }
  }

  const token = getStoredToken();
  if (token) {
    try {
      const res = await fetch('/api/progress', { headers: getAuthHeaders() });
      if (res.ok && isJsonResponse(res)) {
        const rawJson: unknown = await res.json();
        const cloudData: ProgresoUsuario = sanitizeProgress(rawJson);
        const merged = mergeProgress(localData, cloudData);
        safeSaveProgressToStorage(merged);
        if (uid) setLinkedAccountUid(uid);
        await fetch('/api/progress', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(merged)
        }).catch(() => {});
        return { progress: merged };
      }
    } catch {
      // Ignorar fallback
    }
  }

  return { progress: localData };
}

export async function syncUserProgressOnAuth(userId?: string): Promise<ProgresoUsuario> {
  const outcome = await syncUserProgressOnAuthWithConflict(userId);
  if (outcome.conflict) {
    const merged = mergeProgress(outcome.conflict.localData, outcome.conflict.cloudData);
    safeSaveProgressToStorage(merged);
    setLinkedAccountUid(outcome.conflict.userId);
    if (isFirebaseConfigured && outcome.conflict.userId) {
      await saveProgressToFirestore(outcome.conflict.userId, merged).catch(() => {});
    }
    return merged;
  }
  return outcome.progress;
}

export async function resolveSyncConflict(
  conflict: SyncConflictInfo,
  choice: SyncResolutionChoice
): Promise<ProgresoUsuario> {
  let chosen: ProgresoUsuario;
  if (choice === 'cloud') {
    chosen = sanitizeProgress(conflict.cloudData);
  } else if (choice === 'local') {
    chosen = sanitizeProgress({
      ...conflict.localData,
      actualizadoEn: new Date().toISOString()
    });
  } else {
    chosen = mergeProgress(conflict.localData, conflict.cloudData);
  }

  setLinkedAccountUid(conflict.userId);
  localStorage.removeItem(DIRTY_LOCAL_KEY);
  safeSaveProgressToStorage(chosen);

  if (isFirebaseConfigured && conflict.userId && choice !== 'cloud') {
    emitSyncStatus('saving');
    try {
      await saveProgressToFirestore(conflict.userId, chosen);
      emitSyncStatus('synced');
    } catch {
      emitSyncStatus(typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'synced');
    }
  } else {
    emitSyncStatus('synced');
  }

  return chosen;
}

/**
 * Carga el progreso inicial o al recargar la página.
 * Si la cuenta ya está vinculada en la nube, la nube es la fuente de verdad principal
 * (evitando re-mezclar estados viejos ni "resucitar" materias o metas borradas en otro dispositivo),
 * salvo que haya cambios locales hechos sin conexión pendientes de subir.
 */
export async function fetchProgress(): Promise<ProgresoUsuario> {
  const localData = getLocalProgress();

  // 1. Intentar desde Cloud Firestore si hay usuario activo en Firebase
  if (isFirebaseConfigured && auth?.currentUser?.uid) {
    const uid = auth.currentUser.uid;
    try {
      if (hasPendingLocalChanges()) {
        await flushPendingSave();
        return getLocalProgress();
      }
      const rawFirestore = await fetchProgressFromFirestore(uid);
      if (rawFirestore) {
        const cloudData = sanitizeProgress(rawFirestore);
        if (hasAnyData(cloudData) || getLinkedAccountUid() === uid) {
          setLinkedAccountUid(uid);
          safeSaveProgressToStorage(cloudData);
          return cloudData;
        }
        if (hasAnyData(localData)) {
          setLinkedAccountUid(uid);
          saveProgressToFirestore(uid, localData).catch(() => {});
          return localData;
        }
        return cloudData;
      } else if (hasAnyData(localData)) {
        setLinkedAccountUid(uid);
        saveProgressToFirestore(uid, localData).catch(() => {});
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
      if (hasPendingLocalChanges()) {
        await flushPendingSave();
        return getLocalProgress();
      }
      const res = await fetch('/api/progress', {
        headers: getAuthHeaders()
      });
      if (res.ok && isJsonResponse(res)) {
        const rawJson: unknown = await res.json();
        const cloudData: ProgresoUsuario = sanitizeProgress(rawJson);
        if (getLinkedAccountUid() && hasAnyData(cloudData)) {
          safeSaveProgressToStorage(cloudData);
          return cloudData;
        }
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
    metasExamen: {},
    metasGlobalizador: {}
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

  // Metas de globalizador
  const mergedMetasGlobalizador = {
    ...(cloud.metasGlobalizador || {}),
    ...(local.metasGlobalizador || {})
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
    metasGlobalizador: mergedMetasGlobalizador,
    actualizadoEn: new Date().toISOString()
  };
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let firestoreDebounceTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingCloudProgress: ProgresoUsuario | null = null;
let lastWrittenHash = '';

function computeProgressHash(p: ProgresoUsuario): string {
  const { actualizadoEn: _ignored, ...rest } = p;
  return JSON.stringify(rest);
}

export function isOwnWriteEcho(incoming: ProgresoUsuario): boolean {
  if (!lastWrittenHash) return false;
  if (firestoreDebounceTimeout !== null || pendingCloudProgress !== null) {
    return true;
  }
  return computeProgressHash(sanitizeProgress(incoming)) === lastWrittenHash;
}

export function hasPendingLocalChanges(): boolean {
  return (
    firestoreDebounceTimeout !== null ||
    saveTimeout !== null ||
    pendingCloudProgress !== null ||
    localStorage.getItem(DIRTY_LOCAL_KEY) === 'true'
  );
}

export async function flushPendingSave(): Promise<void> {
  if (firestoreDebounceTimeout) {
    clearTimeout(firestoreDebounceTimeout);
    firestoreDebounceTimeout = null;
  }
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }

  const toFlush = pendingCloudProgress || (localStorage.getItem(DIRTY_LOCAL_KEY) === 'true' ? getLocalProgress() : null);
  pendingCloudProgress = null;

  if (!toFlush) {
    if (isFirebaseConfigured && auth?.currentUser?.uid) {
      await flushFirestorePendingWrites();
    }
    return;
  }

  emitSyncStatus('saving');

  if (isFirebaseConfigured && auth?.currentUser?.uid) {
    try {
      await saveProgressToFirestore(auth.currentUser.uid, toFlush);
      await flushFirestorePendingWrites();
      localStorage.removeItem(DIRTY_LOCAL_KEY);
      emitSyncStatus('synced');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('No se pudo vaciar progreso pendiente en Firestore:', message);
      emitSyncStatus(typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'synced');
    }
  }

  const token = getStoredToken();
  if (token) {
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(toFlush)
      });
      if (res.ok) {
        localStorage.removeItem(DIRTY_LOCAL_KEY);
        emitSyncStatus('synced');
      }
    } catch {
      emitSyncStatus(typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'synced');
    }
  }
}

/**
 * Sincroniza manualmente bajo demanda (botón "Sincronizar ahora" en Perfil):
 * 1. Si hay cambios locales en cola o hechos offline pendientes de subir, primero los envía (flush) a la nube para nunca pisar cambios recientes.
 * 2. Luego consulta la versión más reciente directamente desde el servidor y actualiza el almacenamiento local.
 */
export async function forceSyncNow(): Promise<ProgresoUsuario> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    emitSyncStatus('offline');
    return getLocalProgress();
  }

  emitSyncStatus('saving');

  if (hasPendingLocalChanges()) {
    await flushPendingSave();
  }

  if (isFirebaseConfigured && auth?.currentUser?.uid) {
    try {
      await flushFirestorePendingWrites();
      const rawServer = await fetchProgressFromFirestoreServer(auth.currentUser.uid);
      if (rawServer) {
        const clean = sanitizeProgress(rawServer);
        lastWrittenHash = computeProgressHash(clean);
        safeSaveProgressToStorage(clean);
        localStorage.removeItem(DIRTY_LOCAL_KEY);
        emitSyncStatus('synced');
        return clean;
      }
    } catch (err) {
      console.warn('Error al sincronizar manualmente desde Firestore:', err);
    }
  }

  const token = getStoredToken();
  if (token) {
    try {
      const res = await fetch('/api/progress', { headers: getAuthHeaders() });
      if (res.ok && isJsonResponse(res)) {
        const rawJson: unknown = await res.json();
        const clean = sanitizeProgress(rawJson);
        lastWrittenHash = computeProgressHash(clean);
        safeSaveProgressToStorage(clean);
        localStorage.removeItem(DIRTY_LOCAL_KEY);
        emitSyncStatus('synced');
        return clean;
      }
    } catch {
      // Ignorar fallo
    }
  }

  emitSyncStatus('synced');
  return getLocalProgress();
}

export async function persistProgress(progress: Partial<ProgresoUsuario>): Promise<void> {
  const current: ProgresoUsuario = getLocalProgress();

  const updated: ProgresoUsuario = sanitizeProgress({
    ...current,
    ...progress,
    actualizadoEn: new Date().toISOString()
  });
  lastWrittenHash = computeProgressHash(updated);
  safeSaveProgressToStorage(updated);

  const hasCloudSession = Boolean((isFirebaseConfigured && auth?.currentUser?.uid) || getStoredToken());
  if (!hasCloudSession) {
    return;
  }

  localStorage.setItem(DIRTY_LOCAL_KEY, 'true');
  pendingCloudProgress = updated;

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    emitSyncStatus('offline');
  } else {
    emitSyncStatus('saving');
  }

  // 1. Sincronización en la nube con Firestore agrupada (debounce 400ms)
  if (isFirebaseConfigured && auth?.currentUser?.uid) {
    const uid = auth.currentUser.uid;
    if (firestoreDebounceTimeout) clearTimeout(firestoreDebounceTimeout);
    firestoreDebounceTimeout = setTimeout(() => {
      firestoreDebounceTimeout = null;
      const toSend = pendingCloudProgress || updated;
      pendingCloudProgress = null;
      saveProgressToFirestore(uid, toSend)
        .then(() => {
          localStorage.removeItem(DIRTY_LOCAL_KEY);
          emitSyncStatus(typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'synced');
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          console.warn('No se pudo persistir en Firestore (offline):', message);
          emitSyncStatus('offline');
        });
    }, 400);
  }

  // 2. Sincronización secundaria con backend Express si hay sesión autenticada
  const token = getStoredToken();
  if (token) {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveTimeout = null;
      const toSend = pendingCloudProgress || updated;
      if (!isFirebaseConfigured) pendingCloudProgress = null;
      fetch('/api/progress', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(toSend)
      })
        .then((res) => {
          if (res.ok && !isFirebaseConfigured) {
            localStorage.removeItem(DIRTY_LOCAL_KEY);
            emitSyncStatus('synced');
          }
        })
        .catch(() => {
          if (!isFirebaseConfigured) {
            emitSyncStatus(typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'synced');
          }
        });
    }, 400);
  }
}

export async function clearProgress(): Promise<void> {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  if (firestoreDebounceTimeout) {
    clearTimeout(firestoreDebounceTimeout);
    firestoreDebounceTimeout = null;
  }
  pendingCloudProgress = null;
  localStorage.removeItem(DIRTY_LOCAL_KEY);
  localStorage.removeItem(LOCAL_STORAGE_KEY);

  const emptyProgress: ProgresoUsuario = {
    estados: {},
    estadosElectivas: {},
    notas: {},
    ppsHoras: 0,
    perfil: { nombre: '', legajo: '' },
    metasExamen: {},
    metasGlobalizador: {},
    actualizadoEn: new Date().toISOString()
  };
  lastWrittenHash = computeProgressHash(emptyProgress);

  if (isFirebaseConfigured && auth?.currentUser?.uid) {
    emitSyncStatus('saving');
    saveProgressToFirestore(auth.currentUser.uid, emptyProgress)
      .then(() => emitSyncStatus('synced'))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('No se pudo resetear en Firestore:', message);
        emitSyncStatus('offline');
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
