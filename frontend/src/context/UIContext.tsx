import React, { createContext, useContext, useState, useCallback } from 'react';

export type GridFilterOption = 'todas' | 'cursables' | 'regulares' | 'aprobadas' | 'con-meta';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  variant?: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  action?: ToastAction;
}

export interface ToastItem {
  id: string;
  message: string;
  variant: 'success' | 'warning' | 'error' | 'info';
  duration: number;
  action?: ToastAction;
}

export interface UIContextType {
  // Modales
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  reportOpen: boolean;
  setReportOpen: (open: boolean) => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  statsModalOpen: boolean;
  setStatsModalOpen: (open: boolean) => void;
  shareModalOpen: boolean;
  setShareModalOpen: (open: boolean) => void;
  electivasOpen: boolean;
  setElectivasOpen: (open: boolean) => void;

  // Drawer Móvil
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  mobileDrawerView: 'menu' | 'electivas';
  setMobileDrawerView: (view: 'menu' | 'electivas') => void;
  openMobileDrawer: (view?: 'menu' | 'electivas') => void;
  closeMobileDrawer: () => void;

  // Visualización y Filtros
  viewMode: 'grafo' | 'malla';
  setViewMode: (mode: 'grafo' | 'malla') => void;
  gridFilter: GridFilterOption;
  setGridFilter: (filter: GridFilterOption) => void;
  edgeMode: 'ambos' | 'regular' | 'aprobada';
  setEdgeMode: (mode: 'ambos' | 'regular' | 'aprobada') => void;
  dimApproved: boolean;
  setDimApproved: React.Dispatch<React.SetStateAction<boolean>>;
  criticalChainActive: boolean;
  setCriticalChainActive: React.Dispatch<React.SetStateAction<boolean>>;

  // Foco y Selección
  focusedSubjectId: number | null;
  setFocusedSubjectId: (id: number | null) => void;
  selectedSubjectId: number | null;
  setSelectedSubjectId: (id: number | null) => void;

  // Notificaciones Toast
  toasts: ToastItem[];
  toastMessage: string | null;
  showToast: (msg: string, variantOrOptions?: 'success' | 'warning' | 'error' | 'info' | ToastOptions) => void;
  dismissToast: (id: string) => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Modales
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [electivasOpen, setElectivasOpen] = useState(false);

  // Drawer Móvil
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileDrawerView, setMobileDrawerView] = useState<'menu' | 'electivas'>('menu');

  const openMobileDrawer = useCallback((view: 'menu' | 'electivas' = 'menu') => {
    setMobileDrawerView(view);
    setMobileDrawerOpen(true);
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(false);
  }, []);

  // Visualización
  const [viewMode, setViewMode] = useState<'grafo' | 'malla'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'malla';
    }
    return 'grafo';
  });
  const [gridFilter, setGridFilter] = useState<GridFilterOption>('todas');
  const [edgeMode, setEdgeMode] = useState<'ambos' | 'regular' | 'aprobada'>('ambos');
  const [dimApproved, setDimApproved] = useState(false);
  const [criticalChainActive, setCriticalChainActive] = useState(false);

  // Foco y Selección
  const [focusedSubjectId, setFocusedSubjectId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((
    msg: string,
    variantOrOptions: 'success' | 'warning' | 'error' | 'info' | ToastOptions = 'info'
  ) => {
    if (!msg) return;
    const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : `${Date.now()}`;
    const isObj = typeof variantOrOptions === 'object';
    const variant = isObj ? (variantOrOptions.variant || 'info') : variantOrOptions;
    const duration = isObj && variantOrOptions.duration !== undefined
      ? variantOrOptions.duration
      : (isObj && variantOrOptions.action ? 5000 : 3500);
    const action = isObj ? variantOrOptions.action : undefined;

    setToasts(prev => {
      const next = [...prev, { id, message: msg, variant, duration, action }];
      return next.slice(-3);
    });
  }, []);

  const toastMessage = toasts.length > 0 ? toasts[0].message : null;

  return (
    <UIContext.Provider
      value={{
        calendarOpen,
        setCalendarOpen,
        reportOpen,
        setReportOpen,
        profileModalOpen,
        setProfileModalOpen,
        statsModalOpen,
        setStatsModalOpen,
        shareModalOpen,
        setShareModalOpen,
        electivasOpen,
        setElectivasOpen,
        mobileDrawerOpen,
        setMobileDrawerOpen,
        mobileDrawerView,
        setMobileDrawerView,
        openMobileDrawer,
        closeMobileDrawer,
        viewMode,
        setViewMode,
        gridFilter,
        setGridFilter,
        edgeMode,
        setEdgeMode,
        dimApproved,
        setDimApproved,
        criticalChainActive,
        setCriticalChainActive,
        focusedSubjectId,
        setFocusedSubjectId,
        selectedSubjectId,
        setSelectedSubjectId,
        toasts,
        toastMessage,
        showToast,
        dismissToast
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export function useUI(): UIContextType {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI debe usarse dentro de un UIProvider');
  }
  return context;
}
