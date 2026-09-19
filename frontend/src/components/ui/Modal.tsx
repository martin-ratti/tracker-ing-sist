import React, { useEffect } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  maxWidth?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  maxWidth = 'max-w-2xl',
  children
}) => {
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
        className={`bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-t-2xl sm:rounded-2xl w-full ${maxWidth} max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              {badge && <div className="mb-1.5">{badge}</div>}
              <h2 className="text-lg sm:text-xl font-bold font-syne text-[var(--text-body)]">{title}</h2>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="p-2 -mr-1 rounded-xl text-slate-400 hover:text-[var(--text-body)] hover:bg-[var(--bg-surface)] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 max-h-[calc(95vh-120px)] sm:max-h-[calc(85vh-120px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
