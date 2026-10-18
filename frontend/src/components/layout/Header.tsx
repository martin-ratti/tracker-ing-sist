import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTracker } from '../../context/TrackerContext';
import { useAuth } from '../../context/AuthContext';
import { ThemeSelector } from './ThemeSelector';
import { MobileElectivasView } from '../views/MobileElectivasView';
import { useHistoryBack } from '../../hooks/useHistoryBack';
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
  ChevronRight,
  ExternalLink,
  FolderOpen
} from 'lucide-react';
import { useTheme, THEMES, type ThemeId } from '../../context/ThemeContext';
import { formatPromedio } from '../../utils/formatters';
import { DRIVE_ROOT_URL } from '../../data/driveLinks';

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
    perfil,
    resetAll,
    mobileDrawerOpen,
    mobileDrawerView,
    closeMobileDrawer
  } = useTracker();

  const { user, openAuthModal, logout } = useAuth();
  const { theme, setTheme, colorMode, toggleColorMode } = useTheme();

  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerView, setDrawerView] = useState<'menu' | 'electivas'>('menu');
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDrawer = (view: 'menu' | 'electivas' = 'menu') => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setDrawerView(view);
    setDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDrawerVisible(true);
      });
    });
  };

  const closeDrawer = useCallback((callback?: () => void) => {
    setDrawerVisible(false);
    closeMobileDrawer();
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setDrawerMounted(false);
      setDrawerView('menu');
      closeTimeoutRef.current = null;
      if (callback) callback();
    }, 280);
  }, [closeMobileDrawer]);

  // Sincronizar apertura del drawer disparada desde BottomNav o contexto global
  useEffect(() => {
    if (mobileDrawerOpen) {
      const timer = setTimeout(() => {
        openDrawer(mobileDrawerView);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mobileDrawerOpen, mobileDrawerView]);

  // En móvil, si se intenta abrir electivas desde otro lugar, abrir directamente en el drawer
  useEffect(() => {
    if (electivasOpen && typeof window !== 'undefined' && window.innerWidth < 768) {
      const timer = setTimeout(() => {
        openDrawer('electivas');
        setElectivasOpen(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [electivasOpen, setElectivasOpen]);

  // Botón "Atrás" del celular: cierra el drawer móvil si está abierto
  useHistoryBack(drawerMounted, () => closeDrawer());

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
    if (drawerMounted) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeDrawer();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [drawerMounted, closeDrawer]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  return (
    <header className="bg-(--bg-surface)/95 backdrop-blur-md border-b border-(--border-color) sticky top-0 z-30 px-3 sm:px-8 xl:px-12 py-2 sm:py-3 w-full shrink-0">
      {/* Barra superior con título y controles */}
      <div className="w-full flex flex-col md:flex-row flex-wrap xl:flex-nowrap items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Identidad y Título */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-black font-extrabold font-syne text-xs sm:text-base tracking-wider shadow-md shrink-0"
              style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 0 12px var(--color-primary-glow)' }}
            >
              ISI
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="font-syne font-extrabold text-[13px] sm:text-base md:text-lg text-(--text-body) tracking-tight sm:tracking-wide truncate">
                UTN SISTEMAS
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span 
                  className="text-[9px] sm:text-[10px] uppercase font-mono px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded border transition-colors shrink-0"
                  style={{ 
                    backgroundColor: 'var(--color-primary-bg)', 
                    borderColor: 'var(--color-primary-border)', 
                    color: 'var(--color-primary)' 
                  }}
                >
                  Plan 2023 · FRRo
                </span>
                {/* Subtítulo visible exclusivamente en PC de pantalla ancha para evitar colisiones en pantallas intermedias */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden xl:block whitespace-nowrap truncate">
                  · Tracker Pro de Correlativas y Avance Académico
                </p>
              </div>
            </div>
          </div>

          {/* Botones rápidos en móvil (Top-right) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 md:hidden">
            {/* Acceso Directo Google Drive UTN en móvil */}
            <a
              href={DRIVE_ROOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 rounded-xl bg-(--bg-elevated) border border-(--border-color) hover:border-cyan-500/50 text-cyan-600 dark:text-cyan-400 transition-colors min-w-8.5 min-h-8.5 sm:min-w-9.5 sm:min-h-9.5 flex items-center justify-center"
              title="Abrir carpeta general de Google Drive (apuntes, exámenes y resúmenes)"
              aria-label="Abrir Drive de UTN Sistemas"
            >
              <FolderOpen className="w-4 h-4" />
            </a>

            {/* Modo Claro / Oscuro */}
            <button
              type="button"
              onClick={toggleColorMode}
              className="p-1.5 sm:p-2 rounded-xl bg-(--bg-elevated) border border-(--border-color) text-xs hover:bg-(--bg-base) transition-colors min-w-8.5 min-h-8.5 sm:min-w-9.5 sm:min-h-9.5 flex items-center justify-center"
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
                onClick={() => openDrawer()}
                className="relative p-1.5 sm:p-2 rounded-xl bg-(--bg-elevated) border border-(--border-color) hover:border-slate-400 text-xs font-mono min-w-8.5 min-h-8.5 sm:min-w-9.5 sm:min-h-9.5 flex items-center justify-center transition-colors"
                title={`Sesión iniciada como ${user.email}. Toca para abrir menú.`}
                aria-label={`Sesión activa: ${user.email}`}
              >
                <UserIcon className="w-4 h-4 text-indigo-400" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="p-1.5 sm:p-2 rounded-xl border text-xs font-mono font-bold transition-all min-w-8.5 min-h-8.5 sm:min-w-9.5 sm:min-h-9.5 flex items-center justify-center shadow-xs"
                style={{ 
                  backgroundColor: 'var(--color-primary-bg)', 
                  borderColor: 'var(--color-primary-border)', 
                  color: 'var(--color-primary)' 
                }}
                title="Sincronizar avance en la nube"
                aria-label="Sincronizar avance en la nube"
              >
                <Cloud className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>


        {/* Indicadores en vivo en desktop: Contadores en modo Grafo + Promedio y Próxima Meta */}
        {(viewMode === 'grafo' || stats.promedioConAplazos !== null || stats.proximaMeta) && (
          <div className="hidden md:flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 justify-center">
            {/* Contadores de materias visibles en modo Grafo (en Malla ya figuran en los filtros interactivos) */}
            {viewMode === 'grafo' && (
              <div className="flex items-center gap-2">
                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm transition-all"
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
                      className="font-extrabold text-xs leading-none"
                      style={{ color: 'var(--color-aprobada)' }}
                    >
                      {stats.aprobadasCount}
                    </div>
                    <div className="text-[9px] text-slate-800 dark:text-slate-200 uppercase leading-tight font-bold">Aprobadas</div>
                  </div>
                </div>

                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm transition-all"
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
                      className="font-extrabold text-xs leading-none"
                      style={{ color: 'var(--color-regular)' }}
                    >
                      {stats.regularesCount}
                    </div>
                    <div className="text-[9px] text-slate-800 dark:text-slate-200 uppercase leading-tight font-bold">Regulares</div>
                  </div>
                </div>

                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-sm transition-all"
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
                      className="font-extrabold text-xs leading-none"
                      style={{ color: 'var(--color-cursable)' }}
                    >
                      {stats.cursablesCount}
                    </div>
                    <div className="text-[9px] text-slate-800 dark:text-slate-200 uppercase leading-tight font-bold">Cursables</div>
                  </div>
                </div>
              </div>
            )}

            {stats.promedioConAplazos !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/30 shadow-sm">
                <Award className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                <div className="text-left font-mono">
                  <div className="text-purple-900 dark:text-purple-300 font-extrabold text-xs sm:text-sm leading-none">
                    {formatPromedio(stats.promedioSinAplazos !== null ? stats.promedioSinAplazos : stats.promedioConAplazos)}
                  </div>
                  <div 
                    className="text-[10px] text-purple-900 dark:text-purple-300 uppercase leading-tight font-bold cursor-help"
                    title={`Con aplazos: ${formatPromedio(stats.promedioConAplazos)} · Sin aplazos: ${formatPromedio(stats.promedioSinAplazos)}`}
                  >
                    {stats.promedioSinAplazos !== null ? 'Prom. s/aplazos' : 'Promedio'}
                  </div>
                </div>
              </div>
            )}

            {stats.proximaMeta && (
              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm transition-all text-left ${
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
                  <div className="text-[10px] truncate max-w-24 leading-tight font-medium opacity-85">
                    {stats.proximaMeta.materiaNombreCorto}
                  </div>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Acciones de usuario y personalización (superior derecha) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Botón Acceso Directo Google Drive UTN */}
          <a
            href={DRIVE_ROOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] group"
            style={{ 
              backgroundColor: 'var(--color-primary-bg)', 
              borderColor: 'var(--color-primary-border)', 
              color: 'var(--color-primary)' 
            }}
            title="Abrir carpeta general de Google Drive (exámenes, apuntes y resúmenes de UTN)"
            aria-label="Abrir Drive de UTN Sistemas"
          >
            <FolderOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Drive UTN</span>
            <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>

          <div className="h-4 w-px bg-(--border-color) mx-0.5" />

          {/* Perfil del Alumno */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--bg-elevated) border border-(--border-color) hover:border-slate-400 dark:hover:border-slate-700 text-(--text-body) font-mono text-xs transition-colors shadow-sm"
            title="Configurar nombre y legajo universitario del alumno"
          >
            <UserIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="max-w-30 truncate">
              {perfil.nombre || 'Perfil'}
            </span>
          </button>

          <ThemeSelector />

          {/* Botón rápido modo claro/oscuro */}
          <button
            type="button"
            onClick={toggleColorMode}
            className="p-1.5 rounded-lg bg-(--bg-elevated) border border-(--border-color) text-(--text-body) hover:border-slate-500 transition-colors"
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
            <div className="flex items-center gap-1 bg-(--bg-elevated) border border-(--border-color) rounded-lg py-1 px-2.5 font-mono text-xs shadow-sm">
              <div className="flex items-center gap-1.5 text-(--text-body) text-[11px]" title={`Sesión activa: ${user.email}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                <span className="max-w-27.5 truncate font-medium">{user.email.split('@')[0]}</span>
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

      {/* Sub-barra exclusiva para móviles: compacta, con barra de avance visible y contadores en modo Grafo */}
      <div className="flex md:hidden flex-col gap-1.5 mt-2 pt-2 border-t border-(--border-color) w-full">

        {/* Si está en modo Grafo en móvil: selector de correlativas y contadores */}
        {viewMode === 'grafo' && (
          <div className="space-y-1.5 mb-1">
            <div className="flex items-center justify-between bg-(--bg-elevated) p-1 rounded-xl border border-(--border-color) text-xs font-mono">
              <button
                type="button"
                onClick={() => setEdgeMode('ambos')}
                className={`flex-1 py-1 rounded-lg text-center transition-colors text-[11px] ${
                  edgeMode === 'ambos' ? 'bg-(--bg-surface) font-bold shadow-sm border border-(--border-color)' : 'text-slate-600 dark:text-slate-400'
                }`}
                style={edgeMode === 'ambos' ? { color: 'var(--color-primary)' } : {}}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setEdgeMode('regular')}
                className={`flex-1 py-1 rounded-lg text-center transition-colors text-[11px] ${
                  edgeMode === 'regular' ? 'font-bold shadow-sm border border-(--color-cursable-border)' : 'text-slate-600 dark:text-slate-400'
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
                className={`flex-1 py-1 rounded-lg text-center transition-colors text-[11px] ${
                  edgeMode === 'aprobada' ? 'font-bold shadow-sm border border-(--color-regular-border)' : 'text-slate-600 dark:text-slate-400'
                }`}
                style={edgeMode === 'aprobada' ? {
                  backgroundColor: 'var(--color-regular-bg)',
                  color: 'var(--color-regular)'
                } : {}}
              >
                Para Rendir
              </button>
            </div>

            {/* Contadores de materias en modo Grafo móvil */}
            <div className="flex items-center justify-around px-2 text-[10px] font-mono">
              <span style={{ color: 'var(--color-aprobada)' }} className="font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-aprobada)' }} />
                Apr: {stats.aprobadasCount}
              </span>
              <span style={{ color: 'var(--color-regular)' }} className="font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-regular)' }} />
                Reg: {stats.regularesCount}
              </span>
              <span style={{ color: 'var(--color-cursable)' }} className="font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-cursable)' }} />
                Cur: {stats.cursablesCount}
              </span>
            </div>
          </div>
        )}

        {/* Barra de Avance y Meta en móvil (con barra de progreso grande en todo el ancho) */}
        <div className="flex flex-col gap-1 w-full py-0.5">
          <div className="flex items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-[11px] shrink-0">
              <span className="text-slate-500 font-medium">Avance:</span>
              <span className="font-bold font-syne text-(--text-body)">
                {stats.aprobadasCount}/{stats.totalTroncales}
              </span>
              <span className="font-semibold text-[10px]" style={{ color: 'var(--color-primary)' }}>
                ({stats.porcentajeCarrera}%)
              </span>
            </div>

            {/* Próxima meta o Promedio en móvil */}
            {stats.proximaMeta ? (
              <button
                type="button"
                onClick={() => setCalendarOpen(true)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-mono transition-all truncate max-w-[55%] shrink-0 ${
                  stats.proximaMeta.urgencia === 'urgente'
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-800 dark:text-rose-300 font-bold animate-pulse'
                    : stats.proximaMeta.urgencia === 'proxima'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-800 dark:text-amber-300 font-semibold'
                    : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-800 dark:text-cyan-300 font-medium'
                }`}
                title={`Meta: ${stats.proximaMeta.materiaNombre}. Clic para abrir calendario.`}
              >
                <Clock className="w-3 h-3 shrink-0" />
                <span className="truncate">🎯 {stats.proximaMeta.materiaNombreCorto}</span>
                <span className="font-bold shrink-0">{stats.proximaMeta.diasFaltantes === 0 ? '¡Hoy!' : `${stats.proximaMeta.diasFaltantes}d`}</span>
              </button>
            ) : stats.promedioConAplazos !== null ? (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300">
                <Award className="w-3 h-3" />
                <span>Prom: {formatPromedio(stats.promedioSinAplazos !== null ? stats.promedioSinAplazos : stats.promedioConAplazos)}</span>
              </div>
            ) : null}
          </div>

          {/* Barra de progreso ancha y visible en todo el ancho de mobile */}
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 border border-(--border-color) overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats.porcentajeCarrera}%`,
                background: 'var(--gradient-primary)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Sub-barra Desktop: Selector de Vistas, Filtros de Correlativas, % de Avance y Botones de Acción */}
      <div className="hidden md:flex w-full mt-3 pt-2.5 border-t border-(--border-color) flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Bloque Izquierdo: Vistas, Filtro de Correlativas y % de Carrera */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
          {/* Selector de vistas: Grafo vs Malla */}
          <div className="flex items-center gap-1 bg-(--bg-elevated) p-1 rounded-lg border border-(--border-color)">
            <button
              onClick={() => setViewMode('grafo')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'grafo' ? 'border font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-(--text-body)'
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
                viewMode === 'malla' ? 'border font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-(--text-body)'
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
              <div className="flex items-center bg-(--bg-elevated) p-1 rounded-lg border border-(--border-color)">
                <button
                  onClick={() => setEdgeMode('ambos')}
                  className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                    edgeMode === 'ambos' ? 'bg-(--bg-surface) font-extrabold shadow-sm border border-(--border-color)' : 'text-slate-700 dark:text-slate-300 hover:text-(--text-body) font-medium'
                  }`}
                  style={edgeMode === 'ambos' ? { color: 'var(--color-primary)' } : {}}
                >
                  Todas
                </button>
                <button
                  onClick={() => setEdgeMode('regular')}
                  className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                    edgeMode === 'regular' ? 'font-extrabold shadow-sm border border-(--color-cursable-border)' : 'text-slate-700 dark:text-slate-300 hover:text-(--text-body) font-medium'
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
                    edgeMode === 'aprobada' ? 'font-extrabold shadow-sm border border-(--color-regular-border)' : 'text-slate-700 dark:text-slate-300 hover:text-(--text-body) font-medium'
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
          <div className="flex items-center gap-3 px-3.5 py-1.5 bg-(--bg-elevated) rounded-xl border border-(--border-color) shadow-inner">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
              <span>Avance:</span>
              <span className="text-(--text-body) font-bold">
                {stats.aprobadasCount} / {stats.totalTroncales} materias
              </span>
            </div>
            <div className="w-36 sm:w-56 md:w-72 lg:w-85 xl:w-115 2xl:w-140 h-2.5 sm:h-3 rounded-full bg-slate-200 dark:bg-slate-950/90 overflow-hidden border border-slate-300 dark:border-slate-700/60 p-0.5 relative shadow-inner">
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
              className="font-bold text-xs sm:text-sm min-w-11.5 text-right font-syne"
              style={{ color: 'var(--color-primary)' }}
            >
              {stats.porcentajeCarrera}%
            </span>
          </div>
        </div>

        {/* Bloque Derecho: Módulos Académicos, Reportes, Leyenda y Sistema */}
        <div className="flex items-center gap-2.5 flex-wrap ml-auto">
          {/* Módulo Académico (Calendario, Electivas, Títulos) */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-(--bg-elevated) border border-(--border-color) shadow-xs">
            {/* Botón Calendario Oficial y Metas */}
            <button
              onClick={() => setCalendarOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-all shadow-sm ${
                stats.metasCount > 0
                  ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-900 dark:text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-(--bg-surface) border-(--border-color) text-slate-800 dark:text-slate-200 font-semibold hover:border-slate-400 dark:hover:border-slate-700 hover:text-(--text-body)'
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

            {/* Botón Electivas */}
            <button
              onClick={() => setElectivasOpen(!electivasOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-all shadow-sm ${
                electivasOpen
                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-900 dark:text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-(--bg-surface) border-(--border-color) text-slate-800 dark:text-slate-200 font-semibold hover:border-slate-400 dark:hover:border-slate-700 hover:text-(--text-body)'
              }`}
              title="Panel de Materias Electivas y cálculo de horas"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Electivas</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[10px] text-amber-900 dark:text-amber-300 font-bold whitespace-nowrap">
                {stats.horasElectivasAprobadas} / 20 hs
              </span>
            </button>

            {/* Botón Títulos */}
            <button
              onClick={onOpenTitles}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-(--bg-surface) border border-(--border-color) text-slate-800 dark:text-slate-200 font-semibold hover:border-slate-400 dark:hover:border-slate-700 hover:text-(--text-body) font-mono text-[11px] transition-colors shadow-sm"
              title="Requisitos para Título Intermedio ADUSI e Ingeniería"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
              <span>Títulos</span>
              {stats.adusiCumplido && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" title="ADUSI alcanzado" />
              )}
            </button>
          </div>

          <div className="h-4 w-px bg-(--border-color) hidden md:block" />

          {/* Módulo de Reportes & Compartir (Ficha PDF, Estadísticas, Compartir) */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-(--bg-elevated) border border-(--border-color) shadow-xs">
            {/* Botón Ficha Analítica / Reporte PDF */}
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-(--bg-surface) border border-(--border-color) text-slate-800 dark:text-slate-200 font-semibold hover:border-slate-400 dark:hover:border-slate-700 hover:text-(--text-body) font-mono text-[11px] transition-colors shadow-sm"
              title="Descargar o imprimir ficha analítica oficial en PDF"
            >
              <FileText className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
              <span>Ficha PDF</span>
            </button>

            {/* Botón Estadísticas */}
            <button
              onClick={() => setStatsModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-(--bg-surface) border border-(--border-color) text-slate-800 dark:text-slate-200 font-semibold hover:border-slate-400 dark:hover:border-slate-700 hover:text-(--text-body) font-mono text-[11px] transition-colors shadow-sm"
              title="Dashboard de Estadísticas Avanzadas"
            >
              <BarChart3 className="w-3.5 h-3.5 text-pink-700 dark:text-pink-400" />
              <span>Estadísticas</span>
            </button>

            {/* Botón Compartir */}
            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-(--bg-surface) border border-(--border-color) text-slate-800 dark:text-slate-200 font-semibold hover:border-slate-400 dark:hover:border-slate-700 hover:text-(--text-body) font-mono text-[11px] transition-colors shadow-sm"
              title="Generar enlace compartible de tu progreso"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
              <span>Compartir</span>
            </button>
          </div>

          <div className="h-4 w-px bg-(--border-color) hidden md:block" />

          {/* Ayuda y Reset */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenHelp}
              className="text-slate-500 dark:text-slate-400 hover:text-(--text-body) hover:bg-(--bg-elevated) p-1 rounded transition-colors"
              title="Ayuda y atajos"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all ${
                confirmReset 
                  ? 'bg-rose-500/30 border border-rose-500 text-rose-700 dark:text-rose-300 animate-pulse font-bold' 
                  : 'text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-(--bg-elevated)'
              }`}
              title="Reiniciar todos los estados a pendiente"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{confirmReset ? '¿Confirmar?' : 'Reiniciar'}</span>
            </button>
            {confirmReset && (
              <button
                onClick={handleCancelReset}
                className="p-1 rounded text-slate-500 hover:text-(--text-body) transition-colors"
                title="Cancelar reinicio"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drawer Móvil Lateral Tipo Carrito con Animación de Apertura y Cierre */}
      {drawerMounted && createPortal(
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
          {/* Fondo izquierdo difuminado sobre la pantalla actual (tocar aquí cierra el menú con animación suave) */}
          <div 
            className={`absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300 ease-out ${
              drawerVisible ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
            onClick={() => closeDrawer()}
          />

          {/* Panel Lateral que entra y sale de derecha a izquierda por encima de la pantalla */}
          <div className="fixed inset-y-0 right-0 h-dvh max-w-full flex pointer-events-none">
            <div 
              className={`w-[86vw] sm:w-[68vw] max-w-sm bg-(--bg-surface) border-l border-(--border-color) shadow-[-20px_0_50px_rgba(0,0,0,0.65)] flex flex-col h-dvh overflow-hidden pointer-events-auto transform transition-transform duration-300 ease-out ${
                drawerVisible ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              {drawerView === 'electivas' ? (
                <MobileElectivasView
                  onBack={() => setDrawerView('menu')}
                  onClose={() => closeDrawer()}
                />
              ) : (
                <>
                  {/* Header del Panel (Fijo) */}
                  <div className="flex items-center justify-between p-4 border-b border-(--border-color) bg-(--bg-elevated) shrink-0">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-black font-extrabold font-syne text-sm shadow-md"
                    style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 0 10px var(--color-primary-glow)' }}
                  >
                    ISI
                  </div>
                  <div>
                    <h3 className="font-syne font-bold text-sm text-(--text-body) leading-tight">Menú Académico</h3>
                    <p className="text-[10px] font-mono text-slate-500">Plan 2023 · UTN FRRo</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => closeDrawer()}
                  aria-label="Cerrar menú"
                  className="p-2 rounded-xl text-slate-400 hover:text-(--text-body) hover:bg-(--bg-surface) transition-colors min-w-9.5 min-h-9.5 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cuerpo del Panel con scroll táctil sin scrollbar tosca */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar overscroll-contain flex flex-col safe-bottom">
                {/* 1. Tarjeta de Usuario & Nube Firebase */}
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {/* Tarjeta de Perfil */}
                  <div className="p-2.5 rounded-2xl bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between gap-1.5 shadow-sm min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-syne font-bold text-[11px] text-(--text-body) truncate">
                          {perfil.nombre || 'Estudiante'}
                        </div>
                        <div className="text-[9px] text-slate-500 truncate">
                          {perfil.legajo ? `Leg: ${perfil.legajo}` : 'Sin legajo'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => closeDrawer(() => setProfileModalOpen(true))}
                      className="px-2 py-1 rounded-lg text-[9px] font-bold bg-(--bg-surface) border border-(--border-color) text-slate-700 dark:text-slate-300 hover:text-(--text-body) shrink-0 shadow-xs"
                    >
                      Editar
                    </button>
                  </div>

                  {/* Sincronización Nube */}
                  <div className="p-2.5 rounded-2xl bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between gap-1 shadow-sm min-w-0">
                    <div className="min-w-0">
                      <div className="text-[9px] uppercase font-bold text-slate-500 truncate">Nube Firebase</div>
                      {user ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          {user.email?.split('@')[0]}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">Offline</span>
                      )}
                    </div>
                    {user ? (
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          closeDrawer();
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Cerrar sesión"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => closeDrawer(() => openAuthModal())}
                        className="px-2.5 py-1 rounded-lg text-[9px] font-bold border shrink-0 shadow-xs"
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

                {/* 2. Mini-Dashboard de Progreso Académico */}
                <div className="p-3 rounded-2xl bg-(--bg-elevated) border border-(--border-color) shadow-sm">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wide">
                      Progreso de Carrera
                    </span>
                    <span className="font-bold text-xs font-syne" style={{ color: 'var(--color-primary)' }}>
                      {stats.porcentajeCarrera}% ({stats.aprobadasCount}/{stats.totalTroncales})
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-900 border border-(--border-color) overflow-hidden mb-2.5">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stats.porcentajeCarrera}%`, 
                        background: 'var(--gradient-primary)' 
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                    <div 
                      className="p-1.5 rounded-xl border shadow-xs"
                      style={{ 
                        backgroundColor: 'var(--color-aprobada-bg)', 
                        borderColor: 'var(--color-aprobada-border)' 
                      }}
                    >
                      <span className="block text-[8px] uppercase font-bold text-slate-600 dark:text-slate-400">Aprobadas</span>
                      <span className="text-xs font-extrabold" style={{ color: 'var(--color-aprobada)' }}>
                        {stats.aprobadasCount}
                      </span>
                    </div>

                    <div 
                      className="p-1.5 rounded-xl border shadow-xs"
                      style={{ 
                        backgroundColor: 'var(--color-regular-bg)', 
                        borderColor: 'var(--color-regular-border)' 
                      }}
                    >
                      <span className="block text-[8px] uppercase font-bold text-slate-600 dark:text-slate-400">Regulares</span>
                      <span className="text-xs font-extrabold" style={{ color: 'var(--color-regular)' }}>
                        {stats.regularesCount}
                      </span>
                    </div>

                    <div className="p-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 shadow-xs">
                      <span className="block text-[8px] uppercase font-bold text-purple-800 dark:text-purple-300">Promedio</span>
                      <span className="text-xs font-extrabold text-purple-900 dark:text-purple-200">
                        {formatPromedio(stats.promedioSinAplazos !== null ? stats.promedioSinAplazos : stats.promedioConAplazos)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Selector de Paleta Cromática */}
                <div>
                  <div className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between px-0.5">
                    <span>Tema Visual</span>
                    <span className="text-[9px] font-normal text-slate-400 dark:text-slate-500">5 opciones</span>
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
                          className={`h-8 rounded-xl border flex items-center justify-center gap-1 transition-all ${
                            isSelected ? 'border-2 scale-102 shadow-md font-bold' : 'opacity-70 hover:opacity-100 hover:scale-101'
                          }`}
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: isSelected ? opt.primaryColor : 'var(--border-color)'
                          }}
                        >
                          <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: opt.primaryColor }} />
                          <span className="text-[9px] font-mono uppercase text-slate-700 dark:text-slate-300">{id.slice(0, 3)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Lista de Herramientas y Módulos con Distribución Espaciosa */}
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 px-0.5 pt-1">
                    Módulos y Utilidades
                  </div>

                  {/* Google Drive UTN */}
                  <a
                    href={DRIVE_ROOT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-(--bg-elevated) border border-cyan-500/30 text-slate-800 dark:text-slate-200 hover:border-cyan-500/60 hover:bg-cyan-500/5 transition-all min-h-12.5 shadow-xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 text-left">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold font-syne text-(--text-body) truncate flex items-center gap-1.5">
                          <span>Drive UTN Sistemas</span>
                          <ExternalLink className="w-3 h-3 text-cyan-500" />
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">
                          Finales, parciales y resúmenes compartidos
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                  </a>

                  {/* Títulos */}
                  <button
                    type="button"
                    onClick={() => closeDrawer(() => onOpenTitles())}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-(--bg-elevated) border border-(--border-color) text-slate-800 dark:text-slate-200 hover:border-(--color-primary-border) hover:bg-(--bg-base) transition-all min-h-12.5 shadow-xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 text-left">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold font-syne text-(--text-body) truncate">Títulos y Certificaciones</div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">ADUSI y Analista Universitario</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 font-mono font-bold text-[9px]" style={{ color: 'var(--color-primary)' }}>
                        {stats.adusiProgreso}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* Ficha PDF */}
                  <button
                    type="button"
                    onClick={() => closeDrawer(() => setReportOpen(true))}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-(--bg-elevated) border border-(--border-color) text-slate-800 dark:text-slate-200 hover:border-(--color-primary-border) hover:bg-(--bg-base) transition-all min-h-12.5 shadow-xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 text-left">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-purple-500/15 text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold font-syne text-(--text-body) truncate">Ficha Académica PDF</div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">Reporte imprimible en formato A4</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                  </button>

                  {/* Estadísticas */}
                  <button
                    type="button"
                    onClick={() => closeDrawer(() => setStatsModalOpen(true))}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-(--bg-elevated) border border-(--border-color) text-slate-800 dark:text-slate-200 hover:border-(--color-primary-border) hover:bg-(--bg-base) transition-all min-h-12.5 shadow-xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 text-left">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-pink-500/15 text-pink-600 dark:text-pink-400 shrink-0 group-hover:scale-105 transition-transform">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold font-syne text-(--text-body) truncate">Estadísticas y Métricas</div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">Rendimiento, curvas y promedios</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                  </button>

                  {/* Compartir */}
                  <button
                    type="button"
                    onClick={() => closeDrawer(() => setShareModalOpen(true))}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-(--bg-elevated) border border-(--border-color) text-slate-800 dark:text-slate-200 hover:border-(--color-primary-border) hover:bg-(--bg-base) transition-all min-h-12.5 shadow-xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 text-left">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-sky-500/15 text-sky-600 dark:text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold font-syne text-(--text-body) truncate">Compartir Progreso</div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">Exportar o respaldar tus datos</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                  </button>

                  {/* Guía */}
                  <button
                    type="button"
                    onClick={() => closeDrawer(() => onOpenHelp())}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-(--bg-elevated) border border-(--border-color) text-slate-800 dark:text-slate-200 hover:border-(--color-primary-border) hover:bg-(--bg-base) transition-all min-h-12.5 shadow-xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 text-left">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-500/15 text-slate-600 dark:text-slate-400 shrink-0 group-hover:scale-105 transition-transform">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold font-syne text-(--text-body) truncate">Guía del Plan 2023</div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">Reglamento, correlativas y ordenanza</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                  </button>
                </div>

                {/* 5. Zona Inferior de Reinicio */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleReset();
                      if (confirmReset) closeDrawer();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-mono transition-all min-h-12 shadow-xs ${
                      confirmReset
                        ? 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 font-bold animate-pulse'
                        : 'border-slate-300 dark:border-slate-800 bg-(--bg-elevated) text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 text-left">
                      <RotateCcw className="w-4 h-4 shrink-0" />
                      <span className="text-xs leading-tight truncate">
                        {confirmReset ? '¿Confirmar reinicio total?' : 'Reiniciar Progreso'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-500 shrink-0 ml-2 px-2 py-0.5 rounded bg-rose-500/10">
                      {confirmReset ? 'TOCAR PARA BORRAR' : 'Reset'}
                    </span>
                  </button>
                </div>

                {/* Pie Institucional y Créditos */}
                <div className="text-center pt-1 pb-2 space-y-1">
                  <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                    UTN FRRo · Ingeniería en Sistemas de Información
                  </p>
                  <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                    Inspirado en{' '}
                    <a
                      href="https://tracker-plan-de-estudio.vercel.app/index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-(--color-primary) hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Lucas Alonso</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
