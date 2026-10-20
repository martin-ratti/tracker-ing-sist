import React, { useEffect } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { AlertTriangle, X, ArrowDown } from 'lucide-react';

export const CascadeConfirmModal: React.FC = () => {
  const { cascadeConfirmDialog, closeCascadeConfirmDialog } = useTracker();
  const isOpen = Boolean(cascadeConfirmDialog?.isOpen);
  const { isMounted, isVisible } = useModalAnimation(isOpen, 200);
  const modalRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCascadeConfirmDialog();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closeCascadeConfirmDialog]);

  if (!isMounted || !cascadeConfirmDialog) return null;

  const { materiaNombre, totalAfectadas, materiasAfectadas, onConfirm } = cascadeConfirmDialog;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 no-scrollbar">
      <div
        className={`fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
        onClick={closeCascadeConfirmDialog}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cascade-modal-title"
        className={`relative z-10 bg-(--bg-surface) border border-amber-500/40 rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col my-auto transform transition-all duration-200 ease-out ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-(--border-color) bg-amber-500/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 id="cascade-modal-title" className="text-sm sm:text-base font-bold font-syne text-(--text-body) tracking-wide">
                Confirmar Reseteo en Cascada
              </h2>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Se detectaron múltiples materias correlativas afectadas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCascadeConfirmDialog}
            aria-label="Cancelar reseteo"
            className="p-2 rounded-xl min-w-9 min-h-9 flex items-center justify-center text-slate-400 hover:text-(--text-body) hover:bg-(--bg-surface) active:scale-90 transition-all shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-6 space-y-4 font-mono text-xs overflow-y-auto no-scrollbar">
          <p className="text-(--text-body) leading-relaxed">
            Al desmarcar <strong className="text-amber-600 dark:text-amber-400 underline">{materiaNombre}</strong>, también se resetearán a estado pendiente las siguientes <strong className="text-rose-500 font-bold">{totalAfectadas} materias correlativas</strong> que dependen de ella para cursar o rendir:
          </p>

          <div className="p-3 bg-(--bg-elevated) border border-(--border-color) rounded-xl max-h-48 overflow-y-auto space-y-1.5 no-scrollbar">
            {materiasAfectadas.map((nom, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <ArrowDown className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">{nom}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Podrás revertir este cambio inmediatamente utilizando la opción <strong>Deshacer</strong> de la notificación emergente.
          </p>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-(--border-color)">
            <button
              type="button"
              onClick={closeCascadeConfirmDialog}
              className="px-3.5 py-2 rounded-xl bg-(--bg-surface) hover:bg-(--bg-elevated) text-slate-600 dark:text-slate-300 border border-(--border-color) font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                closeCascadeConfirmDialog();
                onConfirm();
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Desmarcar y Resetear Cascada
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
