import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { LayoutGrid, Network, CalendarDays, Sparkles, Menu } from 'lucide-react';

interface BottomNavProps {
  onOpenMenu: () => void;
  onOpenElectivas: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMenu, onOpenElectivas }) => {
  const {
    viewMode,
    setViewMode,
    setCalendarOpen,
    metasExamen
  } = useTracker();

  const tieneMetas = Object.keys(metasExamen).length > 0;

  return (
    <nav
      aria-label="Navegación principal móvil"
      className="fixed bottom-0 left-0 right-0 z-40 bg-(--bg-elevated)/95 backdrop-blur-md border-t border-(--border-color) px-1.5 py-1.5 flex items-center justify-around sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.2)] safe-area-bottom"
    >
      {/* Botón Malla */}
      <button
        type="button"
        onClick={() => setViewMode('malla')}
        className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
          viewMode === 'malla'
            ? 'text-(--color-primary) font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-(--text-body)'
        }`}
      >
        <div className={`p-1 rounded-lg transition-colors ${viewMode === 'malla' ? 'bg-(--color-primary-bg)' : ''}`}>
          <LayoutGrid className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-syne tracking-wide">Malla</span>
      </button>

      {/* Botón Grafo */}
      <button
        type="button"
        onClick={() => setViewMode('grafo')}
        className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
          viewMode === 'grafo'
            ? 'text-(--color-primary) font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-(--text-body)'
        }`}
      >
        <div className={`p-1 rounded-lg transition-colors ${viewMode === 'grafo' ? 'bg-(--color-primary-bg)' : ''}`}>
          <Network className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-syne tracking-wide">Grafo</span>
      </button>

      {/* Botón Calendario */}
      <button
        type="button"
        onClick={() => setCalendarOpen(true)}
        className="flex-1 py-1 px-1 flex flex-col items-center justify-center gap-0.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-(--text-body) transition-all relative"
      >
        <div className="p-1 rounded-lg relative">
          <CalendarDays className="w-5 h-5" />
          {tieneMetas && (
            <span 
              className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" 
              title="Tenés metas de examen agendadas"
            />
          )}
        </div>
        <span className="text-[10px] font-syne tracking-wide">Calendario</span>
      </button>

      {/* Botón Electivas */}
      <button
        type="button"
        onClick={onOpenElectivas}
        className="flex-1 py-1 px-1 flex flex-col items-center justify-center gap-0.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-(--text-body) transition-all"
      >
        <div className="p-1 rounded-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-syne tracking-wide">Electivas</span>
      </button>

      {/* Botón Más / Menú */}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex-1 py-1 px-1 flex flex-col items-center justify-center gap-0.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-(--text-body) transition-all"
      >
        <div className="p-1 rounded-lg">
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-syne tracking-wide">Más</span>
      </button>
    </nav>
  );
};
