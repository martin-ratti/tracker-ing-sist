import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex flex-col items-center justify-center min-h-screen p-6 text-center select-none"
          style={{ backgroundColor: 'var(--bg-base)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border"
            style={{
              backgroundColor: 'var(--color-primary-bg)',
              borderColor: 'var(--color-primary-border)',
              boxShadow: '0 0 24px var(--color-primary-glow)',
            }}
          >
            <AlertTriangle className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
          </div>

          <h1 className="font-syne text-2xl md:text-3xl font-bold text-slate-100 mb-3 tracking-tight">
            Algo salió mal 😵
          </h1>

          <p className="font-mono text-xs text-slate-400 max-w-md mb-4">
            Se produjo un error al renderizar la aplicación.
          </p>

          {this.state.error?.message && (
            <div
              className="max-w-md w-full p-3.5 mb-6 rounded-xl border text-left overflow-auto max-h-36"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
              }}
            >
              <p className="font-mono text-xs text-rose-300 break-words whitespace-pre-wrap">
                {this.state.error.message}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl text-slate-950 font-bold font-mono text-xs md:text-sm transition-all duration-200 hover:opacity-90 active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              style={{
                background: 'var(--gradient-primary)',
                boxShadow: '0 0 16px var(--color-primary-glow)',
              }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recargar página</span>
            </button>

            <button
              type="button"
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl font-mono text-xs md:text-sm font-semibold border transition-all duration-200 hover:bg-slate-800/60 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
                color: '#e2e8f0',
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Intentar de nuevo</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
