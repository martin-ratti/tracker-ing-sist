import React, { useState, lazy, Suspense, useMemo, useRef, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { AuthProvider } from './context/AuthContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import {
  Header,
  BottomNav,
  Toast,
  ErrorBoundary,
  GridView,
  GraphSkeleton,
  ElectivasDrawer,
  SubjectModal,
  TitlesModal,
  HelpModal,
  AuthModal,
  CalendarModal,
  PrintableReportModal,
  ProfileModal,
  StatsModal,
  ShareModal,
  NotFoundView
} from './components';

const NetworkGraph = lazy(() => import('./components/views/NetworkGraph').then(m => ({ default: m.NetworkGraph })));

const TrackerMain: React.FC = () => {
  const {
    viewMode,
    reloadProgress,
    setViewMode,
    electivasOpen,
    setElectivasOpen,
    setCalendarOpen,
    setReportOpen,
    setProfileModalOpen,
    statsModalOpen,
    setStatsModalOpen,
    shareModalOpen,
    setShareModalOpen,
    isViewingShared,
    sharedName,
    exitSharedMode,
    importSharedProgress,
    openMobileDrawer,
  } = useTracker();
  const [titlesModalOpen, setTitlesModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname;
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isNotFound = useMemo(() => {
    return currentPath !== '/' && currentPath !== '' && currentPath !== '/index.html';
  }, [currentPath]);

  const electivasOpenRef = useRef(electivasOpen);
  useEffect(() => {
    electivasOpenRef.current = electivasOpen;
  }, [electivasOpen]);

  const shortcuts = useMemo(
    () => ({
      'g': () => setViewMode('grafo'),
      'm': () => setViewMode('malla'),
      'e': () => setElectivasOpen(!electivasOpenRef.current),
      'c': () => setCalendarOpen(true),
      'r': () => setReportOpen(true),
      'p': () => setProfileModalOpen(true),
      's': () => setShareModalOpen(true),
      '?': () => setHelpModalOpen(true),
    }),
    [setViewMode, setElectivasOpen, setCalendarOpen, setReportOpen, setProfileModalOpen, setShareModalOpen, setHelpModalOpen]
  );

  useKeyboardShortcuts(shortcuts);

  if (isNotFound) {
    return (
      <AuthProvider onUserChanged={reloadProgress}>
        <NotFoundView 
          onNavigateHome={() => {
            if (typeof window !== 'undefined') window.history.pushState(null, '', '/');
            setCurrentPath('/');
          }}
          onNavigateMalla={() => {
            if (typeof window !== 'undefined') window.history.pushState(null, '', '/');
            setCurrentPath('/');
            setViewMode('malla');
          }}
          onNavigateGrafo={() => {
            if (typeof window !== 'undefined') window.history.pushState(null, '', '/');
            setCurrentPath('/');
            setViewMode('grafo');
          }}
          onOpenCalendar={() => {
            if (typeof window !== 'undefined') window.history.pushState(null, '', '/');
            setCurrentPath('/');
            setCalendarOpen(true);
          }}
        />
        <CalendarModal />
        <Toast />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider onUserChanged={reloadProgress}>
      <div className={`bg-(--bg-base) text-(--text-body) flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 ${
        viewMode === 'grafo' ? 'h-dvh overflow-hidden' : 'min-h-screen'
      }`}>
        {/* Banner de Modo Compartido (Solo Lectura) */}
        {isViewingShared && (
          <div className="bg-sky-600 text-white px-4 py-2 text-xs font-mono flex flex-wrap items-center justify-between gap-2 z-40 border-b border-sky-400/50 shadow-md shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>
                Estás visualizando el progreso compartido de <strong className="underline">{sharedName || 'Estudiante'}</strong> (Solo Lectura)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={importSharedProgress}
                className="px-2.5 py-1 rounded bg-white text-sky-950 font-bold hover:bg-sky-100 transition-colors shadow-sm"
                title="Guardar este avance en tu cuenta o navegador"
              >
                Importar como mi progreso
              </button>
              <button
                onClick={exitSharedMode}
                className="px-2.5 py-1 rounded bg-sky-900/80 hover:bg-sky-900 border border-sky-400/50 text-white transition-colors"
                title="Volver a tu progreso personal"
              >
                Volver a mi progreso
              </button>
            </div>
          </div>
        )}

        {/* Barra superior con navegación, filtros y métricas */}
        <Header 
          onOpenTitles={() => setTitlesModalOpen(true)}
          onOpenHelp={() => setHelpModalOpen(true)}
        />

        {/* Contenido principal según vista seleccionada */}
        <main className={`flex-1 relative ${viewMode === 'grafo' ? 'min-h-0 overflow-hidden pb-16 sm:pb-0' : 'pb-16 sm:pb-0'}`}>
          <div key={viewMode} className="view-transition-enter h-full w-full">
            {viewMode === 'grafo' ? (
              <Suspense fallback={<GraphSkeleton />}>
                <NetworkGraph />
              </Suspense>
            ) : (
              <GridView />
            )}
          </div>
        </main>

        {/* Panel lateral de Electivas */}
        <ElectivasDrawer />

        {/* Modal de detalles de Materia y Notas */}
        <SubjectModal />

        {/* Modal de Seguimiento de Títulos (ADUSI / Ingeniería) */}
        <TitlesModal 
          isOpen={titlesModalOpen} 
          onClose={() => setTitlesModalOpen(false)} 
        />

        {/* Modal de Calendario Académico Oficial y Metas */}
        <CalendarModal />

        {/* Modal de Ficha Curricular Imprimible / PDF */}
        <PrintableReportModal />

        {/* Modal de Perfil de Alumno */}
        <ProfileModal />

        {/* Modal de Estadísticas Avanzadas */}
        <StatsModal 
          isOpen={statsModalOpen}
          onClose={() => setStatsModalOpen(false)}
        />

        {/* Modal de Compartir Progreso */}
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />

        {/* Modal de Guía / Ayuda */}
        <HelpModal 
          isOpen={helpModalOpen} 
          onClose={() => setHelpModalOpen(false)} 
        />

        {/* Modal de Autenticación / Nube */}
        <AuthModal />

        {/* Barra de navegación inferior móvil */}
        <BottomNav 
          onOpenMenu={() => openMobileDrawer('menu')} 
          onOpenElectivas={() => openMobileDrawer('electivas')} 
        />

        {/* Notificaciones flotantes */}
        <Toast />
      </div>
    </AuthProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <TrackerProvider>
          <TrackerMain />
        </TrackerProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
