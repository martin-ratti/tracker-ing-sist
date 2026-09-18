import React, { useState, useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import { MATERIAS_ELECTIVAS, MATERIAS_MAP, MATERIAS_TRONCALES } from '../data/plan2023';
import { X, Sparkles, CheckCircle2, Clock, BookOpen } from 'lucide-react';

export const ElectivasDrawer: React.FC = () => {
  const {
    electivasOpen,
    setElectivasOpen,
    estadosElectivas,
    estados,
    toggleMateriaEstado,
    toggleElectivaEstado,
    esElectivaCursable,
    stats
  } = useTracker();

  const [nivelFilter, setNivelFilter] = useState<number | 'todos'>('todos');

  // Soporte teclado Escape
  useEffect(() => {
    if (!electivasOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setElectivasOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [electivasOpen, setElectivasOpen]);

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

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen max-w-xl bg-[var(--bg-surface)] border-l border-[var(--border-color)] shadow-2xl flex flex-col">
          
          {/* Header del Panel */}
          <div className="p-4 sm:p-5 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-syne font-bold text-base sm:text-lg text-[var(--text-body)] tracking-wide">
                    Materias Electivas
                  </h2>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Plan 2023 · UTN FRRo
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setElectivasOpen(false)}
                aria-label="Cerrar panel de electivas"
                className="p-2 rounded-lg text-slate-400 hover:text-[var(--text-body)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Medidor de horas para Título */}
            <div className="bg-[var(--bg-base)] rounded-xl p-3.5 border border-[var(--border-color)] space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-500 dark:text-slate-300 font-semibold">Meta de Ingeniería:</span>
                  <span className="text-amber-500 dark:text-amber-400 font-bold">
                    {stats.horasElectivasAprobadas} / 20 hs ({Math.min(Math.round((stats.horasElectivasAprobadas / 20) * 100), 100)}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.min((stats.horasElectivasAprobadas / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-[11px] font-mono text-slate-600 dark:text-slate-400">
                <span>Requisito ADUSI (4 hs):</span>
                {stats.horasElectivasAprobadas >= 4 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Cumplido ({stats.horasElectivasAprobadas} hs)
                  </span>
                ) : (
                  <span className="text-slate-600 dark:text-slate-400">
                    Faltan {4 - stats.horasElectivasAprobadas} hs
                  </span>
                )}
              </div>

              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 italic bg-[var(--bg-base)] p-1.5 rounded border border-[var(--border-color)]">
                * Las horas que figuran en la grilla son las que suman directamente al total (Resolución Plan 2023).
              </div>
            </div>

            {/* Filtros por nivel */}
            <div className="flex items-center gap-1.5 mt-4 font-mono text-xs">
              <span className="text-slate-600 dark:text-slate-400 text-[11px]">Nivel:</span>
              {(['todos', 2, 3, 4, 5] as const).map(nivel => (
                <button
                  key={nivel}
                  onClick={() => setNivelFilter(nivel)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    nivelFilter === nivel
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-800 dark:text-amber-300 font-bold shadow-sm'
                      : 'bg-[var(--bg-surface)] border border-[var(--border-color)] text-slate-600 dark:text-slate-400 hover:text-[var(--text-body)] hover:bg-[var(--bg-base)]'
                  }`}
                >
                  {nivel === 'todos' ? 'Todas' : `${nivel}º Año`}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Electivas */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* Sección especial: Seminario Integrador ADUSI */}
            {(() => {
              const seminario = MATERIAS_TRONCALES.find(m => m.esAdusiSolo && m.id === 99);
              if (!seminario) return null;
              const estSem = estados[seminario.id] || 'pendiente';
              const reqRegOk = seminario.reqRegular.every(c => {
                const e = estados[c] || 'pendiente';
                return e === 'regular' || e === 'aprobada';
              });
              const reqAprOk = Array.isArray(seminario.reqAprobada)
                ? seminario.reqAprobada.every(c => (estados[c] || 'pendiente') === 'aprobada')
                : true;
              const puedeCursar = estSem === 'pendiente' && reqRegOk && reqAprOk;

              let cardStyle = 'bg-[var(--bg-elevated)] border-pink-500/30 text-slate-500 dark:text-slate-300';
              let statusBadge = (
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-mono font-medium">
                  Pendiente
                </span>
              );

              if (estSem === 'aprobada') {
                cardStyle = 'card-aprobada-theme text-[var(--text-body)]';
                statusBadge = (
                  <span 
                    className="text-[10px] px-2 py-0.5 rounded font-mono border flex items-center gap-1 font-medium"
                    style={{ 
                      color: 'var(--color-aprobada)', 
                      borderColor: 'var(--color-aprobada-border)', 
                      backgroundColor: 'var(--color-aprobada-bg)' 
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3" /> Aprobado
                  </span>
                );
              } else if (estSem === 'regular') {
                cardStyle = 'card-regular-theme text-[var(--text-body)]';
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
              } else if (puedeCursar) {
                cardStyle = 'card-cursable-theme glow-cursable-theme text-[var(--text-body)]';
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
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                    <span className="text-[11px] font-mono font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wider">
                      Título Intermedio ADUSI
                    </span>
                  </div>
                  <div
                    onClick={() => toggleMateriaEstado(seminario.id)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none hover:border-pink-500/40 ${cardStyle}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-[10px] font-mono text-pink-600 dark:text-pink-400 font-bold mr-2">
                          3er NIVEL · ADUSI
                        </span>
                        <h3 className="font-semibold text-sm leading-snug font-mono text-[var(--text-body)] mt-0.5">
                          {seminario.nombreCompleto}
                        </h3>
                        <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 mt-1">
                          Requerido para tramitar el título de ADUSI. No computa para Ingeniería.
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded bg-pink-500/10 border border-pink-500/30 text-pink-700 dark:text-pink-300 font-mono font-bold text-xs shrink-0">
                        {seminario.horas} hs
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-[var(--border-color)] text-[10px] font-mono">
                      <span className="text-slate-600 dark:text-slate-400">Cuatrimestral</span>
                      <span className="text-slate-400 dark:text-slate-600">•</span>
                      {statusBadge}
                    </div>

                    {/* Correlativas del Seminario */}
                    {(seminario.reqRegular.length > 0 || (Array.isArray(seminario.reqAprobada) && seminario.reqAprobada.length > 0)) && (
                      <div className="mt-2.5 pt-2 border-t border-[var(--border-color)] text-[10px] font-mono space-y-1">
                        {seminario.reqRegular.length > 0 && (
                          <div className="text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-1">
                            <span className="text-slate-600 dark:text-slate-500 font-medium">Regulares:</span>
                            {seminario.reqRegular.map(reqId => {
                              const reqEst = estados[reqId] || 'pendiente';
                              const ok = reqEst === 'regular' || reqEst === 'aprobada';
                              return (
                                <span key={reqId} className={`px-1.5 py-0.5 rounded border ${ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium' : 'bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400'}`}>
                                  {MATERIAS_MAP[reqId]?.nombre || `#${reqId}`}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {Array.isArray(seminario.reqAprobada) && seminario.reqAprobada.length > 0 && (
                          <div className="text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-1">
                            <span className="text-slate-600 dark:text-slate-500 font-medium">Aprobadas:</span>
                            {seminario.reqAprobada.map(reqId => {
                              const ok = (estados[reqId] || 'pendiente') === 'aprobada';
                              return (
                                <span key={reqId} className={`px-1.5 py-0.5 rounded border ${ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium' : 'bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400'}`}>
                                  {MATERIAS_MAP[reqId]?.nombre || `#${reqId}`}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {Array.isArray(seminario.reqRendirAprobada) && (
                          <div className="text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-1 pt-1 border-t border-[var(--border-color)]">
                            <span className="text-slate-600 dark:text-slate-500 font-medium">Para Rendir Final:</span>
                            <span className={`px-1.5 py-0.5 rounded border font-bold ${
                              seminario.reqRendirAprobada.every(id => (estados[id] || 'pendiente') === 'aprobada')
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-500/15 border-amber-500/35 text-amber-800 dark:text-amber-300'
                            }`}>
                              Todo 1º, 2º y 3º año ({seminario.reqRendirAprobada.filter(id => (estados[id] || 'pendiente') === 'aprobada').length}/{seminario.reqRendirAprobada.length})
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Divisor */}
            <div className="flex items-center gap-2 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                Electivas Optativas
              </span>
            </div>

            {filteredElectivas.length === 0 ? (
              <p className="text-sm font-mono text-slate-600 italic text-center py-8">
                No hay electivas disponibles para este nivel.
              </p>
            ) : (
              filteredElectivas.map(e => {
                const est = estadosElectivas[e.id] || 'pendiente';
                const cursable = esElectivaCursable(e);

                let cardStyle = 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-slate-600 dark:text-slate-300';
                let statusBadge = (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-mono border border-slate-300 dark:border-slate-700/60 font-medium">
                    Pendiente
                  </span>
                );

                if (est === 'aprobada') {
                  cardStyle = 'card-aprobada-theme text-[var(--text-body)]';
                  statusBadge = (
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded font-mono border flex items-center gap-1 font-medium"
                      style={{ 
                        color: 'var(--color-aprobada)', 
                        borderColor: 'var(--color-aprobada-border)', 
                        backgroundColor: 'var(--color-aprobada-bg)' 
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Aprobada (+{e.horas}hs)
                    </span>
                  );
                } else if (est === 'regular') {
                  cardStyle = 'card-regular-theme text-[var(--text-body)]';
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
                  cardStyle = 'card-cursable-theme glow-cursable-theme text-[var(--text-body)]';
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
                    key={e.id}
                    onClick={() => toggleElectivaEstado(e.id)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none hover:border-slate-500/50 ${cardStyle}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold mr-2">
                          {e.nivel}º NIVEL
                        </span>
                        <h3 className="font-semibold text-sm leading-snug font-mono text-[var(--text-body)] mt-0.5">
                          {e.nombre}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono font-bold text-xs">
                          +{e.horas} hs
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-[var(--border-color)] text-[10px] font-mono">
                      <span className="text-slate-500 dark:text-slate-400">{e.tipo} ({e.cuatrimestre})</span>
                      <span className="text-slate-400 dark:text-slate-600">•</span>
                      {statusBadge}
                    </div>

                    {/* Correlatividades exigidas */}
                    {(e.reqRegular.length > 0 || e.reqAprobada.length > 0) && (
                      <div className="mt-2.5 pt-2 border-t border-[var(--border-color)] text-[10px] font-mono space-y-1">
                        {e.reqRegular.length > 0 && (
                          <div className="text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1">
                            <span className="font-semibold text-slate-600 dark:text-slate-400">Regulares:</span>
                            {e.reqRegular.map(reqId => {
                              const reqEst = estados[reqId] || 'pendiente';
                              const ok = reqEst === 'regular' || reqEst === 'aprobada';
                              return (
                                <span
                                  key={reqId}
                                  className={`px-1.5 py-0.5 rounded border ${
                                    ok
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium'
                                      : 'bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400'
                                  }`}
                                >
                                  {MATERIAS_MAP[reqId]?.nombre || `#${reqId}`}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {e.reqAprobada.length > 0 && (
                          <div className="text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1">
                            <span className="font-semibold text-slate-600 dark:text-slate-400">Aprobadas:</span>
                            {e.reqAprobada.map(reqId => {
                              const reqEst = estados[reqId] || 'pendiente';
                              const ok = reqEst === 'aprobada';
                              return (
                                <span
                                  key={reqId}
                                  className={`px-1.5 py-0.5 rounded border ${
                                    ok
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium'
                                      : 'bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400'
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
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
