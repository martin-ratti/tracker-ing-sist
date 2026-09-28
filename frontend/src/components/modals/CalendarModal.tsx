import React, { useState, useEffect, useMemo } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { 
  TURNOS_EXAMEN, 
  HITOS_ACADEMICOS, 
  REGLA_SYSACAD_EXAMEN,
  isPastDate,
  isFechaEnTurno,
  getFechaExactaMesa,
  DIAS_MESA_POR_MATERIA,
  type TurnoExamenOficial,
  type HitoAcademico
} from '../../data/calendario';
import { MATERIAS_MAP, MATERIAS_TRONCALES } from '../../data/plan2023';
import { 
  X, 
  Calendar as CalendarIcon, 
  Target, 
  Clock, 
  CalendarDays, 
  Trash2, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  List,
  Download
} from 'lucide-react';
import { exportMetasToICS } from '../../utils/icsExporter';

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

export const CalendarModal: React.FC = () => {
  const { 
    calendarOpen, 
    setCalendarOpen, 
    metasExamen, 
    setMetaExamen,
    removeMetaExamen, 
    estados,
    setSelectedSubjectId,
    showToast
  } = useTracker();

  const [activeTab, setActiveTab] = useState<'calendario' | 'metas' | 'turnos'>('calendario');
  const [selectedHito, setSelectedHito] = useState<HitoAcademico | null>(null);

  const handleExportICS = () => {
    const metas = Object.values(metasExamen);
    if (metas.length === 0) {
      showToast('⚠️ No tienes metas de final agendadas para exportar', 'warning');
      return;
    }
    const ok = exportMetasToICS(metas);
    if (ok) {
      showToast('📅 ¡Archivo .ics descargado con éxito!', 'success');
    }
  };
  const modalRef = useFocusTrap(calendarOpen);

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

  // Diálogo para agendar meta desde una celda del calendario
  const [metaDialog, setMetaDialog] = useState<{
    fechaStr: string;
    diaNombre: string;
    turno: TurnoExamenOficial;
  } | null>(null);

  const [materiaSeleccionadaId, setMateriaSeleccionadaId] = useState<number | ''>('');
  const [metaComentarioInput, setMetaComentarioInput] = useState('');

  // Cerrar con Escape
  useEffect(() => {
    if (!calendarOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (metaDialog) {
          setMetaDialog(null);
        } else {
          setCalendarOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [calendarOpen, setCalendarOpen, metaDialog]);

  const metasArray = Object.values(metasExamen);

  // Lista de materias regulares que aún no tienen una mesa/meta asignada
  const materiasRegularesSinMeta = useMemo(() => {
    return MATERIAS_TRONCALES.filter(m => estados[m.id] === 'regular' && !metasExamen[m.id]);
  }, [estados, metasExamen]);

  // Lista dinámica de accesos rápidos calculada a partir de los turnos oficiales registrados
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
        list.push({
          label,
          y: t.anio,
          m: mesNum
        });
      }
    }
    return list;
  }, []);

  // Funciones de navegación de meses
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

  // Cálculo de celdas para la cuadrícula del mes
  const calendarCells = useMemo(() => {
    const firstDay = new Date(navYear, navMonth, 1);
    const lastDay = new Date(navYear, navMonth + 1, 0);

    // Ajuste: 0 (Domingo) pasa a ser 6; Lunes (1) pasa a 0
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = lastDay.getDate();
    const prevMonthLastDay = new Date(navYear, navMonth, 0).getDate();

    const cells: Array<{
      date: Date;
      dateStr: string;
      isCurrentMonth: boolean;
    }> = [];

    // Días previos
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(navYear, navMonth - 1, prevMonthLastDay - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      cells.push({
        date: d,
        dateStr: `${y}-${m}-${day}`,
        isCurrentMonth: false
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(navYear, navMonth, i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      cells.push({
        date: d,
        dateStr: `${y}-${m}-${day}`,
        isCurrentMonth: true
      });
    }

    // Completar siempre exactamente a 42 celdas (6 filas fijas x 7 columnas)
    // para que absolutamente TODOS los meses mantengan dimensiones y altura idénticas en móvil y desktop
    const TOTAL_CELDAS = 42;
    const remaining = TOTAL_CELDAS - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(navYear, navMonth + 1, i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      cells.push({
        date: d,
        dateStr: `${y}-${m}-${day}`,
        isCurrentMonth: false
      });
    }

    return cells;
  }, [navYear, navMonth]);

  // Helper para countdown de días restantes
  const getDaysRemaining = (targetDateStr: string) => {
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
  };

  // Abrir diálogo de creación de meta en un día específico
  const handleOpenMetaDialog = (fechaStr: string, turno: TurnoExamenOficial) => {
    const d = new Date(fechaStr + 'T00:00:00');
    const diaSemanaNombre = DIAS_SEMANA_MAP[d.getDay()] || 'Lunes';
    
    // Buscar si hay materias regulares sin meta asignada que rindan este día
    const candidata = materiasRegularesSinMeta.find(m => DIAS_MESA_POR_MATERIA[m.id] === diaSemanaNombre);
    setMateriaSeleccionadaId(candidata ? candidata.id : (materiasRegularesSinMeta[0]?.id || ''));
    setMetaComentarioInput('');
    setMetaDialog({
      fechaStr,
      diaNombre: diaSemanaNombre,
      turno
    });
  };

  const handleConfirmarMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaDialog || !materiaSeleccionadaId) return;

    const materia = MATERIAS_MAP[Number(materiaSeleccionadaId)];
    if (!materia) return;

    setMetaExamen(materia.id, {
      materiaId: materia.id,
      turnoId: metaDialog.turno.id,
      turnoNombre: metaDialog.turno.nombre,
      fechaEstimada: metaDialog.fechaStr,
      llamado: typeof metaDialog.turno.llamado === 'number' ? metaDialog.turno.llamado : undefined,
      comentario: metaComentarioInput.trim() || undefined
    });

    setMetaDialog(null);
  };

  if (!calendarOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 no-scrollbar"
      onClick={() => setCalendarOpen(false)}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-modal-title"
        className="bg-(--bg-surface) border border-(--border-color) rounded-2xl sm:rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] sm:max-h-[90vh] my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header institucional */}
        <div className="p-3.5 sm:p-5 border-b border-(--border-color) bg-(--bg-elevated) flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div 
              className="p-2 sm:p-2.5 rounded-xl border shadow-lg transition-all shrink-0"
              style={{
                backgroundColor: 'var(--color-primary-bg)',
                borderColor: 'var(--color-primary-border)',
                color: 'var(--color-primary)'
              }}
            >
              <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 id="calendar-modal-title" className="text-sm sm:text-lg font-bold font-syne text-(--text-body) tracking-wide">
                  Calendario Académico
                </h2>
                <span 
                  className="text-[9px] sm:text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border"
                  style={{
                    backgroundColor: 'var(--color-primary-bg)',
                    borderColor: 'var(--color-primary-border)',
                    color: 'var(--color-primary)'
                  }}
                >
                  UTN FRRo · ISI
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-mono text-slate-500 dark:text-slate-400 line-clamp-1 sm:line-clamp-none">
                Plan 2023 · Turnos oficiales de examen y metas de final
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {metasArray.length > 0 && (
              <button
                type="button"
                onClick={handleExportICS}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono bg-(--color-primary-bg) text-(--color-primary) border border-(--color-primary-border) hover:opacity-90 transition-opacity shadow-sm"
                title="Exportar mis metas a formato .ics para Google Calendar y Apple Calendar"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Exportar .ics</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCalendarOpen(false)}
              aria-label="Cerrar calendario académico"
              className="p-2 rounded-xl text-slate-400 hover:text-(--text-body) hover:bg-(--border-color)/50 transition-colors min-w-9 min-h-9 flex items-center justify-center shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <div className="flex border-b border-(--border-color) bg-(--bg-base) px-3 sm:px-6 pt-1.5 sm:pt-2 text-xs font-mono gap-1 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('calendario')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 border-b-2 transition-colors whitespace-nowrap text-xs ${
              activeTab === 'calendario'
                ? 'border-(--color-primary) text-(--color-primary) font-bold bg-(--color-primary-bg)'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-(--text-body)'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">Calendario</span>
            <span className="hidden sm:inline">Calendario Mensual Interactivo</span>
          </button>

          <button
            onClick={() => setActiveTab('metas')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 border-b-2 transition-colors whitespace-nowrap text-xs ${
              activeTab === 'metas'
                ? 'border-(--color-primary) text-(--color-primary) font-bold bg-(--color-primary-bg)'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-(--text-body)'
            }`}
          >
            <Target className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">Metas ({metasArray.length})</span>
            <span className="hidden sm:inline">Mis Metas de Final ({metasArray.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('turnos')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 border-b-2 transition-colors whitespace-nowrap text-xs ${
              activeTab === 'turnos'
                ? 'border-(--color-primary) text-(--color-primary) font-bold bg-(--color-primary-bg)'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-(--text-body)'
            }`}
          >
            <List className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">Turnos</span>
            <span className="hidden sm:inline">Listado de Turnos & Sysacad</span>
          </button>
        </div>

        {/* Contenedor con Scroll */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4 no-scrollbar">
          
          {/* TAB 1: CALENDARIO MENSUAL "POSTA" */}
          {activeTab === 'calendario' && (
            <div className="space-y-3 font-mono">
              
              {/* Barra superior de navegación por mes */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-(--bg-elevated) border border-(--border-color) shadow-sm">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg border border-(--border-color) bg-(--bg-surface) text-(--text-body) hover:bg-(--border-color)/40 transition-colors"
                    title="Mes anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="text-center min-w-[170px]">
                    <span className="font-syne font-extrabold text-base text-(--text-body) tracking-wide block">
                      {NOMBRES_MESES[navMonth]} {navYear}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg border border-(--border-color) bg-(--bg-surface) text-(--text-body) hover:bg-(--border-color)/40 transition-colors"
                    title="Mes siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleIrAHoy}
                    className="ml-2 px-2.5 py-1 rounded-lg text-[11px] bg-(--bg-surface) border border-(--border-color) text-slate-600 dark:text-slate-300 hover:text-(--text-body) transition-colors"
                  >
                    Hoy
                  </button>
                </div>

                {/* Accesos directos a meses con mesas de examen (generado dinámicamente) */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] hidden md:inline">Ir a Turno:</span>
                  {mesesConTurnos.map(btn => (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={() => { setNavYear(btn.y); setNavMonth(btn.m); setSelectedHito(null); }}
                      className={`px-1.5 sm:px-2 py-0.5 rounded border transition-colors text-[10px] sm:text-[11px] ${
                        navYear === btn.y && navMonth === btn.m
                          ? 'bg-(--color-primary-bg) border-(--color-primary-border) text-(--color-primary) font-bold'
                          : 'bg-(--bg-surface) border-(--border-color) text-slate-600 dark:text-slate-400 hover:text-(--text-body)'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leyenda visual del calendario */}
              <div className="flex items-center gap-2.5 sm:gap-4 text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 px-1 sm:px-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <span 
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded border shrink-0" 
                    style={{
                      backgroundColor: 'var(--color-primary-bg)',
                      borderColor: 'var(--color-primary-border)',
                      boxShadow: '0 0 8px var(--color-primary-glow)'
                    }}
                  />
                  <span>Mesa Común</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded border border-purple-400/80 bg-purple-500/20 text-purple-700 dark:text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.4)] shrink-0" />
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
                <div className="flex items-center gap-1 hidden sm:flex">
                  <span className="w-2.5 h-2.5 rounded border border-(--border-color) bg-slate-300 dark:bg-slate-800 opacity-60 shrink-0" />
                  <span>Día pasado</span>
                </div>
              </div>

              {/* Cuadrícula de 7 columnas */}
              <div className="rounded-xl border border-(--border-color) overflow-hidden bg-(--bg-base)">
                {/* Cabecera de días de la semana */}
                <div className="grid grid-cols-7 border-b border-(--border-color) bg-(--bg-elevated) text-center text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 py-1.5 sm:py-2">
                  {DIAS_SEMANA_HEADERS.map((dia, idx) => (
                    <div key={idx} className={idx >= 5 ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}>
                      <span className="sm:hidden">{dia.charAt(0)}</span>
                      <span className="hidden sm:inline">{dia}</span>
                    </div>
                  ))}
                </div>

                {/* Celdas de días */}
                <div className="grid grid-cols-7 divide-x divide-y divide-(--border-color)">
                  {calendarCells.map((cell, idx) => {
                    const diaNum = cell.date.getDate();
                    const isPast = cell.dateStr < todayStr;
                    const isToday = cell.dateStr === todayStr;

                    // Buscar si hay turno de examen oficial en esta fecha
                    const turno = TURNOS_EXAMEN.find(t => isFechaEnTurno(cell.dateStr, t));
                    
                    // Buscar si hay hitos de calendario que apliquen a esta fecha
                    const hito = HITOS_ACADEMICOS.find(h => {
                      // Los recesos y feriados abarcan todo su periodo
                      if (h.tipo === 'receso' || h.tipo === 'feriado') {
                        if (h.fechaFin) return cell.dateStr >= h.fechaInicio && cell.dateStr <= h.fechaFin;
                        return cell.dateStr === h.fechaInicio;
                      }
                      // Para cuatrimestre e inscripciones, solo marcar el día de inicio y el día de cierre puntual
                      if (cell.dateStr === h.fechaInicio) return true;
                      if (h.fechaFin && cell.dateStr === h.fechaFin) return true;
                      return false;
                    });

                    // Buscar metas agendadas en esta fecha
                    const metasEnEsteDia = metasArray.filter(m => {
                      if (m.fechaEstimada) return m.fechaEstimada === cell.dateStr;
                      if (turno && m.turnoId === turno.id) {
                        const fe = getFechaExactaMesa(m.materiaId, turno);
                        return fe ? fe.fechaExactaStr === cell.dateStr : false;
                      }
                      return false;
                    });

                    // Día de la semana en español
                    const diaSemanaNombre = DIAS_SEMANA_MAP[cell.date.getDay()];
                    const esFinDeSemana = cell.date.getDay() === 0 || cell.date.getDay() === 6;

                    // Es día hábil de mesa activa (no pasado y de lunes a viernes durante el turno de examen)
                    const esDiaMesaActiva = turno && !isPast && !esFinDeSemana;

                    // Materias del plan que rinden este día y cuáles tiene regular el usuario SIN meta asignada aún
                    const materiasQueRindenHoy = MATERIAS_TRONCALES.filter(m => DIAS_MESA_POR_MATERIA[m.id] === diaSemanaNombre);
                    const regularesQueRindenHoy = materiasQueRindenHoy.filter(m => estados[m.id] === 'regular' && !metasExamen[m.id]);

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (hito) {
                            setSelectedHito(hito);
                          } else if (esDiaMesaActiva && metasEnEsteDia.length === 0) {
                            handleOpenMetaDialog(cell.dateStr, turno);
                          }
                        }}
                        className={`h-13 sm:h-auto sm:min-h-25 p-1 sm:p-2 flex flex-col justify-between transition-all relative group rounded-md sm:rounded-lg m-0.5 ${
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
                        {/* Fila superior de la celda: Número de día y badges */}
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[11px] sm:text-xs font-bold font-syne ${
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

                          {/* Nombre corto del turno si es día de examen (Desktop) */}
                          {turno && (
                            <span 
                              className={`hidden sm:inline text-[9px] px-1.5 py-0.5 rounded truncate max-w-[80px] font-mono ${
                                isPast 
                                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-(--border-color)' 
                                  : turno.esEspecial
                                    ? 'bg-purple-500/20 text-purple-700 dark:text-purple-200 border border-purple-400/60 font-bold shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                                    : 'bg-(--color-primary-bg) text-(--color-primary) border border-(--color-primary-border) font-bold'
                              }`}
                              title={`${turno.nombre} (${turno.fechaInicio} al ${turno.fechaFin})`}
                            >
                              {turno.nombreCorto.replace('Llamado ', 'Ll.')}
                            </span>
                          )}
                        </div>

                        {/* Indicadores en MOBILE (Micro dots) */}
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

                        {/* Contenido intermedio en DESKTOP: Hito o materias */}
                        <div className="hidden sm:block space-y-1 my-1">
                          {/* Hito académico o feriado */}
                          {hito && (
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedHito(hito);
                              }}
                              className={`text-[9px] px-1.5 py-0.5 rounded truncate cursor-pointer transition-colors font-medium flex items-center gap-1 ${
                                hito.tipo === 'feriado'
                                  ? 'bg-rose-500/15 dark:bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25'
                                  : 'bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25'
                              }`}
                              title={`Clic para ver detalle: ${hito.titulo}`}
                            >
                              <span className="shrink-0 text-[8px]">{hito.tipo === 'feriado' ? '🚫' : '📌'}</span>
                              <span className="truncate">{cell.dateStr === hito.fechaFin && hito.tipo === 'inscripcion' ? `Cierre: ${hito.titulo}` : hito.titulo}</span>
                            </div>
                          )}

                          {/* Metas agendadas por el usuario para esta fecha */}
                          {metasEnEsteDia.map(meta => {
                            const materia = MATERIAS_MAP[meta.materiaId];
                            return (
                              <div
                                key={meta.materiaId}
                                className="px-1.5 py-0.5 rounded bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/60 text-emerald-700 dark:text-emerald-200 text-[10px] font-bold flex items-center justify-between gap-1 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                                title={`Meta agendada: ${materia?.nombreCompleto || meta.turnoNombre}`}
                              >
                                <span className="truncate">{materia?.nombre || `#${meta.materiaId}`}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeMetaExamen(meta.materiaId);
                                  }}
                                  className="text-emerald-600 dark:text-emerald-300 hover:text-rose-500 p-0.5 transition-colors"
                                  title="Quitar meta"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            );
                          })}

                          {/* Sugerencia de materias regulares que rinden este día */}
                          {esDiaMesaActiva && metasEnEsteDia.length === 0 && regularesQueRindenHoy.length > 0 && (
                            <div 
                              className={`text-[9px] px-1.5 py-0.5 rounded border truncate font-semibold cursor-pointer transition-colors ${
                                turno.esEspecial
                                  ? 'bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200 border-purple-400/40 hover:bg-purple-500/30'
                                  : 'bg-(--color-primary-bg) text-(--color-primary) border border-(--color-primary-border) hover:opacity-90'
                              }`}
                              title={`¡Podés rendir hoy (${regularesQueRindenHoy.length}): ${regularesQueRindenHoy.map(m => m.nombre).join(', ')}`}
                              onClick={() => handleOpenMetaDialog(cell.dateStr, turno)}
                            >
                              ⭐ Rinde: {regularesQueRindenHoy.map(m => m.nombre).join(', ')}
                            </div>
                          )}
                        </div>

                        {/* Botón inferior: Anotar como Meta si es día de examen vigente (Desktop) */}
                        {esDiaMesaActiva && metasEnEsteDia.length === 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenMetaDialog(cell.dateStr, turno);
                            }}
                            className={`hidden sm:flex w-full py-1 rounded border text-[10px] font-mono font-semibold items-center justify-center gap-1 transition-all shadow-sm ${
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

              {/* Modal flotante de información de Hito Académico (Accesible en Mobile y Desktop) */}
              {selectedHito && (
                <div 
                  className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
                  onClick={() => setSelectedHito(null)}
                >
                  <div 
                    className={`bg-(--bg-surface) border rounded-2xl max-w-md w-full p-4 sm:p-5 space-y-3 shadow-2xl font-mono text-left animate-in slide-in-from-bottom-4 duration-200 ${
                      selectedHito.tipo === 'feriado'
                        ? 'border-rose-500/50 shadow-[0_0_24px_rgba(244,63,94,0.2)]'
                        : 'border-amber-500/50 shadow-[0_0_24px_rgba(245,158,11,0.2)]'
                    }`}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
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
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedHito(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-(--text-body) hover:bg-(--border-color)/50 transition-colors"
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
                          {selectedHito.fechaInicio}{selectedHito.fechaFin ? ` al ${selectedHito.fechaFin}` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedHito(null)}
                        className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
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
          )}

          {/* TAB 2: MIS METAS ACTIVAS */}
          {activeTab === 'metas' && (
            <div>
              {metasArray.length === 0 ? (
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
              ) : (
                <div className="space-y-3 font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pb-1">
                    <div className="flex items-center gap-2">
                      <span>Materias con mesa tentativa de examen agendada:</span>
                      <span className="px-2 py-0.5 rounded bg-(--bg-elevated) border border-(--border-color) text-(--color-primary) font-semibold">{metasArray.length} meta{metasArray.length !== 1 ? 's' : ''}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportICS}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-(--color-primary-bg) text-(--color-primary) border border-(--color-primary-border) hover:opacity-90 transition-opacity self-start sm:self-auto shadow-sm"
                      title="Descargar archivo .ics compatible con Google Calendar, Apple Calendar y Outlook"
                    >
                      <Download className="w-3.5 h-3.5 text-(--color-primary)" />
                      <span>Exportar a Calendario (.ics)</span>
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
                                onClick={() => removeMetaExamen(meta.materiaId)}
                                className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-(--border-color)/40 transition-colors"
                                title="Quitar meta"
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
                                  <span>📅 Mesa Oficial: {fechaExacta.diaNombre} {fechaExacta.fechaExactaStr}</span>
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
                              onClick={() => {
                                setCalendarOpen(false);
                                setSelectedSubjectId(meta.materiaId);
                              }}
                              className="text-xs text-(--color-primary) hover:underline flex items-center gap-1 transition-colors"
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
              )}
            </div>
          )}

          {/* TAB 3: LISTADO DE TURNOS Y SYSACAD */}
          {activeTab === 'turnos' && (
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
              </div>

              {/* Lista de Turnos */}
              <div className="space-y-2">
                <h4 className="font-syne font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Turnos Oficiales de Examen
                </h4>

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
                              ? `Días: ${turno.diasEspecificos.map(d => parseInt(d.split('-')[2], 10)).join(', ')} de ${turno.mes}`
                              : `${turno.fechaInicio} al ${turno.fechaFin}`}
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
          )}

        </div>
      </div>

      {/* DIÁLOGO POP-UP PARA ANOTAR META EN UN DÍA SELECCIONADO */}
      {metaDialog && (
        <div 
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 no-scrollbar"
          onClick={() => setMetaDialog(null)}
        >
          <div 
            className="bg-(--bg-surface) border border-(--color-primary-border) rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-5 space-y-4 shadow-2xl font-mono my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-(--border-color) pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-(--color-primary)" />
                <h3 className="font-syne font-bold text-(--text-body) text-base">
                  Anotar Meta de Examen
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMetaDialog(null)}
                className="p-1 rounded text-slate-400 hover:text-(--text-body)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 bg-(--bg-elevated) p-3 rounded-lg border border-(--border-color)">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Turno:</span>
                <span className="font-bold text-(--color-primary)">{metaDialog.turno.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Fecha seleccionada:</span>
                <span className="font-bold text-(--text-body)">{metaDialog.diaNombre} {metaDialog.fechaStr}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmarMeta} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-300 mb-1">
                  Materia Regular a Rendir:
                </label>
                {materiasRegularesSinMeta.length === 0 ? (
                  <p className="text-xs text-amber-500 dark:text-amber-400 italic bg-amber-500/10 p-2.5 rounded border border-amber-500/30">
                    {MATERIAS_TRONCALES.some(m => estados[m.id] === 'regular')
                      ? 'Todas tus materias regulares ya tienen una mesa de examen asignada. Podés consultarlas o editarlas en la pestaña "Mis Metas de Final".'
                      : 'No tienes materias en estado Regular actualmente. Pasa alguna materia a Regular en la Malla o Grafo para agendarla.'}
                  </p>
                ) : (
                  <select
                    value={materiaSeleccionadaId}
                    onChange={e => setMateriaSeleccionadaId(Number(e.target.value))}
                    className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-lg p-2 text-xs text-(--text-body) focus:outline-none focus:border-(--color-primary)"
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
                <label className="block text-[11px] text-slate-600 dark:text-slate-300 mb-1">
                  Recordatorio o notas de estudio (opcional):
                </label>
                <input
                  type="text"
                  value={metaComentarioInput}
                  onChange={e => setMetaComentarioInput(e.target.value)}
                  placeholder="Ej: Repasar finales anteriores de la cátedra..."
                  className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-lg p-2 text-xs text-(--text-body) placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-(--color-primary)"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-(--border-color)">
                <button
                  type="button"
                  onClick={() => setMetaDialog(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-(--text-body)"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={materiasRegularesSinMeta.length === 0 || !materiaSeleccionadaId}
                  className="px-4 py-1.5 rounded-lg bg-(--color-primary) hover:opacity-90 disabled:opacity-50 text-slate-950 font-bold text-xs transition-opacity shadow-md"
                >
                  Confirmar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
