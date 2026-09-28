import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { TrackerProvider, useTracker } from '../context/TrackerContext';
import { BottomNav } from '../components/layout/BottomNav';
import { Toast } from '../components/layout/Toast';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';

const ToastTrigger: React.FC = () => {
  const { showToast } = useTracker();
  return (
    <div>
      <button
        type="button"
        onClick={() => showToast('¡Operación exitosa!', 'success')}
      >
        Disparar Toast Success
      </button>
      <button
        type="button"
        onClick={() => showToast('¡Alerta de prueba!', 'warning')}
      >
        Disparar Toast Warning
      </button>
      <button
        type="button"
        onClick={() => showToast('¡Error de prueba!', 'error')}
      >
        Disparar Toast Error
      </button>
      <Toast />
    </div>
  );
};

const ThrowErrorComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Error fatal simulado para prueba');
  }
  return <div>Componente Normal</div>;
};

describe('Layout Components (BottomNav, Toast, ErrorBoundary)', () => {
  describe('BottomNav', () => {
    it('debe renderizar los botones de navegación móvil y responder a clicks', async () => {
      const user = userEvent.setup();
      const mockMenu = vi.fn();
      const mockElectivas = vi.fn();

      render(
        <TrackerProvider>
          <BottomNav onOpenMenu={mockMenu} onOpenElectivas={mockElectivas} />
        </TrackerProvider>
      );

      // Botón Malla
      const botonMalla = screen.getByRole('button', { name: /Malla/i });
      expect(botonMalla).toBeInTheDocument();
      await user.click(botonMalla);

      // Botón Grafo
      const botonGrafo = screen.getByRole('button', { name: /Grafo/i });
      expect(botonGrafo).toBeInTheDocument();
      await user.click(botonGrafo);

      // Botón Calendario
      const botonCalendario = screen.getByRole('button', { name: /Calendario/i });
      expect(botonCalendario).toBeInTheDocument();
      await user.click(botonCalendario);

      // Botón Electivas
      const botonElectivas = screen.getByRole('button', { name: /Electivas/i });
      await user.click(botonElectivas);
      expect(mockElectivas).toHaveBeenCalledTimes(1);

      // Botón Más / Menú
      const botonMenu = screen.getByRole('button', { name: /Más/i });
      await user.click(botonMenu);
      expect(mockMenu).toHaveBeenCalledTimes(1);
    });
  });

  describe('Toast Notification System', () => {
    it('no debe renderizar nada si no hay toasts activos', () => {
      render(
        <TrackerProvider>
          <Toast />
        </TrackerProvider>
      );
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('debe mostrar la notificación al disparar showToast y cerrarla al hacer click', async () => {
      const user = userEvent.setup();
      render(
        <TrackerProvider>
          <ToastTrigger />
        </TrackerProvider>
      );

      const boton = screen.getByRole('button', { name: /Disparar Toast Success/i });
      await user.click(boton);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('¡Operación exitosa!');

      // Cerrar al clickear el toast
      await user.click(alert);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('debe soportar diferentes variantes de toast (warning, error)', async () => {
      const user = userEvent.setup();
      render(
        <TrackerProvider>
          <ToastTrigger />
        </TrackerProvider>
      );

      const botonWarning = screen.getByRole('button', { name: /Disparar Toast Warning/i });
      await user.click(botonWarning);
      expect(screen.getByText('¡Alerta de prueba!')).toBeInTheDocument();

      const botonError = screen.getByRole('button', { name: /Disparar Toast Error/i });
      await user.click(botonError);
      expect(screen.getByText('¡Error de prueba!')).toBeInTheDocument();
    });
  });

  describe('ErrorBoundary', () => {
    it('debe renderizar a los children normalmente cuando no hay error', () => {
      render(
        <ErrorBoundary>
          <div>Todo en orden</div>
        </ErrorBoundary>
      );
      expect(screen.getByText('Todo en orden')).toBeInTheDocument();
    });

    it('debe atrapar errores en children y mostrar interfaz accesible de recuperación', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowErrorComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Algo salió mal/i)).toBeInTheDocument();
      expect(screen.getByText(/Error fatal simulado para prueba/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Recargar página/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Intentar de nuevo/i })).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    it('debe permitir intentar de nuevo con handleReset', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();

      const DynamicErrorComponent: React.FC = () => {
        const [fail, setFail] = useState(true);
        return (
          <ErrorBoundary>
            {fail ? (
              <button type="button" onClick={() => setFail(false)}>
                Romper
              </button>
            ) : (
              <div>Recuperado con éxito</div>
            )}
            <ThrowErrorComponent shouldThrow={fail} />
          </ErrorBoundary>
        );
      };

      render(<DynamicErrorComponent />);
      expect(screen.getByText(/Algo salió mal/i)).toBeInTheDocument();

      const botonReset = screen.getByRole('button', { name: /Intentar de nuevo/i });
      await user.click(botonReset);

      consoleErrorSpy.mockRestore();
    });

    it('debe renderizar la prop fallback personalizada si se suministra', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary fallback={<div>Fallback Personalizado</div>}>
          <ThrowErrorComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Fallback Personalizado')).toBeInTheDocument();
      consoleErrorSpy.mockRestore();
    });

    it('debe llamar a window.location.reload al clickear Recargar página', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
        configurable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowErrorComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      const botonReload = screen.getByRole('button', { name: /Recargar página/i });
      await user.click(botonReload);
      expect(reloadMock).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
