import React, { useState, useMemo } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { MATERIAS_TRONCALES } from '../../data/plan2023';
import { Info, CheckCircle2, Clock, Search, Target, X } from 'lucide-react';

const NIVELES = [1, 2, 3, 4, 5];

export const GridView: React.FC = () => {
  const {
    estados,
    notas,
    metasExamen,
    gridFilter,
    setGridFilter,
    stats,
    toggleMateriaEstado,
    esMateriaCursable,
    setSelectedSubjectId
  } = useTracker();

  const [search, setSearch] = useState('');
  const [activeNivel, setActiveNivel] = useState<number | 'todos'>('todos');

  const nivelStats = useMemo(() => {
    return NIVELES.reduce((acc, n) => {
      const total = MATERIAS_TRONCALES.filter(m => m.nivel === n && !m.esAdusiSolo).length;
      const aprobadas = MATERIAS_TRONCALES.filter(
        m => m.nivel === n && !m.esAdusiSolo && estados[m.id] === 'aprobada'
      ).length;
      const regulares = MATERIAS_TRONCALES.filter(
        m => m.nivel === n && !m.esAdusiSolo && estados[m.id] === 'regular'
      ).length;
      acc[n] = {
        total,
        aprobadas,
        regulares,
        pct: total > 0 ? Math.round((aprobadas / total) * 100) : 0
      };
      return acc;
    }, {} as Record<number, { total: number; aprobadas: number; regulares: number; pct: number }>);
  }, [estados]);

  const filteredMaterias = MATERIAS_TRONCALES.filter(m => {
    if (m.esAdusiSolo) return false; // Seminario va en el drawer de Electivas

    // Filtro rápido por estado
    const est = estados[m.id] || 'pendiente';
    const cursable = esMateriaCursable(m);
    const hasMeta = Boolean(metasExamen[m.id]);

    if (gridFilter === 'cursables' && !cursable) return false;
    if (gridFilter === 'regulares' && est !== 'regular') return false;
    if (gridFilter === 'aprobadas' && est !== 'aprobada') return false;
    if (gridFilter === 'con-meta' && !hasMeta) return false;

    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      m.nombre.toLowerCase().includes(query) ||
      m.nombreCompleto.toLowerCase().includes(query) ||
      m.id.toString().includes(query)
    );
  });

  const displayedNiveles = activeNivel === 'todos' ? NIVELES : [activeNivel];

  // Helper de cambio de estado con vibración háptica en móvil
  const handleToggleMateria = (id: number) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // Ignorar si el navegador o SO no tiene soporte háptico
      }
    }
    toggleMateriaEstado(id);
  };

  return (
    <div className="max-w-[1700px] mx-auto p-3 sm:p-6 overflow-y-auto min-h-[calc(100vh-130px)]">
      {/* Barra de búsqueda y título */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 mb-3 sm:mb-4">
        <div>
          <h2 className="text-base sm:text-xl font-syne font-bold text-(--text-body) tracking-wide">
            Malla Curricular Plan 2023
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono">
            Estructura cronológica por niveles académicos y correlatividades
          </p>
        </div>

        <div className="relative w-full sm:w-80" role="search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar materia o código..."
            aria-label="Buscar materia por nombre o código"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-(--bg-surface) border border-(--border-color) rounded-xl pl-9 pr-9 py-2 text-xs font-mono text-(--text-body) placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-(--text-body) transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Selector de Nivel Académico (Carrusel táctil con scroll suave) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-2.5 no-scrollbar font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveNivel('todos')}
          className={`px-3 py-1.5 rounded-xl border shrink-0 transition-all font-semibold text-xs ${
            activeNivel === 'todos'
              ? 'bg-(--bg-elevated) border-(--color-primary) text-(--text-body) font-bold shadow-sm'
              : 'bg-(--bg-surface) border border-(--border-color) text-slate-600 dark:text-slate-400 hover:text-(--text-body)'
          }`}
        >
          Todos ({MATERIAS_TRONCALES.filter(m => !m.esAdusiSolo).length})
        </button>

        {NIVELES.map(n => {
          const st = nivelStats[n];
          const isSelected = activeNivel === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setActiveNivel(n)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border shrink-0 transition-all flex items-center gap-1.5 font-semibold text-xs ${
                isSelected
                  ? 'border shadow-sm font-bold'
                  : 'bg-(--bg-surface) border border-(--border-color) text-slate-600 dark:text-slate-400 hover:text-(--text-body)'
              }`}
              style={isSelected ? {
                backgroundColor: 'var(--color-primary-bg)',
                borderColor: 'var(--color-primary-border)',
                color: 'var(--color-primary)'
              } : {}}
            >
              <span>{n}º Año</span>
              <span 
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  st.pct === 100 
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {st.aprobadas}/{st.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chips de filtro rápido por estado con scroll horizontal táctil */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar font-mono text-xs">
        <span className="text-slate-600 dark:text-slate-400 text-[11px] hidden sm:inline mr-1 shrink-0 font-medium">Filtrar:</span>
        <button
          onClick={() => setGridFilter('todas')}
          className={`px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
            gridFilter === 'todas'
              ? 'bg-(--bg-elevated) border-(--color-primary) text-(--text-body) font-bold shadow-sm'
              : 'bg-(--bg-surface) border border-(--border-color) text-slate-600 dark:text-slate-400 hover:text-(--text-body) hover:border-slate-400'
          }`}
        >
          Todas
        </button>

        <button
          onClick={() => setGridFilter('cursables')}
          className={`px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
            gridFilter === 'cursables'
              ? 'font-bold shadow-sm'
              : 'bg-(--bg-surface) border border-(--border-color) text-slate-600 dark:text-slate-400 hover:text-(--text-body) hover:border-slate-400'
          }`}
          style={gridFilter === 'cursables' ? {
            backgroundColor: 'var(--color-cursable-bg)',
            borderColor: 'var(--color-cursable-border)',
            color: 'var(--color-cursable)'
          } : {}}
        >
          Cursables ({stats.cursablesCount})
        </button>

        <button
          onClick={() => setGridFilter('regulares')}
          className={`px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
            gridFilter === 'regulares'
              ? 'font-bold shadow-sm'
              : 'bg-(--bg-surface) border border-(--border-color) text-slate-600 dark:text-slate-400 hover:text-(--text-body) hover:border-slate-400'
          }`}
          style={gridFilter === 'regulares' ? {
            backgroundColor: 'var(--color-regular-bg)',
            borderColor: 'var(--color-regular-border)',
            color: 'var(--color-regular)'
          } : {}}
        >
          Regulares ({stats.regularesCount})
        </button>

        <button
          onClick={() => setGridFilter('aprobadas')}
          className={`px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
            gridFilter === 'aprobadas'
              ? 'font-bold shadow-sm'
              : 'bg-(--bg-surface) border border-(--border-color) text-slate-600 dark:text-slate-400 hover:text-(--text-body) hover:border-slate-400'
          }`}
          style={gridFilter === 'aprobadas' ? {
            backgroundColor: 'var(--color-aprobada-bg)',
            borderColor: 'var(--color-aprobada-border)',
            color: 'var(--color-aprobada)'
          } : {}}
        >
          Aprobadas ({stats.aprobadasCount})
        </button>

        <button
          onClick={() => setGridFilter('con-meta')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shrink-0 transition-all ${
            gridFilter === 'con-meta'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-800 dark:text-cyan-300 font-bold shadow-sm'
              : 'bg-(--bg-surface) border border-(--border-color) text-slate-600 dark:text-slate-400 hover:text-(--text-body) hover:border-slate-400'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Con Meta 🎯 ({Object.keys(metasExamen).length})</span>
        </button>
      </div>

      {/* Columnas por Nivel */}
      <div className={`grid gap-4 ${
        activeNivel === 'todos'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
          : 'grid-cols-1 max-w-xl mx-auto'
      }`}>
        {displayedNiveles.map(nivel => {
          const materiasNivel = filteredMaterias.filter(m => m.nivel === nivel);
          const totalNivel = MATERIAS_TRONCALES.filter(m => m.nivel === nivel && !m.esAdusiSolo).length;
          const aprobadasNivel = MATERIAS_TRONCALES.filter(
            m => m.nivel === nivel && !m.esAdusiSolo && estados[m.id] === 'aprobada'
          ).length;
          const pctNivel = totalNivel > 0 ? Math.round((aprobadasNivel / totalNivel) * 100) : 0;

          return (
            <div
              key={nivel}
              className="bg-(--bg-surface) border border-(--border-color) rounded-xl p-3 flex flex-col gap-3 shadow-lg"
            >
              {/* Encabezado del Nivel */}
              <div className="border-b border-(--border-color) pb-2.5">
                <div className="flex items-center justify-between">
                  <span 
                    className="font-syne font-extrabold text-sm tracking-wider"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {nivel}º NIVEL
                  </span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {aprobadasNivel}/{totalNivel} ({pctNivel}%)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800/40 mt-2 overflow-hidden border border-(--border-color)">
                  <div
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${pctNivel}%`,
                      background: 'var(--gradient-primary)'
                    }}
                  />
                </div>
              </div>

              {/* Lista de materias de este nivel */}
              <div className="flex flex-col gap-2.5">
                {materiasNivel.length === 0 ? (
                  <p className="text-xs font-mono text-slate-600 italic text-center py-4">
                    Sin resultados en este nivel
                  </p>
                ) : (
                  materiasNivel.map(m => {
                    const est = estados[m.id] || 'pendiente';
                    const cursable = esMateriaCursable(m);
                    const nota = notas[m.id]?.nota;

                    // Estilos de tarjeta según estado adaptados al tema
                    let cardStyle = 'bg-(--bg-elevated) border-(--border-color) text-slate-700 dark:text-slate-400';
                    let statusBadge = (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-mono border border-slate-300 dark:border-slate-700/60 font-medium">
                        Bloqueada
                      </span>
                    );

                    if (est === 'aprobada') {
                      cardStyle = 'card-aprobada-theme text-(--text-body)';
                      statusBadge = (
                        <span 
                          className="text-[10px] px-2 py-0.5 rounded font-mono border flex items-center gap-1 font-medium"
                          style={{ 
                            color: 'var(--color-aprobada)', 
                            borderColor: 'var(--color-aprobada-border)', 
                            backgroundColor: 'var(--color-aprobada-bg)' 
                          }}
                        >
                          <CheckCircle2 className="w-3 h-3" /> Aprobada
                        </span>
                      );
                    } else if (est === 'regular') {
                      cardStyle = 'card-regular-theme text-(--text-body)';
                      statusBadge = (
                        <span 
                          className="text-[10px] px-2 py-0.5 rounded font-mono border flex items-center gap-1 font-medium"
                          style={{ 
                            color: 'var(--color-regular)', 
                            borderColor: 'var(--color-regular-border)', 
                            backgroundColor: 'var(--color-regular-bg)' 
                          }}
                        >
                          <Clock className="w-3 h-3" /> Regular
                        </span>
                      );
                    } else if (cursable) {
                      cardStyle = 'card-cursable-theme glow-cursable-theme text-(--text-body)';
                      statusBadge = (
                        <span 
                          className="text-[10px] px-2 py-0.5 rounded font-mono border flex items-center gap-1 font-medium"
                          style={{ 
                            color: 'var(--color-cursable)', 
                            borderColor: 'var(--color-cursable-border)', 
                            backgroundColor: 'var(--color-cursable-bg)' 
                          }}
                        >
                          <span 
                            className="w-1.5 h-1.5 rounded-full animate-ping" 
                            style={{ backgroundColor: 'var(--color-cursable)' }}
                          />
                          Cursable
                        </span>
                      );
                    }

                    return (
                      <div
                        key={m.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`${m.nombreCompleto}, nivel ${m.nivel}, estado: ${est}. Presiona Enter para cambiar estado.`}
                        className={`group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${cardStyle}`}
                        onClick={() => handleToggleMateria(m.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleToggleMateria(m.id);
                          }
                        }}
                      >
                        {/* Fila superior: ID y Badges */}
                        <div className="flex items-center justify-between gap-1 mb-1.5 font-mono text-[10px]">
                          <span className="font-bold text-slate-500 dark:text-slate-400 group-hover:text-(--text-body) transition-colors">
                            #{String(m.id).padStart(2, '0')}
                          </span>
                          <div className="flex items-center gap-1">
                            {m.esIntegradora && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-700 dark:text-purple-300 text-[9px] font-semibold">
                                INT
                              </span>
                            )}
                            {m.esCuatrimestral && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-700 dark:text-blue-300 text-[9px] font-semibold">
                                1C/2C
                              </span>
                            )}
                            {m.esAdusiSolo && (
                              <span className="px-1.5 py-0.5 rounded bg-pink-500/20 border border-pink-500/40 text-pink-700 dark:text-pink-300 text-[9px] font-semibold">
                                ADUSI
                              </span>
                            )}
                            <span className="text-slate-600 dark:text-slate-400 font-medium">{m.horas}hs</span>
                          </div>
                        </div>

                        {/* Nombre de la materia */}
                        <div className="font-semibold text-xs leading-snug mb-2 font-mono text-(--text-body)">
                          {m.nombreCompleto}
                        </div>

                        {/* Fila inferior: Estado, Nota, Meta y Botón de Información */}
                        <div className="flex items-center justify-between pt-1 border-t border-(--border-color) mt-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {statusBadge}
                            {nota !== undefined && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-800 dark:text-purple-300">
                                Nota: {nota}
                              </span>
                            )}
                            {metasExamen[m.id] && (
                              <span 
                                className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-800 dark:text-cyan-300 flex items-center gap-1"
                                title={`Meta agendada: ${metasExamen[m.id].turnoNombre}`}
                              >
                                <Target className="w-2.5 h-2.5" />
                                <span>{metasExamen[m.id].turnoNombre.split('(')[0].trim()}</span>
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubjectId(m.id);
                            }}
                            aria-label={`Ver detalles, correlativas y notas de ${m.nombreCompleto}`}
                            className="p-2 -mr-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-(--text-body) hover:bg-(--bg-elevated) transition-colors min-w-9 min-h-9 flex items-center justify-center"
                            title="Ver correlativas y registrar notas"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
