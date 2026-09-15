import { useEffect, useRef } from 'react';

/**
 * Hook para atrapar el foco dentro de un elemento modal (WCAG 2.2 AA).
 * Cuando el usuario presiona Tab o Shift+Tab, el foco cicla únicamente dentro del modal.
 */
export function useFocusTrap(isActive: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;

    const modalElement = ref.current;
    const focusableElements = modalElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Enfocar el primer elemento interactivo
    firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab: hacia atrás
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: hacia adelante
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modalElement.addEventListener('keydown', handleKeyDown);
    return () => {
      modalElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return ref;
}
