import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from '../context/TrackerContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { X, User, Check, GraduationCap, Download, Upload, Database } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const { 
    profileModalOpen, 
    setProfileModalOpen, 
    perfil, 
    setPerfil, 
    showToast,
    exportBackupJson,
    importBackupJson
  } = useTracker();
  const [nombre, setNombre] = useState(perfil.nombre || '');
  const [legajo, setLegajo] = useState(perfil.legajo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ok = importBackupJson(content);
        if (ok) {
          showToast('✅ ¡Datos restaurados exitosamente desde JSON!', 'success');
          setProfileModalOpen(false);
        } else {
          showToast('❌ El archivo seleccionado no tiene un formato válido', 'error');
        }
      } catch {
        showToast('❌ Error al procesar el archivo JSON', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-scrollbar"
      onClick={() => setProfileModalOpen(false)}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-sm sm:text-base font-bold font-syne text-[var(--text-body)] tracking-wide">
                Perfil y Copia de Seguridad
              </h2>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Datos personales y respaldo de tu avance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setProfileModalOpen(false)}
            aria-label="Cerrar perfil"
            className="p-2 rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-[var(--text-body)] hover:bg-[var(--bg-surface)] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 sm:p-6 space-y-6 font-mono text-xs overflow-y-auto no-scrollbar">
          {/* Formulario de perfil */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar Datos Alumno</span>
              </button>
            </div>
          </form>

          {/* Sección de Respaldo y Migración JSON */}
          <div className="pt-4 border-t border-[var(--border-color)] space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-500" />
              <h3 className="font-syne font-bold text-xs sm:text-sm text-[var(--text-body)]">
                Copia de Seguridad Local (.JSON)
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Exportá o restaurá un archivo <strong className="text-[var(--text-body)]">.json</strong> con todo tu progreso: estados de cursado, notas finales, fechas, metas de examen y electivas. Ideal para cambiar de dispositivo o resguardo offline.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={exportBackupJson}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 font-semibold transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Copia (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold transition-all shadow-sm"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Restaurar Copia (.json)</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
