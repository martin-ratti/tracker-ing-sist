import React, { useState, useEffect } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useHistoryBack } from '../../hooks/useHistoryBack';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { MATERIAS_MAP, MATERIAS_TRONCALES } from '../../data/plan2023';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Award, 
  ArrowRight,
  Target,
  Calendar,
  Trash2,
  FolderOpen,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { 
  TURNOS_EXAMEN, 
  isPastDate, 
  getFechaExactaMesa,
  DIAS_MESA_POR_MATERIA
} from '../../data/calendario';
import { getDriveUrlForMateria, getDriveUrlForExamenes } from '../../data/driveLinks';
import { formatFechaLocal, formatRangoFechas } from '../../utils/formatters';



export const SubjectModal: React.FC = () => {
  const {
    selectedSubjectId,
    setSelectedSubjectId,
    estados,
    notas,
    metasExamen,
    setMetaExamen,
    removeMetaExamen,
    setEstadoDirecto,
    setNotaMateria,
    showToast,
    esMateriaRendible
  } = useTracker();

  const [notaVal, setNotaVal] = useState<string>('');

  // Estados para Meta de Examen
  const [selectedTurnoId, setSelectedTurnoId] = useState<string>(TURNOS_EXAMEN[0]?.id || 'feb-2026-l1');
  const [metaComentario, setMetaComentario] = useState<string>('');
  const [showMetaForm, setShowMetaForm] = useState<boolean>(false);

  const isOpen = Boolean(selectedSubjectId);
  const { isMounted, isVisible } = useModalAnimation(isOpen, 200);

  const rawMateria = selectedSubjectId ? MATERIAS_MAP[selectedSubjectId] : null;
  const [lastSubject, setLastSubject] = useState(rawMateria);
  if (rawMateria && rawMateria !== lastSubject) {
    setLastSubject(rawMateria);
  }
  const activeMateria = rawMateria || lastSubject;

  const modalRef = useFocusTrap(isOpen);
  const handleClose = React.useCallback(() => setSelectedSubjectId(null), [setSelectedSubjectId]);
  useHistoryBack(isOpen, handleClose);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedSubjectId(null);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, setSelectedSubjectId]);

  const currentNotaNum = selectedSubjectId ? notas[selectedSubjectId]?.nota : undefined;
  const [prevSubjectId, setPrevSubjectId] = useState(selectedSubjectId);
  const [prevNotaNum, setPrevNotaNum] = useState(currentNotaNum);

  if (selectedSubjectId !== prevSubjectId || currentNotaNum !== prevNotaNum) {
    setPrevSubjectId(selectedSubjectId);
    setPrevNotaNum(currentNotaNum);
    if (currentNotaNum !== undefined) {
      setNotaVal(String(currentNotaNum));
    } else {
      setNotaVal('');
    }

    if (selectedSubjectId && metasExamen[selectedSubjectId]) {
      const m = metasExamen[selectedSubjectId];
      setSelectedTurnoId(m.turnoId);
      setMetaComentario(m.comentario || '');
      setShowMetaForm(false);
    } else {
      const turnosFuturos = TURNOS_EXAMEN.filter(t => !isPastDate(t.fechaFin));
      setSelectedTurnoId(turnosFuturos[0]?.id || TURNOS_EXAMEN[0]?.id || 'nov-2026-l1');
      setMetaComentario('');
      setShowMetaForm(false);
    }
  }

  if (!isMounted || !activeMateria) return null;
  const materia = activeMateria;

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
    const turno = TURNOS_EXAMEN.find(t => t.id === selectedTurnoId);
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

  // Guardar calificación
  const handleSaveNotas = (e: React.FormEvent) => {
    e.preventDefault();
    const num = notaVal.trim() ? parseFloat(notaVal) : undefined;
    setNotaMateria(materia.id, {
      nota: num
    });
    showToast(`✅ Calificación guardada para ${materia.nombre}`);
  };

  // Encontrar qué materias destraba esta materia divididas entre Cursar y Rendir
  const materiasQueDestrabaCursar = MATERIAS_TRONCALES.filter(m => m.reqRegular.includes(materia.id));
  const materiasQueDestrabaRendir = MATERIAS_TRONCALES.filter(m => {
    const enApr = Array.isArray(m.reqAprobada) && m.reqAprobada.includes(materia.id);
    const enRendir = Array.isArray(m.reqRendirAprobada) && m.reqRendirAprobada.includes(materia.id);
    return enApr || enRendir;
  });
  const tieneMateriasQueDestraba = materiasQueDestrabaCursar.length > 0 || materiasQueDestrabaRendir.length > 0;
  const esRendible = esMateriaRendible(materia);

  const materiasParaRendirIds = (() => {
    const ids = new Set<number>();
    materia.reqRegular.forEach(id => ids.add(id));
    if (Array.isArray(materia.reqAprobada)) {
      materia.reqAprobada.forEach(id => ids.add(id));
    }
    if (Array.isArray(materia.reqRendirAprobada)) {
      materia.reqRendirAprobada.forEach(id => ids.add(id));
    }
    ids.delete(materia.id);
    return Array.from(ids);
  })();

  const correlativasFaltantesParaRendir = materiasParaRendirIds
    .filter(reqId => (estados[reqId] || 'pendiente') !== 'aprobada')
    .map(reqId => MATERIAS_MAP[reqId]?.nombre || `#${reqId}`);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 no-scrollbar">
      <div
        className={`fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
        onClick={() => setSelectedSubjectId(null)}
      />
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subject-modal-title"
        className={`relative z-10 bg-(--bg-surface) border border-(--border-color) rounded-2xl sm:rounded-3xl w-full max-w-2xl lg:max-w-3xl 2xl:max-w-4xl 4k:max-w-5xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col my-auto transform transition-all duration-200 ease-out ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
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
              className="p-2 rounded-xl text-slate-400 hover:text-(--text-body) hover:bg-(--bg-surface) active:scale-90 transition-all min-w-9 min-h-9 flex items-center justify-center shrink-0"
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

          {/* Acceso a Material de Estudio en Google Drive */}
          <a
            href={getDriveUrlForMateria(materia.id, materia.nivel)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all group"
            title={`Abrir carpeta en Google Drive de ${materia.nombreCompleto}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-left">
                <div className="text-xs font-bold text-(--text-body) flex items-center gap-1.5 truncate">
                  <span>Carpeta de Drive · {materia.nombre}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-cyan-500 transition-colors shrink-0" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  Exámenes finales, parciales, apuntes y resúmenes
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400 shrink-0 ml-2 hidden sm:inline-flex items-center gap-1">
              Abrir Drive ↗
            </span>
          </a>
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
                  if (currentEstado !== 'pendiente') setEstadoDirecto(materia.id, 'pendiente');
                }}
                className={`py-2.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 active:scale-95 transition-all min-h-11 ${
                  currentEstado === 'pendiente'
                    ? 'bg-slate-200 dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-(--text-body) font-bold shadow-md'
                    : 'bg-(--bg-elevated) border-(--border-color) text-slate-500 dark:text-slate-400 hover:border-slate-400 cursor-pointer'
                }`}
              >
                <span>⚪</span>
                <span>Pendiente</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentEstado !== 'regular') setEstadoDirecto(materia.id, 'regular');
                }}
                className={`py-2.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 active:scale-95 transition-all min-h-11 ${
                  currentEstado === 'regular'
                    ? 'font-bold shadow-md'
                    : 'bg-(--bg-elevated) border-(--border-color) text-slate-500 dark:text-slate-400 hover:border-slate-400 cursor-pointer'
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
                  if (currentEstado !== 'aprobada') setEstadoDirecto(materia.id, 'aprobada');
                }}
                className={`py-2.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 active:scale-95 transition-all min-h-11 ${
                  currentEstado === 'aprobada'
                    ? 'font-bold shadow-md'
                    : 'bg-(--bg-elevated) border-(--border-color) text-slate-500 dark:text-slate-400 hover:border-slate-400 cursor-pointer'
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

                {materiasParaRendirIds.map(reqId => {
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

                {materia.reqRendirAprobada === 'TODAS' && (
                  <li className="flex items-center justify-between text-amber-700 dark:text-amber-300/90 pt-1 border-t border-(--border-color)">
                    <span>Aprobar TODAS las demás materias</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Requerido</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Materias que destraba divididas entre Cursar y Rendir */}
          {tieneMateriasQueDestraba && (
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                <span>Materias que ayuda a destrabar:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Para Cursar (Regularidad) */}
                <div className="bg-(--bg-elevated) p-3 rounded-xl border border-(--border-color)">
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="text-xs font-mono font-bold flex items-center gap-1.5"
                      style={{ color: 'var(--color-regular)' }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-regular)' }} />
                      <span>Para Cursar (Regularidad)</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-(--bg-surface) border border-(--border-color) text-slate-500 dark:text-slate-400 font-semibold">
                      {materiasQueDestrabaCursar.length}
                    </span>
                  </div>
                  {materiasQueDestrabaCursar.length === 0 ? (
                    <p className="text-[11px] font-mono text-slate-500 italic">No destraba cursado directo</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {materiasQueDestrabaCursar.map(m => (
                        <span
                          key={m.id}
                          className="px-2 py-1 rounded bg-(--bg-surface) border text-[11px] font-mono"
                          style={{
                            borderColor: 'var(--color-regular-border)',
                            color: 'var(--color-regular)'
                          }}
                        >
                          {m.nombre} ({m.nivel}º Año)
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Para Rendir (Aprobación) */}
                <div className="bg-(--bg-elevated) p-3 rounded-xl border border-(--border-color)">
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="text-xs font-mono font-bold flex items-center gap-1.5"
                      style={{ color: 'var(--color-aprobada)' }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-aprobada)' }} />
                      <span>Para Rendir (Aprobación)</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-(--bg-surface) border border-(--border-color) text-slate-500 dark:text-slate-400 font-semibold">
                      {materiasQueDestrabaRendir.length}
                    </span>
                  </div>
                  {materiasQueDestrabaRendir.length === 0 ? (
                    <p className="text-[11px] font-mono text-slate-500 italic">No destraba finales directos</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {materiasQueDestrabaRendir.map(m => (
                        <span
                          key={m.id}
                          className="px-2 py-1 rounded bg-(--bg-surface) border text-[11px] font-mono"
                          style={{
                            borderColor: 'var(--color-aprobada-border)',
                            color: 'var(--color-aprobada)'
                          }}
                        >
                          {m.nombre} ({m.nivel}º Año)
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Planificación de Meta de Examen Final (habilitado para materias Regulares) */}
          {currentEstado === 'regular' && (
            <div className="bg-(--color-primary-bg) border border-(--color-primary-border) rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-(--bg-surface) text-(--color-primary) border border-(--color-primary-border)">
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
                    <span className="font-bold text-(--color-primary) flex items-center gap-1.5">
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
                    const turno = TURNOS_EXAMEN.find(t => t.id === currentMeta.turnoId);
                    const exacta = turno ? getFechaExactaMesa(materia.id, turno) : null;
                    if (!exacta) return null;
                    return (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
                        <span>Día exacto: {exacta.diaNombre} {formatFechaLocal(exacta.fechaExactaStr)}</span>
                      </div>
                    );
                  })()}

                  {currentMeta.comentario && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-1 border-t border-(--border-color)">
                      "{currentMeta.comentario}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-(--border-color) flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Preparación de examen:</span>
                    <a
                      href={getDriveUrlForExamenes(materia.id, materia.nivel)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      <FolderOpen className="w-3 h-3" />
                      <span>Ver exámenes anteriores en Drive ↗</span>
                    </a>
                  </div>
                </div>
              ) : !currentMeta && !showMetaForm ? (
                <button
                  type="button"
                  onClick={() => setShowMetaForm(true)}
                  className="w-full py-2.5 px-3 rounded-lg border border-dashed border-(--color-primary-border) hover:border-(--color-primary) bg-(--color-primary-bg) hover:opacity-90 text-(--color-primary) font-mono text-xs flex items-center justify-center gap-2 transition-all font-medium"
                >
                  <Target className="w-3.5 h-3.5 text-(--color-primary)" />
                  <span>Programar mesa tentativa de final para este ciclo</span>
                </button>
              ) : (
                <form onSubmit={handleSaveMeta} className="space-y-3 pt-1">
                  {!esRendible && correlativasFaltantesParaRendir.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-mono flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Aviso de correlatividades:</span> Aún tenés pendiente aprobar <strong>{correlativasFaltantesParaRendir.join(', ')}</strong> antes de rendir esta materia. Podés agendar la meta igualmente como planificación temprana.
                      </div>
                    </div>
                  )}
                  <div>
                    <label htmlFor="materia-turno-select" className="block text-[11px] font-mono text-slate-600 dark:text-slate-400 mb-1">
                      Seleccionar Turno Oficial UTN FRRo:
                    </label>
                    <select
                      id="materia-turno-select"
                      value={selectedTurnoId}
                      onChange={e => setSelectedTurnoId(e.target.value)}
                      className="w-full bg-(--bg-surface) border border-(--border-color) rounded-lg px-3 py-2 text-xs font-mono text-(--text-body) focus:outline-none focus:border-(--color-primary)"
                    >
                      {(() => {
                        const turnosFuturos = TURNOS_EXAMEN.filter(t => !isPastDate(t.fechaFin));
                        const opciones = turnosFuturos.length > 0 ? turnosFuturos : TURNOS_EXAMEN;
                        return opciones.map(t => {
                          const exacta = getFechaExactaMesa(materia.id, t);
                          return (
                            <option key={t.id} value={t.id}>
                              {t.nombre} ({exacta ? `${exacta.diaNombre} ${formatFechaLocal(exacta.fechaExactaStr)}` : formatRangoFechas(t.fechaInicio, t.fechaFin)})
                            </option>
                          );
                        });
                      })()}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="materia-meta-comentario" className="block text-[11px] font-mono text-slate-600 dark:text-slate-400 mb-1">
                      Notas / Recordatorios de estudio (opcional):
                    </label>
                    <input
                      id="materia-meta-comentario"
                      type="text"
                      value={metaComentario}
                      onChange={e => setMetaComentario(e.target.value)}
                      placeholder="Ej: Repasar unidades 3 y 4 de la guía..."
                      className="w-full bg-(--bg-surface) border border-(--border-color) rounded-lg px-3 py-2 text-xs font-mono text-(--text-body) placeholder:text-slate-400 focus:outline-none focus:border-(--color-primary)"
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
                      className="px-3 py-1.5 rounded-lg bg-(--color-primary) hover:opacity-90 text-slate-950 font-bold font-mono text-xs transition-opacity shadow-md"
                    >
                      Guardar Meta
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Calificación de la Materia (Solo si está aprobada) */}
          {currentEstado === 'aprobada' && (
            <div className="border-t border-(--border-color) pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-syne font-bold text-sm text-(--text-body) flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Calificación de la Materia Aprobada</span>
                </h3>
                {notaVal && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/30 font-bold">
                    Nota: {notaVal}
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveNotas} className="flex items-end gap-2.5 font-mono text-xs">
                <div className="flex-1">
                  <label htmlFor="nota-input" className="block text-slate-600 dark:text-slate-400 mb-1 text-[11px]">
                    Nota Final / Promoción (1 - 10):
                  </label>
                  <input
                    id="nota-input"
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={notaVal}
                    onChange={e => setNotaVal(e.target.value)}
                    placeholder="Ej: 8"
                    className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-lg px-3 py-2 text-(--text-body) placeholder:text-slate-400 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {notas[materia.id]?.nota !== undefined && (
                    <button
                      type="button"
                      onClick={() => {
                        setNotaMateria(materia.id, { nota: undefined });
                        setNotaVal('');
                        showToast(`🗑️ Calificación eliminada para ${materia.nombre}`);
                      }}
                      className="p-2 rounded-lg border border-(--border-color) hover:border-rose-500 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Eliminar calificación"
                      aria-label="Eliminar calificación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-slate-950 font-bold transition-all shadow-md shrink-0 cursor-pointer"
                    style={{
                      background: 'var(--gradient-primary)',
                      boxShadow: '0 0 12px var(--color-primary-glow)'
                    }}
                  >
                    Guardar Nota
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Calificación guardada previa (materia no aprobada) */}
          {currentEstado !== 'aprobada' && notas[materia.id]?.nota !== undefined && (
            <div className="border-t border-(--border-color) pt-4">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-xs font-mono gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-(--text-body)">Nota guardada:</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-800 dark:text-purple-300 font-extrabold border border-purple-500/30">
                        {notas[materia.id].nota}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      Esta nota está guardada pero no suma al promedio. Se computará automáticamente cuando la materia esté Aprobada.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotaMateria(materia.id, { nota: undefined });
                    setNotaVal('');
                    showToast(`🗑️ Calificación eliminada para ${materia.nombre}`);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-(--bg-surface) transition-colors shrink-0"
                  title="Eliminar calificación guardada"
                  aria-label="Eliminar calificación guardada"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
