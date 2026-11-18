import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistoryBack } from './useHistoryBack';

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

interface UseNativeDialogOptions {
  isOpen: boolean;
  onClose: () => void;
  enableHistoryBack?: boolean;
}

/**
 * Sincroniza un <dialog> nativo con estado controlado de React,
 * manejando showModal(), animaciones de salida del top-layer,
 * cancel/close, light-dismiss (closedby="any" + fallback) y Escape en JSDOM.
 */
export function useNativeDialog({
  isOpen,
  onClose,
  enableHistoryBack = true
}: UseNativeDialogOptions) {
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

  useHistoryBack(enableHistoryBack && isOpen, onClose);

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

  return { dialogRef, rendered };
}
