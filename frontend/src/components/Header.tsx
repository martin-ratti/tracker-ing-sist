import React, { useState, useRef, useEffect } from 'react';
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
  Target,
  BarChart3,
  Share2,
  Sun,
  Moon,
  Clock,
  Menu,
  ChevronRight
} from 'lucide-react';
import { useTheme, THEMES, type ThemeId } from '../context/ThemeContext';

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
  const { theme, setTheme, colorMode, toggleColorMode } = useTheme();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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

  // Bloquear el scroll de la página de fondo cuando el drawer móvil está abierto
  useEffect(() => {
    if (mobileDrawerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileDrawerOpen]);

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

          {/* Botones rápidos en móvil (Top-right) */}
          <div className="flex items-center gap-1.5 md:hidden">
            {/* Modo Claro / Oscuro */}
            <button
              type="button"
              onClick={toggleColorMode}
              className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs hover:bg-[var(--bg-base)] transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
              title={colorMode === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              aria-label={colorMode === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {colorMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* Acceso Nube / Usuario */}
            {user ? (
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs font-mono min-h-[38px]"
                title={`Sesión iniciada como ${user.email}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                <span className="text-[11px] font-bold truncate max-w-[70px]">
                  {perfil.nombre?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all min-h-[38px]"
                style={{ 
                  backgroundColor: 'var(--color-primary-bg)', 
                  borderColor: 'var(--color-primary-border)', 
                  color: 'var(--color-primary)' 
                }}
                title="Sincronizar avance en la nube"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span className="text-[11px]">Nube</span>
              </button>
            )}

            {/* Botón Menú Hamburguesa */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-body)] hover:bg-[var(--bg-base)] transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
              aria-label="Abrir menú de herramientas"
              title="Menú de herramientas académicas"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Estadísticas en vivo adaptadas al tema (solo escritorio) */}
        <div className="hidden md:flex items-center gap-2 sm:gap-4 overflow-x-auto py-1 w-full md:w-auto justify-center">
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
                className="font-extrabold text-xs sm:text-sm leading-none"
                style={{ color: 'var(--color-aprobada)' }}
              >
                {stats.aprobadasCount}
              </div>
              <div className="text-[10px] text-slate-800 dark:text-slate-200 uppercase leading-tight font-bold">Aprobadas</div>
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
                className="font-extrabold text-xs sm:text-sm leading-none"
                style={{ color: 'var(--color-regular)' }}
              >
                {stats.regularesCount}
              </div>
              <div className="text-[10px] text-slate-800 dark:text-slate-200 uppercase leading-tight font-bold">Regulares</div>
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
                className="font-extrabold text-xs sm:text-sm leading-none"
                style={{ color: 'var(--color-cursable)' }}
              >
                {stats.cursablesCount}
              </div>
              <div className="text-[10px] text-slate-800 dark:text-slate-200 uppercase leading-tight font-bold">Cursables</div>
            </div>
          </div>

          {stats.promedioConAplazos !== null && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 dark:bg-[#190c2e]/80 border border-purple-500/30 shadow-sm">
              <Award className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
              <div className="text-left font-mono">
                <div className="text-purple-900 dark:text-purple-300 font-extrabold text-xs sm:text-sm leading-none">
                  {stats.promedioSinAplazos !== null ? stats.promedioSinAplazos : stats.promedioConAplazos}
                </div>
                <div 
                  className="text-[10px] text-purple-900 dark:text-purple-300 uppercase leading-tight font-bold cursor-help"
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

      {/* Sub-barra exclusiva para móviles */}
      <div className="flex md:hidden flex-col gap-2 mt-2 pt-2 border-t border-[var(--border-color)] w-full">
        {/* Selector de vistas en móvil: Malla vs Grafo */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border-color)] w-full">
            <button
              type="button"
              onClick={() => setViewMode('malla')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono transition-all min-h-[38px] ${
                viewMode === 'malla'
                  ? 'border font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 font-medium'
              }`}
              style={viewMode === 'malla' ? {
                backgroundColor: 'var(--color-primary-bg)',
                borderColor: 'var(--color-primary-border)',
                color: 'var(--color-primary)'
              } : {}}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Malla Curricular</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grafo')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono transition-all min-h-[38px] ${
                viewMode === 'grafo'
                  ? 'border font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 font-medium'
              }`}
              style={viewMode === 'grafo' ? {
                backgroundColor: 'var(--color-primary-bg)',
                borderColor: 'var(--color-primary-border)',
                color: 'var(--color-primary)'
              } : {}}
            >
              <Network className="w-4 h-4" />
              <span>Grafo de Red</span>
            </button>
          </div>
        </div>

        {/* Si está en modo Grafo en móvil, selector de correlativas */}
        {viewMode === 'grafo' && (
          <div className="flex items-center justify-between bg-[var(--bg-elevated)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-mono">
            <button
              type="button"
              onClick={() => setEdgeMode('ambos')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                edgeMode === 'ambos' ? 'bg-[var(--bg-surface)] font-bold shadow-sm border border-[var(--border-color)]' : 'text-slate-600 dark:text-slate-400'
              }`}
              style={edgeMode === 'ambos' ? { color: 'var(--color-primary)' } : {}}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setEdgeMode('regular')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                edgeMode === 'regular' ? 'font-bold shadow-sm border border-[var(--color-cursable-border)]' : 'text-slate-600 dark:text-slate-400'
              }`}
              style={edgeMode === 'regular' ? {
                backgroundColor: 'var(--color-cursable-bg)',
                color: 'var(--color-cursable)'
              } : {}}
            >
              Para Cursar
            </button>
            <button
              type="button"
              onClick={() => setEdgeMode('aprobada')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                edgeMode === 'aprobada' ? 'font-bold shadow-sm border border-[var(--color-regular-border)]' : 'text-slate-600 dark:text-slate-400'
              }`}
              style={edgeMode === 'aprobada' ? {
                backgroundColor: 'var(--color-regular-bg)',
                color: 'var(--color-regular)'
              } : {}}
            >
              Para Rendir
            </button>
          </div>
        )}

        {/* Barra compacta de Avance de Carrera */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Avance de Carrera:</span>
            <span className="font-bold font-syne text-xs" style={{ color: 'var(--color-primary)' }}>
              {stats.aprobadasCount}/{stats.totalTroncales} ({stats.porcentajeCarrera}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-900 border border-[var(--border-color)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats.porcentajeCarrera}%`,
                background: 'var(--gradient-primary)'
              }}
            />
          </div>
        </div>

        {/* Micro-estadísticas en 4 columnas */}
        <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px] text-center">
          <div 
            className="p-1.5 rounded-lg border shadow-sm"
            style={{ 
              backgroundColor: 'var(--color-aprobada-bg)', 
              borderColor: 'var(--color-aprobada-border)' 
            }}
          >
            <div className="text-[9px] uppercase font-bold text-slate-800 dark:text-slate-200">Apr</div>
            <div className="text-xs font-extrabold" style={{ color: 'var(--color-aprobada)' }}>
              {stats.aprobadasCount}
            </div>
          </div>

          <div 
            className="p-1.5 rounded-lg border shadow-sm"
            style={{ 
              backgroundColor: 'var(--color-regular-bg)', 
              borderColor: 'var(--color-regular-border)' 
            }}
          >
            <div className="text-[9px] uppercase font-bold text-slate-800 dark:text-slate-200">Reg</div>
            <div className="text-xs font-extrabold" style={{ color: 'var(--color-regular)' }}>
              {stats.regularesCount}
            </div>
          </div>

          <div 
            className="p-1.5 rounded-lg border shadow-sm"
            style={{ 
              backgroundColor: 'var(--color-cursable-bg)', 
              borderColor: 'var(--color-cursable-border)' 
            }}
          >
            <div className="text-[9px] uppercase font-bold text-slate-800 dark:text-slate-200">Cur</div>
            <div className="text-xs font-extrabold" style={{ color: 'var(--color-cursable)' }}>
              {stats.cursablesCount}
            </div>
          </div>

          <div className="p-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 shadow-sm">
            <div className="text-[9px] uppercase font-bold text-purple-900 dark:text-purple-300">Prom</div>
            <div className="text-xs font-extrabold text-purple-900 dark:text-purple-300">
              {stats.promedioSinAplazos !== null ? stats.promedioSinAplazos : (stats.promedioConAplazos ?? '—')}
            </div>
          </div>
        </div>

        {/* Próxima meta de examen en móvil */}
        {stats.proximaMeta && (
          <button
            type="button"
            onClick={() => setSelectedSubjectId(stats.proximaMeta!.materiaId)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all min-h-[36px] ${
              stats.proximaMeta.urgencia === 'urgente'
                ? 'bg-rose-500/15 border-rose-500/50 text-rose-800 dark:text-rose-300 animate-pulse font-bold'
                : stats.proximaMeta.urgencia === 'proxima'
                ? 'bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-300 font-semibold'
                : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-800 dark:text-cyan-300'
            }`}
          >
            <span className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">🎯 Final: {stats.proximaMeta.materiaNombreCorto}</span>
            </span>
            <span className="font-bold shrink-0 ml-2">
              {stats.proximaMeta.diasFaltantes === 0 ? '¡Hoy!' : `${stats.proximaMeta.diasFaltantes}d`}
            </span>
          </button>
        )}
      </div>

      {/* Sub-barra Desktop: Selector de Vistas, Filtros de Correlativas, % de Avance y Botones de Acción */}
      <div className="hidden md:flex w-full mt-3 pt-2.5 border-t border-[var(--border-color)] flex-wrap items-center justify-between gap-3 text-xs font-mono">
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
              <span className="text-slate-700 dark:text-slate-300 text-[11px] hidden sm:inline font-semibold">Correlativas:</span>
              <div className="flex items-center bg-[var(--bg-elevated)] p-1 rounded-lg border border-[var(--border-color)]">
                <button
                  onClick={() => setEdgeMode('ambos')}
                  className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                    edgeMode === 'ambos' ? 'bg-[var(--bg-surface)] font-extrabold shadow-sm border border-[var(--border-color)]' : 'text-slate-700 dark:text-slate-300 hover:text-[var(--text-body)] font-medium'
                  }`}
                  style={edgeMode === 'ambos' ? { color: 'var(--color-primary)' } : {}}
                >
                  Todas
                </button>
                <button
                  onClick={() => setEdgeMode('regular')}
                  className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                    edgeMode === 'regular' ? 'font-extrabold shadow-sm border border-[var(--color-cursable-border)]' : 'text-slate-700 dark:text-slate-300 hover:text-[var(--text-body)] font-medium'
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
                    edgeMode === 'aprobada' ? 'font-extrabold shadow-sm border border-[var(--color-regular-border)]' : 'text-slate-700 dark:text-slate-300 hover:text-[var(--text-body)] font-medium'
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
                  ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-900 dark:text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-slate-800 dark:text-slate-200 font-semibold hover:border-slate-400 dark:hover:border-slate-700 hover:text-[var(--text-body)]'
              }`}
              title="Calendario Académico UTN 2026/2027 y Metas de Examen"
            >
              <CalendarDays className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
              <span>Calendario</span>
              {stats.metasCount > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/30 text-[10px] text-cyan-950 dark:text-cyan-200 font-bold flex items-center gap-0.5">
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
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-800 dark:text-rose-300 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                    : stats.proximaMeta.urgencia === 'proxima'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-800 dark:text-cyan-300'
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
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-800 dark:text-slate-200 font-semibold hover:border-slate-400 dark:hover:border-slate-700 hover:text-[var(--text-body)] font-mono text-[11px] transition-colors shadow-sm"
              title="Descargar o imprimir ficha analítica oficial en PDF"
            >
              <FileText className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
              <span>Ficha PDF</span>
            </button>

            {/* Botón Electivas */}
            <button
              onClick={() => setElectivasOpen(!electivasOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-all shadow-sm ${
                electivasOpen
                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-900 dark:text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-slate-800 dark:text-slate-200 font-semibold hover:border-slate-400 dark:hover:border-slate-700 hover:text-[var(--text-body)]'
              }`}
              title="Panel de Materias Electivas y cálculo de horas"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Electivas</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[10px] text-amber-900 dark:text-amber-300 font-bold">
                {stats.horasElectivasAprobadas}/20hs
              </span>
            </button>

            {/* Botón Títulos */}
            <button
              onClick={onOpenTitles}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-800 dark:text-slate-200 font-semibold hover:border-slate-400 dark:hover:border-slate-700 hover:text-[var(--text-body)] font-mono text-[11px] transition-colors shadow-sm"
              title="Requisitos para Título Intermedio ADUSI e Ingeniería"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
              <span>Títulos</span>
              {stats.adusiCumplido && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" title="ADUSI alcanzado" />
              )}
            </button>

            {/* Botón Estadísticas */}
            <button
              onClick={() => setStatsModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-800 dark:text-slate-200 font-semibold hover:border-slate-400 dark:hover:border-slate-700 hover:text-[var(--text-body)] font-mono text-[11px] transition-colors shadow-sm"
              title="Dashboard de Estadísticas Avanzadas"
            >
              <BarChart3 className="w-3.5 h-3.5 text-pink-700 dark:text-pink-400" />
              <span>Estadísticas</span>
            </button>

            {/* Botón Compartir */}
            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-800 dark:text-slate-200 font-semibold hover:border-slate-400 dark:hover:border-slate-700 hover:text-[var(--text-body)] font-mono text-[11px] transition-colors shadow-sm"
              title="Generar enlace compartible de tu progreso"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
              <span>Compartir</span>
            </button>
          </div>

          <div className="h-4 w-px bg-[var(--border-color)] hidden xl:block" />

          {/* Leyenda compacta */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-800 dark:text-slate-200 font-semibold">
            <div className="flex items-center gap-1.5">
              <span 
                className="w-2.5 h-2.5 rounded-full shadow-sm" 
                style={{ backgroundColor: 'var(--color-cursable)' }}
              />
              <span className="text-cyan-900 dark:text-cyan-300 font-bold">Cursable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span 
                className="w-2.5 h-2.5 rounded-full shadow-sm" 
                style={{ backgroundColor: 'var(--color-regular)' }}
              />
              <span className="text-amber-900 dark:text-amber-300 font-bold">Regular</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span 
                className="w-2.5 h-2.5 rounded-full shadow-sm" 
                style={{ backgroundColor: 'var(--color-aprobada)' }}
              />
              <span className="text-emerald-900 dark:text-emerald-300 font-bold">Aprobada</span>
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

      {/* Menú Móvil Desplegable: Top-Sheet de ancho completo que cubre más de la mitad de la pantalla */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-start animate-in fade-in duration-200">
          {/* Fondo inferior difuminado (tocar aquí cierra el menú) */}
          <div 
            className="absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Panel Superior Desplegable que ocupa todo el ancho de la pantalla */}
          <div 
            className="relative w-full max-h-[85vh] bg-[var(--bg-surface)]/98 border-b border-[var(--border-color)] shadow-[0_25px_60px_rgba(0,0,0,0.7)] rounded-b-3xl flex flex-col z-10 animate-in slide-in-from-top duration-300 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header del Menú */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-black font-extrabold font-syne text-sm shadow-md"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  ISI
                </div>
                <div>
                  <h3 className="font-syne font-bold text-sm text-[var(--text-body)]">Herramientas</h3>
                  <p className="text-[10px] font-mono text-slate-500">Plan 2023 · UTN FRRo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Cerrar menú"
                className="p-2 rounded-xl text-slate-400 hover:text-[var(--text-body)] hover:bg-[var(--bg-surface)] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido con ancho completo y distribución en 2 columnas */}
            <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar overscroll-contain flex flex-col gap-3 max-w-2xl mx-auto w-full">
              {/* Fila Superior: Perfil + Nube Firebase (2 Columnas) */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Tarjeta de Perfil */}
                <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-between gap-2 shadow-sm min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-syne font-bold text-xs text-[var(--text-body)] truncate">
                        {perfil.nombre || 'Estudiante'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">
                        {perfil.legajo ? `Leg: ${perfil.legajo}` : 'Sin legajo'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[var(--bg-surface)] border border-[var(--border-color)] text-slate-700 dark:text-slate-300 hover:text-[var(--text-body)] shrink-0 shadow-xs"
                  >
                    Editar
                  </button>
                </div>

                {/* Sincronización en la Nube */}
                <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-between gap-2 shadow-sm font-mono text-xs min-w-0">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold text-slate-500 truncate">Nube Firebase</div>
                    {user ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {user.email?.split('@')[0]}
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold truncate">Offline</span>
                    )}
                  </div>
                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileDrawerOpen(false);
                      }}
                      className="p-1.5 rounded text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                      title="Cerrar sesión"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        openAuthModal();
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold border shrink-0 shadow-xs"
                      style={{
                        backgroundColor: 'var(--color-primary-bg)',
                        borderColor: 'var(--color-primary-border)',
                        color: 'var(--color-primary)'
                      }}
                    >
                      Conectar
                    </button>
                  )}
                </div>
              </div>

              {/* Selector de Paleta de Color */}
              <div>
                <div className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Paleta Cromática</span>
                  <span className="text-[9px] font-normal text-slate-400 dark:text-slate-500">5 temas disponibles</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {(Object.keys(THEMES) as ThemeId[]).map(id => {
                    const opt = THEMES[id];
                    const isSelected = theme === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTheme(id)}
                        title={opt.name}
                        className={`h-9 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                          isSelected ? 'border-2 scale-102 shadow-md font-bold' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          borderColor: isSelected ? opt.primaryColor : 'var(--border-color)'
                        }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: opt.primaryColor }} />
                        <span className="text-[9px] font-mono uppercase text-slate-600 dark:text-slate-400">{id.slice(0, 3)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grilla de Acciones y Herramientas (2 Columnas x 4 Filas = 8 items) */}
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    setCalendarOpen(true);
                  }}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-800 dark:text-slate-200 font-semibold hover:bg-[var(--bg-base)] transition-colors min-h-[46px] shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 text-left">
                    <CalendarDays className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span className="text-xs leading-tight truncate">Calendario</span>
                  </div>
                  {stats.metasCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-bold text-[9px] shrink-0 ml-1">
                      {stats.metasCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    setElectivasOpen(true);
                  }}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-800 dark:text-slate-200 font-semibold hover:bg-[var(--bg-base)] transition-colors min-h-[46px] shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 text-left">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="text-xs leading-tight truncate">Electivas</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-900 dark:text-amber-300 font-bold text-[9px] shrink-0 ml-1">
                    {stats.horasElectivasAprobadas}/20hs
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenTitles();
                  }}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-800 dark:text-slate-200 font-semibold hover:bg-[var(--bg-base)] transition-colors min-h-[46px] shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 text-left">
                    <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="text-xs leading-tight truncate">Títulos</span>
                  </div>
                  <span className="text-[10px] font-bold shrink-0 ml-1" style={{ color: 'var(--color-primary)' }}>
                    {stats.adusiProgreso}%
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    setReportOpen(true);
                  }}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-800 dark:text-slate-200 font-semibold hover:bg-[var(--bg-base)] transition-colors min-h-[46px] shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 text-left">
                    <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="text-xs leading-tight truncate">Ficha PDF</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    setStatsModalOpen(true);
                  }}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-800 dark:text-slate-200 font-semibold hover:bg-[var(--bg-base)] transition-colors min-h-[46px] shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 text-left">
                    <BarChart3 className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
                    <span className="text-xs leading-tight truncate">Estadísticas</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    setShareModalOpen(true);
                  }}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-800 dark:text-slate-200 font-semibold hover:bg-[var(--bg-base)] transition-colors min-h-[46px] shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 text-left">
                    <Share2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span className="text-xs leading-tight truncate">Compartir</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenHelp();
                  }}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-slate-800 dark:text-slate-200 font-semibold hover:bg-[var(--bg-base)] transition-colors min-h-[46px] shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 text-left">
                    <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-xs leading-tight truncate">Guía</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {/* Botón de Reiniciar Progreso integrado */}
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    if (confirmReset) setMobileDrawerOpen(false);
                  }}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border text-xs font-mono transition-all min-h-[46px] shadow-xs ${
                    confirmReset
                      ? 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 font-bold animate-pulse'
                      : 'border-slate-300 dark:border-slate-800 bg-[var(--bg-elevated)] text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 text-left">
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <span className="text-xs leading-tight truncate">
                      {confirmReset ? '¿Confirmar?' : 'Reiniciar'}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-rose-500 shrink-0 ml-1">
                    {confirmReset ? 'SÍ' : 'Reset'}
                  </span>
                </button>
              </div>
            </div>

            {/* Pestaña táctil inferior */}
            <div 
              className="py-2.5 flex items-center justify-center bg-[var(--bg-surface)] border-t border-[var(--border-color)] shrink-0 cursor-pointer"
              onClick={() => setMobileDrawerOpen(false)}
              title="Tocar para cerrar menú"
            >
              <div className="w-12 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
