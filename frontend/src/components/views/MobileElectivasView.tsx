import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { MATERIAS_ELECTIVAS, MATERIAS_MAP, MATERIAS_TRONCALES } from '../../data/plan2023';
import { X, Sparkles, CheckCircle2, Clock, BookOpen, ChevronLeft } from 'lucide-react';

interface MobileElectivasViewProps {
  onBack: () => void;
  onClose: () => void;
}

export const MobileElectivasView: React.FC<MobileElectivasViewProps> = ({ onBack, onClose }) => {
  const {
    estadosElectivas,
    estados,
    toggleMateriaEstado,
    toggleElectivaEstado,
    esElectivaCursable,
    stats
  } = useTracker();

  const [nivelFilter, setNivelFilter] = useState<number | 'todos'>('todos');

  const filteredElectivas = MATERIAS_ELECTIVAS.filter(
    e => nivelFilter === 'todos' || e.nivel === nivelFilter
  );

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-200">
      {/* Header del Panel de Electivas */}
      <div className="p-3.5 sm:p-4 border-b border-(--border-color) bg-(--bg-elevated) shrink-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-(--bg-surface) border border-(--border-color) text-xs font-mono font-bold text-(--text-body) hover:bg-(--bg-base) transition-colors min-h-9"
          >
            <ChevronLeft className="w-4 h-4 text-(--color-primary)" />
            <span>Menú</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 text-left">
              <h3 className="font-syne font-bold text-xs sm:text-sm text-(--text-body) truncate">Materias Electivas</h3>
              <p className="text-[10px] font-mono text-slate-500 truncate">Plan 2023 · UTN FRRo</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="p-2 rounded-xl text-slate-400 hover:text-(--text-body) hover:bg-(--bg-surface) transition-colors min-w-9 min-h-9 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Medidor de horas para Título */}
        <div className="bg-(--bg-surface) rounded-xl p-3 border border-(--border-color) space-y-2.5">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-500 dark:text-slate-300 font-semibold text-[11px]">Meta Ingeniería (20 hs):</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">
                {stats.horasElectivasAprobadas} / 20 hs ({Math.min(Math.round((stats.horasElectivasAprobadas / 20) * 100), 100)}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-900 border border-(--border-color) overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min((stats.horasElectivasAprobadas / 20) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-(--border-color) text-[11px] font-mono text-slate-600 dark:text-slate-400">
            <span>Requisito ADUSI (4 hs):</span>
            {stats.horasElectivasAprobadas >= 4 ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Cumplido ({stats.horasElectivasAprobadas} hs)
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                Faltan {4 - stats.horasElectivasAprobadas} hs
              </span>
            )}
          </div>
        </div>

        {/* Filtros por nivel */}
        <div className="flex items-center gap-1 mt-3 font-mono text-xs overflow-x-auto no-scrollbar py-0.5">
          <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold shrink-0 mr-1">Nivel:</span>
          {(['todos', 2, 3, 4, 5] as const).map(nivel => (
            <button
              key={nivel}
              type="button"
              onClick={() => setNivelFilter(nivel)}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors shrink-0 ${
                nivelFilter === nivel
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-900 dark:text-amber-300 font-bold shadow-xs'
                  : 'bg-(--bg-surface) border border-(--border-color) text-slate-600 dark:text-slate-400 hover:text-(--text-body) hover:bg-(--bg-base)'
              }`}
            >
              {nivel === 'todos' ? 'Todas' : `${nivel}º Año`}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Electivas y Seminario Integrador */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 no-scrollbar overscroll-contain safe-bottom">
        {/* Sección especial: Seminario Integrador ADUSI */}
        {(nivelFilter === 'todos' || nivelFilter === 3) && (() => {
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

          let cardStyle = 'bg-(--bg-elevated) border-pink-500/30 text-slate-600 dark:text-slate-300';
          let statusBadge = (
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-mono font-medium">
              Pendiente
            </span>
          );

          if (estSem === 'aprobada') {
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
                <CheckCircle2 className="w-3 h-3" /> Aprobado
              </span>
            );
          } else if (estSem === 'regular') {
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
          } else if (puedeCursar) {
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
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 px-0.5">
                <BookOpen className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                <span className="text-[10px] font-mono font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wider">
                  Título Intermedio ADUSI
                </span>
              </div>
              <div
                onClick={() => toggleMateriaEstado(seminario.id)}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer select-none hover:border-pink-500/50 shadow-xs ${cardStyle}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <span className="text-[9px] font-mono text-pink-600 dark:text-pink-400 font-bold mr-1.5">
                      3er NIVEL · ADUSI
                    </span>
                    <h4 className="font-semibold text-xs leading-snug font-syne text-(--text-body) mt-0.5">
                      {seminario.nombreCompleto}
                    </h4>
                    <p className="text-[9px] font-mono text-slate-500 mt-0.5">
                      Requerido para ADUSI. No computa para Ingeniería.
                    </p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-pink-700 dark:text-pink-300 font-mono font-bold text-[10px] shrink-0">
                    {seminario.horas} hs
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-(--border-color) text-[10px] font-mono">
                  <span className="text-slate-500">Cuatrimestral</span>
                  <span className="text-slate-400">•</span>
                  {statusBadge}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Divisor Electivas Optativas */}
        <div className="flex items-center gap-1.5 pt-1 px-0.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            Electivas Optativas
          </span>
        </div>

        {filteredElectivas.length === 0 ? (
          <p className="text-xs font-mono text-slate-500 italic text-center py-6">
            No hay electivas disponibles para este nivel.
          </p>
        ) : (
          filteredElectivas.map(e => {
            const est = estadosElectivas[e.id] || 'pendiente';
            const cursable = esElectivaCursable(e);

            let cardStyle = 'bg-(--bg-elevated) border-(--border-color) text-slate-600 dark:text-slate-300';
            let statusBadge = (
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-mono border border-slate-300 dark:border-slate-700/60 font-medium">
                Pendiente
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
                  <CheckCircle2 className="w-3 h-3" /> Aprobada (+{e.horas}hs)
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
                key={e.id}
                onClick={() => toggleElectivaEstado(e.id)}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer select-none hover:border-slate-400 dark:hover:border-slate-600 shadow-xs ${cardStyle}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 font-bold mr-1.5">
                      {e.nivel}º NIVEL
                    </span>
                    <h4 className="font-semibold text-xs leading-snug font-syne text-(--text-body) mt-0.5">
                      {e.nombre}
                    </h4>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono font-bold text-[10px]">
                      +{e.horas} hs
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-(--border-color) text-[10px] font-mono">
                  <span className="text-slate-500">{e.tipo} ({e.cuatrimestre})</span>
                  <span className="text-slate-400">•</span>
                  {statusBadge}
                </div>

                {/* Correlatividades exigidas */}
                {(e.reqRegular.length > 0 || e.reqAprobada.length > 0) && (
                  <div className="mt-2 pt-1.5 border-t border-(--border-color) text-[9px] font-mono space-y-1">
                    {e.reqRegular.length > 0 && (
                      <div className="text-slate-500 flex flex-wrap items-center gap-1">
                        <span className="font-semibold">Regulares:</span>
                        {e.reqRegular.map(reqId => {
                          const reqEst = estados[reqId] || 'pendiente';
                          const ok = reqEst === 'regular' || reqEst === 'aprobada';
                          return (
                            <span
                              key={reqId}
                              className={`px-1 py-0.2 rounded border ${
                                ok
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium'
                                  : 'bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {MATERIAS_MAP[reqId]?.nombre || `#${reqId}`}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {e.reqAprobada.length > 0 && (
                      <div className="text-slate-500 flex flex-wrap items-center gap-1">
                        <span className="font-semibold">Aprobadas:</span>
                        {e.reqAprobada.map(reqId => {
                          const reqEst = estados[reqId] || 'pendiente';
                          const ok = reqEst === 'aprobada';
                          return (
                            <span
                              key={reqId}
                              className={`px-1 py-0.2 rounded border ${
                                ok
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium'
                                  : 'bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
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
  );
};
