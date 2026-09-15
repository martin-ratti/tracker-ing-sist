import React, { useState, useRef, useEffect } from 'react';
import type { ThemeId } from '../context/ThemeContext';
import { useTheme, THEMES } from '../context/ThemeContext';
import { Palette } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
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
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white font-mono text-xs transition-colors"
        title="Cambiar paleta y tema visual"
      >
        <Palette className="w-3.5 h-3.5 text-cyan-400" style={{ color: THEMES[theme].primaryColor }} />
        <span className="hidden sm:inline text-[11px]">{THEMES[theme].name.split(' ')[0]}</span>
      </button>

      {open && (
        <div 
          role="menu"
          className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0b101c] border border-slate-800 shadow-2xl p-1.5 z-50 font-mono text-xs animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2.5 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800/60 mb-1">
            Estilo Visual
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
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full border border-white/20"
                    style={{ backgroundColor: opt.primaryColor }}
                  />
                  <span>{opt.name}</span>
                </div>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ backgroundColor: opt.primaryColor }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
