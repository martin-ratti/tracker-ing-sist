import React, { useEffect } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useModalAnimation } from '../../hooks/useModalAnimation';
import { X, HelpCircle, AlertTriangle, ExternalLink, GitFork, Sparkles, BookOpen, Network, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { isMounted, isVisible } = useModalAnimation(isOpen, 200);
  const modalRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 no-scrollbar">
      <div
        className={`fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        className={`relative z-10 bg-(--bg-surface) border border-(--border-color) rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col my-auto transform transition-all duration-200 ease-out ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
          }`}
      >
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-(--border-color) bg-(--bg-elevated) flex items-center justify-between shrink-0">
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
            className="p-2 rounded-xl text-slate-400 hover:text-(--text-body) hover:bg-(--bg-surface) active:scale-90 transition-all min-w-9 min-h-9 flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con módulos resumidos */}
        <div className="p-4 sm:p-6 space-y-4 text-xs font-mono text-slate-600 dark:text-slate-300 overflow-y-auto flex-1 no-scrollbar">

          {/* Módulo 1: Flujo de Estados y Controles */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
              <CheckCircle2 className="w-4 h-4" />
              <span>Flujo de Estados y Controles</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2 rounded-lg bg-(--bg-elevated) border border-(--border-color)">
                <div className="text-(--text-body) font-bold">⚪ Pendiente</div>
                <div className="text-slate-500 text-[10px]">No cursada / bloqueada</div>
              </div>
              <div
                className="p-2 rounded-lg border"
                style={{ backgroundColor: 'var(--color-regular-bg)', borderColor: 'var(--color-regular-border)' }}
              >
                <div className="font-bold" style={{ color: 'var(--color-regular)' }}>🟡 Regular</div>
                <div className="text-slate-600 dark:text-slate-400 text-[10px]">Cursada lista para rendir</div>
              </div>
              <div
                className="p-2 rounded-lg border"
                style={{ backgroundColor: 'var(--color-aprobada-bg)', borderColor: 'var(--color-aprobada-border)' }}
              >
                <div className="font-bold" style={{ color: 'var(--color-aprobada)' }}>🟢 Aprobada</div>
                <div className="text-slate-600 dark:text-slate-400 text-[10px]">Final o promoción</div>
              </div>
            </div>

            <div className="space-y-1.5 bg-(--bg-elevated) p-3 rounded-xl border border-(--border-color) text-[11px] leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body) shrink-0">Click Izq</span>
                <span>Avanza el estado de la materia en ciclo: <strong>Pendiente ➔ Regular ➔ Aprobada</strong>.</span>
              </div>
              <div className="flex items-start gap-2 text-cyan-900 dark:text-cyan-300 font-medium">
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 font-bold shrink-0">Click Derecho</span>
                <span>(o botón ℹ️ en la malla): Abre el <strong>detalle de la materia</strong> para ver correlativas, fechas y asentar notas.</span>
              </div>
            </div>
          </div>

          {/* Módulo 2: Efecto Pulso y Estado Cursable */}
          <div className="space-y-1.5 border-t border-(--border-color) pt-3">
            <h3 className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
              Efecto Pulso y Estado Cursable
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Al cumplir todos los requisitos de correlativas (regulares y aprobadas), la materia se ilumina en cyan con un pulso animado, indicando que estás habilitado para cursarla.
            </p>
          </div>

          {/* Módulo 3: Reseteo en Cascada Inteligente */}
          <div className="space-y-1.5 border-t border-(--border-color) pt-3">
            <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Reseteo en Cascada Inteligente</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Si desmarcás una materia previa, el sistema recalcula recursivamente las materias posteriores que pierden correlatividad, garantizando siempre la consistencia académica de tu plan.
            </p>
          </div>

          {/* Módulo 4: Registro de Notas y Promedios */}
          <div className="space-y-1.5 border-t border-(--border-color) pt-3">
            <h3 className="text-sm font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Registro de Notas y Promedios</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Con <strong>Click Derecho</strong> (o ícono ℹ️) podés asentar la nota de final, fecha, libro y folio. El tracker calcula en tiempo real tu promedio con aplazos y sin aplazos.
            </p>
          </div>

          {/* Módulo 5: Panel de Electivas */}
          <div className="space-y-1.5 border-t border-(--border-color) pt-3">
            <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Panel de Electivas</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              Abrí el panel desde el ícono ✨ en el header para gestionar materias optativas (2° a 5° Año) y controlar el avance hacia las 4 hs de ADUSI y 20 hs de Ingeniería.
            </p>
          </div>

          {/* Módulo 6: Filtros de Correlativas en el Grafo */}
          <div className="space-y-1.5 border-t border-(--border-color) pt-3">
            <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Network className="w-4 h-4" />
              <span>Filtros de Correlativas en el Grafo</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              En el Grafo de Red podés filtrar flechas: <strong>Todas</strong> (mapa completo), <strong>Para Cursar</strong> (regularidades) o <strong>Para Rendir</strong> (aprobaciones).
            </p>
          </div>

          {/* Módulo 7: Atajos de Teclado Globales */}
          <div className="space-y-2 border-t border-(--border-color) pt-3">
            <h3 className="text-sm font-bold text-sky-700 dark:text-sky-300">
              Atajos de Teclado Globales
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
              <div className="p-1 rounded-lg bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between px-2">
                <span>Grafo</span>
                <kbd className="px-1 py-0.2 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">G</kbd>
              </div>
              <div className="p-1 rounded-lg bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between px-2">
                <span>Malla</span>
                <kbd className="px-1 py-0.2 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">M</kbd>
              </div>
              <div className="p-1 rounded-lg bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between px-2">
                <span>Electivas</span>
                <kbd className="px-1 py-0.2 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">E</kbd>
              </div>
              <div className="p-1 rounded-lg bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between px-2">
                <span>Calendario</span>
                <kbd className="px-1 py-0.2 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">C</kbd>
              </div>
              <div className="p-1 rounded-lg bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between px-2">
                <span>Ficha PDF</span>
                <kbd className="px-1 py-0.2 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">R</kbd>
              </div>
              <div className="p-1 rounded-lg bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between px-2">
                <span>Perfil</span>
                <kbd className="px-1 py-0.2 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">P</kbd>
              </div>
              <div className="p-1 rounded-lg bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between px-2">
                <span>Compartir</span>
                <kbd className="px-1 py-0.2 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">S</kbd>
              </div>
              <div className="p-1 rounded-lg bg-(--bg-elevated) border border-(--border-color) flex items-center justify-between px-2">
                <span>Ayuda</span>
                <kbd className="px-1 py-0.2 rounded bg-(--bg-surface) border border-(--border-color) font-bold text-(--text-body)">?</kbd>
              </div>
            </div>
          </div>

          {/* Módulo 8: Código Abierto & Colaboración en GitHub */}
          <div className="border-t border-(--border-color) pt-3">
            <a
              href="https://github.com/martin-ratti/tracker-ing-sist"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-(--bg-elevated) border border-(--border-color) hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all shadow-xs"
            >
              <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-(--bg-surface) border border-(--border-color) flex items-center justify-center shrink-0 text-cyan-500 group-hover:scale-105 transition-transform mt-0.5 sm:mt-0">
                  <GitFork className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left flex-1">
                  <div className="text-xs font-bold font-syne text-(--text-body) flex items-center gap-1.5">
                    <span>¡Colaborá en el Repositorio!</span>
                    <ExternalLink className="w-3 h-3 text-cyan-500 shrink-0" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed mt-0.5 break-words">
                    Código abierto en GitHub · Reportá bugs, sugerí cambios o sumá PRs
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold px-2.5 py-1 rounded bg-(--bg-surface) border border-(--border-color) shrink-0 group-hover:border-cyan-500/40 text-center self-start sm:self-center">
                Ver en GitHub ↗
              </span>
            </a>
          </div>

          {/* Módulo 9: Inspiración y Agradecimientos */}
          <div className="border-t border-(--border-color) pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span>
              Inspirado en el{' '}
              <a
                href="https://tracker-plan-de-estudio.vercel.app/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-(--color-primary) underline hover:text-(--text-body)"
              >
                Tracker de Lucas Alonso
              </a>
              . Adaptado y reescrito para el Plan 2023 ISI (UTN FRRo).
            </span>
            <span className="shrink-0 text-slate-500">Esc para cerrar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
