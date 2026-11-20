import React, { useState, useRef } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Modal } from '../ui/Modal';
import { User, Check, GraduationCap, Download, Upload, Database, Heart, Copy, FileDown, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { DONATION_CONFIG } from '../../data/donations';

export const ProfileModal: React.FC = () => {
  const { 
    profileModalOpen, 
    setProfileModalOpen, 
    perfil, 
    setPerfil, 
    showToast,
    exportBackupJson,
    importBackupJson,
    estados,
    estadosElectivas,
    notas,
    ppsHoras,
    stats,
    metasExamen,
    syncStatus,
    syncNowFromCloud
  } = useTracker();
  const [nombre, setNombre] = useState(perfil.nombre || '');
  const [legajo, setLegajo] = useState(perfil.legajo || '');
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSyncNow = async () => {
    if (isSyncingNow) return;
    setIsSyncingNow(true);
    try {
      await syncNowFromCloud?.();
    } finally {
      setIsSyncingNow(false);
    }
  };

  const handleCopyAlias = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(DONATION_CONFIG.alias)
        .then(() => {
          setCopiedAlias(true);
          showToast('💙 ¡Alias copiado! Muchas gracias por colaborar', 'success');
          setTimeout(() => setCopiedAlias(false), 2500);
        })
        .catch(() => {
          showToast(`Alias: ${DONATION_CONFIG.alias}`, 'info');
        });
    } else {
      showToast(`Alias: ${DONATION_CONFIG.alias}`, 'info');
    }
  };

  const [prevOpen, setPrevOpen] = useState(profileModalOpen);

  if (profileModalOpen !== prevOpen) {
    setPrevOpen(profileModalOpen);
    if (profileModalOpen) {
      setNombre(perfil.nombre || '');
      setLegajo(perfil.legajo || '');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPerfil({
      nombre: nombre.trim(),
      legajo: legajo.trim()
    });
    showToast('✅ Perfil de alumno actualizado');
    setProfileModalOpen(false);
  };

  const handleDownloadPDF = async () => {
    try {
      const { exportFichaCurricularPDF } = await import('../../utils/pdfExporter');
      exportFichaCurricularPDF({
        perfil: { nombre: nombre.trim(), legajo: legajo.trim() },
        estados,
        estadosElectivas,
        notas,
        ppsHoras,
        stats,
        metasExamen
      });
      showToast('📄 ¡Ficha Analítica PDF descargada con éxito!', 'success');
    } catch (err: unknown) {
      console.error('Error al exportar ficha PDF:', err);
      showToast('❌ Error al generar la ficha analítica en PDF', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    file.text()
      .then((content) => {
        try {
          const parsed = JSON.parse(content) as Record<string, unknown>;
          const ok = importBackupJson(content);
          if (ok) {
            const aprCount = Object.values((parsed.estados as Record<string, string>) || {}).filter(val => val === 'aprobada').length;
            const regCount = Object.values((parsed.estados as Record<string, string>) || {}).filter(val => val === 'regular').length;
            const metaCount = Object.keys((parsed.metasExamen as Record<string, unknown>) || {}).length;
            showToast(`✅ Restauradas con éxito: ${aprCount} aprobadas, ${regCount} regulares y ${metaCount} metas`, 'success');
            setProfileModalOpen(false);
          } else {
            showToast('❌ El archivo seleccionado no tiene un formato válido', 'error');
          }
        } catch {
          showToast('❌ Error al procesar el archivo JSON', 'error');
        }
      })
      .catch(() => {
        showToast('❌ Error al procesar el archivo JSON', 'error');
      })
      .finally(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  };

  return (
    <Modal
      isOpen={profileModalOpen}
      onClose={() => setProfileModalOpen(false)}
      title="Perfil y Copia de Seguridad"
      subtitle="Datos personales y respaldo de tu avance"
      titleId="profile-modal-title"
      closeLabel="Cerrar perfil"
      maxWidth="max-w-md 2xl:max-w-lg 4k:max-w-xl"
      icon={
        <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
          <User className="w-5 h-5" />
        </div>
      }
    >
      <div className="space-y-6 font-mono text-xs">
        {/* Formulario de perfil */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="profile-nombre-input" className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
              Nombre y Apellido:
            </label>
            <input
              id="profile-nombre-input"
              name="nombre"
              type="text"
              autoComplete="name"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Martín Ratti"
              className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-lg px-3 py-2 text-(--text-body) placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-1"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="profile-legajo-input" className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
              Legajo Universitario UTN:
            </label>
            <input
              id="profile-legajo-input"
              name="legajo"
              type="text"
              value={legajo}
              onChange={e => setLegajo(e.target.value)}
              placeholder="Ej: 48210 o 51234"
              className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-lg px-3 py-2 text-(--text-body) placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-1"
            />
          </div>

            <div className="p-3 rounded-lg bg-(--bg-elevated) border border-(--border-color) text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <p>
                Estos datos se conservarán en tu sesión y aparecerán impresos en el encabezado oficial de tu <strong className="text-(--text-body)">Ficha Analítica en PDF</strong>.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-bold transition-all shadow-xs text-xs cursor-pointer"
                title="Generar y descargar Ficha Analítica Curricular oficial en PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Descargar Ficha PDF</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md text-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar Datos Alumno</span>
              </button>
            </div>
          </form>

          {/* Sección de Sincronización en la Nube y Respaldo JSON */}
          <div className="pt-4 border-t border-(--border-color) space-y-3">
            {/* Estado de sincronización y botón secundario de refresco */}
            <div className="p-3 rounded-xl bg-(--bg-elevated) border border-(--border-color) flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-(--bg-surface) border border-(--border-color) shrink-0">
                  {syncStatus === 'offline' ? (
                    <CloudOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Cloud className={`w-4 h-4 ${syncStatus === 'saving' || isSyncingNow ? 'text-amber-400 animate-pulse' : 'text-emerald-500'}`} />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-syne font-bold text-xs text-(--text-body) flex items-center gap-1.5">
                    <span>
                      {syncStatus === 'saving' || isSyncingNow
                        ? 'Guardando cambios...'
                        : syncStatus === 'offline'
                        ? 'Sin conexión — guardado en este dispositivo'
                        : 'Sincronizado con la nube'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Envía tus cambios pendientes y actualiza el avance desde la nube.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncingNow || syncStatus === 'offline'}
                title="Envía cualquier cambio local pendiente a la nube y descarga la versión más reciente del servidor"
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--bg-surface) hover:bg-(--bg-base) text-(--text-body) border border-(--border-color) font-semibold transition-all shadow-xs shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-500 ${isSyncingNow ? 'animate-spin' : ''}`} />
                <span>{isSyncingNow ? 'Sincronizando...' : 'Sincronizar ahora'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Database className="w-4 h-4 text-cyan-500" />
              <h3 className="font-syne font-bold text-xs sm:text-sm text-(--text-body)">
                Copia de Seguridad Local (.JSON)
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Exportá o restaurá un archivo <strong className="text-(--text-body)">.json</strong> con todo tu progreso: estados de cursado, notas finales, fechas, metas de examen y electivas. Ideal para cambiar de dispositivo o resguardo offline.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={exportBackupJson}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-(--color-primary-bg) hover:opacity-90 text-(--color-primary) border border-(--color-primary-border) font-semibold transition-opacity shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Copia (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-(--bg-surface) hover:bg-(--bg-elevated) text-(--text-body) border border-(--border-color) font-semibold transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4 text-amber-500 dark:text-amber-400" />
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

          {/* Sección de Apoyo y Donaciones (Mercado Pago - Compacto) */}
          <div className="pt-3 border-t border-(--border-color) space-y-1.5">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Si querés apoyar el desarrollo del proyecto:
            </p>
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-(--bg-elevated) border border-(--border-color) hover:border-sky-500/30 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 text-sky-500">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-syne font-bold text-xs text-(--text-body)">Apoyá el Tracker</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400">
                      Mercado Pago
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    Alias: <strong className="text-(--text-body) font-bold">{DONATION_CONFIG.alias}</strong> · {DONATION_CONFIG.titular}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyAlias}
                aria-label="Copiar alias de Mercado Pago"
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-(--bg-surface) hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-(--border-color) hover:border-sky-500/40 font-mono text-[11px] font-bold transition-all shrink-0 active:scale-95"
              >
                {copiedAlias ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Alias</span>
                  </>
                )}
              </button>
            </div>
          </div>
      </div>
    </Modal>
  );
};
