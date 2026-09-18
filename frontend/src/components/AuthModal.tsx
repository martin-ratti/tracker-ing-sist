import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Cloud, 
  AlertCircle, 
  Loader2, 
  GitMerge, 
  UploadCloud, 
  DownloadCloud 
} from 'lucide-react';
import type { ProgresoUsuario } from '../types/plan';
import { 
  loginApi, 
  registerApi, 
  getLocalProgress, 
  mergeProgress, 
  persistProgress, 
  type UserAuth 
} from '../services/api';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, completeAuth } = useAuth();
  const modalRef = useFocusTrap(isAuthModalOpen);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para Fusión Inteligente
  const [isMergeStep, setIsMergeStep] = useState(false);
  const [pendingAuthUser, setPendingAuthUser] = useState<UserAuth | null>(null);
  const [cloudProgressData, setCloudProgressData] = useState<ProgresoUsuario | null>(null);
  const [localProgressData, setLocalProgressData] = useState<ProgresoUsuario | null>(null);

  const handleClose = React.useCallback(() => {
    setError(null);
    setPassword('');
    setLoading(false);
    setIsMergeStep(false);
    setPendingAuthUser(null);
    closeAuthModal();
  }, [closeAuthModal]);

  useEffect(() => {
    if (!isAuthModalOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isAuthModalOpen, handleClose]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      const authRes = isRegister 
        ? await registerApi(email, password) 
        : await loginApi(email, password);

      // Chequear si hay datos guardados localmente para comparar con la nube
      const localData = getLocalProgress();
      const countLocal = Object.values(localData.estados || {}).filter(e => e !== 'pendiente').length + (localData.ppsHoras || 0);

      // Traer datos de la nube
      const cloudRes = await fetch('/api/progress', {
        headers: { Authorization: `Bearer ${authRes.token}` }
      });
      const cloudData: ProgresoUsuario = cloudRes.ok 
        ? await cloudRes.json() 
        : { estados: {}, estadosElectivas: {}, notas: {}, ppsHoras: 0 };
      const countCloud = Object.values(cloudData.estados || {}).filter(e => e !== 'pendiente').length + (cloudData.ppsHoras || 0);

      // Si ambos lados tienen materias y difieren, ofrecer fusión inteligente
      if (countLocal > 0 && countCloud > 0 && JSON.stringify(localData.estados) !== JSON.stringify(cloudData.estados)) {
        setPendingAuthUser(authRes.user);
        setLocalProgressData(localData);
        setCloudProgressData(cloudData);
        setIsMergeStep(true);
        setLoading(false);
        return;
      }

      // Si la cuenta estaba vacía pero en local tenía datos (ej: usuario que usó la app y recién se registra):
      if (countLocal > 0 && countCloud === 0) {
        await persistProgress(localData);
      }

      completeAuth(authRes.user);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Acciones de fusión
  const handleMergeBoth = async () => {
    if (!pendingAuthUser || !localProgressData || !cloudProgressData) return;
    setLoading(true);
    try {
      const merged = mergeProgress(localProgressData, cloudProgressData);
      await persistProgress(merged);
      completeAuth(pendingAuthUser);
    } catch {
      setError('Error al fusionar progreso.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCloud = () => {
    if (!pendingAuthUser || !cloudProgressData) return;
    localStorage.setItem('utn-sistemas-tracker-2023', JSON.stringify(cloudProgressData));
    completeAuth(pendingAuthUser);
  };

  const handleUseLocal = async () => {
    if (!pendingAuthUser || !localProgressData) return;
    setLoading(true);
    try {
      await persistProgress(localProgressData);
      completeAuth(pendingAuthUser);
    } catch {
      setError('Error al subir progreso local a la nube.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              className="p-2 rounded-xl border"
              style={{
                backgroundColor: 'var(--color-primary-bg)',
                borderColor: 'var(--color-primary-border)',
                color: 'var(--color-primary)'
              }}
            >
              {isMergeStep ? <GitMerge className="w-5 h-5" /> : <Cloud className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-lg font-bold font-syne text-[var(--text-body)]">
                {isMergeStep 
                  ? 'Fusión Inteligente' 
                  : isRegister ? 'Crear Cuenta en la Nube' : 'Iniciar Sesión'}
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {isMergeStep 
                  ? 'Detectamos progreso previo en esta computadora'
                  : 'Sincronizá tu avance en cualquier PC o celular'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar modal de autenticación"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--text-body)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PANTALLA DE FUSIÓN INTELIGENTE */}
        {isMergeStep ? (
          <div className="p-6 space-y-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/40 text-cyan-300 space-y-2">
              <div className="font-bold flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-cyan-400" />
                <span>¿Cómo deseas gestionar tus datos?</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Tienes materias cargadas de forma local en esta PC y también guardadas en tu cuenta de la nube.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">En esta PC (Local)</span>
                <span className="font-bold text-sm text-white">
                  {Object.values(localProgressData?.estados || {}).filter(e => e === 'aprobada').length} Aprobadas
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {Object.values(localProgressData?.estados || {}).filter(e => e === 'regular').length} Regulares
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">En tu Cuenta (Nube)</span>
                <span className="font-bold text-sm text-cyan-400">
                  {Object.values(cloudProgressData?.estados || {}).filter(e => e === 'aprobada').length} Aprobadas
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {Object.values(cloudProgressData?.estados || {}).filter(e => e === 'regular').length} Regulares
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleMergeBoth}
                disabled={loading}
                className="w-full p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitMerge className="w-4 h-4" />}
                <span>Combinar ambos (Recomendado)</span>
              </button>

              <button
                type="button"
                onClick={handleUseCloud}
                disabled={loading}
                className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors flex items-center justify-center gap-2"
              >
                <DownloadCloud className="w-4 h-4 text-indigo-400" />
                <span>Usar datos de la Nube (descarta local)</span>
              </button>

              <button
                type="button"
                onClick={handleUseLocal}
                disabled={loading}
                className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span>Sobreescribir Nube con esta PC</span>
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO DE LOGIN / REGISTRO */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-300 text-xs font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                Correo Electrónico:
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="alumno@utn.edu.ar"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-[var(--text-body)] placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
                Contraseña:
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg pl-9 pr-9 py-2 text-xs font-mono text-[var(--text-body)] placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--text-body)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-slate-950 font-bold font-mono text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              style={{
                background: 'var(--gradient-primary)',
                boxShadow: '0 0 15px var(--color-primary-glow)'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
              )}
            </button>

            {/* Alternador Registro / Login */}
            <div className="pt-3 border-t border-slate-800/80 text-center font-mono text-xs">
              <span className="text-slate-400">
                {isRegister ? '¿Ya tenés una cuenta?' : '¿Aún no tenés cuenta?'}
              </span>
              {' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                }}
                className="font-bold underline hover:opacity-80 transition-opacity"
                style={{ color: 'var(--color-primary)' }}
              >
                {isRegister ? 'Iniciá Sesión' : 'Registrate gratis'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
