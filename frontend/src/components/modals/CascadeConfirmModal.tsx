import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Modal } from '../ui/Modal';
import { AlertTriangle, ArrowDown } from 'lucide-react';

export const CascadeConfirmModal: React.FC = () => {
  const { cascadeConfirmDialog, closeCascadeConfirmDialog } = useTracker();
  const isOpen = Boolean(cascadeConfirmDialog?.isOpen);

  if (!cascadeConfirmDialog) return null;

  const { materiaNombre, totalAfectadas, materiasAfectadas, onConfirm } = cascadeConfirmDialog;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeCascadeConfirmDialog}
      title="Confirmar Reseteo en Cascada"
      subtitle="Se detectaron múltiples materias correlativas afectadas"
      titleId="cascade-modal-title"
      closeLabel="Cancelar reseteo"
      maxWidth="max-w-lg"
      panelClassName="border-amber-500/40"
      headerClassName="bg-amber-500/10"
      icon={
        <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      }
    >
      <div className="space-y-4 font-mono text-xs">
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
            autoFocus
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
    </Modal>
  );
};
