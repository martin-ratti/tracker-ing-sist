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
      <div className="bg-[#0f172a]/95 backdrop-blur-md border border-cyan-500/40 text-slate-100 px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.7)] text-xs md:text-sm font-mono flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
