import React, { useState, useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { encodeProgress } from '../utils/share';
import { X, Share2, Copy, Check, Eye } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { estados, estadosElectivas, perfil, ppsHoras, stats, showToast } = useTracker();
  const [copied, setCopied] = useState(false);
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

  const shareCode = encodeProgress({
    estados,
    estadosElectivas,
    perfil,
    ppsHoras
  });

  const shareUrl = `${window.location.origin}${window.location.pathname}#share=${shareCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      showToast('🔗 ¡Enlace copiado al portapapeles!', 'success');
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      showToast('⚠️ No se pudo copiar automáticamente', 'error');
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-syne text-[var(--text-body)]">
                Compartir Avance de Carrera
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Genera un enlace público en modo solo lectura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--text-body)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-color)] space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pb-2 border-b border-[var(--border-color)]">
              <span>Resumen compartido:</span>
              <span className="font-bold text-[var(--text-body)]">{perfil.nombre || 'Estudiante'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-slate-600 dark:text-slate-400">Aprobadas: </span>
                <span className="font-bold" style={{ color: 'var(--color-aprobada)' }}>{stats.aprobadasCount}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Regulares: </span>
                <span className="font-bold" style={{ color: 'var(--color-regular)' }}>{stats.regularesCount}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Avance carrera: </span>
                <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{stats.porcentajeCarrera}%</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Electivas: </span>
                <span className="font-bold text-amber-700 dark:text-amber-400">{stats.horasElectivasAprobadas} hs</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <label className="text-slate-600 dark:text-slate-400 block font-medium">Enlace de lectura:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-body)] focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all shrink-0"
                style={{
                  background: copied ? 'var(--color-aprobada)' : 'var(--gradient-primary)',
                  color: '#ffffff'
                }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-800 dark:text-sky-300 font-mono">
            <Eye className="w-4 h-4 shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
            <span>
              Quien reciba este enlace podrá visualizar tu grafo y malla curricular sin modificar tus datos guardados.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
