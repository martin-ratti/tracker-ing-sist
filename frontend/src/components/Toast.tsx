import React, { useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';

export const Toast: React.FC = () => {
  const { toastMessage, showToast } = useTracker();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        showToast('');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, showToast]);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-3">
      <div 
        className="bg-[#0f172a]/95 backdrop-blur-md border text-slate-100 px-5 py-2.5 rounded-full text-xs md:text-sm font-mono flex items-center gap-2"
        style={{
          borderColor: 'var(--color-primary-border)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.7), 0 0 15px var(--color-primary-glow)'
        }}
      >
        <span 
          className="w-2 h-2 rounded-full animate-pulse" 
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
