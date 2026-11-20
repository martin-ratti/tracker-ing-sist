import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserAuth, SyncConflictInfo, SyncResolutionChoice } from '../services/api';
import { 
  getStoredUser, 
  saveAuthSession, 
  clearAuthSession, 
  checkAuthMe,
  loginApi,
  registerApi,
  syncUserProgressOnAuthWithConflict,
  resolveSyncConflict,
  sendWelcomeEmailApi
} from '../services/api';
import { 
  isFirebaseConfigured, 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  signOutFirebase, 
  onFirebaseAuthStateChanged 
} from '../services/firebase';

interface AuthContextType {
  user: UserAuth | null;
  isFirebase: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  completeAuth: (authUser: UserAuth) => void;
  logout: () => void;
  syncConflict: SyncConflictInfo | null;
  handleResolveSyncConflict: (choice: SyncResolutionChoice) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode; onUserChanged?: () => void }> = ({
  children,
  onUserChanged
}) => {
  const [user, setUser] = useState<UserAuth | null>(() => getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [syncConflict, setSyncConflict] = useState<SyncConflictInfo | null>(null);

  // Escuchar sesión en Firebase o verificar backend tradicional
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onFirebaseAuthStateChanged(async (fbUser) => {
        if (fbUser) {
          const authUser: UserAuth = {
            id: fbUser.uid,
            email: fbUser.email || 'usuario@firebase'
          };
          const token = await fbUser.getIdToken();
          saveAuthSession(token, authUser);
          setUser(authUser);
        } else {
          // Si Firebase confirma que el usuario cerró sesión, limpiar cualquier sesión zombi local
          const stored = getStoredUser();
          if (stored) {
            clearAuthSession();
          }
          setUser(null);
        }
      });
      return () => unsubscribe();
    } else {
      checkAuthMe()
        .then(currentUser => {
          setUser(currentUser);
        })
        .catch(() => {
          setUser(null);
        });
    }
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const completeAuth = useCallback((authUser: UserAuth) => {
    setUser(authUser);
    setIsAuthModalOpen(false);

    // Enviar correo de bienvenida en el primer inicio de sesión o registro (si hay backend de correos activo)
    if (authUser.email && authUser.email.includes('@')) {
      const welcomeKey = `utn_welcome_sent_${authUser.id}`;
      if (!localStorage.getItem(welcomeKey)) {
        sendWelcomeEmailApi(authUser.email).then(success => {
          if (success) {
            localStorage.setItem(welcomeKey, 'true');
          }
        }).catch(() => {});
      }
    }

    if (onUserChanged) onUserChanged();
  }, [onUserChanged]);

  const handleResolveSyncConflict = useCallback(async (choice: SyncResolutionChoice) => {
    if (!syncConflict) return;
    await resolveSyncConflict(syncConflict, choice);
    setSyncConflict(null);
    if (onUserChanged) onUserChanged();
  }, [syncConflict, onUserChanged]);

  const loginWithGoogle = useCallback(async () => {
    const fbUser = await signInWithGoogle();
    const authUser: UserAuth = {
      id: fbUser.uid,
      email: fbUser.email || 'usuario@google'
    };
    const token = await fbUser.getIdToken();
    saveAuthSession(token, authUser);
    const outcome = await syncUserProgressOnAuthWithConflict(fbUser.uid);
    if (outcome.conflict) {
      setSyncConflict(outcome.conflict);
    }
    completeAuth(authUser);
  }, [completeAuth]);

  const login = useCallback(async (email: string, password: string) => {
    if (isFirebaseConfigured) {
      const fbUser = await signInWithEmail(email, password);
      const authUser: UserAuth = {
        id: fbUser.uid,
        email: fbUser.email || email
      };
      const token = await fbUser.getIdToken();
      saveAuthSession(token, authUser);
      const outcome = await syncUserProgressOnAuthWithConflict(fbUser.uid);
      if (outcome.conflict) {
        setSyncConflict(outcome.conflict);
      }
      completeAuth(authUser);
    } else {
      const res = await loginApi(email, password);
      if (res.user?.id) {
        const outcome = await syncUserProgressOnAuthWithConflict(res.user.id);
        if (outcome.conflict) {
          setSyncConflict(outcome.conflict);
        }
      }
      completeAuth(res.user);
    }
  }, [completeAuth]);

  const register = useCallback(async (email: string, password: string) => {
    if (isFirebaseConfigured) {
      const fbUser = await signUpWithEmail(email, password);
      const authUser: UserAuth = {
        id: fbUser.uid,
        email: fbUser.email || email
      };
      const token = await fbUser.getIdToken();
      saveAuthSession(token, authUser);
      const outcome = await syncUserProgressOnAuthWithConflict(fbUser.uid);
      if (outcome.conflict) {
        setSyncConflict(outcome.conflict);
      }
      completeAuth(authUser);
    } else {
      const res = await registerApi(email, password);
      if (res.user?.id) {
        const outcome = await syncUserProgressOnAuthWithConflict(res.user.id);
        if (outcome.conflict) {
          setSyncConflict(outcome.conflict);
        }
      }
      completeAuth(res.user);
    }
  }, [completeAuth]);

  const logout = useCallback(() => {
    if (isFirebaseConfigured) {
      signOutFirebase().catch(() => {});
    }
    clearAuthSession();
    setSyncConflict(null);
    setUser(null);
    if (onUserChanged) onUserChanged();
  }, [onUserChanged]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isFirebase: isFirebaseConfigured,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginWithGoogle,
        completeAuth,
        logout,
        syncConflict,
        handleResolveSyncConflict
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
