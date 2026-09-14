import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { 
  Network, 
  LayoutGrid, 
  Sparkles, 
  GraduationCap, 
  RotateCcw, 
  HelpCircle,
  Award
} from 'lucide-react';

interface HeaderProps {
  onOpenTitles: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTitles, onOpenHelp }) => {
  const { 
    stats, 
    edgeMode, 
    setEdgeMode, 
    viewMode, 
    setViewMode, 
    electivasOpen, 
    setElectivasOpen,
    resetAll
  } = useTracker();

  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    if (confirmReset) {
      resetAll();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
    }
  };

  return (
    <header className="bg-[#0b101c]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-3 sm:px-6 py-3">
      {/* Barra superior con título y controles */}
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Identidad y Título */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold font-syne text-base tracking-wider">
              ISI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-syne font-extrabold text-base sm:text-lg text-white tracking-wider flex items-center gap-2">
                  UTN SISTEMAS
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                    Plan 2023 · FRRo
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Tracker Pro de Correlativas y Avance Académico
              </p>
            </div>
          </div>

          {/* Botones rápidos en móvil */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setElectivasOpen(!electivasOpen)}
              className={`p-2 rounded border text-xs font-mono transition-colors ${
                electivasOpen 
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                  : 'bg-slate-800/60 border-slate-700 text-slate-300'
              }`}
              title="Electivas"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenTitles}
              className="p-2 rounded bg-slate-800/60 border border-slate-700 text-slate-300 text-xs font-mono"
              title="Títulos"
            >
              <GraduationCap className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Estadísticas en vivo */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1 w-full md:w-auto justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#071f14]/80 border border-emerald-500/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <div className="text-left font-mono">
              <div className="text-emerald-400 font-bold text-xs sm:text-sm leading-none">{stats.aprobadasCount}</div>
              <div className="text-[10px] text-emerald-300/60 uppercase leading-tight">Aprobadas</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1400]/80 border border-amber-500/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <div className="text-left font-mono">
              <div className="text-amber-400 font-bold text-xs sm:text-sm leading-none">{stats.regularesCount}</div>
              <div className="text-[10px] text-amber-300/60 uppercase leading-tight">Regulares</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#051520]/80 border border-cyan-500/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <div className="text-left font-mono">
              <div className="text-cyan-400 font-bold text-xs sm:text-sm leading-none">{stats.cursablesCount}</div>
              <div className="text-[10px] text-cyan-300/60 uppercase leading-tight">Cursables</div>
            </div>
          </div>

          {stats.promedioConAplazos !== null && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#190c2e]/80 border border-purple-500/30 shadow-sm">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <div className="text-left font-mono">
                <div className="text-purple-300 font-bold text-xs sm:text-sm leading-none">{stats.promedioSinAplazos ?? stats.promedioConAplazos}</div>
                <div className="text-[10px] text-purple-300/60 uppercase leading-tight">Promedio</div>
              </div>
            </div>
          )}
        </div>

        {/* Barra de Progreso y Acciones principales */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Barra de avance */}
          <div className="w-full sm:w-48 md:w-56 font-mono text-xs">
            <div className="flex justify-between text-[11px] mb-1 text-slate-300">
              <span>{stats.aprobadasCount} / {stats.totalTroncales} materias</span>
              <span className="text-cyan-400 font-bold">{stats.porcentajeCarrera}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800/90 overflow-hidden border border-slate-700/60 p-0.5">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                style={{ width: `${stats.porcentajeCarrera}%` }}
              />
            </div>
          </div>

          {/* Botones de navegación y modales */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setElectivasOpen(!electivasOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs transition-all ${
                electivasOpen
                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Electivas</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[10px] text-amber-300">
                {stats.horasElectivasAprobadas}/20hs
              </span>
            </button>

            <button
              onClick={onOpenTitles}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white font-mono text-xs transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Títulos</span>
              {stats.adusiCumplido && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" title="ADUSI alcanzado" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-barra: Selector de Vistas, Filtros de Árbol y Guía rápida */}
      <div className="max-w-[1600px] mx-auto mt-3 pt-2.5 border-t border-slate-800/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Selector de vistas: Grafo vs Malla */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('grafo')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              viewMode === 'grafo'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Grafo Red</span>
          </button>
          <button
            onClick={() => setViewMode('malla')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              viewMode === 'malla'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Malla Curricular</span>
          </button>
        </div>

        {/* Filtros de correlativas (solo relevante en modo Grafo) */}
        {viewMode === 'grafo' && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] hidden sm:inline">Correlativas:</span>
            <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setEdgeMode('ambos')}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                  edgeMode === 'ambos' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setEdgeMode('regular')}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                  edgeMode === 'regular' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Para Cursar
              </button>
              <button
                onClick={() => setEdgeMode('aprobada')}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                  edgeMode === 'aprobada' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Para Rendir
              </button>
            </div>
          </div>
        )}

        {/* Leyenda y Reset */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Leyenda compacta */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded border border-cyan-400 bg-cyan-400/20"></span>
              <span>Cursable</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded border border-amber-400 bg-amber-400/20"></span>
              <span>Regular</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded border border-emerald-400 bg-emerald-400/20"></span>
              <span>Aprobada</span>
            </div>
          </div>

          <button
            onClick={onOpenHelp}
            className="text-slate-400 hover:text-cyan-300 p-1 rounded transition-colors"
            title="Ayuda y atajos"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleReset}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all ${
              confirmReset 
                ? 'bg-rose-500/30 border border-rose-500 text-rose-300 animate-pulse font-bold' 
                : 'text-slate-500 hover:text-rose-400'
            }`}
            title="Reiniciar todos los estados a pendiente"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{confirmReset ? '¿Confirmar?' : 'Reiniciar'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
