import React from 'react';
import { Target, Download, Calendar as CalendarIcon, Trash2, ExternalLink } from 'lucide-react';
import type { MetaExamen } from '../../../types/plan';
import { MATERIAS_MAP } from '../../../data/plan2023';
import { TURNOS_EXAMEN, getFechaExactaMesa } from '../../../data/calendario';
import { formatFechaLocal } from '../../../utils/formatters';

interface CalendarMetasTabProps {
  metasArray: MetaExamen[];
  onRemoveMeta: (materiaId: number) => void;
  onExportICS: () => void;
  onSelectSubject: (materiaId: number) => void;
  getDaysRemaining: (targetDateStr: string) => { days: number; text: string; badgeColor: string };
}

export const CalendarMetasTab: React.FC<CalendarMetasTabProps> = ({
  metasArray,
  onRemoveMeta,
  onExportICS,
  onSelectSubject,
  getDaysRemaining
}) => {
  if (metasArray.length === 0) {
    return (
      <div className="text-center py-10 px-4 space-y-3">
        <div className="w-12 h-12 rounded-full bg-(--bg-elevated) border border-(--border-color) mx-auto flex items-center justify-center text-slate-400">
          <Target className="w-6 h-6" />
        </div>
        <h3 className="font-syne font-bold text-(--text-body) text-base">
          No tienes finales programados aún
        </h3>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Podes hacer clic en el botón <strong className="text-(--color-primary)">"Anotar"</strong> sobre cualquier día de mesa en el <strong className="text-(--color-primary)">Calendario Mensual</strong>, o ingresar a una materia <strong className="text-amber-500 dark:text-amber-400">Regular</strong> en la Malla Curricular.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pb-1">
        <div className="flex items-center gap-2">
          <span>Materias con mesa tentativa de examen agendada:</span>
          <span className="px-2 py-0.5 rounded bg-(--bg-elevated) border border-(--border-color) text-(--color-primary) font-semibold">
            {metasArray.length} meta{metasArray.length !== 1 ? 's' : ''}
          </span>
        </div>

        <button
          type="button"
          onClick={onExportICS}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-(--color-primary-bg) text-(--color-primary) border border-(--color-primary-border) hover:opacity-90 transition-opacity self-start sm:self-auto shadow-sm cursor-pointer"
          title="Descargar archivo .ics compatible con Google Calendar, Apple Calendar y Outlook"
        >
          <Download className="w-3.5 h-3.5 text-(--color-primary)" />
          <span>Exportar .ics</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metasArray.map(meta => {
          const materia = MATERIAS_MAP[meta.materiaId];
          const countdown = meta.fechaEstimada ? getDaysRemaining(meta.fechaEstimada) : null;
          const turno = TURNOS_EXAMEN.find(t => t.id === meta.turnoId);
          const fechaExacta = turno ? getFechaExactaMesa(meta.materiaId, turno) : null;

          return (
            <div
              key={meta.materiaId}
              className="bg-(--bg-surface) border border-(--border-color) hover:border-(--color-primary-border) rounded-xl p-4 flex flex-col justify-between transition-all group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-(--bg-elevated) border border-(--border-color) text-slate-600 dark:text-slate-300">
                      Nivel {materia?.nivel || '?'}º
                    </span>
                    <h4 className="font-syne font-bold text-sm text-(--text-body) mt-1 group-hover:text-(--color-primary) transition-colors">
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
      </div>
    </div>
  );
};
