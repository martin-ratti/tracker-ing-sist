import React from 'react';
import { Target, X } from 'lucide-react';
import type { Materia } from '../../../types/plan';
import type { TurnoExamenOficial } from '../../../data/calendario';
import { DIAS_MESA_POR_MATERIA } from '../../../data/calendario';

export interface MetaDialogState {
  fechaStr: string;
  diaNombre: string;
  turno: TurnoExamenOficial;
}

interface CalendarScheduleDialogProps {
  metaDialog: MetaDialogState;
  onClose: () => void;
  materiasRegularesSinMeta: Materia[];
  materiaSeleccionadaId: number | '';
  setMateriaSeleccionadaId: (id: number) => void;
  metaComentarioInput: string;
  setMetaComentarioInput: (comment: string) => void;
  onConfirm: (e: React.FormEvent) => void;
  hasRegulares: boolean;
}

export const CalendarScheduleDialog: React.FC<CalendarScheduleDialogProps> = ({
  metaDialog,
  onClose,
  materiasRegularesSinMeta,
  materiaSeleccionadaId,
  setMateriaSeleccionadaId,
  metaComentarioInput,
  setMetaComentarioInput,
  onConfirm,
  hasRegulares
}) => {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 no-scrollbar">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div 
        className="relative z-10 bg-(--bg-surface) border border-(--color-primary-border) rounded-2xl sm:rounded-3xl max-w-md 2xl:max-w-xl 4k:max-w-2xl w-full p-4 sm:p-5 2xl:p-7 space-y-4 2xl:space-y-6 shadow-2xl font-mono my-auto transition-all"
      >
        <div className="flex items-center justify-between border-b border-(--border-color) pb-3 2xl:pb-4">
          <div className="flex items-center gap-2 2xl:gap-3">
            <Target className="w-5 h-5 2xl:w-6 2xl:h-6 text-(--color-primary) shrink-0" />
            <h3 className="font-syne font-bold text-(--text-body) text-base 2xl:text-xl">
              Anotar Meta de Examen
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar diálogo de meta"
            className="p-1 2xl:p-1.5 rounded-lg text-slate-400 hover:text-(--text-body) transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 2xl:w-5 2xl:h-5" />
          </button>
        </div>

        <div className="space-y-1.5 2xl:space-y-2.5 text-xs 2xl:text-sm text-slate-700 dark:text-slate-300 bg-(--bg-elevated) p-3 2xl:p-4 rounded-lg 2xl:rounded-xl border border-(--border-color)">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Turno:</span>
            <span className="font-bold text-(--color-primary)">{metaDialog.turno.nombre}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Fecha seleccionada:</span>
            <span className="font-bold text-(--text-body)">{metaDialog.diaNombre} {metaDialog.fechaStr}</span>
          </div>
        </div>

        <form onSubmit={onConfirm} className="space-y-3.5 2xl:space-y-5">
          <div>
            <label htmlFor="materia-regular-select" className="block text-[11px] 2xl:text-xs text-slate-600 dark:text-slate-300 mb-1 2xl:mb-1.5 font-medium">
              Materia Regular a Rendir:
            </label>
            {materiasRegularesSinMeta.length === 0 ? (
              <p className="text-xs 2xl:text-sm text-amber-500 dark:text-amber-400 italic bg-amber-500/10 p-2.5 2xl:p-3.5 rounded-lg border border-amber-500/30">
                {hasRegulares
                  ? 'Todas tus materias regulares ya tienen una mesa de examen asignada. Podés consultarlas o editarlas en la pestaña "Mis Metas de Final".'
                  : 'No tienes materias en estado Regular actualmente. Pasa alguna materia a Regular en la Malla o Grafo para agendarla.'}
              </p>
            ) : (
              <select
                id="materia-regular-select"
                value={materiaSeleccionadaId}
                onChange={e => setMateriaSeleccionadaId(Number(e.target.value))}
                className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-lg 2xl:rounded-xl p-2 2xl:p-3 text-xs 2xl:text-sm text-(--text-body) focus:outline-none focus:border-(--color-primary) cursor-pointer"
              >
                {materiasRegularesSinMeta
                  .slice()
                  .sort((a, b) => {
                    const aMatch = DIAS_MESA_POR_MATERIA[a.id] === metaDialog.diaNombre ? -1 : 1;
                    const bMatch = DIAS_MESA_POR_MATERIA[b.id] === metaDialog.diaNombre ? -1 : 1;
                    return aMatch - bMatch;
                  })
                  .map(m => {
                    const diaOficial = DIAS_MESA_POR_MATERIA[m.id];
                    const coincideDia = diaOficial === metaDialog.diaNombre;
                    return (
                      <option key={m.id} value={m.id}>
                        {coincideDia ? `⭐ ${m.nombreCompleto} (Día oficial: ${diaOficial})` : `${m.nombreCompleto} ${diaOficial ? `(Oficial: ${diaOficial})` : ''}`}
                      </option>
                    );
                  })}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="meta-comentario-input" className="block text-[11px] 2xl:text-xs text-slate-600 dark:text-slate-300 mb-1 2xl:mb-1.5 font-medium">
              Recordatorio o notas de estudio (opcional):
            </label>
            <input
              id="meta-comentario-input"
              type="text"
              value={metaComentarioInput}
              onChange={e => setMetaComentarioInput(e.target.value)}
              placeholder="Ej: Repasar finales anteriores de la cátedra..."
              className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-lg 2xl:rounded-xl p-2 2xl:p-3 text-xs 2xl:text-sm text-(--text-body) placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-(--color-primary)"
            />
          </div>

          <div className="flex justify-end gap-2 2xl:gap-3 pt-2.5 2xl:pt-4 border-t border-(--border-color)">
            <button
              type="button"
              onClick={onClose}
              className="px-3 2xl:px-4 py-1.5 2xl:py-2.5 rounded-lg 2xl:rounded-xl text-xs 2xl:text-sm text-slate-500 dark:text-slate-400 hover:text-(--text-body) cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={materiasRegularesSinMeta.length === 0 || !materiaSeleccionadaId}
              className="px-4 2xl:px-6 py-1.5 2xl:py-2.5 rounded-lg 2xl:rounded-xl bg-(--color-primary) hover:opacity-90 disabled:opacity-50 text-slate-950 font-bold text-xs 2xl:text-sm transition-opacity shadow-md cursor-pointer"
            >
              Confirmar Meta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
