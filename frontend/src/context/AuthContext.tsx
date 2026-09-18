import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserAuth } from '../services/api';
import { 
  getStoredUser, 
  saveAuthSession, 
  clearAuthSession, 
  checkAuthMe,
  loginApi,
  registerApi
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode; onUserChanged?: () => void }> = ({
  children,
  onUserChanged
}) => {
  const [user, setUser] = useState<UserAuth | null>(() => getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
          // Si no hay sesión en Firebase pero había sesión local previa
          const stored = getStoredUser();
          if (stored) {
            setUser(stored);
          }
        }
      });
      return () => unsubscribe();
    } else {
      checkAuthMe().then(currentUser => {
        setUser(currentUser);
      });
    }
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const completeAuth = useCallback((authUser: UserAuth) => {
    setUser(authUser);
    setIsAuthModalOpen(false);
    if (onUserChanged) onUserChanged();
  }, [onUserChanged]);

  const loginWithGoogle = useCallback(async () => {
    const fbUser = await signInWithGoogle();
    const authUser: UserAuth = {
      id: fbUser.uid,
      email: fbUser.email || 'usuario@google'
    };
    const token = await fbUser.getIdToken();
    saveAuthSession(token, authUser);
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
      completeAuth(authUser);
    } else {
      const res = await loginApi(email, password);
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
      completeAuth(authUser);
    } else {
      const res = await registerApi(email, password);
      completeAuth(res.user);
    }
  }, [completeAuth]);

  const logout = useCallback(() => {
    if (isFirebaseConfigured) {
      signOutFirebase().catch(() => {});
    }
    clearAuthSession();
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
        logout
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
