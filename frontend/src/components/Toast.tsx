import React, { useEffect, useRef } from 'react';
import { useTracker } from '../context/TrackerContext';
import type { ToastItem } from '../context/TrackerContext';

const VARIANT_STYLES: Record<ToastItem['variant'], { border: string; dot: string; bg: string }> = {
  success: {
    border: 'border-l-[var(--color-aprobada)]',
    dot: 'bg-[var(--color-aprobada)]',
    bg: 'shadow-[0_8px_30px_rgba(0,0,0,0.7),0_0_12px_var(--color-aprobada-glow)]'
  },
  warning: {
    border: 'border-l-[var(--color-regular)]',
    dot: 'bg-[var(--color-regular)]',
    bg: 'shadow-[0_8px_30px_rgba(0,0,0,0.7),0_0_12px_var(--color-regular-glow)]'
  },
  error: {
    border: 'border-l-rose-500',
    dot: 'bg-rose-500',
    bg: 'shadow-[0_8px_30px_rgba(0,0,0,0.7),0_0_12px_rgba(244,63,94,0.4)]'
  },
  info: {
    border: 'border-l-[var(--color-primary)]',
    dot: 'bg-[var(--color-primary)]',
    bg: 'shadow-[0_8px_30px_rgba(0,0,0,0.7),0_0_15px_var(--color-primary-glow)]'
  }
};

const SingleToast: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onDismiss]);

  const style = VARIANT_STYLES[toast.variant];

  return (
    <div
      role="alert"
      className={`relative bg-[#0f172a]/95 backdrop-blur-md border border-[var(--border-color)] border-l-4 ${style.border} text-slate-100 px-4 py-2.5 rounded-lg text-xs md:text-sm font-mono flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${style.bg} animate-in fade-in slide-in-from-bottom-3`}
      onClick={() => onDismiss(toast.id)}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${style.dot}`} />
      <span className="flex-1">{toast.message}</span>
      <div
        className="absolute bottom-0 left-0 h-0.5 rounded-full bg-white/30"
        style={{
          animation: `shrinkBar ${toast.duration}ms linear forwards`
        }}
      />
    </div>
  );
};

export const Toast: React.FC = () => {
  const { toasts, dismissToast } = useTracker();

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes shrinkBar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col-reverse gap-2 pointer-events-auto max-w-md w-full px-4">
        {toasts.map(toast => (
          <SingleToast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </>
  );
};
