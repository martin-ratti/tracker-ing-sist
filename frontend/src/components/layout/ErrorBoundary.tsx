import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, Download, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
  backupDownloaded: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    showDetails: false,
    backupDownloaded: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary capturó un error fatal:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleClearCacheAndReload = (): void => {
    if (typeof window !== 'undefined') {
      // Limpiar solo claves transitorias de sesión/caché, preservando el progreso principal
      try {
        sessionStorage.clear();
      } catch {
        // Ignorar si sessionStorage está bloqueado
      }
      window.location.href = '/';
    }
  };

  private handleDownloadBackup = (): void => {
    if (typeof window === 'undefined') return;
    try {
      const keys = ['tracker_progress', 'tracker_perfil', 'tracker_metas', 'tracker_notas'];
      const backupData: Record<string, unknown> = {
        exportedAt: new Date().toISOString(),
        source: 'ErrorBoundary Emergency Backup',
        error: this.state.error?.message,
      };

      for (const k of keys) {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            backupData[k] = JSON.parse(val);
          } catch {
            backupData[k] = val;
          }
        }
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tracker-isi-respaldo-emergencia-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.setState({ backupDownloaded: true });
    } catch (err) {
      console.error('Error al generar respaldo de emergencia:', err);
    }
  };

  private handleCopyDetails = (): void => {
    if (typeof window === 'undefined' || !navigator.clipboard) return;
    const details = [
      `Error: ${this.state.error?.name || 'Error'} - ${this.state.error?.message || 'Sin mensaje'}`,
      `Fecha: ${new Date().toISOString()}`,
      `URL: ${window.location.href}`,
      `Navegador: ${navigator.userAgent}`,
      `Stack:\n${this.state.error?.stack || 'Sin stack'}`,
      `ComponentStack:\n${this.state.errorInfo?.componentStack || 'Sin component stack'}`
    ].join('\n\n');

    navigator.clipboard.writeText(details).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    }).catch(() => {
      // Ignorar fallas de portapapeles
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen bg-(--bg-base) text-(--text-body) flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden"
          style={{ backgroundColor: 'var(--bg-base)' }}
        >
          {/* Luces de fondo ambientales de advertencia */}
          <div 
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: '#f43f5e' }}
          />

          <div className="max-w-xl w-full text-center relative z-10 space-y-6">
            {/* Ícono de alerta */}
            <div className="flex justify-center">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border shadow-2xl animate-bounce"
                style={{
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  borderColor: 'rgba(244, 63, 94, 0.4)',
                  boxShadow: '0 0 30px rgba(244, 63, 94, 0.35)',
                }}
              >
                <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
              </div>
            </div>

            {/* Título y descripción */}
            <div>
              <span className="font-mono text-xs uppercase px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold tracking-wider">
                Error Inesperado en la Interfaz
              </span>
              <h1 className="font-syne text-2xl sm:text-3xl font-bold text-slate-100 mt-3 tracking-tight">
                Algo salió mal 😵
              </h1>
              <p className="font-mono text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                Se detuvo la ejecución de la aplicación. Ocurrió un problema inesperado al renderizar la vista. Podés recargar o descargar un respaldo de tus materias y notas.
              </p>
            </div>

            {/* Resumen del error */}
            {this.state.error?.message && (
              <div
                className="w-full p-3.5 rounded-xl border text-left"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 overflow-hidden">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Mensaje de excepción:</span>
                    <p className="font-mono text-xs text-rose-400 break-words">
                      {this.state.error.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={this.handleCopyDetails}
                    className="p-1.5 rounded-lg bg-(--bg-elevated) hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
                    title="Copiar detalles del error para soporte"
                    aria-label="Copiar diagnóstico técnico"
                  >
                    {this.state.copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Acordeón de detalles técnicos */}
                <div className="mt-3 pt-2.5 border-t border-(--border-color)">
                  <button
                    type="button"
                    onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>{this.state.showDetails ? 'Ocultar stack técnico' : 'Ver stack técnico y traza'}</span>
                  </button>

                  {this.state.showDetails && (
                    <div className="mt-2 p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-48 whitespace-pre leading-relaxed select-text">
                      {this.state.error.stack || 'No se capturó stack trace.'}
                      {this.state.errorInfo?.componentStack && `\n\nJerarquía de componentes:\n${this.state.errorInfo.componentStack}`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Acciones principales de recuperación */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="px-5 py-2.5 rounded-xl text-slate-950 font-bold font-mono text-xs sm:text-sm transition-all duration-200 hover:opacity-95 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  style={{
                    background: 'var(--gradient-primary)',
                    boxShadow: '0 0 18px var(--color-primary-glow)',
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Recargar página</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleReset}
                  className="px-5 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-semibold border transition-all duration-200 hover:bg-slate-800/80 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-body)',
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Intentar de nuevo</span>
                </button>
              </div>

              {/* Botón de rescate de datos: Descargar respaldo de emergencia */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={this.handleDownloadBackup}
                  className="px-4 py-2 rounded-xl font-mono text-xs border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  title="Descargar copia JSON de tus materias y notas guardadas"
                >
                  {this.state.backupDownloaded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{this.state.backupDownloaded ? 'Respaldo descargado' : 'Descargar respaldo de emergencia'}</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleClearCacheAndReload}
                  className="px-4 py-2 rounded-xl font-mono text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
                >
                  Restablecer sesión y volver al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
