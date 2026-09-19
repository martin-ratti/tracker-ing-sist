import React, { useEffect } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { X, HelpCircle, AlertTriangle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-scrollbar"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        className="bg-(--bg-surface) border border-(--border-color) rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col my-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-(--border-color) bg-(--bg-elevated) flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div 
              className="p-2 rounded-xl border shrink-0"
              style={{
                backgroundColor: 'var(--color-primary-bg)',
                borderColor: 'var(--color-primary-border)',
                color: 'var(--color-primary)'
              }}
            >
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="help-modal-title" className="text-base sm:text-lg font-bold font-syne text-(--text-body)">
                Guía del Tracker Plan 2023
              </h2>
              <p className="text-[11px] sm:text-xs font-mono text-slate-500 dark:text-slate-400">
                Reglas de correlatividades y funcionamiento interactivo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar guía de ayuda"
            className="p-2 rounded-xl text-slate-400 hover:text-(--text-body) hover:bg-(--bg-surface) transition-colors min-w-9 min-h-9 flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5 text-xs font-mono text-slate-600 dark:text-slate-300 overflow-y-auto flex-1 no-scrollbar">
          
          <div className="space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
              <span>Flujo de Estados de una Materia</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Hacé click en cualquier nodo del grafo o tarjeta de la malla curricular para avanzar en el ciclo:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2.5 rounded-lg bg-(--bg-elevated) border border-(--border-color)">
                <div className="text-(--text-body) font-bold mb-1">⚪ Pendiente</div>
                <div className="text-slate-500 dark:text-slate-400">No cursada aún o bloqueada</div>
              </div>
              <div 
                className="p-2.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-regular-bg)',
                  borderColor: 'var(--color-regular-border)'
                }}
              >
                <div className="font-bold mb-1" style={{ color: 'var(--color-regular)' }}>🟡 Regular</div>
                <div className="text-slate-600 dark:text-slate-400">Cursada aprobada, lista para rendir</div>
              </div>
              <div 
                className="p-2.5 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-aprobada-bg)',
                  borderColor: 'var(--color-aprobada-border)'
                }}
              >
                <div className="font-bold mb-1" style={{ color: 'var(--color-aprobada)' }}>🟢 Aprobada</div>
                <div className="text-slate-600 dark:text-slate-400">Final o promoción acreditada</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-(--border-color) pt-4">
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
              Efecto Pulso y Estado Cursable
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Cuando una materia cumple con todos sus requisitos de correlatividades (regulares y aprobadas), se iluminará en el color de estado cursable del tema seleccionado con una animación de pulso. Esto indica que estás habilitado para anotarte y cursarla en el período lectivo.
            </p>
          </div>

          <div className="space-y-2 border-t border-(--border-color) pt-4">
            <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Reseteo en Cascada Inteligente</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Si desmarcás una materia para devolverla a "Pendiente", el sistema automáticamente verificará todas las materias posteriores. Si alguna ya no cumple las correlatividades requeridas, volverá al estado correspondiente de forma recursiva para garantizar que tu plan siempre sea académicamente válido.
            </p>
          </div>

          <div className="space-y-2 border-t border-(--border-color) pt-4">
            <h3 className="text-sm font-bold text-purple-700 dark:text-purple-300">
              Registro de Notas y Promedios
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Hacé <strong>doble click</strong> sobre cualquier materia en el grafo (o click en el ícono de información en la malla) para asentar la nota de final, fecha de examen, libro y folio. El tracker calculará tu promedio general en vivo.
            </p>
          </div>

          <div className="space-y-2 border-t border-(--border-color) pt-4">
            <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300">
              Panel de Electivas
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Abrí el panel de <strong className="text-amber-700 dark:text-amber-300">Electivas</strong> (ícono ✨ en el header) para gestionar las materias optativas. Podés filtrar por nivel (2° a 5° Año) y ver el progreso hacia las 4 hs requeridas para ADUSI y las 20 hs para Ingeniería.
            </p>
          </div>

          <div className="space-y-2 border-t border-(--border-color) pt-4">
            <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
              Filtros de Correlativas en el Grafo
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              En la vista de Grafo de Red podés filtrar las conexiones visibles: <strong>Todas</strong> (muestra todo), <strong>Para Cursar</strong> (solo flechas de regularidad) o <strong>Para Rendir</strong> (solo flechas de aprobación).
            </p>
          </div>

          <div className="space-y-2 border-t border-(--border-color) pt-4">
            <h3 className="text-sm font-bold text-sky-700 dark:text-sky-300">
              Atajos de Teclado Globales
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-1.5 rounded bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between">
                <span>Grafo:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">G</kbd>
              </div>
              <div className="p-1.5 rounded bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between">
                <span>Malla:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">M</kbd>
              </div>
              <div className="p-1.5 rounded bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between">
                <span>Electivas:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">E</kbd>
              </div>
              <div className="p-1.5 rounded bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between">
                <span>Calendario:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">C</kbd>
              </div>
              <div className="p-1.5 rounded bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between">
                <span>Reporte PDF:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">R</kbd>
              </div>
              <div className="p-1.5 rounded bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between">
                <span>Perfil:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">P</kbd>
              </div>
              <div className="p-1.5 rounded bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between">
                <span>Compartir:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">S</kbd>
              </div>
              <div className="p-1.5 rounded bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between">
                <span>Ayuda:</span>
                <kbd className="px-1.5 py-0.5 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">?</kbd>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-(--border-color) pt-3">
            Presioná <kbd className="px-1.5 py-0.5 rounded bg-(--bg-elevated) border border-(--border-color) text-(--text-body)">Esc</kbd> o hacé click fuera para cerrar cualquier panel.
          </div>
        </div>
      </div>
    </div>
  );
};
