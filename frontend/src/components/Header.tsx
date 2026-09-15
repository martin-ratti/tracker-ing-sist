import React, { useState, useRef } from 'react';
import { useTracker } from '../context/TrackerContext';
import { useAuth } from '../context/AuthContext';
import { ThemeSelector } from './ThemeSelector';
import { 
  Network, 
  LayoutGrid, 
  Sparkles, 
  GraduationCap, 
  RotateCcw, 
  HelpCircle,
  Award,
  X,
  Cloud,
  LogOut,
  CalendarDays,
  FileText,
  User as UserIcon,
  Target
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
    setCalendarOpen,
    setReportOpen,
    setProfileModalOpen,
    perfil,
    resetAll
  } = useTracker();

  const { user, openAuthModal, logout } = useAuth();

  const [confirmReset, setConfirmReset] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReset = () => {
    if (confirmReset) {
      resetAll();
      setConfirmReset(false);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    } else {
      setConfirmReset(true);
      resetTimerRef.current = setTimeout(() => setConfirmReset(false), 4000);
    }
  };

  const handleCancelReset = () => {
    setConfirmReset(false);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
  };

  return (
    <header className="bg-[#0b101c]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-3 sm:px-6 py-3">
      {/* Barra superior con título y controles */}
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Identidad y Título */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center text-black font-extrabold font-syne text-base tracking-wider shadow-lg transition-all"
              style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 0 15px var(--color-primary-glow)' }}
            >
              ISI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-syne font-extrabold text-base sm:text-lg text-white tracking-wider flex items-center gap-2">
                  UTN SISTEMAS
                  <span 
                    className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border transition-colors"
                    style={{ 
                      backgroundColor: 'var(--color-primary-bg)', 
                      borderColor: 'var(--color-primary-border)', 
                      color: 'var(--color-primary)' 
                    }}
                  >
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
              onClick={() => setCalendarOpen(true)}
              className="p-2 rounded bg-slate-800/60 border border-slate-700 text-cyan-400 text-xs font-mono"
              title="Calendario y Metas"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="p-2 rounded bg-slate-800/60 border border-slate-700 text-purple-400 text-xs font-mono"
              title="Ficha PDF"
            >
              <FileText className="w-4 h-4" />
            </button>
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

        {/* Estadísticas en vivo adaptadas al tema */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1 w-full md:w-auto justify-center">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm transition-all"
            style={{ 
              backgroundColor: 'var(--color-aprobada-bg)', 
              borderColor: 'var(--color-aprobada-border)' 
            }}
          >
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: 'var(--color-aprobada)' }}
            />
            <div className="text-left font-mono">
              <div 
                className="font-bold text-xs sm:text-sm leading-none"
                style={{ color: 'var(--color-aprobada)' }}
              >
                {stats.aprobadasCount}
              </div>
              <div className="text-[10px] text-slate-300/70 uppercase leading-tight">Aprobadas</div>
            </div>
          </div>

          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm transition-all"
            style={{ 
              backgroundColor: 'var(--color-regular-bg)', 
              borderColor: 'var(--color-regular-border)' 
            }}
          >
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: 'var(--color-regular)' }}
            />
            <div className="text-left font-mono">
              <div 
                className="font-bold text-xs sm:text-sm leading-none"
                style={{ color: 'var(--color-regular)' }}
              >
                {stats.regularesCount}
              </div>
              <div className="text-[10px] text-slate-300/70 uppercase leading-tight">Regulares</div>
            </div>
          </div>

          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm transition-all"
            style={{ 
              backgroundColor: 'var(--color-cursable-bg)', 
              borderColor: 'var(--color-cursable-border)' 
            }}
          >
            <span 
              className={`w-2 h-2 rounded-full ${stats.cursablesCount > 0 ? 'animate-ping' : ''}`}
              style={{ backgroundColor: 'var(--color-cursable)' }}
            />
            <div className="text-left font-mono">
              <div 
                className="font-bold text-xs sm:text-sm leading-none"
                style={{ color: 'var(--color-cursable)' }}
              >
                {stats.cursablesCount}
              </div>
              <div className="text-[10px] text-slate-300/70 uppercase leading-tight">Cursables</div>
            </div>
          </div>

          {stats.promedioConAplazos !== null && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#190c2e]/80 border border-purple-500/30 shadow-sm">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <div className="text-left font-mono">
                <div className="text-purple-300 font-bold text-xs sm:text-sm leading-none">
                  {stats.promedioSinAplazos ?? stats.promedioConAplazos}
                </div>
                <div
                  className="text-[10px] text-purple-300/60 uppercase leading-tight"
                  title={`Con aplazos: ${stats.promedioConAplazos} · Sin aplazos: ${stats.promedioSinAplazos ?? '—'}`}
                >
                  {stats.promedioSinAplazos !== null ? 'Prom. s/aplazos' : 'Promedio'}
                </div>
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
              <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                {stats.porcentajeCarrera}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-800/90 overflow-hidden border border-slate-700/60 p-0.5">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${stats.porcentajeCarrera}%`,
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 0 10px var(--color-primary-glow)'
                }}
              />
            </div>
          </div>

          {/* Botones de navegación y modales */}
          <div className="hidden md:flex items-center gap-2">
            {/* Botón Calendario Oficial y Metas */}
            <button
              onClick={() => setCalendarOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs transition-all ${
                stats.metasCount > 0
                  ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
              title="Calendario Académico UTN 2026/2027 y Metas de Examen"
            >
              <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
              <span>Calendario</span>
              {stats.metasCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/30 text-[10px] text-cyan-200 font-bold flex items-center gap-1">
                  <Target className="w-2.5 h-2.5" />
                  {stats.metasCount}
                </span>
              )}
            </button>

            {/* Botón Ficha Analítica / Reporte PDF */}
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white font-mono text-xs transition-colors"
              title="Descargar o imprimir ficha analítica oficial en PDF"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Ficha PDF</span>
            </button>

            {/* Perfil del Alumno */}
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-mono text-xs transition-colors"
              title="Configurar nombre y legajo universitario del alumno"
            >
              <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[110px] truncate">
                {perfil.nombre || 'Perfil'}
              </span>
            </button>

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
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[10px] text-amber-300">
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

            <ThemeSelector />

            {user ? (
              <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800/80 rounded-lg py-1 px-2 font-mono text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 text-[11px]" title={`Sesión activa: ${user.email}`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981]" />
                  <span className="max-w-[110px] truncate font-medium">{user.email.split('@')[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className="ml-1 p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs transition-all shadow-sm"
                style={{ 
                  backgroundColor: 'var(--color-primary-bg)', 
                  borderColor: 'var(--color-primary-border)', 
                  color: 'var(--color-primary)' 
                }}
                title="Sincronizar avance en la nube para verlo desde otra PC o celular"
              >
                <Cloud className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                <span>Nube</span>
              </button>
            )}
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
              viewMode === 'grafo' ? 'border font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            style={viewMode === 'grafo' ? {
              backgroundColor: 'var(--color-primary-bg)',
              borderColor: 'var(--color-primary-border)',
              color: 'var(--color-primary)'
            } : {}}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Grafo Red</span>
          </button>
          <button
            onClick={() => setViewMode('malla')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              viewMode === 'malla' ? 'border font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            style={viewMode === 'malla' ? {
              backgroundColor: 'var(--color-primary-bg)',
              borderColor: 'var(--color-primary-border)',
              color: 'var(--color-primary)'
            } : {}}
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
                  edgeMode === 'ambos' ? 'bg-slate-800 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={edgeMode === 'ambos' ? { color: 'var(--color-primary)' } : {}}
              >
                Todas
              </button>
              <button
                onClick={() => setEdgeMode('regular')}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                  edgeMode === 'regular' ? 'font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={edgeMode === 'regular' ? {
                  backgroundColor: 'var(--color-cursable-bg)',
                  color: 'var(--color-cursable)'
                } : {}}
              >
                Para Cursar
              </button>
              <button
                onClick={() => setEdgeMode('aprobada')}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                  edgeMode === 'aprobada' ? 'font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                style={edgeMode === 'aprobada' ? {
                  backgroundColor: 'var(--color-regular-bg)',
                  color: 'var(--color-regular)'
                } : {}}
              >
                Para Rendir
              </button>
            </div>
          </div>
        )}

        {/* Leyenda adaptada al tema activo y Reset */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Leyenda compacta */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span 
                className="w-2.5 h-2.5 rounded border"
                style={{ 
                  borderColor: 'var(--color-cursable-border)', 
                  backgroundColor: 'var(--color-cursable)' 
                }}
              />
              <span>Cursable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span 
                className="w-2.5 h-2.5 rounded border"
                style={{ 
                  borderColor: 'var(--color-regular-border)', 
                  backgroundColor: 'var(--color-regular)' 
                }}
              />
              <span>Regular</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span 
                className="w-2.5 h-2.5 rounded border"
                style={{ 
                  borderColor: 'var(--color-aprobada-border)', 
                  backgroundColor: 'var(--color-aprobada)' 
                }}
              />
              <span>Aprobada</span>
            </div>
          </div>

          <button
            onClick={onOpenHelp}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
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
          {confirmReset && (
            <button
              onClick={handleCancelReset}
              className="p-1 rounded text-slate-500 hover:text-slate-200 transition-colors"
              title="Cancelar reinicio"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
