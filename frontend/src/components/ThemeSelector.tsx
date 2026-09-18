import React, { useState, useRef, useEffect } from 'react';
import type { ThemeId } from '../context/ThemeContext';
import { useTheme, THEMES } from '../context/ThemeContext';
import { Palette, Sun, Moon } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, colorMode, setColorMode } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Cambiar tema visual"
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-body)] hover:border-slate-500 font-mono text-xs transition-colors"
        title="Cambiar paleta cromática y modo claro/oscuro"
      >
        <Palette className="w-3.5 h-3.5" style={{ color: THEMES[theme].primaryColor }} />
        <span className="hidden sm:inline text-[11px]">{THEMES[theme].name.split(' ')[0]}</span>
      </button>

      {open && (
        <div 
          role="menu"
          className="absolute right-0 mt-2 w-52 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl p-2 z-50 font-mono text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Selector de Modo Global (Oscuro / Claro) */}
          <div className="mb-2 pb-2 border-b border-[var(--border-color)]">
            <div className="px-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
              Modo Global
            </div>
            <div className="grid grid-cols-2 gap-1 bg-[var(--bg-base)] p-1 rounded-lg border border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setColorMode('dark')}
                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[11px] font-medium transition-all ${
                  colorMode === 'dark'
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>Oscuro</span>
              </button>
              <button
                type="button"
                onClick={() => setColorMode('light')}
                className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[11px] font-medium transition-all ${
                  colorMode === 'light'
                    ? 'bg-white text-slate-900 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Claro</span>
              </button>
            </div>
          </div>

          {/* Listado de Paletas de Color */}
          <div className="px-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            Paleta de Acento
          </div>
          {(Object.keys(THEMES) as ThemeId[]).map(id => {
            const opt = THEMES[id];
            const isSelected = theme === id;
            return (
              <button
                key={id}
                role="menuitem"
                onClick={() => {
                  setTheme(id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-body)] font-bold border border-[var(--border-color)]'
                    : 'text-slate-400 hover:text-[var(--text-body)] hover:bg-[var(--bg-elevated)]/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: opt.primaryColor }}
                  />
                  <span>{opt.name}</span>
                </div>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: opt.primaryColor }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
