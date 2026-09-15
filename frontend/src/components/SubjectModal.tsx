import React, { useState, useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { MATERIAS_MAP, MATERIAS_TRONCALES } from '../data/plan2023';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Award, 
  ArrowRight
} from 'lucide-react';

export const SubjectModal: React.FC = () => {
  const {
    selectedSubjectId,
    setSelectedSubjectId,
    estados,
    notas,
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
  }, [selectedSubjectId, notas]);

  if (!materia) return null;

  const currentEstado = estados[materia.id] || 'pendiente';

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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setSelectedSubjectId(null)}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subject-modal-title"
        className="bg-[#0b101c] border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-[#0d1527] relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
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
                <span className="font-mono text-xs text-slate-400">
                  {materia.nivel}º Nivel · {materia.horas} horas semanales
                </span>
              </div>
              <h2 id="subject-modal-title" className="text-xl font-bold font-syne text-white">
                {materia.nombreCompleto}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSubjectId(null)}
              aria-label="Cerrar detalles de la materia"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Badges de características */}
          <div className="flex flex-wrap gap-2 mt-3 font-mono text-[11px]">
            {materia.esIntegradora && (
              <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300">
                Materia Integradora
              </span>
            )}
            {materia.esCuatrimestral && (
              <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300">
                Régimen Cuatrimestral
              </span>
            )}
            {materia.esAdusiSolo && (
              <span className="px-2 py-0.5 rounded bg-pink-500/20 border border-pink-500/40 text-pink-300">
                Específica para título intermedio ADUSI
              </span>
            )}
          </div>
        </div>

        {/* Cuerpo del modal */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-180px)] overflow-y-auto">
          
          {/* Selector de Estado */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2">
              Estado Actual de la Materia:
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  if (currentEstado !== 'pendiente') toggleMateriaEstado(materia.id);
                }}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                  currentEstado === 'pendiente'
                    ? 'bg-slate-800 border-slate-600 text-white font-bold shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
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
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                  currentEstado === 'regular'
                    ? 'font-bold shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
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
                    showToast(`🟢 ${materia.nombre} marcada como APROBADA`);
                  }
                }}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                  currentEstado === 'aprobada'
                    ? 'font-bold shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
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
            <div className="bg-[#070b13] p-4 rounded-xl border border-slate-800/80">
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
                      <li key={reqId} className="flex items-center justify-between text-slate-300">
                        <span className="truncate">{reqM?.nombre || `#${reqId}`} (Regular)</span>
                        {ok ? (
                          <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OK
                          </span>
                        ) : (
                          <span className="text-rose-400/80 flex items-center gap-1 text-[11px]">
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
                      <li key={reqId} className="flex items-center justify-between text-slate-300">
                        <span className="truncate">{reqM?.nombre || `#${reqId}`} (Aprobada)</span>
                        {ok ? (
                          <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OK
                          </span>
                        ) : (
                          <span className="text-rose-400/80 flex items-center gap-1 text-[11px]">
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
            <div className="bg-[#070b13] p-4 rounded-xl border border-slate-800/80">
              <h4 
                className="text-xs font-mono font-bold mb-2.5 flex items-center gap-1.5"
                style={{ color: 'var(--color-regular)' }}
              >
                <span>Para Rendir Examen Final</span>
              </h4>
              <ul className="space-y-1.5 text-xs font-mono text-slate-300">
                <li className="flex items-center justify-between">
                  <span>Estar Regularizada</span>
                  {currentEstado === 'regular' || currentEstado === 'aprobada' ? (
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> OK
                    </span>
                  ) : (
                    <span className="text-rose-400/80 flex items-center gap-1 text-[11px]">
                      <XCircle className="w-3.5 h-3.5" /> Pendiente
                    </span>
                  )}
                </li>

                {materia.reqRendirAprobada === 'TODAS' && (
                  <li className="flex items-center justify-between text-amber-300/90 pt-1 border-t border-slate-800/60">
                    <span>Aprobar TODAS las demás materias</span>
                    <span className="text-[10px] text-amber-400">Requerido</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Materias que destraba */}
          {materiasQueDestraba.length > 0 && (
            <div>
              <h4 className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                <span>Materias que ayuda a destrabar:</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {materiasQueDestraba.map(m => (
                  <span
                    key={m.id}
                    className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
                  >
                    {m.nombre} ({m.nivel}º Año)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Registro de Examen Final / Calificación */}
          <div className="border-t border-slate-800/80 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-syne font-bold text-sm text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Registro de Examen Final (Opcional)</span>
              </h3>
              {notaVal && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Calificación: {notaVal}
                </span>
              )}
            </div>

            <form onSubmit={handleSaveNotas} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Nota (1 - 10):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={notaVal}
                    onChange={e => setNotaVal(e.target.value)}
                    placeholder="Ej: 8"
                    className="w-full bg-[#070b13] border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Fecha de Aprobación:</label>
                  <input
                    type="date"
                    value={fechaVal}
                    onChange={e => setFechaVal(e.target.value)}
                    className="w-full bg-[#070b13] border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Libro:</label>
                    <input
                      type="text"
                      value={libroVal}
                      onChange={e => setLibroVal(e.target.value)}
                      placeholder="Libro"
                      className="w-full bg-[#070b13] border border-slate-800 rounded-lg px-2 py-2 text-slate-200 focus:outline-none focus:border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Folio:</label>
                    <input
                      type="text"
                      value={folioVal}
                      onChange={e => setFolioVal(e.target.value)}
                      placeholder="Folio"
                      className="w-full bg-[#070b13] border border-slate-800 rounded-lg px-2 py-2 text-slate-200 focus:outline-none focus:border-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px] font-mono">Comentarios / Profesor / Cátedra:</label>
                <input
                  type="text"
                  value={comentarioVal}
                  onChange={e => setComentarioVal(e.target.value)}
                  placeholder="Ej: Aprobado con el Ing. Pérez en mesa de Febrero..."
                  className="w-full bg-[#070b13] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-slate-500"
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
