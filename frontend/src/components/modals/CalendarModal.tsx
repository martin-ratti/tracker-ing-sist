import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { 
  TURNOS_EXAMEN, 
  getFechaExactaMesa,
  type TurnoExamenOficial,
  type HitoAcademico
} from '../../data/calendario';
import { MATERIAS_TRONCALES, MATERIAS_MAP } from '../../data/plan2023';
import { 
  X, 
  Calendar as CalendarIcon, 
  Target, 
  CalendarDays, 
  List
} from 'lucide-react';
import { exportMetasToICS } from '../../utils/icsExporter';
import { useViewportResolution } from '../../hooks/useViewportResolution';
import { CalendarMonthGrid, type CalendarCell } from './calendar/CalendarMonthGrid';
import { CalendarMetasTab } from './calendar/CalendarMetasTab';
import { CalendarTurnosTab } from './calendar/CalendarTurnosTab';
import { CalendarScheduleDialog, type MetaDialogState } from './calendar/CalendarScheduleDialog';
import { CalendarDayDetailModal } from './calendar/CalendarDayDetailModal';
import { CalendarScheduleGlobalizadorDialog } from './calendar/CalendarScheduleGlobalizadorDialog';

export const CalendarModal: React.FC = () => {
  const { 
    calendarOpen, 
    setCalendarOpen, 
    metasExamen, 
    setMetaExamen,
    removeMetaExamen, 
    metasGlobalizador,
    setMetaGlobalizador,
    removeMetaGlobalizador,
    estados,
    setEstadoDirecto,
    esMateriaCursable,
    setSelectedSubjectId,
    showToast
  } = useTracker();

  const { isMounted, isVisible } = useModalAnimation(calendarOpen, 200);
  const [activeTab, setActiveTab] = useState<'calendario' | 'metas' | 'turnos'>('calendario');
  const resolution = useViewportResolution(activeTab === 'calendario');
  const [selectedHito, setSelectedHito] = useState<HitoAcademico | null>(null);

  const modalRef = useFocusTrap(calendarOpen);

  const handleExportICS = useCallback(() => {
    const metas = Object.values(metasExamen);
    const globs = Object.values(metasGlobalizador);
    if (metas.length === 0 && globs.length === 0) {
      showToast('⚠️ No tienes metas de final ni de globalizador agendadas para exportar', 'warning');
      return;
    }
    const ok = exportMetasToICS(metas, globs);
    if (ok) {
      showToast('📅 ¡Archivo .ics descargado con éxito!', 'success');
    }
  }, [metasExamen, metasGlobalizador, showToast]);

  // Fecha actual de referencia
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, [today]);

  // Estado de navegación en el calendario (mes y año)
  const [navYear, setNavYear] = useState<number>(() => today.getFullYear());
  const [navMonth, setNavMonth] = useState<number>(() => today.getMonth());

  // Diálogo para agendar meta de final desde una celda del calendario
  const [metaDialog, setMetaDialog] = useState<MetaDialogState | null>(null);
  const [materiaSeleccionadaId, setMateriaSeleccionadaId] = useState<number | ''>('');
  const [metaComentarioInput, setMetaComentarioInput] = useState('');

  // Estados para Detalle del Día y Meta de Globalizador
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    fechaStr: string;
    turno: TurnoExamenOficial | null;
    hito: HitoAcademico | null;
  } | null>(null);
  const [globalizadorDialogFecha, setGlobalizadorDialogFecha] = useState<string | null>(null);

  // Cerrar con Escape
  useEffect(() => {
    if (!calendarOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (globalizadorDialogFecha) {
          setGlobalizadorDialogFecha(null);
        } else if (metaDialog) {
          setMetaDialog(null);
        } else if (selectedDayDetail) {
          setSelectedDayDetail(null);
        } else {
          setCalendarOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [calendarOpen, setCalendarOpen, metaDialog, selectedDayDetail, globalizadorDialogFecha]);

  const metasArray = useMemo(() => Object.values(metasExamen), [metasExamen]);
  const metasGlobalizadorArray = useMemo(() => Object.values(metasGlobalizador), [metasGlobalizador]);

  // Materias regulares sin meta asignada
  const materiasRegularesSinMeta = useMemo(() => {
    return MATERIAS_TRONCALES.filter(m => estados[m.id] === 'regular' && !metasExamen[m.id]);
  }, [estados, metasExamen]);

  // Materias cursables sin globalizador asignado
  const materiasCursablesSinGlobalizador = useMemo(() => {
    return MATERIAS_TRONCALES.filter(m => esMateriaCursable(m) && !metasGlobalizador[m.id]);
  }, [esMateriaCursable, metasGlobalizador]);

  // Accesos rápidos por mes
  const mesesConTurnos = useMemo(() => {
    const list: Array<{ label: string; y: number; m: number }> = [];
    const vistos = new Set<string>();

    for (const t of TURNOS_EXAMEN) {
      const d = new Date(t.fechaInicio + 'T00:00:00');
      const mesNum = d.getMonth();
      const sufijo = t.esEspecial ? ' (Esp)' : '';
      const mesCorto = t.mes.slice(0, 3);
      const anioCorto = String(t.anio).slice(-2);
      const label = `${mesCorto} '${anioCorto}${sufijo}`;
      const key = `${t.anio}-${mesNum}-${t.esEspecial ? 'esp' : 'comun'}`;

      if (!vistos.has(key)) {
        vistos.add(key);
        list.push({ label, y: t.anio, m: mesNum });
      }
    }
    return list;
  }, []);

  const handlePrevMonth = () => {
    setSelectedHito(null);
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear(prev => prev - 1);
    } else {
      setNavMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedHito(null);
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear(prev => prev + 1);
    } else {
      setNavMonth(prev => prev + 1);
    }
  };

  const handleIrAHoy = () => {
    setSelectedHito(null);
    setNavYear(today.getFullYear());
    setNavMonth(today.getMonth());
  };

  const handleJumpMonth = (y: number, m: number) => {
    setSelectedHito(null);
    setNavYear(y);
    setNavMonth(m);
  };

  // Cálculo de 42 celdas para el mes
  const calendarCells = useMemo<CalendarCell[]>(() => {
    const firstDay = new Date(navYear, navMonth, 1);
    const lastDay = new Date(navYear, navMonth + 1, 0);

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = lastDay.getDate();
    const prevMonthLastDay = new Date(navYear, navMonth, 0).getDate();

    const cells: CalendarCell[] = [];

    // Días previos
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(navYear, navMonth - 1, prevMonthLastDay - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      cells.push({ date: d, dateStr: `${y}-${m}-${day}`, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(navYear, navMonth, i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      cells.push({ date: d, dateStr: `${y}-${m}-${day}`, isCurrentMonth: true });
    }

    // Completar a 42 celdas (6 filas x 7 columnas fijas)
    const TOTAL_CELDAS = 42;
    const remaining = TOTAL_CELDAS - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(navYear, navMonth + 1, i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      cells.push({ date: d, dateStr: `${y}-${m}-${day}`, isCurrentMonth: false });
    }

    return cells;
  }, [navYear, navMonth]);

  // Helper para countdown de días restantes
  const getDaysRemaining = useCallback((targetDateStr: string) => {
    const target = new Date(targetDateStr + 'T00:00:00');
    const diffMs = target.getTime() - today.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { days, text: `Mesa finalizada hace ${Math.abs(days)} d`, badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700' };
    }
    if (days === 0) {
      return { days, text: '¡Comienza hoy!', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' };
    }
    if (days <= 7) {
      return { days, text: `¡Quedan ${days} días!`, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold' };
    }
    return { days, text: `Faltan ${days} días`, badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
  }, [today]);

  const handleOpenMetaDialog = (fechaStr: string, turno: TurnoExamenOficial) => {
    const dateObj = new Date(fechaStr + 'T00:00:00');
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaNombre = diasSemana[dateObj.getDay()];

    setMetaDialog({ fechaStr, diaNombre, turno });
    setMetaComentarioInput('');

    if (materiasRegularesSinMeta.length > 0) {
      setMateriaSeleccionadaId(materiasRegularesSinMeta[0].id);
    } else {
      setMateriaSeleccionadaId('');
    }
  };

  const handleConfirmarMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaDialog || !materiaSeleccionadaId) return;

    const turno = metaDialog.turno;
    setMetaExamen(materiaSeleccionadaId, {
      materiaId: materiaSeleccionadaId,
      turnoId: turno.id,
      turnoNombre: turno.nombre,
      fechaEstimada: metaDialog.fechaStr,
      llamado: typeof turno.llamado === 'number' ? turno.llamado : undefined,
      comentario: metaComentarioInput.trim() || undefined
    });

    setMetaDialog(null);
  };

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2.5 sm:p-4 lg:p-6 no-scrollbar">
      <div
        className={`fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
        onClick={() => setCalendarOpen(false)}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-modal-title"
        className={`relative z-10 bg-(--bg-surface) border border-(--border-color) rounded-2xl sm:rounded-3xl w-full flex flex-col overflow-hidden shadow-2xl my-auto transform transition-all duration-200 ease-out ${resolution.calendarModalSize} ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        {/* Cabecera del modal con selector de pestañas */}
        <div className="p-2.5 sm:p-5 border-b border-(--border-color) bg-(--bg-elevated) relative shrink-0">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div 
                className="p-1.5 sm:p-2 rounded-xl border shrink-0"
                style={{
                  backgroundColor: 'var(--color-primary-bg)',
                  borderColor: 'var(--color-primary-border)',
                  color: 'var(--color-primary)'
                }}
              >
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 id="calendar-modal-title" className="text-sm sm:text-lg font-bold font-syne text-(--text-body) leading-tight truncate">
                  Calendario Académico y Metas
                </h2>
                <p className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 line-clamp-1 sm:line-clamp-none">
                  Mesas oficiales de examen, hitos y planificación
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCalendarOpen(false)}
              aria-label="Cerrar calendario académico"
              className="p-1.5 rounded-xl text-slate-400 hover:text-(--text-body) hover:bg-(--border-color)/40 active:scale-90 transition-all min-w-9 min-h-9 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selector de Pestañas (Tabs) adaptativo y simétrico en mobile */}
          <div className="grid grid-cols-3 gap-1.5 mt-2.5 sm:flex sm:items-center sm:gap-2 sm:mt-3 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('calendario')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap min-w-0 ${
                activeTab === 'calendario'
                  ? 'bg-(--color-primary-bg) text-(--color-primary) border-(--color-primary-border) font-bold shadow-sm'
                  : 'bg-(--bg-surface) text-slate-500 dark:text-slate-400 border-(--border-color) hover:text-(--text-body)'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Vista Mensual</span>
              <span className="sm:hidden">Mensual</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('metas')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap min-w-0 ${
                activeTab === 'metas'
                  ? 'bg-(--color-primary-bg) text-(--color-primary) border-(--color-primary-border) font-bold shadow-sm'
                  : 'bg-(--bg-surface) text-slate-500 dark:text-slate-400 border-(--border-color) hover:text-(--text-body)'
              }`}
            >
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Mis Metas de Final ({metasArray.length})</span>
              <span className="sm:hidden">Metas ({metasArray.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('turnos')}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap min-w-0 ${
                activeTab === 'turnos'
                  ? 'bg-(--color-primary-bg) text-(--color-primary) border-(--color-primary-border) font-bold shadow-sm'
                  : 'bg-(--bg-surface) text-slate-500 dark:text-slate-400 border-(--border-color) hover:text-(--text-body)'
              }`}
            >
              <List className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Turnos Oficiales y Sysacad</span>
              <span className="sm:hidden">Turnos</span>
            </button>
          </div>
        </div>

        {/* Cuerpo del Modal con scroll adaptativo */}
        <div
          className={`overflow-y-auto flex-1 no-scrollbar ${
            activeTab === 'calendario'
              ? `${resolution.containerPadding} flex flex-col min-h-0`
              : 'p-3 sm:p-5 space-y-4'
          }`}
        >
          {activeTab === 'calendario' && (
            <CalendarMonthGrid
              navYear={navYear}
              navMonth={navMonth}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onIrAHoy={handleIrAHoy}
              onJumpMonth={handleJumpMonth}
              mesesConTurnos={mesesConTurnos}
              calendarCells={calendarCells}
              todayStr={todayStr}
              metasArray={metasArray}
              metasGlobalizadorArray={metasGlobalizadorArray}
              estados={estados}
              metasExamen={metasExamen}
              removeMetaExamen={removeMetaExamen}
              removeMetaGlobalizador={removeMetaGlobalizador}
              selectedHito={selectedHito}
              setSelectedHito={setSelectedHito}
              onOpenMetaDialog={handleOpenMetaDialog}
              onSelectDay={(fechaStr, turno, hito) => setSelectedDayDetail({ fechaStr, turno, hito })}
            />
          )}

          {activeTab === 'metas' && (
            <CalendarMetasTab
              metasArray={metasArray}
              metasGlobalizadorArray={metasGlobalizadorArray}
              onRemoveMeta={removeMetaExamen}
              onRemoveMetaGlobalizador={removeMetaGlobalizador}
              onAprobarGlobalizador={(materiaId) => {
                setEstadoDirecto(materiaId, 'regular');
                removeMetaGlobalizador(materiaId);
                const mat = MATERIAS_MAP[materiaId];
                showToast(`🎉 ¡Felicitaciones! "${mat?.nombre || materiaId}" pasada a Regular`, 'success');
              }}
              onExportICS={handleExportICS}
              onSelectSubject={(materiaId) => {
                setCalendarOpen(false);
                setSelectedSubjectId(materiaId);
              }}
              getDaysRemaining={getDaysRemaining}
            />
          )}

          {activeTab === 'turnos' && (
            <CalendarTurnosTab
              metasArray={metasArray}
              getDaysRemaining={getDaysRemaining}
            />
          )}
        </div>
      </div>

      {/* Modal de Detalle del Día */}
      {selectedDayDetail && (
        <CalendarDayDetailModal
          fechaStr={selectedDayDetail.fechaStr}
          turno={selectedDayDetail.turno}
          hito={selectedDayDetail.hito}
          onClose={() => setSelectedDayDetail(null)}
          metasFinalEnEsteDia={metasArray.filter(m => {
            if (m.fechaEstimada) return m.fechaEstimada === selectedDayDetail.fechaStr;
            if (selectedDayDetail.turno && m.turnoId === selectedDayDetail.turno.id) {
              const fe = getFechaExactaMesa(m.materiaId, selectedDayDetail.turno);
              return fe ? fe.fechaExactaStr === selectedDayDetail.fechaStr : false;
            }
            return false;
          })}
          metasGlobalizadorEnEsteDia={metasGlobalizadorArray.filter(mg => mg.fecha === selectedDayDetail.fechaStr)}
          onOpenAgendarFinal={handleOpenMetaDialog}
          onOpenAgendarGlobalizador={(fecha) => {
            setSelectedDayDetail(null);
            setGlobalizadorDialogFecha(fecha);
          }}
          onRemoveMetaFinal={removeMetaExamen}
          onRemoveMetaGlobalizador={removeMetaGlobalizador}
          onAprobarGlobalizador={(materiaId) => {
            setEstadoDirecto(materiaId, 'regular');
            removeMetaGlobalizador(materiaId);
            const mat = MATERIAS_MAP[materiaId];
            showToast(`🎉 ¡Felicitaciones! "${mat?.nombre || materiaId}" pasada a Regular`, 'success');
          }}
          onSelectSubject={(materiaId) => {
            setCalendarOpen(false);
            setSelectedSubjectId(materiaId);
          }}
        />
      )}

      {/* Diálogo para agendar meta de globalizador */}
      {globalizadorDialogFecha && (
        <CalendarScheduleGlobalizadorDialog
          fechaStr={globalizadorDialogFecha}
          onClose={() => setGlobalizadorDialogFecha(null)}
          materiasCursables={materiasCursablesSinGlobalizador}
          onConfirm={(materiaId, fecha, comentario) => {
            setMetaGlobalizador(materiaId, { materiaId, fecha, comentario });
            setGlobalizadorDialogFecha(null);
          }}
        />
      )}

      {/* Diálogo para agendar meta de final */}
      {metaDialog && (
        <CalendarScheduleDialog
          metaDialog={metaDialog}
          onClose={() => setMetaDialog(null)}
          materiasRegularesSinMeta={materiasRegularesSinMeta}
          materiaSeleccionadaId={materiaSeleccionadaId}
          setMateriaSeleccionadaId={setMateriaSeleccionadaId}
          metaComentarioInput={metaComentarioInput}
          setMetaComentarioInput={setMetaComentarioInput}
          onConfirm={handleConfirmarMeta}
          hasRegulares={MATERIAS_TRONCALES.some(m => estados[m.id] === 'regular')}
        />
      )}
    </div>
  );
};
