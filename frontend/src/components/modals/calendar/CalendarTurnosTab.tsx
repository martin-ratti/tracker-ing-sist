import React from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import type { MetaExamen } from '../../../types/plan';
import { TURNOS_EXAMEN, REGLA_SYSACAD_EXAMEN, isPastDate } from '../../../data/calendario';
import { MATERIAS_MAP } from '../../../data/plan2023';
import { formatRangoFechas } from '../../../utils/formatters';

interface CalendarTurnosTabProps {
  metasArray: MetaExamen[];
  getDaysRemaining: (targetDateStr: string) => { days: number; text: string; badgeColor: string };
}

export const CalendarTurnosTab: React.FC<CalendarTurnosTabProps> = ({
  metasArray,
  getDaysRemaining
}) => {
  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Regla Sysacad destacada */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
          <Clock className="w-4 h-4 shrink-0" />
          <span>Regla Oficial de Cierre en Sysacad</span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
          {REGLA_SYSACAD_EXAMEN.descripcion}
        </p>
        <div className="pt-1">
          <a
            href="https://alumnos.frro.utn.edu.ar/loginAlumno.asp?refrescar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            <span>Abrir Sysacad Alumnos</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Lista de Turnos */}
      <div className="space-y-2">
        <h4 className="font-syne font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Turnos Oficiales de Examen
        </h4>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
          {TURNOS_EXAMEN.map(turno => {
            const materiasEnEsteTurno = metasArray.filter(m => m.turnoId === turno.id);
            const countdown = getDaysRemaining(turno.fechaInicio);
            const yaPaso = isPastDate(turno.fechaFin);

            return (
              <div
                key={turno.id}
                className={`p-3 rounded-xl border transition-all ${
                  yaPaso 
                    ? 'opacity-50 bg-(--bg-base) border-(--border-color)'
                    : materiasEnEsteTurno.length > 0
                      ? turno.esEspecial
                        ? 'bg-purple-500/10 border-purple-500/40 shadow-sm'
                        : 'bg-(--color-primary-bg) border-(--color-primary-border) shadow-sm'
                      : 'bg-(--bg-surface) border border-(--border-color)'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${yaPaso ? 'bg-slate-400' : turno.esEspecial ? 'bg-purple-500' : 'bg-(--color-primary)'}`} />
                    <span className={`font-bold text-xs ${yaPaso ? 'text-slate-400 line-through' : 'text-(--text-body)'}`}>
                      {turno.nombre}
                    </span>
                    {turno.esEspecial && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                        Mesa Especial
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {turno.diasEspecificos 
                        ? `Días: ${turno.diasEspecificos.map(d => Number.parseInt(d.split('-')[2], 10)).join(', ')} de ${turno.mes}`
                        : formatRangoFechas(turno.fechaInicio, turno.fechaFin)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${countdown.badgeColor}`}>
                      {countdown.text}
                    </span>
                  </div>
                </div>

                {turno.descripcion && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic pl-4">
                    {turno.descripcion}
                  </p>
                )}

                {materiasEnEsteTurno.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-(--border-color) flex flex-wrap items-center gap-1.5 pl-4">
                    <span className="text-[11px] text-(--color-primary) font-bold">Planeas rendir:</span>
                    {materiasEnEsteTurno.map(m => (
                      <span
                        key={m.materiaId}
                        className="px-2 py-0.5 rounded bg-(--color-primary-bg) border border-(--color-primary-border) text-(--color-primary) text-[10px]"
                      >
                        {MATERIAS_MAP[m.materiaId]?.nombre || `#${m.materiaId}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
