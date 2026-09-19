import React, { useState, useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { X, User, Check, GraduationCap } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const { profileModalOpen, setProfileModalOpen, perfil, setPerfil, showToast } = useTracker();
  const [nombre, setNombre] = useState(perfil.nombre || '');
  const [legajo, setLegajo] = useState(perfil.legajo || '');

  const modalRef = useFocusTrap(profileModalOpen);

  useEffect(() => {
    setNombre(perfil.nombre || '');
    setLegajo(perfil.legajo || '');
  }, [perfil, profileModalOpen]);

  useEffect(() => {
    if (!profileModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileModalOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [profileModalOpen, setProfileModalOpen]);

  if (!profileModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPerfil({
      nombre: nombre.trim(),
      legajo: legajo.trim()
    });
    showToast('✅ Perfil de alumno actualizado');
    setProfileModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => setProfileModalOpen(false)}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-base font-bold font-syne text-[var(--text-body)] tracking-wide">
                Perfil del Alumno
              </h2>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Datos para la cabecera y el reporte analítico en PDF
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setProfileModalOpen(false)}
            aria-label="Cerrar perfil"
            className="p-2 rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-[var(--text-body)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
              Nombre y Apellido:
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Martín Ratti"
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[var(--text-body)] placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
              Legajo Universitario UTN:
            </label>
            <input
              type="text"
              value={legajo}
              onChange={e => setLegajo(e.target.value)}
              placeholder="Ej: 48210 o 51234"
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[var(--text-body)] placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p>
              Estos datos se conservarán en tu sesión y aparecerán impresos en el encabezado oficial de tu <strong className="text-[var(--text-body)]">Ficha Analítica en PDF</strong>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={() => setProfileModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-[var(--text-body)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Perfil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
