import React, { useState, useEffect, useMemo } from 'react';
import { useTracker } from '../context/TrackerContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { 
  TURNOS_EXAMEN_2026, 
  HITOS_ACADEMICOS_2026, 
  REGLA_SYSACAD_EXAMEN,
  isPastDate,
  getFechaExactaMesa,
  DIAS_MESA_POR_MATERIA,
  type TurnoExamenOficial
} from '../data/calendario2026';
import { MATERIAS_MAP, MATERIAS_TRONCALES } from '../data/plan2023';
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
  List
} from 'lucide-react';

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
    setSelectedSubjectId 
  } = useTracker();

  const [activeTab, setActiveTab] = useState<'calendario' | 'metas' | 'turnos'>('calendario');
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

  // Funciones de navegación de meses
  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear(prev => prev - 1);
    } else {
      setNavMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear(prev => prev + 1);
    } else {
      setNavMonth(prev => prev + 1);
    }
  };

  const handleIrAHoy = () => {
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

    // Días posteriores para completar a múltiplos de 7
    const remaining = (7 - (cells.length % 7)) % 7;
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
      return { days, text: `Mesa finalizada hace ${Math.abs(days)} d`, badgeColor: 'bg-slate-800 text-slate-400 border-slate-700' };
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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setCalendarOpen(false)}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-modal-title"
        className="bg-[#080d1a] border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] sm:max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header institucional */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#0b1222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl border shadow-lg transition-all"
              style={{
                backgroundColor: 'var(--color-primary-bg)',
                borderColor: 'var(--color-primary-border)',
                color: 'var(--color-primary)'
              }}
            >
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="calendar-modal-title" className="text-base sm:text-lg font-bold font-syne text-white tracking-wide">
                  Calendario Académico Oficial
                </h2>
                <span 
                  className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: 'var(--color-primary-bg)',
                    borderColor: 'var(--color-primary-border)',
                    color: 'var(--color-primary)'
                  }}
                >
                  UTN FRRo · ISI
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">
                Plan 2023 · Turnos oficiales de examen, días de mesa y metas de final
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCalendarOpen(false)}
            aria-label="Cerrar calendario académico"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de navegación */}
        <div className="flex border-b border-slate-800 bg-[#070b14] px-4 sm:px-6 pt-2 text-xs font-mono gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('calendario')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'calendario'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendario Mensual Interactivo</span>
          </button>

          <button
            onClick={() => setActiveTab('metas')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'metas'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Mis Metas de Final ({metasArray.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('turnos')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'turnos'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Listado de Turnos & Sysacad</span>
          </button>
        </div>

        {/* Contenedor con Scroll */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: CALENDARIO MENSUAL "POSTA" */}
          {activeTab === 'calendario' && (
            <div className="space-y-3 font-mono">
              
              {/* Barra superior de navegación por mes */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#0b1325] border border-slate-800 shadow-sm">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Mes anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="text-center min-w-[170px]">
                    <span className="font-syne font-extrabold text-base text-white tracking-wide block">
                      {NOMBRES_MESES[navMonth]} {navYear}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Mes siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleIrAHoy}
                    className="ml-2 px-2.5 py-1 rounded-lg text-[11px] bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    Hoy
                  </button>
                </div>

                {/* Accesos directos a meses con mesas de examen */}
                <div className="flex items-center gap-1.5 flex-wrap justify-center text-[11px]">
                  <span className="text-slate-400 text-[10px] hidden md:inline">Ir a Turno:</span>
                  <button
                    type="button"
                    onClick={() => { setNavYear(2026); setNavMonth(8); }} // Sep 2026
                    className={`px-2 py-0.5 rounded border transition-colors ${navYear === 2026 && navMonth === 8 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    Sep '26
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNavYear(2026); setNavMonth(10); }} // Nov 2026
                    className={`px-2 py-0.5 rounded border transition-colors ${navYear === 2026 && navMonth === 10 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    Nov '26
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNavYear(2026); setNavMonth(11); }} // Dic 2026
                    className={`px-2 py-0.5 rounded border transition-colors ${navYear === 2026 && navMonth === 11 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    Dic '26
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNavYear(2027); setNavMonth(1); }} // Feb 2027
                    className={`px-2 py-0.5 rounded border transition-colors ${navYear === 2027 && navMonth === 1 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    Feb '27
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNavYear(2027); setNavMonth(2); }} // Mar 2027
                    className={`px-2 py-0.5 rounded border transition-colors ${navYear === 2027 && navMonth === 2 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    Mar '27
                  </button>
                </div>
              </div>

              {/* Leyenda visual del calendario */}
              <div className="flex items-center gap-4 text-[10px] text-slate-400 px-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded border border-cyan-400/80 bg-cyan-950/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                  <span>Mesa de Examen Activa (con Glow)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded border border-emerald-500/80 bg-emerald-950/60 text-emerald-300" />
                  <span>Meta de Final Agendada</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded border border-purple-500/60 bg-purple-950/40 text-purple-300" />
                  <span>Período / Hito Lectivo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded border border-slate-800 bg-slate-950/80 opacity-50" />
                  <span>Día anterior / pasado (apagado)</span>
                </div>
              </div>

              {/* Cuadrícula de 7 columnas */}
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#070b13]">
                {/* Cabecera de días de la semana */}
                <div className="grid grid-cols-7 border-b border-slate-800 bg-[#090f1d] text-center text-[11px] font-bold text-slate-400 py-2">
                  {DIAS_SEMANA_HEADERS.map((dia, idx) => (
                    <div key={idx} className={idx >= 5 ? 'text-slate-500' : 'text-slate-300'}>
                      {dia}
                    </div>
                  ))}
                </div>

                {/* Celdas de días */}
                <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/60">
                  {calendarCells.map((cell, idx) => {
                    const diaNum = cell.date.getDate();
                    const isPast = cell.dateStr < todayStr;
                    const isToday = cell.dateStr === todayStr;

                    // Buscar si hay turno de examen oficial en esta fecha
                    const turno = TURNOS_EXAMEN_2026.find(t => cell.dateStr >= t.fechaInicio && cell.dateStr <= t.fechaFin);
                    
                    // Buscar si hay hitos de calendario
                    const hito = HITOS_ACADEMICOS_2026.find(h => {
                      if (h.fechaFin) return cell.dateStr >= h.fechaInicio && cell.dateStr <= h.fechaFin;
                      return cell.dateStr === h.fechaInicio;
                    });

                    // Buscar metas agendadas en esta fecha
                    const metasEnEsteDia = metasArray.filter(m => {
                      if (m.fechaEstimada) return m.fechaEstimada === cell.dateStr;
                      if (turno && m.turnoId === turno.id) return true;
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
                        className={`min-h-[96px] sm:min-h-[108px] p-2 flex flex-col justify-between transition-all relative group rounded-lg m-0.5 ${
                          !cell.isCurrentMonth
                            ? 'bg-[#03060c]/70 text-slate-700 opacity-25 border border-transparent'
                            : isPast
                              ? 'bg-[#050811]/40 text-slate-600 opacity-40 border border-slate-900/60'
                              : esDiaMesaActiva
                                ? 'bg-gradient-to-b from-cyan-950/40 via-cyan-900/20 to-transparent border-cyan-400/80 text-cyan-100'
                                : 'bg-[#070b14] border border-slate-800/80 text-slate-300 hover:border-slate-700'
                        }`}
                        style={esDiaMesaActiva ? {
                          boxShadow: '0 0 16px rgba(6, 182, 212, 0.35), inset 0 0 12px rgba(6, 182, 212, 0.12)',
                          borderColor: 'rgba(6, 182, 212, 0.75)'
                        } : {}}
                      >
                        {/* Fila superior de la celda: Número de día y badges */}
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold font-syne ${
                            isToday 
                              ? 'w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-extrabold shadow-[0_0_10px_rgba(6,182,212,0.9)]' 
                              : isPast 
                                ? 'text-slate-500' 
                                : esDiaMesaActiva 
                                  ? 'text-cyan-300 font-extrabold drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' 
                                  : 'text-slate-300'
                          }`}>
                            {diaNum}
                          </span>

                          {/* Nombre corto del turno si es día de examen */}
                          {turno && (
                            <span 
                              className={`text-[9px] px-1.5 py-0.5 rounded truncate max-w-[80px] font-mono ${
                                isPast 
                                  ? 'bg-slate-800/80 text-slate-500 border border-slate-800' 
                                  : 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                              }`}
                              title={`${turno.nombre} (${turno.fechaInicio} al ${turno.fechaFin})`}
                            >
                              {turno.nombreCorto.replace('Llamado ', 'Ll.')}
                            </span>
                          )}
                        </div>

                        {/* Contenido intermedio: Hito o materias */}
                        <div className="space-y-1 my-1">
                          {/* Hito académico */}
                          {hito && (
                            <div 
                              className="text-[9px] px-1 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 truncate"
                              title={hito.titulo}
                            >
                              {hito.titulo}
                            </div>
                          )}

                          {/* Metas agendadas por el usuario para esta fecha */}
                          {metasEnEsteDia.map(meta => {
                            const materia = MATERIAS_MAP[meta.materiaId];
                            return (
                              <div
                                key={meta.materiaId}
                                className="px-1.5 py-0.5 rounded bg-emerald-500/25 border border-emerald-500/60 text-emerald-200 text-[10px] font-bold flex items-center justify-between gap-1 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                title={`Meta agendada: ${materia?.nombreCompleto || meta.turnoNombre}`}
                              >
                                <span className="truncate">{materia?.nombre || `#${meta.materiaId}`}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeMetaExamen(meta.materiaId);
                                  }}
                                  className="text-emerald-300 hover:text-rose-400 p-0.5 transition-colors"
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
                              className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 truncate font-semibold cursor-pointer hover:bg-cyan-500/30 transition-colors"
                              title={`¡Podés rendir hoy (${regularesQueRindenHoy.length}): ${regularesQueRindenHoy.map(m => m.nombre).join(', ')}`}
                              onClick={() => handleOpenMetaDialog(cell.dateStr, turno)}
                            >
                              ⭐ Rinde: {regularesQueRindenHoy.map(m => m.nombre).join(', ')}
                            </div>
                          )}
                        </div>

                        {/* Botón inferior: Anotar como Meta si es día de examen vigente */}
                        {esDiaMesaActiva && metasEnEsteDia.length === 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenMetaDialog(cell.dateStr, turno)}
                            className="w-full py-1 rounded border border-cyan-500/40 hover:border-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 hover:text-white text-[10px] font-mono font-semibold flex items-center justify-center gap-1 transition-all shadow-sm"
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

            </div>
          )}

          {/* TAB 2: MIS METAS ACTIVAS */}
          {activeTab === 'metas' && (
            <div>
              {metasArray.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="font-syne font-bold text-white text-base">
                    No tienes finales programados aún
                  </h3>
                  <p className="text-xs font-mono text-slate-400 max-w-md mx-auto leading-relaxed">
                    Podes hacer clic en el botón <strong className="text-cyan-300">"Anotar"</strong> sobre cualquier día de mesa en el <strong className="text-cyan-300">Calendario Mensual</strong>, o ingresar a una materia <strong className="text-amber-400">Regular</strong> en la Malla Curricular.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                    <span>Materias con mesa tentativa de examen agendada:</span>
                    <span>{metasArray.length} meta{metasArray.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {metasArray.map(meta => {
                      const materia = MATERIAS_MAP[meta.materiaId];
                      const countdown = meta.fechaEstimada ? getDaysRemaining(meta.fechaEstimada) : null;
                      const turno = TURNOS_EXAMEN_2026.find(t => t.id === meta.turnoId);
                      const fechaExacta = turno ? getFechaExactaMesa(meta.materiaId, turno) : null;

                      return (
                        <div
                          key={meta.materiaId}
                          className="bg-[#070b13] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between transition-all group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                                  Nivel {materia?.nivel || '?'}º
                                </span>
                                <h4 className="font-syne font-bold text-sm text-white mt-1 group-hover:text-cyan-300 transition-colors">
                                  {materia?.nombreCompleto || `Materia #${meta.materiaId}`}
                                </h4>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeMetaExamen(meta.materiaId)}
                                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                title="Quitar meta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-center gap-1.5 text-cyan-300">
                                <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-semibold truncate">{meta.turnoNombre}</span>
                              </div>

                              {fechaExacta && (
                                <div className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                                  <span>📅 Mesa Oficial: {fechaExacta.diaNombre} {fechaExacta.fechaExactaStr}</span>
                                </div>
                              )}

                              {countdown && (
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] border ${countdown.badgeColor}`}>
                                    {countdown.text}
                                  </span>
                                  {meta.fechaEstimada && (
                                    <span className="text-[11px] text-slate-500">
                                      Inicio: {meta.fechaEstimada}
                                    </span>
                                  )}
                                </div>
                              )}

                              {meta.comentario && (
                                <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/80">
                                  "{meta.comentario}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setCalendarOpen(false);
                                setSelectedSubjectId(meta.materiaId);
                              }}
                              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
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
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Regla Oficial de Cierre en Sysacad</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {REGLA_SYSACAD_EXAMEN.descripcion}
                </p>
              </div>

              {/* Lista de Turnos */}
              <div className="space-y-2">
                <h4 className="font-syne font-bold text-xs text-white uppercase tracking-wider text-slate-400">
                  Turnos Oficiales de Examen (Ciclo 2026 - 2027)
                </h4>

                {TURNOS_EXAMEN_2026.map(turno => {
                  const materiasEnEsteTurno = metasArray.filter(m => m.turnoId === turno.id);
                  const countdown = getDaysRemaining(turno.fechaInicio);
                  const yaPaso = isPastDate(turno.fechaFin);

                  return (
                    <div
                      key={turno.id}
                      className={`p-3 rounded-xl border transition-all ${
                        yaPaso 
                          ? 'opacity-50 bg-[#060910] border-slate-800/60'
                          : materiasEnEsteTurno.length > 0
                            ? 'bg-cyan-950/20 border-cyan-500/40 shadow-sm'
                            : 'bg-[#070b13] border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${yaPaso ? 'bg-slate-600' : 'bg-cyan-400'}`} />
                          <span className={`font-bold text-xs ${yaPaso ? 'text-slate-400 line-through' : 'text-white'}`}>
                            {turno.nombre}
                          </span>
                          {turno.esEspecial && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Mesa Especial
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">
                            {turno.fechaInicio} al {turno.fechaFin}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${countdown.badgeColor}`}>
                            {countdown.text}
                          </span>
                        </div>
                      </div>

                      {turno.descripcion && (
                        <p className="text-[11px] text-slate-400 mt-1 italic pl-4">
                          {turno.descripcion}
                        </p>
                      )}

                      {materiasEnEsteTurno.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 pl-4">
                          <span className="text-[11px] text-cyan-300 font-bold">Planeas rendir:</span>
                          {materiasEnEsteTurno.map(m => (
                            <span
                              key={m.materiaId}
                              className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-[10px]"
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
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setMetaDialog(null)}
        >
          <div 
            className="bg-[#0c1324] border border-cyan-500/40 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl font-mono"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <h3 className="font-syne font-bold text-white text-base">
                  Anotar Meta de Examen
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMetaDialog(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Turno:</span>
                <span className="font-bold text-cyan-300">{metaDialog.turno.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fecha seleccionada:</span>
                <span className="font-bold text-white">{metaDialog.diaNombre} {metaDialog.fechaStr}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmarMeta} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1">
                  Materia Regular a Rendir:
                </label>
                {materiasRegularesSinMeta.length === 0 ? (
                  <p className="text-xs text-amber-400 italic bg-amber-500/10 p-2.5 rounded border border-amber-500/30">
                    {MATERIAS_TRONCALES.some(m => estados[m.id] === 'regular')
                      ? 'Todas tus materias regulares ya tienen una mesa de examen asignada. Podés consultarlas o editarlas en la pestaña "Mis Metas de Final".'
                      : 'No tienes materias en estado Regular actualmente. Pasa alguna materia a Regular en la Malla o Grafo para agendarla.'}
                  </p>
                ) : (
                  <select
                    value={materiaSeleccionadaId}
                    onChange={e => setMateriaSeleccionadaId(Number(e.target.value))}
                    className="w-full bg-[#070b13] border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
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
                <label className="block text-[11px] text-slate-300 mb-1">
                  Recordatorio o notas de estudio (opcional):
                </label>
                <input
                  type="text"
                  value={metaComentarioInput}
                  onChange={e => setMetaComentarioInput(e.target.value)}
                  placeholder="Ej: Repasar finales anteriores de la cátedra..."
                  className="w-full bg-[#070b13] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMetaDialog(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={materiasRegularesSinMeta.length === 0 || !materiaSeleccionadaId}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors shadow-md"
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
