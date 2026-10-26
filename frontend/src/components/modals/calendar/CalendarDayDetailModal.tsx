import React from 'react';
import { 
  Calendar as CalendarIcon, 
  X, 
  Target, 
  BookOpen, 
  Trash2, 
  CheckCircle2, 
  ExternalLink
} from 'lucide-react';
import type { MetaExamen, MetaGlobalizador } from '../../../types/plan';
import type { TurnoExamenOficial, HitoAcademico } from '../../../data/calendario';
import { MATERIAS_MAP } from '../../../data/plan2023';
import { formatFechaLocal } from '../../../utils/formatters';

interface CalendarDayDetailModalProps {
  fechaStr: string;
  onClose: () => void;
  turno: TurnoExamenOficial | null;
  hito: HitoAcademico | null;
  metasFinalEnEsteDia: MetaExamen[];
  metasGlobalizadorEnEsteDia: MetaGlobalizador[];
  onOpenAgendarFinal: (fechaStr: string, turno: TurnoExamenOficial) => void;
  onOpenAgendarGlobalizador: (fechaStr: string) => void;
  onRemoveMetaFinal: (materiaId: number) => void;
  onRemoveMetaGlobalizador: (materiaId: number) => void;
  onAprobarGlobalizador: (materiaId: number) => void;
  onSelectSubject?: (materiaId: number) => void;
}

export const CalendarDayDetailModal: React.FC<CalendarDayDetailModalProps> = ({
  fechaStr,
  onClose,
  turno,
  hito,
  metasFinalEnEsteDia,
  metasGlobalizadorEnEsteDia,
  onOpenAgendarFinal,
  onOpenAgendarGlobalizador,
  onRemoveMetaFinal,
  onRemoveMetaGlobalizador,
  onAprobarGlobalizador,
  onSelectSubject
}) => {
  const dateObj = new Date(fechaStr + 'T00:00:00');
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaNombre = diasSemana[dateObj.getDay()];
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

  const totalMetas = metasFinalEnEsteDia.length + metasGlobalizadorEnEsteDia.length;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 no-scrollbar">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className="relative z-10 bg-(--bg-surface) border border-(--border-color) rounded-2xl sm:rounded-3xl max-w-lg 2xl:max-w-xl w-full p-4 sm:p-6 space-y-4 shadow-2xl font-mono my-auto transition-all text-left"
      >
        {/* Cabecera del día */}
        <div className="flex items-center justify-between border-b border-(--border-color) pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-(--bg-elevated) border border-(--border-color) text-(--color-primary)">
              <CalendarIcon className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-(--color-primary)">
                {diaNombre}
              </span>
              <h3 className="font-syne font-bold text-(--text-body) text-base 2xl:text-xl">
                {formatFechaLocal(fechaStr)}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle del día"
            className="p-1 rounded-lg text-slate-400 hover:text-(--text-body) transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sección de Hito Académico (si hay) */}
        {hito && (
          <div className={`p-3.5 rounded-xl border space-y-1.5 ${
            hito.tipo === 'feriado'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-100'
              : hito.tipo === 'inscripcion'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-100'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-100'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-black/15">
                {hito.tipo === 'feriado' ? '🚫 Feriado / Asueto' : hito.tipo === 'inscripcion' ? '📝 Inscripción Sysacad' : '📌 Hito Académico'}
              </span>
              <span className="font-bold text-xs sm:text-sm">{hito.titulo}</span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed font-sans">{hito.detalle}</p>
          </div>
        )}

        {/* Sección de Turno Oficial de Final (si aplica) */}
        {turno && (
          <div className={`p-3.5 rounded-xl border space-y-1.5 ${
            turno.esEspecial
              ? 'bg-purple-500/10 border-purple-400/40 text-purple-900 dark:text-purple-100'
              : 'bg-(--color-primary-bg) border-(--color-primary-border) text-(--text-body)'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                turno.esEspecial ? 'bg-purple-500/20 text-purple-700 dark:text-purple-200' : 'bg-(--bg-elevated) text-(--color-primary)'
              }`}>
                {turno.esEspecial ? '⚡ Turno Especial de Final' : '🎓 Turno Ordinario de Final'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Llamado {turno.llamado}
              </span>
            </div>
            <h4 className="font-syne font-bold text-sm text-(--text-body)">{turno.nombre}</h4>
            {turno.descripcion && (
              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans">{turno.descripcion}</p>
            )}
          </div>
        )}

        {/* Metas agendadas en esta fecha */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Metas agendadas para este día:</span>
            <span className="px-2 py-0.5 rounded bg-(--bg-elevated) border border-(--border-color) text-(--color-primary) font-semibold">
              {totalMetas} meta{totalMetas !== 1 ? 's' : ''}
            </span>
          </div>

          {totalMetas === 0 ? (
            <div className="p-3.5 rounded-xl bg-(--bg-elevated) border border-(--border-color) text-xs text-slate-500 dark:text-slate-400 text-center">
              No tienes metas de final ni de globalizador agendadas para esta fecha.
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {/* Metas de Final */}
              {metasFinalEnEsteDia.map(meta => {
                const materia = MATERIAS_MAP[meta.materiaId];
                return (
                  <div
                    key={`final-${meta.materiaId}`}
                    className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-between gap-2 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 shrink-0">
                        <Target className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Examen Final
                          </span>
                        </div>
                        <h5 className="font-syne font-bold text-xs sm:text-sm text-(--text-body) truncate">
                          {materia?.nombreCompleto || `Materia #${meta.materiaId}`}
                        </h5>
                        {meta.comentario && (
                          <p className="text-[11px] text-slate-500 italic truncate font-sans">
                            "{meta.comentario}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onSelectSubject && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSubject(meta.materiaId);
                            onClose();
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-(--text-body) hover:bg-(--border-color)/40 transition-colors cursor-pointer"
                          title="Ver ficha de la materia"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveMetaFinal(meta.materiaId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-(--border-color)/40 transition-colors cursor-pointer"
                        title="Quitar meta de final"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Metas de Globalizador */}
              {metasGlobalizadorEnEsteDia.map(meta => {
                const materia = MATERIAS_MAP[meta.materiaId];
                return (
                  <div
                    key={`glob-${meta.materiaId}`}
                    className="p-3 rounded-xl bg-(--color-cursable-bg) border border-(--color-cursable-border) flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-(--bg-surface) border border-(--color-cursable-border) text-(--color-cursable) shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-cursable)">
                          Globalizador · Regularidad
                        </span>
                        <h5 className="font-syne font-bold text-xs sm:text-sm text-(--text-body) truncate">
                          {materia?.nombreCompleto || `Materia #${meta.materiaId}`}
                        </h5>
                        {meta.comentario && (
                          <p className="text-[11px] text-slate-500 italic truncate font-sans">
                            "{meta.comentario}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onAprobarGlobalizador(meta.materiaId);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                        title="Pasar esta materia a Regular"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>¡Aprobé! Pasar a Regular</span>
                      </button>

                      {onSelectSubject && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSubject(meta.materiaId);
                            onClose();
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-(--text-body) hover:bg-(--border-color)/40 transition-colors cursor-pointer"
                          title="Ver ficha de la materia"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onRemoveMetaGlobalizador(meta.materiaId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-(--border-color)/40 transition-colors cursor-pointer"
                        title="Quitar meta de globalizador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Acciones para agendar */}
        <div className="pt-2 border-t border-(--border-color) flex flex-col sm:flex-row gap-2 justify-end">
          {turno && !isWeekend && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAgendarFinal(fechaStr, turno);
              }}
              className="px-3.5 py-2 rounded-xl bg-(--color-primary-bg) hover:opacity-90 border border-(--color-primary-border) text-(--color-primary) font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Target className="w-4 h-4 text-(--color-primary)" />
              <span>+ Agendar Final</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAgendarGlobalizador(fechaStr);
            }}
            className="px-4 py-2 rounded-xl bg-(--color-cursable) hover:opacity-90 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <BookOpen className="w-4 h-4" />
            <span>+ Agendar Globalizador</span>
          </button>
        </div>
      </div>
    </div>
  );
};
