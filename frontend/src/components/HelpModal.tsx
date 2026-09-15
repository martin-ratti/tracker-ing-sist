import React, { useEffect } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        className="bg-[#0b101c] border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 bg-[#0d1527] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="help-modal-title" className="text-lg font-bold font-syne text-white">
                Guía del Tracker Plan 2023
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Reglas de correlatividades y funcionamiento interactivo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar guía de ayuda"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs font-mono text-slate-300 max-h-[calc(80vh-100px)] overflow-y-auto">
          
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
              <span>Flujo de Estados de una Materia</span>
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Hacé click en cualquier nodo del grafo o tarjeta de la malla curricular para avanzar en el ciclo:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-200 font-bold mb-1">⚪ Pendiente</div>
                <div className="text-slate-400">No cursada aún o bloqueada</div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="text-amber-300 font-bold mb-1">🟡 Regular</div>
                <div className="text-slate-400">Cursada aprobada, lista para rendir</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-emerald-300 font-bold mb-1">🟢 Aprobada</div>
                <div className="text-slate-400">Final o promoción acreditada</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-4">
            <h3 className="text-sm font-bold text-cyan-300">
              Efecto Pulso y Estado Cursable
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Cuando una materia cumple con todos sus requisitos de correlatividades (regulares y aprobadas), se iluminará en color <strong className="text-cyan-300">Cian Brillante</strong> con una animación de pulso neón. Esto indica que estás habilitado para anotarte y cursarla en el período lectivo.
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-4">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Reseteo en Cascada Inteligente</span>
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Si desmarcás una materia para devolverla a "Pendiente", el sistema automáticamente verificará todas las materias posteriores. Si alguna ya no cumple las correlatividades requeridas, volverá al estado correspondiente de forma recursiva para garantizar que tu plan siempre sea académicamente válido.
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-4">
            <h3 className="text-sm font-bold text-purple-300">
              Registro de Notas y Promedios
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Hacé <strong>doble click</strong> sobre cualquier materia en el grafo (o click en el ícono de información en la malla) para asentar la nota de final, fecha de examen, libro y folio. El tracker calculará tu promedio general en vivo.
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-4">
            <h3 className="text-sm font-bold text-amber-300">
              Panel de Electivas
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Abrí el panel de <strong className="text-amber-300">Electivas</strong> (ícono ✨ en el header) para gestionar las materias optativas. Podés filtrar por nivel (2° a 5° Año) y ver el progreso hacia las 4 hs requeridas para ADUSI y las 20 hs para Ingeniería.
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-4">
            <h3 className="text-sm font-bold text-indigo-300">
              Filtros de Correlativas en el Grafo
            </h3>
            <p className="text-slate-400 leading-relaxed">
              En la vista de Grafo de Red podés filtrar las conexiones visibles: <strong>Todas</strong> (muestra todo), <strong>Para Cursar</strong> (solo flechas de regularidad) o <strong>Para Rendir</strong> (solo flechas de aprobación).
            </p>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-800/40 pt-3">
            Presioná <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Esc</kbd> o hacé click fuera para cerrar cualquier panel.
          </div>
        </div>
      </div>
    </div>
  );
};
