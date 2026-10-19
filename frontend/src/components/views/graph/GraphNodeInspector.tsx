import React from 'react';
import { X, ExternalLink, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { MATERIAS_MAP, MATERIAS_TRONCALES } from '../../../data/plan2023';
import type { EstadoMateria } from '../../../types/plan';

interface GraphNodeInspectorProps {
  focusedSubjectId: number | null;
  estados: Record<number, EstadoMateria>;
  onClose: () => void;
  onOpenDetails: (id: number) => void;
  onSetEstadoDirecto: (id: number, estado: EstadoMateria) => void;
}

export const GraphNodeInspector: React.FC<GraphNodeInspectorProps> = ({
  focusedSubjectId,
  estados,
  onClose,
  onOpenDetails,
  onSetEstadoDirecto
}) => {
  if (!focusedSubjectId) return null;
  const materia = MATERIAS_MAP[focusedSubjectId];
  if (!materia) return null;

  const currentEstado = estados[materia.id] || 'pendiente';

  const destrabaCursar = MATERIAS_TRONCALES.filter(m => m.reqRegular.includes(materia.id)).length;
  const destrabaRendir = MATERIAS_TRONCALES.filter(m => {
    const enApr = Array.isArray(m.reqAprobada) && m.reqAprobada.includes(materia.id);
    const enRendir = Array.isArray(m.reqRendirAprobada) && m.reqRendirAprobada.includes(materia.id);
    return enApr || enRendir;
  }).length;

  return (
    <div className="absolute bottom-20 left-3 right-3 sm:left-6 sm:right-auto sm:bottom-6 md:bottom-8 z-30 w-auto sm:w-90 max-w-[calc(100vw-24px)] bg-(--bg-surface) border-2 border-(--border-color) rounded-2xl p-4 shadow-[0_16px_48px_rgba(0,0,0,0.55)] font-mono text-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-start justify-between gap-2 border-b border-(--border-color) pb-2.5 mb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5">
            <span className="font-bold text-(--color-primary)">#{String(materia.id).padStart(2, '0')}</span>
            <span>·</span>
            <span>{materia.nivel}º Nivel · {materia.horas} hs</span>
          </div>
          <h4 className="font-syne font-bold text-sm text-(--text-body) truncate">
            {materia.nombreCompleto}
          </h4>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar inspector"
          className="p-1 rounded-lg text-slate-400 hover:text-(--text-body) hover:bg-(--border-color)/40 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Selector rápido de estado */}
      <div className="space-y-1.5 mb-3">
        <span className="text-[10px] text-slate-500 block">Cambio rápido de estado:</span>
        <div className="grid grid-cols-3 gap-1 text-[10px]">
          <button
            type="button"
            onClick={() => onSetEstadoDirecto(materia.id, 'pendiente')}
            className={`py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
              currentEstado === 'pendiente'
                ? 'bg-slate-200 dark:bg-slate-800 border-slate-400 text-(--text-body) font-bold shadow-xs'
                : 'bg-(--bg-elevated) border-(--border-color) text-slate-500 hover:text-(--text-body)'
            }`}
          >
            ⚪ Pendiente
          </button>
          <button
            type="button"
            onClick={() => onSetEstadoDirecto(materia.id, 'regular')}
            className={`py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
              currentEstado === 'regular'
                ? 'font-bold shadow-xs'
                : 'bg-(--bg-elevated) border-(--border-color) text-slate-500 hover:text-(--text-body)'
            }`}
            style={currentEstado === 'regular' ? {
              backgroundColor: 'var(--color-regular-bg)',
              borderColor: 'var(--color-regular-border)',
              color: 'var(--color-regular)'
            } : {}}
          >
            🟡 Regular
          </button>
          <button
            type="button"
            onClick={() => onSetEstadoDirecto(materia.id, 'aprobada')}
            className={`py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
              currentEstado === 'aprobada'
                ? 'font-bold shadow-xs'
                : 'bg-(--bg-elevated) border-(--border-color) text-slate-500 hover:text-(--text-body)'
            }`}
            style={currentEstado === 'aprobada' ? {
              backgroundColor: 'var(--color-aprobada-bg)',
              borderColor: 'var(--color-aprobada-border)',
              color: 'var(--color-aprobada)'
            } : {}}
          >
            🟢 Aprobada
          </button>
        </div>
      </div>

      {/* Métricas de desbloqueo */}
      <div className="grid grid-cols-2 gap-2 text-[10px] bg-(--bg-elevated) p-2 rounded-xl border border-(--border-color) mb-3">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-regular)' }} />
          <span>Destraba cursar: <strong className="text-(--text-body)">{destrabaCursar}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--color-aprobada)' }} />
          <span>Destraba rendir: <strong className="text-(--text-body)">{destrabaRendir}</strong></span>
        </div>
      </div>

      {/* Botón ver detalles completos */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <ArrowRight className="w-3 h-3 text-(--color-primary)" />
          <span>Ver correlatividades</span>
        </span>
        <button
          type="button"
          onClick={() => onOpenDetails(materia.id)}
          className="px-2.5 py-1 rounded-lg bg-(--color-primary-bg) text-(--color-primary) hover:opacity-90 border border-(--color-primary-border) font-bold text-[11px] flex items-center gap-1 transition-opacity cursor-pointer shadow-xs"
        >
          <span>Abrir Ficha</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
