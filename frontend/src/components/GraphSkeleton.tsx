import React from 'react';
import { Network, Loader2 } from 'lucide-react';

export const GraphSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[calc(100vh-125px)] bg-[#070b13] flex flex-col items-center justify-center overflow-hidden">
      {/* Patrón de fondo geométrico sutil */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(34,211,238,0.2) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-2xl bg-[#0b101c]/80 border border-slate-800/80 backdrop-blur-md shadow-2xl text-center max-w-sm">
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
          <h3 className="font-syne font-bold text-white text-base">
            Cargando Grafo Interactivo
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Optimizando motor de visualización de red...
          </p>
        </div>

        <div className="w-48 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
          <div 
            className="h-full animate-[pulse_1.5s_ease-in-out_infinite]" 
            style={{ background: 'var(--gradient-primary)' }}
          />
        </div>
      </div>
    </div>
  );
};
