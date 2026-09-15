import React, { useState, useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { TURNOS_EXAMEN_2026, HITOS_ACADEMICOS_2026, REGLA_SYSACAD_EXAMEN } from '../data/calendario2026';
import { MATERIAS_MAP } from '../data/plan2023';
import { 
  X, 
  Calendar as CalendarIcon, 
  Target, 
  Clock, 
  Info, 
  CalendarDays, 
  Trash2,
  ExternalLink
} from 'lucide-react';

export const CalendarModal: React.FC = () => {
  const { 
    calendarOpen, 
    setCalendarOpen, 
    metasExamen, 
    removeMetaExamen, 
    setSelectedSubjectId 
  } = useTracker();

  const [activeTab, setActiveTab] = useState<'metas' | 'turnos' | 'hitos'>('metas');
  const modalRef = useFocusTrap(calendarOpen);

  useEffect(() => {
    if (!calendarOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCalendarOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [calendarOpen, setCalendarOpen]);

  if (!calendarOpen) return null;

  const metasArray = Object.values(metasExamen);

  // Helper para días restantes
  const getDaysRemaining = (targetDateStr: string) => {
    const target = new Date(targetDateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffMs = target.getTime() - now.getTime();
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

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setCalendarOpen(false)}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-modal-title"
        className="bg-[#0b101c] border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#0d1527] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h2 id="calendar-modal-title" className="text-lg font-bold font-syne text-white tracking-wide flex items-center gap-2">
                Calendario Académico 2026 - 2027
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  UTN FRRo Oficial
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Mesas de examen, metas tentativas y fechas de inscripción
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
        <div className="flex border-b border-slate-800 bg-[#090e1a] px-5 pt-2 text-xs font-mono gap-2">
          <button
            onClick={() => setActiveTab('metas')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
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
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
              activeTab === 'turnos'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Turnos de Examen (16 Llamados)</span>
          </button>

          <button
            onClick={() => setActiveTab('hitos')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
              activeTab === 'hitos'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Fechas Clave & Sysacad</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="p-6 max-h-[calc(85vh-160px)] overflow-y-auto space-y-4">
          
          {/* TAB 1: MIS METAS ACTIVAS */}
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
                    Para asignar una meta, haz clic sobre cualquier materia que tengas en estado <strong className="text-amber-400">Regular</strong> en la Malla o Grafo y selecciona <strong className="text-cyan-300">"Programar mesa tentativa"</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1">
                    <span>Materias con mesa tentativa de examen agendada:</span>
                    <span>{metasArray.length} meta{metasArray.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {metasArray.map(meta => {
                      const materia = MATERIAS_MAP[meta.materiaId];
                      const countdown = meta.fechaEstimada ? getDaysRemaining(meta.fechaEstimada) : null;

                      return (
                        <div
                          key={meta.materiaId}
                          className="bg-[#070b13] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between transition-all group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
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

                            <div className="space-y-1.5 font-mono text-xs">
                              <div className="flex items-center gap-1.5 text-cyan-300">
                                <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-semibold truncate">{meta.turnoNombre}</span>
                              </div>

                              {countdown && (
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${countdown.badgeColor}`}>
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
                              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
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

          {/* TAB 2: TODOS LOS TURNOS DE EXAMEN */}
          {activeTab === 'turnos' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Turnos de examen extraídos de la cartilla oficial de <strong className="text-white">Gradiente UTN FRRo</strong> para el ciclo 2026 y comienzos de 2027.
                </p>
              </div>

              <div className="space-y-2">
                {TURNOS_EXAMEN_2026.map(turno => {
                  const materiasEnEsteTurno = metasArray.filter(m => m.turnoId === turno.id);
                  const countdown = getDaysRemaining(turno.fechaInicio);

                  return (
                    <div
                      key={turno.id}
                      className={`p-3 rounded-xl border transition-all ${
                        materiasEnEsteTurno.length > 0
                          ? 'bg-cyan-950/20 border-cyan-500/40 shadow-sm'
                          : 'bg-[#070b13] border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span className="font-bold text-white text-xs">{turno.nombre}</span>
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

          {/* TAB 3: FECHAS CLAVE E INSCRIPCIONES */}
          {activeTab === 'hitos' && (
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

              {/* Lista de Hitos de cursado */}
              <div className="space-y-2.5">
                <h4 className="font-syne font-bold text-xs text-white uppercase tracking-wider text-slate-400">
                  Períodos Lectivos e Inscripciones 2026
                </h4>

                {HITOS_ACADEMICOS_2026.map(hito => (
                  <div
                    key={hito.id}
                    className="p-3.5 rounded-xl bg-[#070b13] border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white text-xs">
                        {hito.titulo}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                        {hito.fechaFin ? `${hito.fechaInicio} al ${hito.fechaFin}` : hito.fechaInicio}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {hito.detalle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
