import React, { useState } from 'react';
import { Target, Download, Calendar as CalendarIcon, Trash2, ExternalLink, BookOpen, CheckCircle2 } from 'lucide-react';
import type { MetaExamen, MetaGlobalizador } from '../../../types/plan';
import { MATERIAS_MAP } from '../../../data/plan2023';
import { TURNOS_EXAMEN, getFechaExactaMesa } from '../../../data/calendario';
import { formatFechaLocal } from '../../../utils/formatters';

interface CalendarMetasTabProps {
  metasArray: MetaExamen[];
  metasGlobalizadorArray: MetaGlobalizador[];
  onRemoveMeta: (materiaId: number) => void;
  onRemoveMetaGlobalizador: (materiaId: number) => void;
  onAprobarGlobalizador: (materiaId: number) => void;
  onExportICS: () => void;
  onSelectSubject: (materiaId: number) => void;
  getDaysRemaining: (targetDateStr: string) => { days: number; text: string; badgeColor: string };
}

export const CalendarMetasTab: React.FC<CalendarMetasTabProps> = ({
  metasArray,
  metasGlobalizadorArray,
  onRemoveMeta,
  onRemoveMetaGlobalizador,
  onAprobarGlobalizador,
  onExportICS,
  onSelectSubject,
  getDaysRemaining
}) => {
  const [filter, setFilter] = useState<'todas' | 'finales' | 'globalizadores'>('todas');

  const totalMetas = metasArray.length + metasGlobalizadorArray.length;

  if (totalMetas === 0) {
    return (
      <div className="text-center py-10 px-4 space-y-3 font-mono">
        <div className="w-12 h-12 rounded-full bg-(--bg-elevated) border border-(--border-color) mx-auto flex items-center justify-center text-slate-400">
          <Target className="w-6 h-6" />
        </div>
        <h3 className="font-syne font-bold text-(--text-body) text-base">
          No tienes metas programadas aún
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Podés tocar cualquier día en el <strong className="text-(--color-primary)">Calendario</strong> para agendar un <strong className="text-(--color-primary)">Final</strong> o un <strong className="text-(--color-cursable)">Globalizador</strong>, o ingresar a una materia desde la Malla Curricular.
        </p>
      </div>
    );
  }

  const showFinales = filter === 'todas' || filter === 'finales';
  const showGlobalizadores = filter === 'todas' || filter === 'globalizadores';

  return (
    <div className="space-y-3 font-mono">
      {/* Barra superior de filtros y exportación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pb-1">
        {/* Chips de filtro */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilter('todas')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
              filter === 'todas'
                ? 'bg-(--color-primary) text-slate-950 border-(--color-primary)'
                : 'bg-(--bg-elevated) text-slate-600 dark:text-slate-300 border-(--border-color) hover:text-(--text-body)'
            }`}
          >
            Todas ({totalMetas})
          </button>
          <button
            type="button"
            onClick={() => setFilter('finales')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1 ${
              filter === 'finales'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                : 'bg-(--bg-elevated) text-slate-600 dark:text-slate-300 border-(--border-color) hover:text-(--text-body)'
            }`}
          >
            <Target className="w-3 h-3" />
            <span>Finales ({metasArray.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('globalizadores')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1 ${
              filter === 'globalizadores'
                ? 'bg-(--color-cursable) text-slate-950 border-(--color-cursable)'
                : 'bg-(--bg-elevated) text-slate-600 dark:text-slate-300 border-(--border-color) hover:text-(--text-body)'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Globalizadores ({metasGlobalizadorArray.length})</span>
          </button>
        </div>

        {/* Botón de exportar .ics */}
        <button
          type="button"
          onClick={onExportICS}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-(--color-primary-bg) text-(--color-primary) border border-(--color-primary-border) hover:opacity-90 transition-opacity self-start sm:self-auto shadow-xs cursor-pointer"
          title="Descargar archivo .ics compatible con Google Calendar, Apple Calendar y Outlook"
        >
          <Download className="w-3.5 h-3.5 text-(--color-primary)" />
          <span>Exportar .ics</span>
        </button>
      </div>

      {/* Grilla de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
        {/* Metas de Final */}
        {showFinales && metasArray.map(meta => {
          const materia = MATERIAS_MAP[meta.materiaId];
          const countdown = meta.fechaEstimada ? getDaysRemaining(meta.fechaEstimada) : null;
          const turno = TURNOS_EXAMEN.find(t => t.id === meta.turnoId);
          const fechaExacta = turno ? getFechaExactaMesa(meta.materiaId, turno) : null;

          return (
            <div
              key={`final-${meta.materiaId}`}
              className="bg-(--bg-surface) border border-(--border-color) hover:border-(--color-primary-border) rounded-xl p-4 flex flex-col justify-between transition-all group shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-(--bg-elevated) border border-(--border-color) text-slate-600 dark:text-slate-300">
                        Nivel {materia?.nivel || '?'}º
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
                        Final
                      </span>
                    </div>
                    <h4 className="font-syne font-bold text-sm text-(--text-body) mt-1.5 group-hover:text-(--color-primary) transition-colors">
                      {materia?.nombreCompleto || `Materia #${meta.materiaId}`}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveMeta(meta.materiaId)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-(--border-color)/40 transition-colors cursor-pointer"
                    title="Quitar meta"
                    aria-label={`Quitar meta de ${materia?.nombre || meta.materiaId}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-(--color-primary)">
                    <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-semibold truncate">{meta.turnoNombre}</span>
                  </div>

                  {fechaExacta && (
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                      <span>📅 Mesa Oficial: {fechaExacta.diaNombre} {formatFechaLocal(fechaExacta.fechaExactaStr)}</span>
                    </div>
                  )}

                  {countdown && (
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${countdown.badgeColor}`}>
                        {countdown.text}
                      </span>
                      {meta.fechaEstimada && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Inicio: {meta.fechaEstimada}
                        </span>
                      )}
                    </div>
                  )}

                  {meta.comentario && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-(--border-color)">
                      "{meta.comentario}"
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-(--border-color) flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onSelectSubject(meta.materiaId)}
                  className="text-xs text-(--color-primary) hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Ver materia y correlativas</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Metas de Globalizador */}
        {showGlobalizadores && metasGlobalizadorArray.map(meta => {
          const materia = MATERIAS_MAP[meta.materiaId];
          const countdown = meta.fecha ? getDaysRemaining(meta.fecha) : null;

          return (
            <div
              key={`glob-${meta.materiaId}`}
              className="bg-(--bg-surface) border border-(--border-color) hover:border-(--color-cursable-border) rounded-xl p-4 flex flex-col justify-between transition-all group shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-(--bg-elevated) border border-(--border-color) text-slate-600 dark:text-slate-300">
                        Nivel {materia?.nivel || '?'}º
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-(--color-cursable-bg) border border-(--color-cursable-border) text-(--color-cursable) font-bold uppercase tracking-wider">
                        Globalizador
                      </span>
                    </div>
                    <h4 className="font-syne font-bold text-sm text-(--text-body) mt-1.5 group-hover:text-(--color-cursable) transition-colors">
                      {materia?.nombreCompleto || `Materia #${meta.materiaId}`}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveMetaGlobalizador(meta.materiaId)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-(--border-color)/40 transition-colors cursor-pointer"
                    title="Quitar meta"
                    aria-label={`Quitar meta de ${materia?.nombre || meta.materiaId}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-(--color-cursable)">
                    <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-semibold truncate">Fecha: {formatFechaLocal(meta.fecha)}</span>
                  </div>

                  {countdown && (
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${countdown.badgeColor}`}>
                        {countdown.text}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Rinde: {meta.fecha}
                      </span>
                    </div>
                  )}

                  {meta.comentario && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-(--border-color)">
                      "{meta.comentario}"
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-(--border-color) flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onAprobarGlobalizador(meta.materiaId)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  title="Pasar esta materia a Regular"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>¡Aprobé! Pasar a Regular</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectSubject(meta.materiaId)}
                  className="text-xs text-slate-500 hover:text-(--text-body) flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                >
                  <span>Ver materia</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
