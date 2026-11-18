import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Cloud, 
  AlertCircle, 
  Loader2,
  Bell
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, loginWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClose = useCallback(() => {
    setError(null);
    setPassword('');
    setLoading(false);
    closeAuthModal();
  }, [closeAuthModal]);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (err: unknown) {
      const errCode = typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code: unknown }).code)
        : undefined;
      if (errCode !== 'auth/popup-closed-by-user') {
        const message = err instanceof Error ? err.message : 'Error al autenticarse con Google';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

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
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error. Intenta nuevamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={handleClose}
      title={isRegister ? 'Crear Cuenta en la Nube' : 'Iniciar Sesión'}
      subtitle="Sincronizá tu avance y recibí alertas de mesas"
      titleId="auth-modal-title"
      closeLabel="Cerrar modal de autenticación"
      maxWidth="max-w-md 2xl:max-w-lg 4k:max-w-xl"
      icon={
        <div
          className="p-2 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-primary-bg)',
            borderColor: 'var(--color-primary-border)',
            color: 'var(--color-primary)'
          }}
        >
          <Cloud className="w-5 h-5" />
        </div>
      }
    >
      {/* FORMULARIO DE LOGIN / REGISTRO */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Aviso de recordatorios de mesas por correo */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5 text-blue-600 dark:text-blue-300 text-xs font-mono">
          <Bell className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
          <div className="leading-snug">
            <strong>Recordatorios por correo:</strong> Te avisamos 7 días antes de tus mesas para que no te olvides de anotarte en Sysacad.
          </div>
        </div>

        {error && (
          <div
            id="auth-form-error"
            role="alert"
            className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs font-mono"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Botón de Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl border border-(--border-color) bg-(--bg-elevated) hover:bg-(--bg-surface) text-(--text-body) font-mono text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm hover:border-slate-400 dark:hover:border-slate-600 disabled:opacity-50"
        >
          <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continuar con Google</span>
        </button>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-(--border-color)" />
          <span className="text-[10px] uppercase font-mono text-slate-500">o con correo</span>
          <div className="flex-1 h-px bg-(--border-color)" />
        </div>

        <div>
          <label htmlFor="auth-email-input" className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
            Correo Electrónico:
          </label>
          <div className="relative">
            <Mail aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="auth-email-input"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'auth-form-error' : undefined}
              placeholder="alumno@utn.edu.ar"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-(--text-body) placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-cyan-500 focus-visible:outline-offset-1 focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="auth-password-input" className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1.5 font-semibold">
            Contraseña:
          </label>
          <div className="relative">
            <Lock aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="auth-password-input"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={6}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'auth-form-error' : undefined}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-(--bg-elevated) border border-(--border-color) rounded-lg pl-9 pr-9 py-2 text-xs font-mono text-(--text-body) placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-cyan-500 focus-visible:outline-offset-1 focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-(--text-body)"
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
        <div className="pt-3 border-t border-(--border-color) text-center font-mono text-xs">
          <span className="text-slate-500 dark:text-slate-400">
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
    </Modal>
  );
};
