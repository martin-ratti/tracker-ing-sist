import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Crosshair } from 'lucide-react';
import { MATERIAS_GRAFO } from './graphDependencies';
import type { EstadoMateria } from '../../../types/plan';

interface GraphSearchBarProps {
  onSelectSubject: (id: number) => void;
  estados: Record<number, EstadoMateria>;
}

const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const MATERIA_ALIASES: Record<number, string[]> = {
  1: ['am1', 'am 1', 'ami', 'am i', 'analisis 1', 'analisis i'],
  2: ['aga', 'algebra', 'algebra lineal', 'geometria'],
  3: ['fisica 1', 'fisica i', 'f1'],
  4: ['ingles 1', 'ingles i', 'ing 1'],
  5: ['logica', 'discreta', 'estructuras discretas', 'led'],
  6: ['algoritmos', 'aed', 'algo', 'estructuras de datos'],
  7: ['arquitectura', 'arq', 'orga', 'computadoras', 'hardware'],
  8: ['spn', 'sistemas y procesos', 'procesos de negocio'],
  9: ['am2', 'am 2', 'amii', 'am ii', 'analisis 2', 'analisis ii'],
  10: ['fisica 2', 'fisica ii', 'f2'],
  11: ['ingenieria y sociedad', 'sociedad', 'iys'],
  12: ['ingles 2', 'ingles ii', 'ing 2'],
  13: ['sintaxis', 'ssl', 'lenguajes', 'gramaticas', 'automatas'],
  14: ['paradigmas', 'pdp', 'funcional', 'objetos', 'logico'],
  15: ['sistemas operativos', 'so', 's o', 'linux'],
  16: ['analisis de sistemas', 'adesi', 'ads', 'analisis de sistemas de informacion'],
  17: ['probabilidad', 'estadistica', 'proba', 'pye'],
  18: ['economia'],
  19: ['base de datos', 'bases de datos', 'bd', 'bdd', 'sql'],
  20: ['desarrollo de software', 'dds', 'desarrollo'],
  21: ['comunicacion de datos', 'com datos', 'comunicaciones', 'cdd'],
  22: ['analisis numerico', 'numerico', 'an'],
  23: ['diseno de sistemas', 'dsi', 'diseno de sistemas de informacion'],
  24: ['legislacion', 'leyes', 'derecho'],
  25: ['ingenieria de calidad', 'calidad', 'ics'],
  26: ['redes', 'redes de datos', 'networking'],
  27: ['investigacion operativa', 'inv operativa', 'io'],
  28: ['simulacion', 'sim'],
  29: ['automatizacion', 'control'],
  30: ['administracion de sistemas', 'asi', 'administracion'],
  31: ['inteligencia artificial', 'ia', 'ai'],
  32: ['ciencia de datos', 'cd', 'data science'],
  33: ['sistemas de gestion', 'gestion', 'sg'],
  34: ['gestion gerencial', 'gerencial', 'gg'],
  35: ['seguridad', 'seguridad informatica', 'ciberseguridad', 'seg'],
  36: ['proyecto final', 'pf', 'tesis', 'tesina']
};

export const GraphSearchBar: React.FC<GraphSearchBarProps> = ({ onSelectSubject, estados }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const cleanQuery = normalizeText(query);
  const queryWords = cleanQuery.split(' ').filter(Boolean);

  const filtered = cleanQuery
    ? MATERIAS_GRAFO.filter(m => {
        const normNombre = normalizeText(m.nombre);
        const normCompleto = normalizeText(m.nombreCompleto || '');
        const idStr = String(m.id);
        const aliases = MATERIA_ALIASES[m.id] || [];

        // Coincidencia exacta con ID (ej. "6" o "#6")
        if (cleanQuery === idStr || cleanQuery === ` ${idStr}`) return true;

        // Coincidencia por alias
        if (aliases.some(alias => normalizeText(alias).includes(cleanQuery) || cleanQuery.includes(normalizeText(alias)))) {
          return true;
        }

        // Todas las palabras ingresadas deben estar presentes en nombre o nombre completo
        return queryWords.every(word => normNombre.includes(word) || normCompleto.includes(word));
      }).slice(0, 7)
    : [];

  const [prevCleanQuery, setPrevCleanQuery] = useState(cleanQuery);
  if (prevCleanQuery !== cleanQuery) {
    setPrevCleanQuery(cleanQuery);
    setSelectedIndex(0);
  }

  // Asegurar que el elemento seleccionado esté visible en el scroll
  useEffect(() => {
    if (isOpen && itemsRef.current[selectedIndex]) {
      const el = itemsRef.current[selectedIndex];
      if (typeof el?.scrollIntoView === 'function') {
        el.scrollIntoView({
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex, isOpen]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (id: number) => {
    onSelectSubject(id);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filtered.length === 0) {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && filtered.length > 0) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filtered[selectedIndex] || filtered[0];
      if (target) {
        handleSelect(target.id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative z-20 w-48 sm:w-64 font-mono text-xs">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Enfocar materia..."
          aria-label="Buscar materia para enfocar en el grafo"
          className="w-full bg-(--bg-surface)/90 backdrop-blur-md border border-(--border-color) rounded-xl pl-8 pr-7 py-1.5 text-xs text-(--text-body) placeholder:text-slate-500 focus:outline-none focus:border-(--color-primary) shadow-lg transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              setSelectedIndex(0);
            }}
            aria-label="Limpiar búsqueda"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-(--text-body)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div 
          role="listbox" 
          aria-label="Sugerencias de materias"
          className="absolute top-full left-0 right-0 mt-1.5 bg-(--bg-surface) border border-(--border-color) rounded-xl shadow-2xl overflow-hidden py-1 divide-y divide-(--border-color) max-h-72 overflow-y-auto"
        >
          {filtered.map((m, idx) => {
            const est = estados[m.id] || 'pendiente';
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={m.id}
                ref={el => { itemsRef.current[idx] = el; }}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(m.id)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full px-3 py-2 text-left transition-colors flex items-center justify-between gap-2 group cursor-pointer ${
                  isSelected 
                    ? 'bg-(--bg-elevated) ring-1 ring-inset ring-(--color-primary)/50 text-(--color-primary)' 
                    : 'hover:bg-(--bg-elevated)'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-(--text-body) group-hover:text-(--color-primary) truncate">
                    {m.nombreCompleto || m.nombre}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {m.nivel}º Año · #{m.id}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${
                    est === 'aprobada'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : est === 'regular'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-(--border-color)'
                  }`}>
                    {est}
                  </span>
                  <Crosshair className="w-3.5 h-3.5 text-slate-400 group-hover:text-(--color-primary)" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
