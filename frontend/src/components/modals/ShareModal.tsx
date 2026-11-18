import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Modal } from '../ui/Modal';
import { encodeProgress } from '../../utils/share';
import { Share2, Copy, Check, Eye } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { estados, estadosElectivas, perfil, ppsHoras, stats, showToast } = useTracker();
  const [copied, setCopied] = useState(false);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compartir Avance de Carrera"
      subtitle="Genera un enlace público en modo solo lectura"
      maxWidth="max-w-lg 2xl:max-w-xl 4k:max-w-2xl"
      icon={
        <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
          <Share2 className="w-5 h-5" />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3.5 sm:p-4 rounded-xl bg-(--bg-base) border border-(--border-color) space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pb-2 border-b border-(--border-color)">
              <span>Resumen compartido:</span>
              <span className="font-bold text-(--text-body)">{perfil.nombre || 'Estudiante'}</span>
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
                <span className="font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">{stats.horasElectivasAprobadas} hs</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <label htmlFor="share-url-input" className="text-slate-600 dark:text-slate-400 block font-medium">Enlace de lectura:</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                id="share-url-input"
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-(--bg-base) border border-(--border-color) rounded-lg px-3 py-2 text-xs font-mono text-(--text-body) focus-visible:outline-2 focus-visible:outline-(--color-primary) focus-visible:outline-offset-1 select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-bold transition-all shrink-0 text-xs"
                style={{
                  background: copied ? 'var(--color-aprobada)' : 'var(--gradient-primary)',
                  color: '#ffffff'
                }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado' : 'Copiar Enlace'}</span>
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
    </Modal>
  );
};
