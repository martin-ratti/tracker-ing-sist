import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { MATERIAS_ELECTIVAS, MATERIAS_MAP } from '../data/plan2023';
import { X, Sparkles, CheckCircle2, Clock } from 'lucide-react';

export const ElectivasDrawer: React.FC = () => {
  const {
    electivasOpen,
    setElectivasOpen,
    estadosElectivas,
    estados,
    toggleElectivaEstado,
    esElectivaCursable,
    stats
  } = useTracker();

  const [nivelFilter, setNivelFilter] = useState<number | 'todos'>('todos');

  if (!electivasOpen) return null;

  const filteredElectivas = MATERIAS_ELECTIVAS.filter(
    e => nivelFilter === 'todos' || e.nivel === nivelFilter
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setElectivasOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[#090e1a] border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header del Panel */}
          <div className="p-5 border-b border-slate-800/80 bg-[#0b1222]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-syne font-bold text-lg text-white tracking-wide">
                    Materias Electivas
                  </h2>
                  <p className="text-[11px] font-mono text-slate-400">
                    Plan 2023 · UTN FRRo
                  </p>
                </div>
              </div>

              <button
                onClick={() => setElectivasOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Medidor de horas para Título */}
            <div className="bg-[#0f172a]/90 rounded-xl p-3.5 border border-slate-800 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300 font-semibold">Meta de Ingeniería:</span>
                  <span className="text-amber-400 font-bold">
                    {stats.horasElectivasAprobadas} / 20 hs ({Math.min(Math.round((stats.horasElectivasAprobadas / 20) * 100), 100)}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.min((stats.horasElectivasAprobadas / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                <span>Requisito ADUSI (4 hs):</span>
                {stats.horasElectivasAprobadas >= 4 ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Cumplido ({stats.horasElectivasAprobadas} hs)
                  </span>
                ) : (
                  <span className="text-slate-400">
                    Faltan {4 - stats.horasElectivasAprobadas} hs
                  </span>
                )}
              </div>

              <div className="text-[10px] font-mono text-slate-500 italic bg-slate-900/50 p-1.5 rounded border border-slate-800/50">
                * Las horas que figuran en la grilla son las que suman directamente al total (Resolución Plan 2023).
              </div>
            </div>

            {/* Filtros por nivel */}
            <div className="flex items-center gap-1.5 mt-4 font-mono text-xs">
              <span className="text-slate-500 text-[11px]">Nivel:</span>
              {(['todos', 2, 3, 4, 5] as const).map(nivel => (
                <button
                  key={nivel}
                  onClick={() => setNivelFilter(nivel)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                    nivelFilter === nivel
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {nivel === 'todos' ? 'Todas' : `${nivel}º Año`}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Electivas */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {filteredElectivas.map(e => {
              const est = estadosElectivas[e.id] || 'pendiente';
              const cursable = esElectivaCursable(e);

              let cardStyle = 'bg-[#0d1527]/70 border-slate-800 text-slate-300';
              let statusBadge = (
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  Pendiente
                </span>
              );

              if (est === 'aprobada') {
                cardStyle = 'bg-[#071f14]/80 border-emerald-500/40 text-emerald-100 shadow-[0_2px_12px_rgba(16,185,129,0.15)]';
                statusBadge = (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Aprobada (+{e.horas}hs)
                  </span>
                );
              } else if (est === 'regular') {
                cardStyle = 'bg-[#1a1400]/80 border-amber-500/40 text-amber-100 shadow-[0_2px_12px_rgba(245,158,11,0.15)]';
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
                  key={e.id}
                  onClick={() => toggleElectivaEstado(e.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none hover:border-slate-700 ${cardStyle}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 font-bold mr-2">
                        {e.nivel}º NIVEL
                      </span>
                      <h3 className="font-semibold text-sm leading-snug font-mono text-white mt-0.5">
                        {e.nombre}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs">
                        +{e.horas} hs
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono">
                    <span className="text-slate-400">{e.tipo} ({e.cuatrimestre})</span>
                    <span className="text-slate-600">•</span>
                    {statusBadge}
                  </div>

                  {/* Correlatividades exigidas */}
                  {(e.reqRegular.length > 0 || e.reqAprobada.length > 0) && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/40 text-[10px] font-mono space-y-1">
                      {e.reqRegular.length > 0 && (
                        <div className="text-slate-400 flex flex-wrap items-center gap-1">
                          <span className="text-slate-500">Regulares:</span>
                          {e.reqRegular.map(reqId => {
                            const reqEst = estados[reqId] || 'pendiente';
                            const ok = reqEst === 'regular' || reqEst === 'aprobada';
                            return (
                              <span
                                key={reqId}
                                className={`px-1.5 py-0.2 rounded border ${
                                  ok
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                }`}
                              >
                                {MATERIAS_MAP[reqId]?.nombre || `#${reqId}`}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {e.reqAprobada.length > 0 && (
                        <div className="text-slate-400 flex flex-wrap items-center gap-1">
                          <span className="text-slate-500">Aprobadas:</span>
                          {e.reqAprobada.map(reqId => {
                            const reqEst = estados[reqId] || 'pendiente';
                            const ok = reqEst === 'aprobada';
                            return (
                              <span
                                key={reqId}
                                className={`px-1.5 py-0.2 rounded border ${
                                  ok
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                }`}
                              >
                                {MATERIAS_MAP[reqId]?.nombre || `#${reqId}`}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
