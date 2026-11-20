import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  onSnapshot,
  waitForPendingWrites
} from 'firebase/firestore';
import type { Analytics } from 'firebase/analytics';
import type { ProgresoUsuario } from '../types/plan';

// Configuración leída de variables de entorno Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'tracker-isi-utn-6f213.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'tracker-isi-utn-6f213',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'tracker-isi-utn-6f213.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '155271149492',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:155271149492:web:7a547c34e36dc81e7824e1',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-N85G9T5JNH'
};

// Verifica si las credenciales mínimas de Firebase están presentes
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'AIzaSy_REPLACE_WITH_YOUR_KEY' &&
  firebaseConfig.projectId
);

const { auth, db, googleProvider } = (() => {
  if (!isFirebaseConfigured) {
    console.info('ℹ️ Firebase no configurado: la aplicación funcionará en modo Local/Offline. Para habilitar la nube, crea un archivo .env con tus credenciales de Firebase.');
    return { auth: null, db: null, googleProvider: null };
  }
  try {
    const appInst = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const authInst = getAuth(appInst);
    let dbInst;
    try {
      dbInst = initializeFirestore(appInst, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch {
      dbInst = getFirestore(appInst);
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return { auth: authInst, db: dbInst, googleProvider: provider };
  } catch (err) {
    console.warn('⚠️ Error al inicializar Firebase SDK:', err);
    return { auth: null, db: null, googleProvider: null };
  }
})();

const analytics: Analytics | null = null;

export { auth, db, analytics, googleProvider };

/**
 * Autenticación con Google (Popup)
 */
export async function signInWithGoogle(): Promise<User> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Auth no está configurado. Configura las variables VITE_FIREBASE_* en .env');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Autenticación con Email y Contraseña
 */
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  if (!auth) {
    throw new Error('Firebase Auth no está configurado.');
  }
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

/**
 * Registro con Email y Contraseña
 */
export async function signUpWithEmail(email: string, pass: string): Promise<User> {
  if (!auth) {
    throw new Error('Firebase Auth no está configurado.');
  }
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
}

/**
 * Cierre de sesión en Firebase
 */
export async function signOutFirebase(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Escucha cambios en el estado de autenticación
 */
export function onFirebaseAuthStateChanged(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Elimina recursivamente campos con valor `undefined` para evitar que Firestore rechace la escritura
 */
function sanitizeForFirestore<T>(data: T): T {
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeForFirestore) as unknown as T;
  }
  const cleaned: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      cleaned[key] = sanitizeForFirestore(val);
    }
  }
  return cleaned as T;
}

/**
 * Guarda o actualiza el progreso del alumno en Firestore
 */
export async function saveProgressToFirestore(userId: string, progress: ProgresoUsuario): Promise<void> {
  if (!db) return;
  try {
    const userDocRef = doc(db, 'users', userId);
    const sanitized = sanitizeForFirestore({
      ...progress,
      actualizadoEn: new Date().toISOString()
    });
    await setDoc(userDocRef, sanitized);
  } catch (error) {
    console.error('Error al persistir progreso en Firestore:', error);
    throw error;
  }
}

/**
 * Obtiene el progreso del alumno desde Firestore
 */
export async function fetchProgressFromFirestore(userId: string): Promise<ProgresoUsuario | null> {
  if (!db) return null;
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as ProgresoUsuario;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener progreso de Firestore:', error);
    return null;
  }
}

/**
 * Consulta directamente al servidor de Firestore (ignorando caché local) con fallback seguro a getDoc
 */
export async function fetchProgressFromFirestoreServer(userId: string): Promise<ProgresoUsuario | null> {
  if (!db) return null;
  const userDocRef = doc(db, 'users', userId);
  try {
    const docSnap = await getDocFromServer(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as ProgresoUsuario;
    }
    return null;
  } catch {
    try {
      const fallbackSnap = await getDoc(userDocRef);
      if (fallbackSnap.exists()) {
        return fallbackSnap.data() as ProgresoUsuario;
      }
    } catch (err) {
      console.error('Error en fallback getDoc de Firestore:', err);
    }
    return null;
  }
}

/**
 * Espera a que todas las escrituras pendientes de Firestore se confirmen en el servidor
 */
export async function flushFirestorePendingWrites(): Promise<void> {
  if (!db) return;
  try {
    await waitForPendingWrites(db);
  } catch (err) {
    console.warn('No se pudieron confirmar escrituras pendientes en Firestore:', err);
  }
}

/**
 * Suscripción en tiempo real a los cambios del documento del usuario en Firestore.
 * Ignora ecos locales propios (hasPendingWrites) para evitar re-hidratar estado viejo durante escrituras rápidas.
 */
export function subscribeToUserProgress(
  userId: string, 
  onUpdate: (progress: ProgresoUsuario, metadata: { hasPendingWrites: boolean; fromCache: boolean }) => void
): () => void {
  if (!db) return () => {};
  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(userDocRef, { includeMetadataChanges: true }, (docSnap) => {
    if (docSnap.metadata.hasPendingWrites) {
      return;
    }
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as ProgresoUsuario, {
        hasPendingWrites: docSnap.metadata.hasPendingWrites,
        fromCache: docSnap.metadata.fromCache
      });
    }
  }, (error) => {
    console.warn('Error en suscripción en tiempo real de Firestore:', error);
  });
}
