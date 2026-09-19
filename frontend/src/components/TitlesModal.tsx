import React, { useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { X, GraduationCap, Award, CheckCircle2 } from 'lucide-react';

interface TitlesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TitlesModal: React.FC<TitlesModalProps> = ({ isOpen, onClose }) => {
  const { stats, ppsHoras, setPpsHoras } = useTracker();
  const modalRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titles-modal-title"
        className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 id="titles-modal-title" className="text-lg sm:text-xl font-bold font-syne text-[var(--text-body)] tracking-wide">
                Titulación Universitaria
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Plan 2023 · UTN Facultad Regional Rosario
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar seguimiento de títulos"
            className="p-2 rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-[var(--text-body)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[calc(95vh-120px)] sm:max-h-[calc(85vh-120px)] overflow-y-auto">
          
          {/* Tarjeta ADUSI (Título Intermedio) */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-pink-700 dark:text-pink-300 font-bold">
                  Título Intermedio
                </span>
                <h3 className="font-syne font-bold text-base text-[var(--text-body)] mt-1.5">
                  Analista Desarrollador Universitario en Sistemas de Información (ADUSI)
                </h3>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                  {stats.adusiProgreso}%
                </span>
              </div>
            </div>

            {/* Barra de progreso ADUSI */}
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-4">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${stats.adusiProgreso}%`,
                  background: 'var(--gradient-primary)'
                }}
              />
            </div>

            {/* Requisitos ADUSI */}
            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-[var(--text-body)]">
                <span>Materias 1º, 2º y 3º Nivel (23 materias):</span>
                {stats.adusiFaltantes.some(f => f.includes('Materias')) ? (
                  <span className="text-slate-500 dark:text-slate-400">En progreso</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completadas
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[var(--text-body)]">
                <span>Seminario Integrador (ADUSI):</span>
                {stats.adusiFaltantes.includes('Seminario Integrador') ? (
                  <span className="text-slate-500 dark:text-slate-400">Pendiente</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprobado
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[var(--text-body)]">
                <span>Cumplimiento de 4 hs de Electivas:</span>
                {stats.horasElectivasAprobadas >= 4 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {stats.horasElectivasAprobadas} / 4 hs
                  </span>
                ) : (
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">
                    {stats.horasElectivasAprobadas} / 4 hs (faltan {4 - stats.horasElectivasAprobadas} hs)
                  </span>
                )}
              </div>
            </div>

            {stats.adusiCumplido && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>¡Felicitaciones! Cumplís con todos los requisitos para tramitar el título de ADUSI.</span>
              </div>
            )}
          </div>

          {/* Tarjeta Ingeniería (Título de Grado) */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold">
                  Título de Grado
                </span>
                <h3 className="font-syne font-bold text-base text-[var(--text-body)] mt-1.5">
                  Ingeniero/a en Sistemas de Información
                </h3>
              </div>
              <div className="text-right">
                <span className="font-mono text-lg font-bold" style={{ color: 'var(--color-aprobada)' }}>
                  {stats.ingenieroProgreso}%
                </span>
              </div>
            </div>

            {/* Barra de progreso Ingeniería */}
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-4">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${stats.ingenieroProgreso}%`,
                  background: 'var(--gradient-primary)'
                }}
              />
            </div>

            {/* Requisitos Ingeniería */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[var(--text-body)]">
                <span>{stats.totalTroncales} Materias Troncales (90%):</span>
                <span className={stats.aprobadasCount === stats.totalTroncales ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                  {stats.aprobadasCount} / {stats.totalTroncales} aprobadas
                </span>
              </div>

              <div className="flex items-center justify-between text-[var(--text-body)]">
                <span>Mínimo 20 hs de Electivas (5%):</span>
                <span className={stats.horasElectivasAprobadas >= 20 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-700 dark:text-amber-400 font-semibold'}>
                  {stats.horasElectivasAprobadas} / 20 hs acumuladas
                </span>
              </div>

              {/* Input interactivo de PPS (Prácticas Profesionales Supervisadas) */}
              <div className="pt-2 border-t border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-1.5 text-[var(--text-body)]">
                  <span>Prácticas Profesionales Supervisadas (PPS - 200 hs, 5%):</span>
                  <span className={ppsHoras >= 200 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                    {ppsHoras} / 200 hs
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="10"
                    value={ppsHoras}
                    onChange={e => setPpsHoras(parseInt(e.target.value))}
                    className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={ppsHoras}
                    onChange={e => setPpsHoras(Math.min(200, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded px-2 py-1 text-right text-xs font-mono focus:outline-none"
                    style={{ color: 'var(--color-primary)' }}
                  />
                </div>
              </div>
            </div>

            {stats.ingenieroCumplido && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono text-xs flex items-center gap-2 font-medium">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>¡Excelente! Has alcanzado todos los requisitos para recibirte de Ingeniero/a.</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
