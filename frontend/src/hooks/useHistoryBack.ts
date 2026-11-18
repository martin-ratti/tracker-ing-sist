import { useEffect, useId, useRef } from 'react';

const STATE_KEY = 'overlay-open';
const activeOverlays: string[] = [];
let pendingBackTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSelfBacks = 0;

/**
 * Hook para interceptar el botón "Atrás" del navegador/celular en overlays.
 *
 * Coordina una pila global de overlays activos para evitar condiciones de carrera
 * cuando un drawer/modal se cierra y otro se abre de forma inmediata.
 */
export function useHistoryBack(isOpen: boolean, onClose: () => void): void {
  const overlayId = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    if (pendingBackTimer !== null) {
      clearTimeout(pendingBackTimer);
      pendingBackTimer = null;
    }

    activeOverlays.push(overlayId);

    if (!history.state?.[STATE_KEY]) {
      history.pushState({ [STATE_KEY]: true }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (pendingSelfBacks > 0) {
        pendingSelfBacks -= 1;
        return;
      }
      if (event.state?.[STATE_KEY]) return;
      const topOverlay = activeOverlays[activeOverlays.length - 1];
      if (topOverlay === overlayId) {
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);

      const idx = activeOverlays.lastIndexOf(overlayId);
      if (idx !== -1) {
        activeOverlays.splice(idx, 1);
      }

      if (activeOverlays.length === 0 && history.state?.[STATE_KEY]) {
        pendingBackTimer = setTimeout(() => {
          pendingBackTimer = null;
          if (activeOverlays.length === 0 && history.state?.[STATE_KEY]) {
            pendingSelfBacks += 1;
            history.back();
            setTimeout(() => {
              if (pendingSelfBacks > 0) pendingSelfBacks = 0;
            }, 100);
          }
        }, 0);
      }
    };
  }, [isOpen, overlayId]);
}
