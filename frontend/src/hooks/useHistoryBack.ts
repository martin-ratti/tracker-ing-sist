import { useEffect, useRef } from 'react';

/**
 * Hook para interceptar el botón "Atrás" del navegador/celular en overlays.
 *
 * Cuando `isOpen` pasa a true, inserta un estado en el historial del navegador
 * (history.pushState) de forma que al presionar "Atrás" en Android/iOS en lugar
 * de salir de la SPA, el evento `popstate` se dispara y llama a `onClose`.
 *
 * Al cerrar el overlay por cualquier otro medio (botón X, Escape, backdrop)
 * comprueba si el estado que insertó aún está activo y, de ser así, llama
 * a `history.back()` para mantener el historial limpio (sin entradas fantasma).
 */
export function useHistoryBack(isOpen: boolean, onClose: () => void): void {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const STATE_KEY = 'overlay-open';

    // Insertamos una entrada "falsa" en el historial para que el botón atrás
    // la consuma en lugar de salir de la app.
    history.pushState({ [STATE_KEY]: true }, '');

    const handlePopState = (event: PopStateEvent) => {
      // El usuario presionó "Atrás" — el historial ya retrocedió,
      // simplemente cerramos el overlay.
      if (event.state?.[STATE_KEY]) return;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);

      // Si el overlay se cierra por otro motivo (botón X, Escape, backdrop),
      // el estado falso sigue en el historial. Lo eliminamos con history.back()
      // sólo si el estado actual es el que nosotros insertamos.
      if (history.state?.[STATE_KEY]) {
        history.back();
      }
    };
  }, [isOpen]);
}
