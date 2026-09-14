import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { MATERIAS_TRONCALES } from '../data/plan2023';
import { Info, CheckCircle2, Clock, Search } from 'lucide-react';

export const GridView: React.FC = () => {
  const {
    estados,
    notas,
    toggleMateriaEstado,
    esMateriaCursable,
    setSelectedSubjectId
  } = useTracker();

  const [search, setSearch] = useState('');

  const niveles = [1, 2, 3, 4, 5];

  const filteredMaterias = MATERIAS_TRONCALES.filter(m => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      m.nombre.toLowerCase().includes(query) ||
      m.nombreCompleto.toLowerCase().includes(query) ||
      m.id.toString() === query
    );
  });

  return (
    <div className="max-w-[1700px] mx-auto p-4 sm:p-6 overflow-y-auto min-h-[calc(100vh-130px)]">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-syne font-bold text-white tracking-wide">
            Malla Curricular Plan 2023
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Estructura cronológica por niveles académicos y estado de correlatividades
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar materia o código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0b101c] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Columnas por Nivel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {niveles.map(nivel => {
          const materiasNivel = filteredMaterias.filter(m => m.nivel === nivel);
          const totalNivel = MATERIAS_TRONCALES.filter(m => m.nivel === nivel && !m.esAdusiSolo).length;
          const aprobadasNivel = MATERIAS_TRONCALES.filter(
            m => m.nivel === nivel && !m.esAdusiSolo && estados[m.id] === 'aprobada'
          ).length;
          const pctNivel = totalNivel > 0 ? Math.round((aprobadasNivel / totalNivel) * 100) : 0;

          return (
            <div
              key={nivel}
              className="bg-[#0b111e]/90 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-3 shadow-lg"
            >
              {/* Encabezado del Nivel */}
              <div className="border-b border-slate-800/60 pb-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-syne font-extrabold text-sm text-cyan-400 tracking-wider">
                    {nivel}º NIVEL
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {aprobadasNivel}/{totalNivel} ({pctNivel}%)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${pctNivel}%` }}
                  />
                </div>
              </div>

              {/* Lista de materias de este nivel */}
              <div className="flex flex-col gap-2.5">
                {materiasNivel.map(m => {
                  const est = estados[m.id] || 'pendiente';
                  const cursable = esMateriaCursable(m);
                  const nota = notas[m.id]?.nota;

                  // Estilos de tarjeta según estado
                  let cardStyle = 'bg-[#0d1527]/80 border-slate-800/80 text-slate-400';
                  let statusBadge = (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700/60">
                      Bloqueada
                    </span>
                  );

                  if (est === 'aprobada') {
                    cardStyle = 'bg-[#071f14]/80 border-emerald-500/40 text-emerald-100 shadow-[0_2px_12px_rgba(16,185,129,0.1)]';
                    statusBadge = (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Aprobada
                      </span>
                    );
                  } else if (est === 'regular') {
                    cardStyle = 'bg-[#1a1400]/80 border-amber-500/40 text-amber-100 shadow-[0_2px_12px_rgba(245,158,11,0.1)]';
                    statusBadge = (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Regular
                      </span>
                    );
                  } else if (cursable) {
                    cardStyle = 'bg-[#051520]/80 border-cyan-500/50 text-cyan-100 shadow-[0_2px_14px_rgba(34,211,238,0.2)] glow-cyan';
                    statusBadge = (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> Cursable
                      </span>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer select-none ${cardStyle}`}
                      onClick={() => toggleMateriaEstado(m.id)}
                    >
                      {/* Fila superior: ID y Badges */}
                      <div className="flex items-center justify-between gap-1 mb-1.5 font-mono text-[10px]">
                        <span className="font-bold text-slate-500 group-hover:text-cyan-300 transition-colors">
                          #{String(m.id).padStart(2, '0')}
                        </span>
                        <div className="flex items-center gap-1">
                          {m.esIntegradora && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[9px]">
                              INT
                            </span>
                          )}
                          {m.esCuatrimestral && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[9px]">
                              1C/2C
                            </span>
                          )}
                          {m.esAdusiSolo && (
                            <span className="px-1.5 py-0.2 rounded bg-pink-500/20 border border-pink-500/40 text-pink-300 text-[9px]">
                              ADUSI
                            </span>
                          )}
                          <span className="text-slate-400">{m.horas}hs</span>
                        </div>
                      </div>

                      {/* Nombre de la materia */}
                      <div className="font-semibold text-xs leading-snug mb-2 font-mono">
                        {m.nombreCompleto}
                      </div>

                      {/* Fila inferior: Estado, Nota y Botón de Información */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 mt-1">
                        <div className="flex items-center gap-1.5">
                          {statusBadge}
                          {nota !== undefined && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300">
                              Nota: {nota}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubjectId(m.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                          title="Ver correlativas y registrar notas"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
