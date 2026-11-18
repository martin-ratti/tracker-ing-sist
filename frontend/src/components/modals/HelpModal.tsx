import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { HelpCircle, AlertTriangle, ExternalLink, GitFork, Sparkles, BookOpen, Network, CheckCircle2, Heart, Copy, Check } from 'lucide-react';
import { DONATION_CONFIG } from '../../data/donations';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [copiedAlias, setCopiedAlias] = useState(false);

  const handleCopyAlias = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(DONATION_CONFIG.alias)
        .then(() => {
          setCopiedAlias(true);
          setTimeout(() => setCopiedAlias(false), 2500);
        })
        .catch(() => {});
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guía del Tracker Plan 2023"
      subtitle="Reglas de correlatividades y funcionamiento interactivo"
      titleId="help-modal-title"
      closeLabel="Cerrar guía de ayuda"
      maxWidth="max-w-xl 2xl:max-w-2xl 4k:max-w-3xl"
      icon={
        <div
          className="p-2 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-primary-bg)',
            borderColor: 'var(--color-primary-border)',
            color: 'var(--color-primary)'
          }}
        >
          <HelpCircle className="w-5 h-5" />
        </div>
      }
    >
      <div className="space-y-4 text-xs font-mono text-slate-600 dark:text-slate-300">

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
              En el Grafo de Red podés filtrar flechas: <strong>Todas</strong> (mapa completo), <strong>Req. Regular</strong> (líneas punteadas, regularidades) o <strong>Req. Aprobada</strong> (líneas continuas, finales aprobados).
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
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed mt-0.5 wrap-break-word">
                    Código abierto en GitHub · Reportá bugs, sugerí cambios o sumá PRs
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold px-2.5 py-1 rounded bg-(--bg-surface) border border-(--border-color) shrink-0 group-hover:border-cyan-500/40 text-center self-start sm:self-center">
                Ver en GitHub ↗
              </span>
            </a>
          </div>

          {/* Módulo 9: Apoyo y Donaciones (Mercado Pago) */}
          <div className="border-t border-(--border-color) pt-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-(--bg-elevated) border border-(--border-color) hover:border-sky-500/40 transition-all shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 text-sky-500">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-syne text-(--text-body)">Si querés apoyar el desarrollo</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20 shrink-0">
                      Mercado Pago
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono leading-tight mt-0.5">
                    Alias: <strong className="text-(--text-body) font-bold">{DONATION_CONFIG.alias}</strong> · {DONATION_CONFIG.titular}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyAlias}
                aria-label="Copiar alias de Mercado Pago"
                className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-lg bg-(--bg-surface) border border-(--border-color) hover:border-sky-500/40 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0 transition-all active:scale-95 self-start sm:self-center"
              >
                {copiedAlias ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Alias</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Módulo 10: Inspiración y Agradecimientos */}
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
    </Modal>
  );
};
