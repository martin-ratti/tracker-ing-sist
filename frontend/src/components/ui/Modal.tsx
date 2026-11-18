import React from 'react';
import { X } from 'lucide-react';
import { useNativeDialog } from '../../hooks/useNativeDialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?: string;
  closeLabel?: string;
  panelClassName?: string;
  headerClassName?: string;
  titleId?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  icon,
  maxWidth = 'max-w-2xl',
  closeLabel = 'Cerrar',
  panelClassName = 'border-(--border-color)',
  headerClassName = 'bg-(--bg-elevated)',
  titleId: customTitleId,
  children
}) => {
  const { dialogRef, rendered } = useNativeDialog({ isOpen, onClose });

  const generatedTitleId = React.useId();
  const titleId = customTitleId ?? generatedTitleId;
  const subtitleId = React.useId();

  if (!rendered) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={subtitle ? subtitleId : undefined}
      {...({ closedby: 'any' } as Record<string, string>)}
      className={`native-dialog m-auto p-0 bg-(--bg-surface) text-(--text-body) border ${panelClassName} rounded-2xl sm:rounded-3xl w-[calc(100%-1.5rem)] ${maxWidth} max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl open:flex flex-col`}
    >
      <div className={`p-4 sm:p-6 border-b border-(--border-color) ${headerClassName} relative shrink-0`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="min-w-0">
              {badge && <div className="mb-1.5">{badge}</div>}
              <h2 id={titleId} className="text-base sm:text-xl font-bold font-syne text-(--text-body)">{title}</h2>
              {subtitle && (
                <p id={subtitleId} className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="p-2 -mr-1 rounded-xl text-slate-400 hover:text-(--text-body) hover:bg-(--bg-surface) active:scale-90 transition-all min-w-9 min-h-9 flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 no-scrollbar">
        {children}
      </div>
    </dialog>
  );
};
