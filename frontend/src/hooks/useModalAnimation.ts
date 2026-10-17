import { useState, useEffect } from 'react';

/**
 * Hook para gestionar el ciclo de vida de animación fluida de entrada y salida (enter & exit)
 * en modales, diálogos y paneles deslizables (drawers).
 *
 * `isMounted` es verdadero si `isOpen` está activo o mientras transcurre la animación de salida
 * (`durationMs`), desmontándose de forma limpia al terminar la transición CSS.
 *
 * @param isOpen Estado lógico de apertura del modal
 * @param durationMs Duración en ms de la transición de cierre (por defecto 200ms)
 * @returns { isMounted, isVisible }
 */
export function useModalAnimation(isOpen: boolean, durationMs = 200) {
  const [isMounted, setIsMounted] = useState<boolean>(isOpen);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [prevOpen, setPrevOpen] = useState<boolean>(isOpen);

  // Sincronizar durante el renderizado cuando isOpen cambia (React 19 pattern)
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen && !isMounted) {
      setIsMounted(true);
    }
    if (!isOpen && isVisible) {
      setIsVisible(false);
    }
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (isOpen) {
      // Usar requestAnimationFrame para asegurar que el DOM tenga el estado inicial (opacity-0 / translate)
      // antes de activar la animación de entrada
      const frameId = requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return () => {
        cancelAnimationFrame(frameId);
      };
    } else {
      timer = setTimeout(() => {
        setIsMounted(false);
      }, durationMs);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, durationMs]);

  return { isMounted: isOpen || isMounted, isVisible };
}
