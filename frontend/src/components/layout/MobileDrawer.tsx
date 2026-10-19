import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTracker } from '../../context/TrackerContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme, THEMES, type ThemeId } from '../../context/ThemeContext';
import { MobileElectivasView } from '../views/MobileElectivasView';
import { useHistoryBack } from '../../hooks/useHistoryBack';
import { formatPromedio } from '../../utils/formatters';
import { DRIVE_ROOT_URL } from '../../data/driveLinks';
import {
  X,
  LogOut,
  User as UserIcon,
  ChevronRight,
  ExternalLink,
  FolderOpen,
  GraduationCap,
  FileText,
  BarChart3,
  Share2,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

interface MobileDrawerProps {
  onOpenTitles: () => void;
  onOpenHelp: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ onOpenTitles, onOpenHelp }) => {
  const {
    stats,
    setReportOpen,
    setProfileModalOpen,
    setStatsModalOpen,
    setShareModalOpen,
    perfil,
    resetAll,
    mobileDrawerOpen,
    mobileDrawerView,
    closeMobileDrawer,
    electivasOpen,
    setElectivasOpen
  } = useTracker();

  const { user, openAuthModal, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerView, setDrawerView] = useState<'menu' | 'electivas'>('menu');
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDrawer = useCallback((view: 'menu' | 'electivas' = 'menu') => {
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
  }, []);

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
  }, [mobileDrawerOpen, mobileDrawerView, openDrawer]);

  // En móvil, si se intenta abrir electivas desde otro lugar, abrir directamente en el drawer
  useEffect(() => {
    if (electivasOpen && typeof window !== 'undefined' && window.innerWidth < 768) {
      const timer = setTimeout(() => {
        openDrawer('electivas');
        setElectivasOpen(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [electivasOpen, setElectivasOpen, openDrawer]);

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

  if (!drawerMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
      {/* Fondo izquierdo difuminado sobre la pantalla actual */}
      <div
        className={`absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          drawerVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
        onClick={() => closeDrawer()}
      />

      {/* Panel Lateral */}
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

              {/* Cuerpo del Panel */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar overscroll-contain flex flex-col safe-bottom">
                {/* 1. Tarjeta de Usuario & Nube */}
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

                {/* 4. Lista de Herramientas y Módulos */}
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
                        <div className="text-[10px] font-mono text-slate-500 truncate">Descarga directa en formato PDF</div>
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
  );
};
