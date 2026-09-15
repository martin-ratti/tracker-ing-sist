import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { X, Mail, Lock, Eye, EyeOff, Cloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const modalRef = useFocusTrap(isAuthModalOpen);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClose = React.useCallback(() => {
    setError(null);
    setPassword('');
    setLoading(false);
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
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error. Intenta nuevamente.');
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
        className="bg-[#0b101c] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-6 border-b border-slate-800 bg-[#0d1527] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
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
            <div>
              <h2 id="auth-modal-title" className="text-lg font-bold font-syne text-white">
                {isRegister ? 'Crear Cuenta en la Nube' : 'Iniciar Sesión'}
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Sincronizá tu avance en cualquier PC o celular
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar modal de autenticación"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de modo */}
        <div className="grid grid-cols-2 p-1.5 bg-[#070b14] border-b border-slate-800 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`py-2 rounded-lg font-medium transition-all ${
              !isRegister
                ? 'font-bold shadow-sm border'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={!isRegister ? {
              backgroundColor: 'var(--color-primary-bg)',
              borderColor: 'var(--color-primary-border)',
              color: 'var(--color-primary)'
            } : {}}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`py-2 rounded-lg font-medium transition-all ${
              isRegister
                ? 'font-bold shadow-sm border'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={isRegister ? {
              backgroundColor: 'var(--color-primary-bg)',
              borderColor: 'var(--color-primary-border)',
              color: 'var(--color-primary)'
            } : {}}
          >
            Registrarse
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu.correo@ejemplo.com"
                className="w-full pl-9 pr-3 py-2 bg-[#060a12] border border-slate-800 rounded-lg text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-9 pr-10 py-2 bg-[#060a12] border border-slate-800 rounded-lg text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] font-mono text-slate-500">
              * Tu contraseña se cifra de forma segura en el servidor con algoritmo bcrypt.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-slate-950 font-mono font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{
              background: 'var(--gradient-primary)',
              boxShadow: '0 4px 15px var(--color-primary-glow)'
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : isRegister ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Crear Cuenta y Sincronizar</span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4" />
                <span>Ingresar y Cargar Avance</span>
              </>
            )}
          </button>

          <div className="pt-3 border-t border-slate-800/60 text-center">
            <button
              type="button"
              onClick={handleClose}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
            >
              Continuar en modo local sin iniciar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
