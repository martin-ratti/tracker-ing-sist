import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useHistoryBack } from '../../hooks/useHistoryBack';
import { X } from 'lucide-react';

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

let cachedDisplayTransitionSupport: boolean | undefined;

function canTransitionDisplay(): boolean {
  if (cachedDisplayTransitionSupport !== undefined) return cachedDisplayTransitionSupport;
  if (typeof window === 'undefined' || !window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  const initialDisplay = getComputedStyle(probe).display;
  probe.style.display = 'none';
  cachedDisplayTransitionSupport = initialDisplay === 'block' && getComputedStyle(probe).display === 'block';
  probe.remove();
  return cachedDisplayTransitionSupport;
}

function supportsTopLayerExit(): boolean {
  return typeof window !== 'undefined' && Boolean(window.CSS?.supports?.('overlay', 'auto')) && canTransitionDisplay();
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [rendered, setRendered] = useState(isOpen);
  const [prevOpen, setPrevOpen] = useState(isOpen);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen && !rendered) {
      setRendered(true);
    }
  }

  useHistoryBack(isOpen, onClose);

  const generatedTitleId = React.useId();
  const titleId = customTitleId ?? generatedTitleId;
  const subtitleId = React.useId();

  const closeTopLayer = useCallback(async (dialog: HTMLDialogElement) => {
    if (!supportsTopLayerExit() && typeof dialog.getAnimations === 'function') {
      dialog.setAttribute('data-closing', '');
      const animations = dialog.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map(a => a.finished)),
          new Promise<void>(resolve => setTimeout(resolve, 250))
        ]);
      }
      if (!dialog.hasAttribute('data-closing')) return;
      dialog.removeAttribute('data-closing');
    }

    if (typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
    setRendered(false);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.removeAttribute('data-closing');
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      }
    } else if (rendered) {
      void closeTopLayer(dialog);
    }
  }, [isOpen, rendered, closeTopLayer]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !rendered) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onCloseRef.current();
    };

    const handleClose = () => {
      if (isOpen) onCloseRef.current();
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleClose);

    // Fallback de light-dismiss para navegadores sin <dialog closedby="any"> (p. ej. Safari)
    let cleanupClosedByFallback: (() => void) | undefined;
    if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const isOutside = (e: PointerEvent) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      const handlePointerDown = (e: PointerEvent) => {
        pressedOutside = isOutside(e);
      };
      const handlePointerUp = (e: PointerEvent) => {
        if (pressedOutside && isOutside(e)) {
          onCloseRef.current();
        }
        pressedOutside = false;
      };
      dialog.addEventListener('pointerdown', handlePointerDown);
      dialog.addEventListener('pointerup', handlePointerUp);
      cleanupClosedByFallback = () => {
        dialog.removeEventListener('pointerdown', handlePointerDown);
        dialog.removeEventListener('pointerup', handlePointerUp);
      };
    }

    // Fallback de Escape únicamente para entornos sin showModal nativo (p. ej. JSDOM en tests)
    let cleanupJsdomEsc: (() => void) | undefined;
    if (typeof dialog.showModal !== 'function') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCloseRef.current();
      };
      document.addEventListener('keydown', handleKeyDown);
      cleanupJsdomEsc = () => document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
      cleanupClosedByFallback?.();
      cleanupJsdomEsc?.();
    };
  }, [rendered, isOpen]);

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
