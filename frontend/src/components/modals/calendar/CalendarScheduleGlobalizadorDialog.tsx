import React, { useState } from 'react';
import { BookOpen, X, AlertCircle } from 'lucide-react';
import type { Materia } from '../../../types/plan';
import { formatFechaLocal } from '../../../utils/formatters';

interface CalendarScheduleGlobalizadorDialogProps {
  fechaStr: string;
  onClose: () => void;
  materiasCursables: Materia[];
  onConfirm: (materiaId: number, fecha: string, comentario?: string) => void;
  materiaPreseleccionadaId?: number;
  permitirCambiarFecha?: boolean;
}

export const CalendarScheduleGlobalizadorDialog: React.FC<CalendarScheduleGlobalizadorDialogProps> = ({
  fechaStr: initialFecha,
  onClose,
  materiasCursables,
  onConfirm,
  materiaPreseleccionadaId,
  permitirCambiarFecha = false
}) => {
  const [fecha, setFecha] = useState<string>(initialFecha);
  const [selectedMateriaId, setSelectedMateriaId] = useState<number>(() => {
    if (materiaPreseleccionadaId && materiasCursables.some(m => m.id === materiaPreseleccionadaId)) {
      return materiaPreseleccionadaId;
    }
    return materiasCursables.length > 0 ? materiasCursables[0].id : 0;
  });
  const [comentario, setComentario] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMateriaId || !fecha) return;
    onConfirm(selectedMateriaId, fecha, comentario.trim() || undefined);
    onClose();
  };

  const materiaSeleccionada = materiasCursables.find(m => m.id === selectedMateriaId);

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 no-scrollbar">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className="relative z-10 bg-(--bg-surface) border border-(--color-cursable-border) rounded-2xl sm:rounded-3xl max-w-md 2xl:max-w-xl w-full p-4 sm:p-5 2xl:p-7 space-y-4 shadow-2xl font-mono my-auto transition-all text-left"
        style={{
          boxShadow: '0 0 25px var(--color-cursable-glow)'
        }}
      >
        {/* Cabecera del diálogo */}
        <div className="flex items-center justify-between border-b border-(--border-color) pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-(--color-cursable-bg) border border-(--color-cursable-border) text-(--color-cursable)">
              <BookOpen className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h3 className="font-syne font-bold text-(--text-body) text-base 2xl:text-lg">
                Anotar Meta de Globalizador
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Instancia de recuperación para regularizar la materia
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar diálogo de globalizador"
            className="p-1 rounded-lg text-slate-400 hover:text-(--text-body) transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info de fecha seleccionada */}
        <div className="text-xs text-slate-700 dark:text-slate-300 bg-(--bg-elevated) p-3 rounded-xl border border-(--border-color) space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Tipo de instancia:</span>
            <span className="font-bold text-(--color-cursable)">Examen Globalizador / Regularidad</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Fecha fijada:</span>
            <span className="font-bold text-(--text-body)">{formatFechaLocal(fecha)}</span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {permitirCambiarFecha && (
            <div>
              <label htmlFor="fecha-globalizador-input" className="block text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium">
                Fecha del Examen:
              </label>
              <input
                id="fecha-globalizador-input"
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                required
                className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-xl p-2.5 text-xs 2xl:text-sm text-(--text-body) focus:outline-none focus:border-(--color-cursable)"
              />
            </div>
          )}

          <div>
            <label htmlFor="materia-cursable-select" className="block text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium">
              Materia Troncal a Regularizar:
            </label>
            {materiasCursables.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  No tienes materias pendientes habilitadas para cursar en este momento, o todas ya tienen una meta de globalizador agendada.
                </p>
              </div>
            ) : (
              <select
                id="materia-cursable-select"
                value={selectedMateriaId}
                onChange={e => setSelectedMateriaId(Number(e.target.value))}
                className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-xl p-2.5 text-xs 2xl:text-sm text-(--text-body) focus:outline-none focus:border-(--color-cursable) cursor-pointer"
              >
                {materiasCursables.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nombreCompleto} (Año {m.nivel}º)
                  </option>
                ))}
              </select>
            )}
            {materiaSeleccionada && (
              <p className="text-[10px] text-slate-500 mt-1">
                Nivel {materiaSeleccionada.nivel}º · {materiaSeleccionada.horas} hs · Condición actual: Pendiente
              </p>
            )}
          </div>

          <div>
            <label htmlFor="comentario-globalizador-input" className="block text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium">
              Notas o unidades a repasar (opcional):
            </label>
            <input
              id="comentario-globalizador-input"
              type="text"
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder="Ej: Repasar unidades 1 a 4, ejercicios de práctica..."
              className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-xl p-2.5 text-xs 2xl:text-sm text-(--text-body) placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-(--color-cursable)"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-(--border-color)">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:text-(--text-body) cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={materiasCursables.length === 0 || !selectedMateriaId || !fecha}
              className="px-5 py-2 rounded-xl bg-(--color-cursable) hover:opacity-90 disabled:opacity-40 text-slate-950 font-bold text-xs transition-opacity shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guardar Meta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
