import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserAuth } from '../services/api';
import { getStoredUser, loginApi, registerApi, clearAuthSession, checkAuthMe } from '../services/api';

interface AuthContextType {
  user: UserAuth | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode; onUserChanged?: () => void }> = ({
  children,
  onUserChanged
}) => {
  const [user, setUser] = useState<UserAuth | null>(() => getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    checkAuthMe().then(currentUser => {
      setUser(currentUser);
    });
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginApi(email, password);
    setUser(res.user);
    setIsAuthModalOpen(false);
    if (onUserChanged) onUserChanged();
  }, [onUserChanged]);

  const register = useCallback(async (email: string, password: string) => {
    const res = await registerApi(email, password);
    setUser(res.user);
    setIsAuthModalOpen(false);
    if (onUserChanged) onUserChanged();
  }, [onUserChanged]);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
    if (onUserChanged) onUserChanged();
  }, [onUserChanged]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
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
