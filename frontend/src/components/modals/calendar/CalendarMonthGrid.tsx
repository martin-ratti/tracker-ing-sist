import React from 'react';
import { ChevronLeft, ChevronRight, Trash2, Calendar as CalendarIcon, X, Plus } from 'lucide-react';
import type { MetaExamen, EstadoMateria } from '../../../types/plan';
import { 
  TURNOS_EXAMEN, 
  HITOS_ACADEMICOS, 
  isFechaEnTurno, 
  getFechaExactaMesa, 
  DIAS_MESA_POR_MATERIA,
  type TurnoExamenOficial,
  type HitoAcademico 
} from '../../../data/calendario';
import { MATERIAS_MAP, MATERIAS_TRONCALES } from '../../../data/plan2023';
import { formatRangoFechas } from '../../../utils/formatters';
import { useViewportResolution } from '../../../hooks/useViewportResolution';

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA_HEADERS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

const DIAS_SEMANA_MAP: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  0: 'Domingo'
};

export interface CalendarCell {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
}

interface CalendarMonthGridProps {
  navYear: number;
  navMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onIrAHoy: () => void;
  onJumpMonth: (y: number, m: number) => void;
  mesesConTurnos: Array<{ label: string; y: number; m: number }>;
  calendarCells: CalendarCell[];
  todayStr: string;
  metasArray: MetaExamen[];
  estados: Record<number, EstadoMateria>;
  metasExamen: Record<number, MetaExamen>;
  removeMetaExamen: (materiaId: number) => void;
  selectedHito: HitoAcademico | null;
  setSelectedHito: (hito: HitoAcademico | null) => void;
  onOpenMetaDialog: (fechaStr: string, turno: TurnoExamenOficial) => void;
}

export const CalendarMonthGrid: React.FC<CalendarMonthGridProps> = ({
  navYear,
  navMonth,
  onPrevMonth,
  onNextMonth,
  onIrAHoy,
  onJumpMonth,
  mesesConTurnos,
  calendarCells,
  todayStr,
  metasArray,
  estados,
  metasExamen,
  removeMetaExamen,
  selectedHito,
  setSelectedHito,
  onOpenMetaDialog
}) => {
  const resolution = useViewportResolution(true);

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-1.5 sm:space-y-2 lg:space-y-2.5 font-mono">
      {/* Barra superior de controles del calendario */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-syne font-bold text-base sm:text-lg text-(--text-body)">
            {NOMBRES_MESES[navMonth]} {navYear}
          </h3>
          <button
            type="button"
            onClick={onIrAHoy}
            className="text-[11px] px-2 py-0.5 rounded bg-(--bg-elevated) hover:bg-(--border-color)/50 text-(--color-primary) border border-(--border-color) transition-colors cursor-pointer"
          >
            Hoy
          </button>
        </div>

        {/* Botones de navegación y saltos rápidos */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={onPrevMonth}
            title="Mes anterior"
            aria-label="Mes anterior"
            className="p-1.5 rounded-lg bg-(--bg-surface) hover:bg-(--bg-elevated) border border-(--border-color) text-slate-400 hover:text-(--text-body) transition-colors shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            title="Mes siguiente"
            aria-label="Mes siguiente"
            className="p-1.5 rounded-lg bg-(--bg-surface) hover:bg-(--bg-elevated) border border-(--border-color) text-slate-400 hover:text-(--text-body) transition-colors shrink-0 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-(--border-color) mx-1 shrink-0" />

          {/* Accesos rápidos a los meses con turnos oficiales */}
          <div className="flex items-center gap-1">
            {mesesConTurnos.map(item => {
              const isSelected = navYear === item.y && navMonth === item.m;
              return (
                <button
                  key={`${item.y}-${item.m}-${item.label}`}
                  type="button"
                  onClick={() => onJumpMonth(item.y, item.m)}
                  className={`px-2 py-1 rounded text-[10px] whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-(--color-primary-bg) text-(--color-primary) border border-(--color-primary-border) font-bold'
                      : 'bg-(--bg-surface) hover:bg-(--bg-elevated) text-slate-500 dark:text-slate-400 border border-(--border-color)'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Referencias de color */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] text-slate-500 dark:text-slate-400 bg-(--bg-elevated) p-1.5 sm:p-2 rounded-xl border border-(--border-color) shrink-0">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Referencias:</span>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded border border-(--color-primary-border) bg-(--color-primary-bg) shrink-0" />
          <span>Turno Común</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded border border-purple-500/80 bg-purple-500/20 text-purple-700 dark:text-purple-300 shadow-[0_0_6px_rgba(168,85,247,0.4)] shrink-0" />
          <span>Mesa Especial</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded border border-emerald-500/80 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0" />
          <span>Meta Agendada</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded border border-rose-500/80 bg-rose-500/20 text-rose-700 dark:text-rose-300 shadow-[0_0_6px_rgba(244,63,94,0.4)] shrink-0" />
          <span>Feriado</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded border border-amber-400/80 bg-amber-500/20 text-amber-700 dark:text-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.4)] shrink-0" />
          <span>Hito Académico</span>
        </div>
      </div>

      {/* Cuadrícula de 7 columnas */}
      <div className="flex flex-col flex-1 min-h-0 rounded-xl border border-(--border-color) overflow-hidden bg-(--bg-base)">
        {/* Cabecera de días de la semana */}
        <div className="grid grid-cols-7 border-b border-(--border-color) bg-(--bg-elevated) text-center text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 py-1 sm:py-1.5 shrink-0">
          {DIAS_SEMANA_HEADERS.map((dia, idx) => (
            <div key={idx} className={idx >= 5 ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}>
              <span className="sm:hidden">{dia.charAt(0)}</span>
              <span className="hidden sm:inline">{dia}</span>
            </div>
          ))}
        </div>

        {/* Celdas de días */}
        <div className="grid grid-cols-7 grid-rows-6 flex-1 min-h-0 divide-x divide-y divide-(--border-color)">
          {calendarCells.map((cell, idx) => {
            const diaNum = cell.date.getDate();
            const isPast = cell.dateStr < todayStr;
            const isToday = cell.dateStr === todayStr;

            const turno = TURNOS_EXAMEN.find(t => isFechaEnTurno(cell.dateStr, t));
            
            const hito = HITOS_ACADEMICOS.find(h => {
              if (h.tipo === 'receso' || h.tipo === 'feriado') {
                if (h.fechaFin) return cell.dateStr >= h.fechaInicio && cell.dateStr <= h.fechaFin;
                return cell.dateStr === h.fechaInicio;
              }
              if (cell.dateStr === h.fechaInicio) return true;
              if (h.fechaFin && cell.dateStr === h.fechaFin) return true;
              return false;
            });

            const metasEnEsteDia = metasArray.filter(m => {
              if (m.fechaEstimada) return m.fechaEstimada === cell.dateStr;
              if (turno && m.turnoId === turno.id) {
                const fe = getFechaExactaMesa(m.materiaId, turno);
                return fe ? fe.fechaExactaStr === cell.dateStr : false;
              }
              return false;
            });

            const diaSemanaNombre = DIAS_SEMANA_MAP[cell.date.getDay()];
            const esFinDeSemana = cell.date.getDay() === 0 || cell.date.getDay() === 6;
            const esDiaMesaActiva = turno && !isPast && !esFinDeSemana;

            const materiasQueRindenHoy = MATERIAS_TRONCALES.filter(m => DIAS_MESA_POR_MATERIA[m.id] === diaSemanaNombre);
            const regularesQueRindenHoy = materiasQueRindenHoy.filter(m => estados[m.id] === 'regular' && !metasExamen[m.id]);
            const esClickeable = Boolean(hito || (esDiaMesaActiva && metasEnEsteDia.length === 0));

            const handleDiaClick = () => {
              if (hito) {
                setSelectedHito(hito);
              } else if (esDiaMesaActiva && metasEnEsteDia.length === 0) {
                onOpenMetaDialog(cell.dateStr, turno);
              }
            };

            return (
              <div
                key={idx}
                role={esClickeable ? "button" : undefined}
                tabIndex={esClickeable ? 0 : undefined}
                onClick={esClickeable ? handleDiaClick : undefined}
                onKeyDown={esClickeable ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDiaClick();
                  }
                } : undefined}
                className={`h-13 sm:h-full sm:min-h-0 ${resolution.dayCellPadding} flex flex-col justify-between transition-all relative group rounded-md sm:rounded-lg m-0.5 ${
                  !cell.isCurrentMonth
                    ? 'bg-slate-100/70 dark:bg-(--bg-base)/70 text-slate-400 dark:text-slate-600 opacity-30 border border-transparent'
                    : isPast
                      ? 'bg-slate-200/50 dark:bg-(--bg-base)/40 text-slate-400 dark:text-slate-600 opacity-50 border border-slate-300/40 dark:border-slate-900/60'
                      : esDiaMesaActiva
                        ? turno.esEspecial
                          ? 'bg-gradient-to-b from-purple-500/15 via-purple-500/5 to-transparent border-purple-400/80 text-purple-900 dark:text-purple-100 cursor-pointer sm:cursor-default'
                          : 'bg-gradient-to-b from-(--color-primary-bg) via-transparent to-transparent border-(--color-primary-border) text-(--text-body) cursor-pointer sm:cursor-default'
                        : hito?.tipo === 'feriado'
                          ? 'bg-gradient-to-b from-rose-500/15 via-rose-500/5 to-(--bg-surface) border-rose-500/40 text-rose-900 dark:text-rose-100 hover:border-rose-400/70 cursor-pointer'
                          : hito
                            ? 'bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-(--bg-surface) border-amber-500/40 text-amber-900 dark:text-amber-100 hover:border-amber-400/70 cursor-pointer'
                            : 'bg-(--bg-surface) border border-(--border-color) text-(--text-body) hover:border-slate-400 dark:hover:border-slate-600'
                }`}
                style={esDiaMesaActiva ? {
                  boxShadow: turno.esEspecial
                    ? '0 0 16px rgba(168, 85, 247, 0.25), inset 0 0 12px rgba(168, 85, 247, 0.10)'
                    : '0 0 16px var(--color-primary-glow), inset 0 0 12px var(--color-primary-bg)',
                  borderColor: turno.esEspecial ? 'rgba(168, 85, 247, 0.75)' : 'var(--color-primary-border)'
                } : hito?.tipo === 'feriado' ? {
                  boxShadow: 'inset 0 0 12px rgba(244, 63, 94, 0.10)'
                } : hito ? {
                  boxShadow: 'inset 0 0 12px rgba(245, 158, 11, 0.10)'
                } : {}}
              >
                {/* Fila superior de la celda */}
                <div className="flex items-center justify-between gap-1">
                  <span className={`font-bold font-syne ${resolution.dayNumberSize} ${
                    isToday 
                      ? 'w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-(--color-primary) text-white dark:text-slate-950 flex items-center justify-center font-extrabold shadow-[0_0_10px_var(--color-primary-glow)]' 
                      : isPast 
                        ? 'text-slate-400 dark:text-slate-500' 
                        : esDiaMesaActiva 
                          ? turno.esEspecial
                            ? 'text-purple-600 dark:text-purple-300 font-extrabold drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]'
                            : 'text-(--color-primary) font-extrabold' 
                          : hito?.tipo === 'feriado'
                            ? 'text-rose-600 dark:text-rose-300 font-extrabold'
                            : hito
                              ? 'text-amber-600 dark:text-amber-300 font-extrabold'
                              : 'text-(--text-body)'
                  }`}>
                    {diaNum}
                  </span>

                  {turno && (
                    <span 
                      className={`hidden sm:inline ${resolution.turnBadgeSize} px-1.5 py-0.5 rounded truncate font-mono ${
                        isPast 
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-(--border-color)' 
                          : turno.esEspecial
                            ? 'bg-purple-500/20 text-purple-700 dark:text-purple-200 border border-purple-400/60 font-bold shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                            : 'bg-(--color-primary-bg) text-(--color-primary) border border-(--color-primary-border) font-bold'
                      }`}
                      title={`${turno.nombre} (${formatRangoFechas(turno.fechaInicio, turno.fechaFin)})`}
                    >
                      {turno.nombreCorto.replace('Llamado ', 'Ll.')}
                    </span>
                  )}
                </div>

                {/* Micro dots en mobile */}
                <div className="flex sm:hidden items-center justify-center gap-1.5 my-auto pt-0.5">
                  {metasEnEsteDia.length > 0 && (
                    <span 
                      className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" 
                      title="Meta agendada" 
                    />
                  )}
                  {esDiaMesaActiva && metasEnEsteDia.length === 0 && (
                    <span 
                      className={`w-1.5 h-1.5 rounded-full ${
                        turno.esEspecial
                          ? 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]'
                          : 'bg-(--color-primary) shadow-[0_0_6px_var(--color-primary-glow)]'
                      }`} 
                      title={turno.nombre} 
                    />
                  )}
                  {hito && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHito(hito);
                      }}
                      aria-label={`Ver: ${hito.titulo}`}
                      className={`w-2.5 h-2.5 rounded-full transition-all flex items-center justify-center p-0 ${
                        selectedHito?.id === hito.id
                          ? hito.tipo === 'feriado'
                            ? 'bg-rose-400 ring-2 ring-rose-500 scale-125 shadow-[0_0_8px_rgba(244,63,94,0.9)]'
                            : 'bg-amber-400 ring-2 ring-amber-500 scale-125 shadow-[0_0_8px_rgba(245,158,11,0.9)]'
                          : hito.tipo === 'feriado'
                            ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)] hover:scale-110'
                            : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)] hover:scale-110'
                      }`}
                    />
                  )}
                </div>

                {/* Contenido desktop */}
                <div className="hidden sm:block space-y-1 my-0.5">
                  {hito && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHito(hito);
                      }}
                      className={`w-full text-left ${resolution.metaBadgeSize} px-1.5 py-0.5 rounded truncate cursor-pointer transition-colors font-medium flex items-center gap-1 ${
                        hito.tipo === 'feriado'
                          ? 'bg-rose-500/15 dark:bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25'
                          : 'bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25'
                      }`}
                      title={`Clic para ver detalle: ${hito.titulo}`}
                    >
                      <span className="shrink-0 text-[8px]">{hito.tipo === 'feriado' ? '🚫' : '📌'}</span>
                      <span className="truncate">{cell.dateStr === hito.fechaFin && hito.tipo === 'inscripcion' ? `Cierre: ${hito.titulo}` : hito.titulo}</span>
                    </button>
                  )}

                  {metasEnEsteDia.map(meta => {
                    const materia = MATERIAS_MAP[meta.materiaId];
                    return (
                      <div
                        key={meta.materiaId}
                        className={`px-1.5 py-0.5 rounded bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/60 text-emerald-700 dark:text-emerald-200 ${resolution.metaBadgeSize} font-bold flex items-center justify-between gap-1 shadow-[0_0_8px_rgba(16,185,129,0.2)]`}
                        title={`Meta agendada: ${materia?.nombreCompleto || meta.turnoNombre}`}
                      >
                        <span className="truncate">{materia?.nombre || `#${meta.materiaId}`}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMetaExamen(meta.materiaId);
                          }}
                          className="text-emerald-600 dark:text-emerald-300 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                          title="Quitar meta"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}

                  {esDiaMesaActiva && metasEnEsteDia.length === 0 && regularesQueRindenHoy.length > 0 && (
                    <button
                      type="button"
                      className={`w-full text-left ${resolution.metaBadgeSize} px-1.5 py-0.5 rounded border truncate font-semibold cursor-pointer transition-colors ${
                        turno.esEspecial
                          ? 'bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200 border-purple-400/40 hover:bg-purple-500/30'
                          : 'bg-(--color-primary-bg) text-(--color-primary) border border-(--color-primary-border) hover:opacity-90'
                      }`}
                      title={`¡Podés rendir hoy (${regularesQueRindenHoy.length}): ${regularesQueRindenHoy.map(m => m.nombre).join(', ')}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMetaDialog(cell.dateStr, turno);
                      }}
                    >
                      ⭐ Rinde: {regularesQueRindenHoy.map(m => m.nombre).join(', ')}
                    </button>
                  )}
                </div>

                {/* Botón Anotar en desktop */}
                {esDiaMesaActiva && metasEnEsteDia.length === 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMetaDialog(cell.dateStr, turno);
                    }}
                    className={`hidden sm:flex w-full ${resolution.anotarButtonSize} rounded border font-mono font-semibold items-center justify-center gap-1 transition-all shadow-sm cursor-pointer ${
                      turno.esEspecial
                        ? 'border-purple-500/40 hover:border-purple-300 bg-purple-500/10 hover:bg-purple-500/25 text-purple-600 dark:text-purple-300 hover:text-(--text-body)'
                        : 'border-(--color-primary-border) hover:border-(--color-primary) bg-(--color-primary-bg) hover:opacity-90 text-(--color-primary)'
                    }`}
                    title={`Anotar meta para rendir en ${diaSemanaNombre} ${cell.dateStr}`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Anotar</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal flotante de información de Hito Académico */}
      {selectedHito && (
        <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
            onClick={() => setSelectedHito(null)}
          />
          <div 
            className={`relative z-10 bg-(--bg-surface) border rounded-2xl max-w-md w-full p-4 sm:p-5 space-y-3 shadow-2xl font-mono text-left animate-in slide-in-from-bottom-4 duration-200 ${
              selectedHito.tipo === 'feriado'
                ? 'border-rose-500/50 shadow-[0_0_24px_rgba(244,63,94,0.2)]'
                : 'border-amber-500/50 shadow-[0_0_24px_rgba(245,158,11,0.2)]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                selectedHito.tipo === 'feriado'
                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40'
                  : selectedHito.tipo === 'inscripcion'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                    : selectedHito.tipo === 'receso'
                      ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
              }`}>
                {selectedHito.tipo === 'feriado' ? '🚫 Feriado / Asueto' : selectedHito.tipo === 'inscripcion' ? '📝 Inscripción Sysacad' : selectedHito.tipo === 'receso' ? '🏖️ Receso Invernal' : '🎓 Ciclo Lectivo'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedHito(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-(--text-body) hover:bg-(--border-color)/50 transition-colors cursor-pointer"
                aria-label="Cerrar detalle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="font-syne font-bold text-sm sm:text-base text-(--text-body)">
                {selectedHito.titulo}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {selectedHito.detalle}
              </p>
            </div>

            <div className="pt-2 border-t border-(--border-color) flex items-center justify-between text-xs">
              <div className={`flex items-center gap-1.5 ${selectedHito.tipo === 'feriado' ? 'text-rose-600 dark:text-rose-300/90' : 'text-amber-600 dark:text-amber-300/90'}`}>
                <CalendarIcon className={`w-3.5 h-3.5 ${selectedHito.tipo === 'feriado' ? 'text-rose-500' : 'text-amber-500'}`} />
                <span>
                  {formatRangoFechas(selectedHito.fechaInicio, selectedHito.fechaFin)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHito(null)}
                className={`px-3 py-1 rounded-lg text-xs border transition-colors cursor-pointer ${
                  selectedHito.tipo === 'feriado'
                    ? 'bg-rose-500/15 dark:bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-200 hover:bg-rose-500/30'
                    : 'bg-amber-500/15 dark:bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-200 hover:bg-amber-500/30'
                }`}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
