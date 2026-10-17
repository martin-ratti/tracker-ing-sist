import React from 'react';
import { Compass, Grid3X3, Share2, Calendar, ArrowLeft } from 'lucide-react';

interface NotFoundViewProps {
  onNavigateHome: () => void;
  onNavigateMalla?: () => void;
  onNavigateGrafo?: () => void;
  onOpenCalendar?: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  onNavigateHome,
  onNavigateMalla,
  onNavigateGrafo,
  onOpenCalendar
}) => {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  const handleGoHome = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.pushState(null, '', '/');
    }
    onNavigateHome();
  };

  const handleGoMalla = () => {
    if (typeof window !== 'undefined') window.history.pushState(null, '', '/');
    if (onNavigateMalla) onNavigateMalla();
    else onNavigateHome();
  };

  const handleGoGrafo = () => {
    if (typeof window !== 'undefined') window.history.pushState(null, '', '/');
    if (onNavigateGrafo) onNavigateGrafo();
    else onNavigateHome();
  };

  return (
    <div className="min-h-screen bg-(--bg-base) text-(--text-body) flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Luces de fondo ambientales */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />
      <div 
        className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: 'var(--color-regular)' }}
      />

      <div className="max-w-md w-full text-center relative z-10 space-y-6">
        {/* Badge 404 */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-(--border-color) bg-(--bg-elevated) shadow-sm">
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: 'var(--color-primary)' }} />
          <span className="font-mono text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Error 404 · Ruta No Encontrada
          </span>
        </div>

        {/* Gran Número 404 Estilizado */}
        <div className="relative">
          <div 
            className="font-syne font-black text-7xl sm:text-8xl tracking-tighter select-none"
            style={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px var(--color-primary-glow)'
            }}
          >
            404
          </div>
          <div className="font-mono text-xs sm:text-sm text-slate-400 mt-2 font-medium">
            ¡Materia o ruta fuera del plan de estudios! 🛰️
          </div>
        </div>

        {/* Tarjeta de diagnóstico */}
        <div className="bg-(--bg-surface) border border-(--border-color) rounded-2xl p-4 sm:p-5 text-left shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 border-b border-(--border-color) pb-2.5">
            <Compass className="w-4 h-4 text-(--color-primary) shrink-0" />
            <span className="truncate">Ruta solicitada:</span>
            <code className="text-amber-500 dark:text-amber-400 font-bold bg-(--bg-elevated) px-2 py-0.5 rounded truncate">
              {currentPath}
            </code>
          </div>

          <p className="text-xs font-mono text-slate-400 leading-relaxed">
            La página o parámetro al que intentás acceder no existe o fue reubicado en la última actualización del Plan 2023.
          </p>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={handleGoMalla}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-(--bg-elevated) hover:bg-slate-800/80 border border-(--border-color) text-(--text-body) font-medium transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Grid3X3 className="w-4 h-4 text-cyan-400" />
              <span>Ver Malla Curricular</span>
            </button>

            <button
              type="button"
              onClick={handleGoGrafo}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-(--bg-elevated) hover:bg-slate-800/80 border border-(--border-color) text-(--text-body) font-medium transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Explorar Grafo</span>
            </button>

            {onOpenCalendar && (
              <button
                type="button"
                onClick={onOpenCalendar}
                className="col-span-1 sm:col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-(--bg-elevated) hover:bg-slate-800/80 border border-(--border-color) text-slate-300 font-medium transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Consultar Calendario de Exámenes</span>
              </button>
            )}
          </div>
        </div>

        {/* Botón Principal: Volver al inicio */}
        <div>
          <button
            type="button"
            onClick={handleGoHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-syne font-bold text-sm text-slate-950 transition-all duration-200 hover:opacity-95 hover:scale-[1.02] active:scale-95 shadow-lg cursor-pointer"
            style={{
              background: 'var(--gradient-primary)',
              boxShadow: '0 0 20px var(--color-primary-glow)'
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Tracker Principal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundView;
