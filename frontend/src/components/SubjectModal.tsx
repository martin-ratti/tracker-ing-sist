import React, { useState, useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { MATERIAS_MAP, MATERIAS_TRONCALES } from '../data/plan2023';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Award, 
  ArrowRight,
  Target,
  Calendar,
  Trash2
} from 'lucide-react';
import { 
  TURNOS_EXAMEN_2026, 
  isPastDate, 
  getFechaExactaMesa,
  DIAS_MESA_POR_MATERIA
} from '../data/calendario2026';



export const SubjectModal: React.FC = () => {
  const {
    selectedSubjectId,
    setSelectedSubjectId,
    estados,
    notas,
    metasExamen,
    setMetaExamen,
    removeMetaExamen,
    toggleMateriaEstado,
    setEstadoDirecto,
    setNotaMateria,
    showToast
  } = useTracker();

  const [notaVal, setNotaVal] = useState<string>('');
  const [fechaVal, setFechaVal] = useState<string>('');
  const [libroVal, setLibroVal] = useState<string>('');
  const [folioVal, setFolioVal] = useState<string>('');
  const [comentarioVal, setComentarioVal] = useState<string>('');

  // Estados para Meta de Examen
  const [selectedTurnoId, setSelectedTurnoId] = useState<string>(TURNOS_EXAMEN_2026[0]?.id || 'feb-2026-l1');
  const [metaComentario, setMetaComentario] = useState<string>('');
  const [showMetaForm, setShowMetaForm] = useState<boolean>(false);

  const materia = selectedSubjectId ? MATERIAS_MAP[selectedSubjectId] : null;
  const modalRef = useFocusTrap(Boolean(materia));

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedSubjectId(null);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [setSelectedSubjectId]);

  useEffect(() => {
    if (selectedSubjectId && notas[selectedSubjectId]) {
      const n = notas[selectedSubjectId];
      setNotaVal(n.nota !== undefined ? String(n.nota) : '');
      setFechaVal(n.fecha || '');
      setLibroVal(n.libro || '');
      setFolioVal(n.folio || '');
      setComentarioVal(n.comentario || '');
    } else {
      setNotaVal('');
      setFechaVal('');
      setLibroVal('');
      setFolioVal('');
      setComentarioVal('');
    }

    if (selectedSubjectId && metasExamen[selectedSubjectId]) {
      const m = metasExamen[selectedSubjectId];
      setSelectedTurnoId(m.turnoId);
      setMetaComentario(m.comentario || '');
      setShowMetaForm(false);
    } else {
      const turnosFuturos = TURNOS_EXAMEN_2026.filter(t => !isPastDate(t.fechaFin));
      setSelectedTurnoId(turnosFuturos[0]?.id || TURNOS_EXAMEN_2026[0]?.id || 'nov-2026-l1');
      setMetaComentario('');
      setShowMetaForm(false);
    }
  }, [selectedSubjectId, notas, metasExamen]);

  if (!materia) return null;

  const currentEstado = estados[materia.id] || 'pendiente';
  const currentMeta = metasExamen[materia.id];

  // Helper para countdown de días
  const getDaysRemaining = (targetDateStr: string) => {
    const target = new Date(targetDateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffMs = target.getTime() - now.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { days, text: `Mesa finalizada hace ${Math.abs(days)} d`, badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700' };
    }
    if (days === 0) {
      return { days, text: '¡La mesa es hoy!', badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' };
    }
    if (days <= 7) {
      return { days, text: `¡Quedan ${days} días!`, badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' };
    }
    return { days, text: `Faltan ${days} días`, badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' };
  };

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materia) return;
    const turno = TURNOS_EXAMEN_2026.find(t => t.id === selectedTurnoId);
    if (!turno) return;

    const fechaExacta = getFechaExactaMesa(materia.id, turno);

    setMetaExamen(materia.id, {
      materiaId: materia.id,
      turnoId: turno.id,
      turnoNombre: turno.nombre,
      fechaEstimada: fechaExacta ? fechaExacta.fechaExactaStr : turno.fechaInicio,
      llamado: typeof turno.llamado === 'number' ? turno.llamado : undefined,
      comentario: metaComentario.trim() || undefined
    });
    setShowMetaForm(false);
  };

  const handleRemoveMeta = () => {
    if (!materia) return;
    removeMetaExamen(materia.id);
    setShowMetaForm(false);
  };

  // Guardar notas
  const handleSaveNotas = (e: React.FormEvent) => {
    e.preventDefault();
    const num = notaVal.trim() ? parseFloat(notaVal) : undefined;
    setNotaMateria(materia.id, {
      nota: num,
      fecha: fechaVal.trim() || undefined,
      libro: libroVal.trim() || undefined,
      folio: folioVal.trim() || undefined,
      comentario: comentarioVal.trim() || undefined
    });
    showToast(`✅ Notas guardadas para ${materia.nombre}`);
  };

  // Encontrar qué materias destraba esta materia
  const materiasQueDestraba = MATERIAS_TRONCALES.filter(m => {
    const enReg = m.reqRegular.includes(materia.id);
    const enApr = Array.isArray(m.reqAprobada) && m.reqAprobada.includes(materia.id);
    const enRendir = Array.isArray(m.reqRendirAprobada) && m.reqRendirAprobada.includes(materia.id);
    return enReg || enApr || enRendir;
  });

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-scrollbar"
      onClick={() => setSelectedSubjectId(null)}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subject-modal-title"
        className="bg-(--bg-surface) border border-(--border-color) rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-(--border-color) bg-(--bg-elevated) relative shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span 
                  className="font-mono text-xs font-bold px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: 'var(--color-primary-bg)',
                    borderColor: 'var(--color-primary-border)',
                    color: 'var(--color-primary)'
                  }}
                >
                  Materia #{String(materia.id).padStart(2, '0')}
                </span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {materia.nivel}º Nivel · {materia.horas} horas
                </span>
              </div>
              <h2 id="subject-modal-title" className="text-base sm:text-xl font-bold font-syne text-(--text-body)">
                {materia.nombreCompleto}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSubjectId(null)}
              aria-label="Cerrar detalles de la materia"
              className="p-2 rounded-xl text-slate-400 hover:text-(--text-body) hover:bg-(--bg-surface) transition-colors min-w-9 min-h-9 flex items-center justify-center shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Badges de características */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 font-mono text-[11px]">
            {DIAS_MESA_POR_MATERIA[materia.id] && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/35 text-emerald-700 dark:text-emerald-300 font-semibold" title="Día oficial de mesa de examen según cronograma oficial UTN FRRo">
                📅 Mesa: {DIAS_MESA_POR_MATERIA[materia.id]}
              </span>
            )}
            {materia.esIntegradora && (
              <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-700 dark:text-purple-300 font-medium">
                Materia Integradora
              </span>
            )}
            {materia.esCuatrimestral && (
              <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-700 dark:text-blue-300 font-medium">
                Régimen Cuatrimestral
              </span>
            )}
            {materia.esAdusiSolo && (
              <span className="px-2 py-0.5 rounded bg-pink-500/20 border border-pink-500/40 text-pink-700 dark:text-pink-300 font-medium">
                Específica para título intermedio ADUSI
              </span>
            )}
          </div>
        </div>

        {/* Cuerpo del modal */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 no-scrollbar">
          
          {/* Selector de Estado */}
          <div>
            <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-2">
              Estado Actual de la Materia:
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs">
              <button
                type="button"
                onClick={() => {
                  if (currentEstado !== 'pendiente') toggleMateriaEstado(materia.id);
                }}
                className={`py-2.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all min-h-11 ${
                  currentEstado === 'pendiente'
                    ? 'bg-slate-200 dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-(--text-body) font-bold shadow-md'
                    : 'bg-(--bg-elevated) border-(--border-color) text-slate-500 dark:text-slate-400 hover:border-slate-400'
                }`}
              >
                <span>⚪</span>
                <span>Pendiente</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentEstado === 'pendiente') toggleMateriaEstado(materia.id);
                }}
                className={`py-2.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all min-h-11 ${
                  currentEstado === 'regular'
                    ? 'font-bold shadow-md'
                    : 'bg-(--bg-elevated) border-(--border-color) text-slate-500 dark:text-slate-400 hover:border-slate-400'
                }`}
                style={currentEstado === 'regular' ? {
                  backgroundColor: 'var(--color-regular-bg)',
                  borderColor: 'var(--color-regular-border)',
                  color: 'var(--color-regular)',
                  boxShadow: '0 0 14px var(--color-regular-glow)'
                } : {}}
              >
                <span>🟡</span>
                <span>Regular</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentEstado === 'regular') toggleMateriaEstado(materia.id);
                  else if (currentEstado === 'pendiente') {
                    setEstadoDirecto(materia.id, 'aprobada');
                    showToast(`🟢 ${materia.nombre} marcada como APROBADA`, 'success');
                  }
                }}
                className={`py-2.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all min-h-11 ${
                  currentEstado === 'aprobada'
                    ? 'font-bold shadow-md'
                    : 'bg-(--bg-elevated) border-(--border-color) text-slate-500 dark:text-slate-400 hover:border-slate-400'
                }`}
                style={currentEstado === 'aprobada' ? {
                  backgroundColor: 'var(--color-aprobada-bg)',
                  borderColor: 'var(--color-aprobada-border)',
                  color: 'var(--color-aprobada)',
                  boxShadow: '0 0 14px var(--color-aprobada-glow)'
                } : {}}
              >
                <span>🟢</span>
                <span>Aprobada</span>
              </button>
            </div>
          </div>

          {/* Requisitos para cursar y rendir */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Para Cursar */}
            <div className="bg-(--bg-elevated) p-4 rounded-xl border border-(--border-color)">
              <h4 
                className="text-xs font-mono font-bold mb-2.5 flex items-center gap-1.5"
                style={{ color: 'var(--color-cursable)' }}
              >
                <span>Para Cursar (Regulares / Aprobadas)</span>
              </h4>
              
              {materia.reqRegular.length === 0 && (Array.isArray(materia.reqAprobada) ? materia.reqAprobada.length === 0 : false) ? (
                <p className="text-xs font-mono text-slate-500 italic">Sin requisitos previos</p>
              ) : (
                <ul className="space-y-1.5 text-xs font-mono">
                  {materia.reqRegular.map(reqId => {
                    const reqM = MATERIAS_MAP[reqId];
                    const est = estados[reqId] || 'pendiente';
                    const ok = est === 'regular' || est === 'aprobada';
                    return (
                      <li key={reqId} className="flex items-center justify-between text-(--text-body)">
                        <span className="truncate">{reqM?.nombre || `#${reqId}`} (Regular)</span>
                        {ok ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OK
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400/80 flex items-center gap-1 text-[11px] font-semibold">
                            <XCircle className="w-3.5 h-3.5" /> Falta
                          </span>
                        )}
                      </li>
                    );
                  })}

                  {Array.isArray(materia.reqAprobada) && materia.reqAprobada.map(reqId => {
                    const reqM = MATERIAS_MAP[reqId];
                    const est = estados[reqId] || 'pendiente';
                    const ok = est === 'aprobada';
                    return (
                      <li key={reqId} className="flex items-center justify-between text-(--text-body)">
                        <span className="truncate">{reqM?.nombre || `#${reqId}`} (Aprobada)</span>
                        {ok ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OK
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400/80 flex items-center gap-1 text-[11px] font-semibold">
                            <XCircle className="w-3.5 h-3.5" /> Falta
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Para Rendir */}
            <div className="bg-(--bg-elevated) p-4 rounded-xl border border-(--border-color)">
              <h4 
                className="text-xs font-mono font-bold mb-2.5 flex items-center gap-1.5"
                style={{ color: 'var(--color-regular)' }}
              >
                <span>Para Rendir Examen Final</span>
              </h4>
              <ul className="space-y-1.5 text-xs font-mono text-(--text-body)">
                <li className="flex items-center justify-between">
                  <span>Estar Regularizada</span>
                  {currentEstado === 'regular' || currentEstado === 'aprobada' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> OK
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400/80 flex items-center gap-1 text-[11px] font-semibold">
                      <XCircle className="w-3.5 h-3.5" /> Pendiente
                    </span>
                  )}
                </li>

                {materia.reqRendirAprobada === 'TODAS' && (
                  <li className="flex items-center justify-between text-amber-700 dark:text-amber-300/90 pt-1 border-t border-(--border-color)">
                    <span>Aprobar TODAS las demás materias</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Requerido</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Materias que destraba */}
          {materiasQueDestraba.length > 0 && (
            <div>
              <h4 className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                <span>Materias que ayuda a destrabar:</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {materiasQueDestraba.map(m => (
                  <span
                    key={m.id}
                    className="px-2 py-1 rounded bg-(--bg-elevated) border border-(--border-color) text-[11px] font-mono text-(--text-body)"
                  >
                    {m.nombre} ({m.nivel}º Año)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Planificación de Meta de Examen Final (habilitado para materias Regulares) */}
          {currentEstado === 'regular' && (
            <div className="bg-cyan-500/10 dark:bg-[#081226]/90 border border-cyan-500/30 rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-syne font-bold text-xs text-(--text-body)">
                      Meta de Examen Final · Calendario UTN 2026/2027
                    </h4>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      Asigna la mesa oficial en la que planeas rendir esta materia
                    </p>
                  </div>
                </div>

                {currentMeta && !showMetaForm && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMetaForm(true)}
                      className="px-2.5 py-1 rounded bg-(--bg-surface) hover:bg-(--bg-elevated) border border-(--border-color) text-[11px] font-mono text-(--text-body) transition-colors shadow-sm"
                    >
                      Cambiar
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveMeta}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-500 hover:bg-(--bg-surface) transition-colors"
                      title="Quitar meta de examen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {currentMeta && !showMetaForm ? (
                <div className="bg-(--bg-surface) border border-(--border-color) rounded-lg p-3 font-mono text-xs space-y-2 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {currentMeta.turnoNombre}
                    </span>
                    {currentMeta.fechaEstimada && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${getDaysRemaining(currentMeta.fechaEstimada).badgeColor}`}>
                        {getDaysRemaining(currentMeta.fechaEstimada).text}
                      </span>
                    )}
                  </div>

                  {(() => {
                    const turno = TURNOS_EXAMEN_2026.find(t => t.id === currentMeta.turnoId);
                    const exacta = turno ? getFechaExactaMesa(materia.id, turno) : null;
                    if (!exacta) return null;
                    return (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
                        <span>Día exacto: {exacta.diaNombre} {exacta.fechaExactaStr}</span>
                      </div>
                    );
                  })()}

                  {currentMeta.comentario && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-1 border-t border-(--border-color)">
                      "{currentMeta.comentario}"
                    </p>
                  )}
                </div>
              ) : !currentMeta && !showMetaForm ? (
                <button
                  type="button"
                  onClick={() => setShowMetaForm(true)}
                  className="w-full py-2.5 px-3 rounded-lg border border-dashed border-cyan-500/40 hover:border-cyan-500/70 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-mono text-xs flex items-center justify-center gap-2 transition-all font-medium"
                >
                  <Target className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Programar mesa tentativa de final para este ciclo</span>
                </button>
              ) : (
                <form onSubmit={handleSaveMeta} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-400 mb-1">
                      Seleccionar Turno Oficial UTN FRRo:
                    </label>
                    <select
                      value={selectedTurnoId}
                      onChange={e => setSelectedTurnoId(e.target.value)}
                      className="w-full bg-(--bg-surface) border border-(--border-color) rounded-lg px-3 py-2 text-xs font-mono text-(--text-body) focus:outline-none focus:border-cyan-500"
                    >
                      {(() => {
                        const turnosFuturos = TURNOS_EXAMEN_2026.filter(t => !isPastDate(t.fechaFin));
                        const opciones = turnosFuturos.length > 0 ? turnosFuturos : TURNOS_EXAMEN_2026;
                        return opciones.map(t => {
                          const exacta = getFechaExactaMesa(materia.id, t);
                          return (
                            <option key={t.id} value={t.id}>
                              {t.nombre} ({exacta ? `${exacta.diaNombre} ${exacta.fechaExactaStr}` : `${t.fechaInicio} al ${t.fechaFin}`})
                            </option>
                          );
                        });
                      })()}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-600 dark:text-slate-400 mb-1">
                      Notas / Recordatorios de estudio (opcional):
                    </label>
                    <input
                      type="text"
                      value={metaComentario}
                      onChange={e => setMetaComentario(e.target.value)}
                      placeholder="Ej: Repasar unidades 3 y 4 de la guía..."
                      className="w-full bg-(--bg-surface) border border-(--border-color) rounded-lg px-3 py-2 text-xs font-mono text-(--text-body) placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMetaForm(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-(--text-body) font-mono text-xs transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono text-xs transition-colors shadow-md"
                    >
                      Guardar Meta
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Registro de Examen Final / Calificación */}
          <div className="border-t border-(--border-color) pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-syne font-bold text-sm text-(--text-body) flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Registro de Examen Final (Opcional)</span>
              </h3>
              {notaVal && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/30 font-bold">
                  Calificación: {notaVal}
                </span>
              )}
            </div>

            <form onSubmit={handleSaveNotas} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">Nota (1 - 10):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={notaVal}
                    onChange={e => setNotaVal(e.target.value)}
                    placeholder="Ej: 8"
                    className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-lg px-3 py-2 text-(--text-body) placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">Fecha de Aprobación:</label>
                  <input
                    type="date"
                    value={fechaVal}
                    onChange={e => setFechaVal(e.target.value)}
                    className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-lg px-3 py-2 text-(--text-body) focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">Libro:</label>
                    <input
                      type="text"
                      value={libroVal}
                      onChange={e => setLibroVal(e.target.value)}
                      placeholder="Libro"
                      className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-lg px-2 py-2 text-(--text-body) placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">Folio:</label>
                    <input
                      type="text"
                      value={folioVal}
                      onChange={e => setFolioVal(e.target.value)}
                      placeholder="Folio"
                      className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-lg px-2 py-2 text-(--text-body) placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px] font-mono">Comentarios / Profesor / Cátedra:</label>
                <input
                  type="text"
                  value={comentarioVal}
                  onChange={e => setComentarioVal(e.target.value)}
                  placeholder="Ej: Aprobado con el Ing. Pérez en mesa de Febrero..."
                  className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-lg px-3 py-2 text-xs font-mono text-(--text-body) placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 font-mono text-xs">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-slate-950 font-bold transition-all shadow-md"
                  style={{
                    background: 'var(--gradient-primary)',
                    boxShadow: '0 0 12px var(--color-primary-glow)'
                  }}
                >
                  Guardar Datos
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
