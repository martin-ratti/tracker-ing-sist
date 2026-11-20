import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Cloud, Laptop, GitMerge, AlertCircle } from 'lucide-react';

export const SyncConflictModal: React.FC = () => {
  const { syncConflict, handleResolveSyncConflict } = useAuth();

  if (!syncConflict) return null;

  const countApproved = (estados?: Record<number, string>) =>
    Object.values(estados || {}).filter(e => e === 'aprobada').length;
  const countRegular = (estados?: Record<number, string>) =>
    Object.values(estados || {}).filter(e => e === 'regular').length;
  const countMetas = (metas?: Record<number, unknown>) =>
    Object.keys(metas || {}).length;

  const localApproved = countApproved(syncConflict.localData.estados);
  const localRegular = countRegular(syncConflict.localData.estados);
  const localMetas = countMetas(syncConflict.localData.metasExamen) + countMetas(syncConflict.localData.metasGlobalizador);

  const cloudApproved = countApproved(syncConflict.cloudData.estados);
  const cloudRegular = countRegular(syncConflict.cloudData.estados);
  const cloudMetas = countMetas(syncConflict.cloudData.metasExamen) + countMetas(syncConflict.cloudData.metasGlobalizador);

  return (
    <Modal
      isOpen={Boolean(syncConflict)}
      onClose={() => void handleResolveSyncConflict('cloud')}
      title="Sincronizar Progreso Inicial"
      subtitle="Detectamos avances distintos entre este dispositivo y tu cuenta en la nube"
      titleId="sync-conflict-modal-title"
      closeLabel="Usar datos de la nube"
      maxWidth="max-w-lg"
      icon={
        <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-500">
          <AlertCircle className="w-5 h-5" />
        </div>
      }
    >
      <div className="space-y-4 font-mono text-xs">
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Estabas usando el Tracker sin cuenta y ahora iniciaste sesión en una cuenta que ya tiene datos guardados. Elegí cómo querés continuar (esta confirmación se pregunta una única vez al vincular el dispositivo):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-(--bg-elevated) border border-(--border-color) space-y-1">
            <div className="flex items-center gap-1.5 font-syne font-bold text-(--text-body)">
              <Cloud className="w-4 h-4 text-cyan-500" />
              <span>En tu Nube</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              <div>• Aprobadas: <strong className="text-(--text-body)">{cloudApproved}</strong></div>
              <div>• Regulares: <strong className="text-(--text-body)">{cloudRegular}</strong></div>
              <div>• Metas agendadas: <strong className="text-(--text-body)">{cloudMetas}</strong></div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-(--bg-elevated) border border-(--border-color) space-y-1">
            <div className="flex items-center gap-1.5 font-syne font-bold text-(--text-body)">
              <Laptop className="w-4 h-4 text-indigo-500" />
              <span>En este Dispositivo</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              <div>• Aprobadas: <strong className="text-(--text-body)">{localApproved}</strong></div>
              <div>• Regulares: <strong className="text-(--text-body)">{localRegular}</strong></div>
              <div>• Metas agendadas: <strong className="text-(--text-body)">{localMetas}</strong></div>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => void handleResolveSyncConflict('cloud')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-left transition-colors cursor-pointer"
          >
            <div>
              <div className="font-bold text-(--text-body) flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-cyan-500" />
                <span>Usar datos de la nube (Recomendado)</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Carga exactamente lo que tenías guardado en tu cuenta.
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => void handleResolveSyncConflict('local')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-(--bg-elevated) hover:bg-(--bg-base) border border-(--border-color) text-left transition-colors cursor-pointer"
          >
            <div>
              <div className="font-bold text-(--text-body) flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-indigo-500" />
                <span>Subir datos de este dispositivo</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Reemplaza la nube con el progreso que armaste en este navegador.
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => void handleResolveSyncConflict('merge')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-(--bg-elevated) hover:bg-(--bg-base) border border-(--border-color) text-left transition-colors cursor-pointer"
          >
            <div>
              <div className="font-bold text-(--text-body) flex items-center gap-1.5">
                <GitMerge className="w-4 h-4 text-emerald-500" />
                <span>Combinar ambos</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Une las materias aprobadas, notas y metas de ambos lugares.
              </div>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
};
