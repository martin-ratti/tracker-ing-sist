import React, { useState, lazy, Suspense, useMemo, useRef, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { GridView } from './components/GridView';
import { GraphSkeleton } from './components/GraphSkeleton';
import { ElectivasDrawer } from './components/ElectivasDrawer';
import { SubjectModal } from './components/SubjectModal';
import { TitlesModal } from './components/TitlesModal';
import { HelpModal } from './components/HelpModal';
import { AuthModal } from './components/AuthModal';
import { CalendarModal } from './components/CalendarModal';
import { PrintableReportModal } from './components/PrintableReportModal';
import { ProfileModal } from './components/ProfileModal';
import { StatsModal } from './components/StatsModal';
import { ShareModal } from './components/ShareModal';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const NetworkGraph = lazy(() => import('./components/NetworkGraph').then(m => ({ default: m.NetworkGraph })));

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

  return (
    <AuthProvider onUserChanged={reloadProgress}>
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-body)] flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Banner de Modo Compartido (Solo Lectura) */}
        {isViewingShared && (
          <div className="bg-sky-600 text-white px-4 py-2 text-xs font-mono flex flex-wrap items-center justify-between gap-2 z-40 border-b border-sky-400/50 shadow-md">
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
        <main className="flex-1 relative pb-16 sm:pb-0">
          <div key={viewMode} className="view-transition-enter h-full">
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
