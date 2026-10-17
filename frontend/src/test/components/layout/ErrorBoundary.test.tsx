import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary } from '../../../components/layout/ErrorBoundary';

function FaultyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Simulated crash in child component');
  }
  return <div>Componente Hijo Funcional</div>;
}

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('debe renderizar los hijos con normalidad si no ocurre ningún error', () => {
    render(
      <ErrorBoundary>
        <FaultyComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Componente Hijo Funcional')).toBeInTheDocument();
  });

  it('debe renderizar el fallback personalizado si se proporciona', () => {
    render(
      <ErrorBoundary fallback={<div>Fallback Personalizado de Error</div>}>
        <FaultyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Fallback Personalizado de Error')).toBeInTheDocument();
  });

  it('debe renderizar la pantalla de emergencia por defecto y permitir ver detalles técnicos', () => {
    render(
      <ErrorBoundary>
        <FaultyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Algo salió mal/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulated crash in child component/i)).toBeInTheDocument();

    // Toggle de detalles técnicos
    const toggleDetailsBtn = screen.getByRole('button', { name: /Ver stack técnico y traza/i });
    fireEvent.click(toggleDetailsBtn);

    expect(screen.getByText(/Ocultar stack técnico/i)).toBeInTheDocument();
    expect(screen.getByText(/Jerarquía de componentes:/i)).toBeInTheDocument();

    // Ocultar detalles
    fireEvent.click(screen.getByRole('button', { name: /Ocultar stack técnico/i }));
    expect(screen.queryByText(/Jerarquía de componentes:/i)).not.toBeInTheDocument();
  });

  it('debe permitir copiar los detalles al portapapeles', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock }
    });

    render(
      <ErrorBoundary>
        <FaultyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const copyBtn = screen.getByRole('button', { name: /Copiar diagnóstico técnico/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('Simulated crash in child component'));
  });

  it('debe permitir descargar un respaldo de emergencia en formato JSON', () => {
    localStorage.setItem('tracker_progress', JSON.stringify({ estados: { 1: 'aprobada' } }));
    localStorage.setItem('tracker_perfil', 'texto_simple');

    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();

    render(
      <ErrorBoundary>
        <FaultyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const downloadBtn = screen.getByRole('button', { name: /Descargar respaldo de emergencia/i });
    fireEvent.click(downloadBtn);

    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(screen.getByText(/Respaldo descargado/i)).toBeInTheDocument();
  });

  it('debe manejar la recarga de página', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadMock }
    });

    render(
      <ErrorBoundary>
        <FaultyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadBtn = screen.getByRole('button', { name: /Recargar página/i });
    fireEvent.click(reloadBtn);

    expect(reloadMock).toHaveBeenCalled();
  });

  it('debe restablecer sesión y redirigir a inicio al hacer clic en restablecer sesión', () => {
    const clearSpy = vi.spyOn(Storage.prototype, 'clear');
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, href: '' }
    });

    render(
      <ErrorBoundary>
        <FaultyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const resetSessionBtn = screen.getByRole('button', { name: /Restablecer sesión y volver al inicio/i });
    fireEvent.click(resetSessionBtn);

    expect(clearSpy).toHaveBeenCalled();
  });

  it('debe restablecer el estado hasError al pulsar Intentar de nuevo', async () => {
    let shouldThrow = true;
    function DynamicComponent() {
      if (shouldThrow) throw new Error('Crash temporal');
      return <div>Recuperado con éxito</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <DynamicComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Crash temporal/i)).toBeInTheDocument();

    shouldThrow = false;
    const retryBtn = screen.getByRole('button', { name: /Intentar de nuevo/i });
    fireEvent.click(retryBtn);

    rerender(
      <ErrorBoundary>
        <DynamicComponent />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText('Recuperado con éxito')).toBeInTheDocument();
    });
  });
});
