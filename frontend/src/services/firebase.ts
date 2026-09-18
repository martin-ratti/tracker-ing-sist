import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  type User,
  type Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  type Firestore 
} from 'firebase/firestore';
import type { ProgresoUsuario } from '../types/plan';

// Configuración leída de variables de entorno Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Verifica si las credenciales mínimas de Firebase están presentes
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'AIzaSy_REPLACE_WITH_YOUR_KEY' &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.warn('⚠️ Error al inicializar Firebase SDK:', err);
  }
} else {
  console.info('ℹ️ Firebase no configurado: la aplicación funcionará en modo Local/Offline. Para habilitar la nube, crea un archivo .env con tus credenciales de Firebase.');
}

export { auth, db, googleProvider };

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
 * Guarda o actualiza el progreso del alumno en Firestore
 */
export async function saveProgressToFirestore(userId: string, progress: ProgresoUsuario): Promise<void> {
  if (!db) return;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      ...progress,
      actualizadoEn: new Date().toISOString()
    }, { merge: true });
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
 * Suscripción en tiempo real a los cambios del documento del usuario en Firestore
 */
export function subscribeToUserProgress(
  userId: string, 
  onUpdate: (progress: ProgresoUsuario) => void
): () => void {
  if (!db) return () => {};
  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as ProgresoUsuario);
    }
  }, (error) => {
    console.warn('Error en suscripción en tiempo real de Firestore:', error);
  });
}
