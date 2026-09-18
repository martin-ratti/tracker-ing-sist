import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import type { EstadoMateria } from '../../types/plan';

interface StatusBadgeProps {
  estado: EstadoMateria;
  cursable?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ estado, cursable }) => {
  if (estado === 'aprobada') {
    return (
      <span
        className="text-[10px] px-2 py-0.5 rounded font-mono border flex items-center gap-1 font-medium"
        style={{
          color: 'var(--color-aprobada)',
          borderColor: 'var(--color-aprobada-border)',
          backgroundColor: 'var(--color-aprobada-bg)'
        }}
      >
        <CheckCircle2 className="w-3 h-3" /> Aprobada
      </span>
    );
  }

  if (estado === 'regular') {
    return (
      <span
        className="text-[10px] px-2 py-0.5 rounded font-mono border flex items-center gap-1 font-medium"
        style={{
          color: 'var(--color-regular)',
          borderColor: 'var(--color-regular-border)',
          backgroundColor: 'var(--color-regular-bg)'
        }}
      >
        <Clock className="w-3 h-3" /> Regular
      </span>
    );
  }

  if (cursable) {
    return (
      <span
        className="text-[10px] px-2 py-0.5 rounded font-mono border flex items-center gap-1 font-medium"
        style={{
          color: 'var(--color-cursable)',
          borderColor: 'var(--color-cursable-border)',
          backgroundColor: 'var(--color-cursable-bg)'
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-ping"
          style={{ backgroundColor: 'var(--color-cursable)' }}
        />
        Cursable
      </span>
    );
  }

  return (
    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700/60">
      Bloqueada
    </span>
  );
};
