import React from 'react';
import { Network, Loader2 } from 'lucide-react';

export const GraphSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[calc(100vh-125px)] bg-(--bg-base) flex flex-col items-center justify-center overflow-hidden">
      {/* Patrón de fondo geométrico sutil */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-primary) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-2xl bg-(--bg-surface)/90 border border-(--border-color) backdrop-blur-md shadow-2xl text-center max-w-sm">
        <div className="relative">
          <div 
            className="p-4 rounded-2xl border"
            style={{
              backgroundColor: 'var(--color-primary-bg)',
              borderColor: 'var(--color-primary-border)',
              color: 'var(--color-primary)'
            }}
          >
            <Network className="w-8 h-8 animate-pulse" />
          </div>
          <Loader2 
            className="w-5 h-5 animate-spin absolute -top-1 -right-1" 
            style={{ color: 'var(--color-primary)' }}
          />
        </div>

        <div>
          <h3 className="font-syne font-bold text-(--text-body) text-base">
            Cargando Grafo Interactivo
          </h3>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
            Optimizando motor de visualización de red...
          </p>
        </div>

        <div className="w-48 h-1.5 rounded-full bg-(--border-color) overflow-hidden mt-1">
          <div 
            className="h-full animate-[pulse_1.5s_ease-in-out_infinite]" 
            style={{ background: 'var(--gradient-primary)' }}
          />
        </div>
      </div>
    </div>
  );
};
