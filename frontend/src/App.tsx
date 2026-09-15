import React, { useState } from 'react';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { NetworkGraph } from './components/NetworkGraph';
import { GridView } from './components/GridView';
import { ElectivasDrawer } from './components/ElectivasDrawer';
import { SubjectModal } from './components/SubjectModal';
import { TitlesModal } from './components/TitlesModal';
import { HelpModal } from './components/HelpModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';

const TrackerMain: React.FC = () => {
  const { viewMode, reloadProgress } = useTracker();
  const [titlesModalOpen, setTitlesModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  return (
    <AuthProvider onUserChanged={reloadProgress}>
      <div className="min-h-screen bg-[#080c14] text-[#e2e8f0] flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Barra superior con navegación, filtros y métricas */}
        <Header 
          onOpenTitles={() => setTitlesModalOpen(true)}
          onOpenHelp={() => setHelpModalOpen(true)}
        />

        {/* Contenido principal según vista seleccionada */}
        <main className="flex-1 relative">
          {viewMode === 'grafo' ? (
            <NetworkGraph />
          ) : (
            <GridView />
          )}
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

        {/* Modal de Guía / Ayuda */}
        <HelpModal 
          isOpen={helpModalOpen} 
          onClose={() => setHelpModalOpen(false)} 
        />

        {/* Modal de Autenticación / Nube */}
        <AuthModal />

        {/* Notificaciones flotantes */}
        <Toast />
      </div>
    </AuthProvider>
  );
};

export default function App() {
  return (
    <TrackerProvider>
      <TrackerMain />
    </TrackerProvider>
  );
}
