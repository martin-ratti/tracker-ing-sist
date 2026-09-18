import React, { useState, useRef } from 'react';
import { useTracker } from '../context/TrackerContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  Target,
  BarChart3,
  Share2,
  Sun,
  Moon,
  Clock
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
    setStatsModalOpen,
    setShareModalOpen,
    setSelectedSubjectId,
    perfil,
    resetAll
  } = useTracker();

  const { user, openAuthModal, logout } = useAuth();
  const { colorMode, toggleColorMode } = useTheme();

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
    <header className="bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-color)] sticky top-0 z-30 px-4 sm:px-8 xl:px-12 py-3 w-full">
      {/* Barra superior con título y controles */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
        
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
                <h1 className="font-syne font-extrabold text-base sm:text-lg text-[var(--text-body)] tracking-wider flex items-center gap-2">
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
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Tracker Pro de Correlativas y Avance Académico
              </p>
            </div>
          </div>

          {/* Botones rápidos en móvil */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setCalendarOpen(true)}
              className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-cyan-700 dark:text-cyan-400 hover:bg-[var(--bg-base)] text-xs font-mono"
              title="Calendario y Metas"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-purple-700 dark:text-purple-400 hover:bg-[var(--bg-base)] text-xs font-mono"
              title="Ficha PDF"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setElectivasOpen(!electivasOpen)}
              className={`p-2 rounded-lg border text-xs font-mono transition-colors ${
                electivasOpen 
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-800 dark:text-amber-300 font-bold' 
                  : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-slate-700 dark:text-slate-300 hover:bg-[var(--bg-base)]'
              }`}
              title="Electivas"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenTitles}
              className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-700 dark:text-slate-300 hover:bg-[var(--bg-base)] text-xs font-mono"
              title="Títulos"
            >
              <GraduationCap className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStatsModalOpen(true)}
              className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-pink-700 dark:text-pink-400 hover:bg-[var(--bg-base)] text-xs font-mono"
              title="Estadísticas"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShareModalOpen(true)}
              className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sky-700 dark:text-sky-400 hover:bg-[var(--bg-base)] text-xs font-mono"
              title="Compartir"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={toggleColorMode}
              className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-mono hover:bg-[var(--bg-base)]"
              title={colorMode === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {colorMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
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
              <div className="text-[10px] text-slate-600 dark:text-slate-300/80 uppercase leading-tight font-medium">Aprobadas</div>
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
              <div className="text-[10px] text-slate-600 dark:text-slate-300/80 uppercase leading-tight font-medium">Regulares</div>
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
              <div className="text-[10px] text-slate-600 dark:text-slate-300/80 uppercase leading-tight font-medium">Cursables</div>
            </div>
          </div>

          {stats.promedioConAplazos !== null && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 dark:bg-[#190c2e]/80 border border-purple-500/30 shadow-sm">
              <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <div className="text-left font-mono">
                <div className="text-purple-700 dark:text-purple-300 font-bold text-xs sm:text-sm leading-none">
                  {stats.promedioSinAplazos ?? stats.promedioConAplazos}
                </div>
                <div
                  className="text-[10px] text-purple-700/70 dark:text-purple-300/60 uppercase leading-tight font-medium"
                  title={`Con aplazos: ${stats.promedioConAplazos} · Sin aplazos: ${stats.promedioSinAplazos ?? '—'}`}
                >
                  {stats.promedioSinAplazos !== null ? 'Prom. s/aplazos' : 'Promedio'}
                </div>
              </div>
            </div>
          )}

          {stats.proximaMeta && (
            <button
              type="button"
              onClick={() => setSelectedSubjectId(stats.proximaMeta!.materiaId)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm transition-all text-left ${
                stats.proximaMeta.urgencia === 'urgente'
                  ? 'bg-rose-500/15 border-rose-500/50 text-rose-700 dark:text-rose-300 animate-pulse'
                  : stats.proximaMeta.urgencia === 'proxima'
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-700 dark:text-amber-300'
                  : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-700 dark:text-cyan-300'
              }`}
              title={`Meta de examen: ${stats.proximaMeta.materiaNombre} (${stats.proximaMeta.fechaExamenStr}). Clic para ver.`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <div className="font-mono">
                <div className="font-bold text-xs sm:text-sm leading-none flex items-center gap-1">
                  <span>{stats.proximaMeta.diasFaltantes === 0 ? '¡Rinde Hoy!' : `${stats.proximaMeta.diasFaltantes}d`}</span>
                </div>
                <div className="text-[10px] truncate max-w-[85px] leading-tight font-medium opacity-85">
                  {stats.proximaMeta.materiaNombreCorto}
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Acciones de usuario y personalización (superior derecha) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Perfil del Alumno */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-slate-400 dark:hover:border-slate-700 text-[var(--text-body)] font-mono text-xs transition-colors shadow-sm"
            title="Configurar nombre y legajo universitario del alumno"
          >
            <UserIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="max-w-[120px] truncate">
              {perfil.nombre || 'Perfil'}
            </span>
          </button>

          <ThemeSelector />

          {/* Botón rápido modo claro/oscuro */}
          <button
            type="button"
            onClick={toggleColorMode}
            className="p-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-body)] hover:border-slate-500 transition-colors"
            title={colorMode === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label={colorMode === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            {colorMode === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg py-1 px-2.5 font-mono text-xs shadow-sm">
              <div className="flex items-center gap-1.5 text-[var(--text-body)] text-[11px]" title={`Sesión activa: ${user.email}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                <span className="max-w-[110px] truncate font-medium">{user.email.split('@')[0]}</span>
              </div>
              <button
                onClick={logout}
                className="ml-1 p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
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

      {/* Sub-barra: Selector de Vistas, Filtros de Correlativas, % de Avance y Botones de Acción */}
      <div className="w-full mt-3 pt-2.5 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Bloque Izquierdo: Vistas, Filtro de Correlativas y % de Carrera */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
          {/* Selector de vistas: Grafo vs Malla */}
          <div className="flex items-center gap-1 bg-[var(--bg-elevated)] p-1 rounded-lg border border-[var(--border-color)]">
            <button
              onClick={() => setViewMode('grafo')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'grafo' ? 'border font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-[var(--text-body)]'
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
                viewMode === 'malla' ? 'border font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-[var(--text-body)]'
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
              <div className="flex items-center bg-[var(--bg-elevated)] p-1 rounded-lg border border-[var(--border-color)]">
                <button
                  onClick={() => setEdgeMode('ambos')}
                  className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                    edgeMode === 'ambos' ? 'bg-[var(--bg-surface)] font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-[var(--text-body)]'
                  }`}
                  style={edgeMode === 'ambos' ? { color: 'var(--color-primary)' } : {}}
                >
                  Todas
                </button>
                <button
                  onClick={() => setEdgeMode('regular')}
                  className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                    edgeMode === 'regular' ? 'font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-[var(--text-body)]'
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
                    edgeMode === 'aprobada' ? 'font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-[var(--text-body)]'
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

          {/* Porcentaje y barra de avance de la carrera larga y satisfactoria */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-color)] shadow-inner">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
              <span>Avance:</span>
              <span className="text-[var(--text-body)] font-bold">
                {stats.aprobadasCount} / {stats.totalTroncales} materias
              </span>
            </div>
            <div className="w-36 sm:w-56 md:w-72 lg:w-[340px] xl:w-[460px] 2xl:w-[560px] h-2.5 sm:h-3 rounded-full bg-slate-200 dark:bg-slate-950/90 overflow-hidden border border-slate-300 dark:border-slate-700/60 p-0.5 relative shadow-inner">
              <div 
                className="h-full rounded-full transition-all duration-700 ease-out relative"
                style={{ 
                  width: `${stats.porcentajeCarrera}%`,
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 0 12px var(--color-primary-glow)'
                }}
              >
                <span className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full blur-[1px]" />
              </div>
            </div>
            <span 
              className="font-bold text-xs sm:text-sm min-w-[46px] text-right font-syne"
              style={{ color: 'var(--color-primary)' }}
            >
              {stats.porcentajeCarrera}%
            </span>
          </div>
        </div>

        {/* Bloque Derecho: Botones de navegación académica, Leyenda y Reset */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Botones de navegación académica */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Botón Calendario Oficial y Metas */}
            <button
              onClick={() => setCalendarOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-all shadow-sm ${
                stats.metasCount > 0
                  ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-800 dark:text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700 hover:text-[var(--text-body)]'
              }`}
              title="Calendario Académico UTN 2026/2027 y Metas de Examen"
            >
              <CalendarDays className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Calendario</span>
              {stats.metasCount > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/30 text-[10px] text-cyan-800 dark:text-cyan-200 font-bold flex items-center gap-0.5">
                  <Target className="w-2.5 h-2.5" />
                  {stats.metasCount}
                </span>
              )}
            </button>

            {/* Chip de Próxima Meta de Examen con Cuenta Regresiva (Item 17) */}
            {stats.proximaMeta && (
              <button
                type="button"
                onClick={() => setSelectedSubjectId(stats.proximaMeta!.materiaId)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-all shadow-sm ${
                  stats.proximaMeta.urgencia === 'urgente'
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-700 dark:text-rose-300 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                    : stats.proximaMeta.urgencia === 'proxima'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-700 dark:text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-700 dark:text-cyan-300'
                }`}
                title={`Meta agendada: ${stats.proximaMeta.materiaNombre} (${stats.proximaMeta.fechaExamenStr} - ${stats.proximaMeta.turnoNombre}). Clic para ver materia.`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="font-semibold">{stats.proximaMeta.materiaNombreCorto}:</span>
                <span className="font-bold">
                  {stats.proximaMeta.diasFaltantes === 0
                    ? '¡Hoy!'
                    : `Faltan ${stats.proximaMeta.diasFaltantes}d`}
                </span>
              </button>
            )}

            {/* Botón Ficha Analítica / Reporte PDF */}
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700 hover:text-[var(--text-body)] font-mono text-[11px] transition-colors shadow-sm"
              title="Descargar o imprimir ficha analítica oficial en PDF"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Ficha PDF</span>
            </button>

            {/* Botón Electivas */}
            <button
              onClick={() => setElectivasOpen(!electivasOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-all shadow-sm ${
                electivasOpen
                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-800 dark:text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700 hover:text-[var(--text-body)]'
              }`}
              title="Panel de Materias Electivas y cálculo de horas"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Electivas</span>
              <span className="px-1 py-0.2 rounded bg-amber-500/20 text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                {stats.horasElectivasAprobadas}/20hs
              </span>
            </button>

            {/* Botón Títulos */}
            <button
              onClick={onOpenTitles}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700 hover:text-[var(--text-body)] font-mono text-[11px] transition-colors shadow-sm"
              title="Requisitos para Título Intermedio ADUSI e Ingeniería"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Títulos</span>
              {stats.adusiCumplido && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" title="ADUSI alcanzado" />
              )}
            </button>

            {/* Botón Estadísticas */}
            <button
              onClick={() => setStatsModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700 hover:text-[var(--text-body)] font-mono text-[11px] transition-colors shadow-sm"
              title="Dashboard de Estadísticas Avanzadas"
            >
              <BarChart3 className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
              <span>Estadísticas</span>
            </button>

            {/* Botón Compartir */}
            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700 hover:text-[var(--text-body)] font-mono text-[11px] transition-colors shadow-sm"
              title="Generar enlace compartible de tu progreso"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Compartir</span>
            </button>
          </div>

          <div className="h-4 w-px bg-[var(--border-color)] hidden xl:block" />

          {/* Leyenda compacta */}
          <div className="hidden lg:flex items-center gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: 'var(--color-cursable)' }}
              />
              <span>Cursable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: 'var(--color-regular)' }}
              />
              <span>Regular</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: 'var(--color-aprobada)' }}
              />
              <span>Aprobada</span>
            </div>
          </div>

          {/* Ayuda y Reset */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenHelp}
              className="text-slate-500 dark:text-slate-400 hover:text-[var(--text-body)] hover:bg-[var(--bg-elevated)] p-1 rounded transition-colors"
              title="Ayuda y atajos"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all ${
                confirmReset 
                  ? 'bg-rose-500/30 border border-rose-500 text-rose-700 dark:text-rose-300 animate-pulse font-bold' 
                  : 'text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[var(--bg-elevated)]'
              }`}
              title="Reiniciar todos los estados a pendiente"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{confirmReset ? '¿Confirmar?' : 'Reiniciar'}</span>
            </button>
            {confirmReset && (
              <button
                onClick={handleCancelReset}
                className="p-1 rounded text-slate-500 hover:text-[var(--text-body)] transition-colors"
                title="Cancelar reinicio"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
