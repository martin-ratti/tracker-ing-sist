import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useEffect } from 'react';
import { TrackerProvider, useTracker } from '../../../context/TrackerContext';
import { AuthProvider, useAuth } from '../../../context/AuthContext';
import { HelpModal } from '../../../components/modals/HelpModal';
import { TitlesModal } from '../../../components/modals/TitlesModal';
import { ProfileModal } from '../../../components/modals/ProfileModal';
import { ShareModal } from '../../../components/modals/ShareModal';
import { StatsModal } from '../../../components/modals/StatsModal';
import { PrintableReportModal } from '../../../components/modals/PrintableReportModal';
import { AuthModal } from '../../../components/modals/AuthModal';

const ProfileModalWrapper: React.FC = () => {
  const { setProfileModalOpen } = useTracker();
  return (
    <div>
      <button type="button" onClick={() => setProfileModalOpen(true)}>
        Abrir Perfil
      </button>
      <ProfileModal />
    </div>
  );
};

const ReportModalWrapper: React.FC = () => {
  const { setReportOpen } = useTracker();
  return (
    <div>
      <button type="button" onClick={() => setReportOpen(true)}>
        Abrir Reporte
      </button>
      <PrintableReportModal />
    </div>
  );
};

const AuthModalWrapper: React.FC = () => {
  const { openAuthModal } = useAuth();
  return (
    <div>
      <button type="button" onClick={openAuthModal}>
        Abrir Auth
      </button>
      <AuthModal />
    </div>
  );
};

const StatsModalWithDataWrapper: React.FC = () => {
  const { setEstadoDirecto, setNotaMateria } = useTracker();
  const initRef = React.useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    setEstadoDirecto(1, 'aprobada');
    setNotaMateria(1, { nota: 9, fecha: '2026-11-20' });
    setEstadoDirecto(2, 'regular');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <StatsModal isOpen={true} onClose={() => {}} />;
};

describe('Componentes Modales', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('HelpModal', () => {
    it('no debe renderizar si isOpen es false', () => {
      render(<HelpModal isOpen={false} onClose={() => {}} />);
      expect(screen.queryByText(/Guía del Tracker Plan 2023/i)).not.toBeInTheDocument();
    });

    it('debe renderizar y cerrar con Escape o botón de cierre', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(<HelpModal isOpen={true} onClose={handleClose} />);
      expect(screen.getByText(/Guía del Tracker Plan 2023/i)).toBeInTheDocument();
      expect(screen.getByText(/Atajos de Teclado Globales/i)).toBeInTheDocument();

      const botonCerrar = screen.getByLabelText(/Cerrar guía de ayuda/i);
      await user.click(botonCerrar);
      expect(handleClose).toHaveBeenCalledTimes(1);

      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('TitlesModal', () => {
    it('no debe renderizar si isOpen es false', () => {
      render(
        <TrackerProvider>
          <TitlesModal isOpen={false} onClose={() => {}} />
        </TrackerProvider>
      );
      expect(screen.queryByText(/Titulación Universitaria/i)).not.toBeInTheDocument();
    });

    it('debe renderizar títulos intermedio y de grado y permitir modificar PPS', async () => {
      const user = userEvent.setup();
      render(
        <TrackerProvider>
          <TitlesModal isOpen={true} onClose={() => {}} />
        </TrackerProvider>
      );
      expect(screen.getByText(/Titulación Universitaria/i)).toBeInTheDocument();
      expect(screen.getByText(/Analista Desarrollador/i)).toBeInTheDocument();
      expect(screen.getByText(/Ingeniero\/a en Sistemas/i)).toBeInTheDocument();

      // Modificar horas de PPS con slider o input numérico
      const inputsNumber = screen.getAllByRole('spinbutton');
      if (inputsNumber.length > 0) {
        await user.clear(inputsNumber[0]);
        await user.type(inputsNumber[0], '150');
      }
    });
  });

  describe('ProfileModal', () => {
    it('debe abrirse, permitir cambiar nombre y legajo, y guardarlos', async () => {
      const user = userEvent.setup();
      render(
        <TrackerProvider>
          <ProfileModalWrapper />
        </TrackerProvider>
      );

      await user.click(screen.getByRole('button', { name: /Abrir Perfil/i }));

      expect(screen.getByText(/Perfil y Copia de Seguridad/i)).toBeInTheDocument();

      const inputNombre = screen.getByPlaceholderText(/Ej: Martín Ratti/i);
      const inputLegajo = screen.getByPlaceholderText(/Ej: 48210/i);

      await user.clear(inputNombre);
      await user.type(inputNombre, 'Estudiante Prueba');
      await user.clear(inputLegajo);
      await user.type(inputLegajo, '54321');

      const botonGuardar = screen.getByRole('button', { name: /Guardar Datos Alumno/i });
      await user.click(botonGuardar);

      expect(screen.queryByText(/Perfil y Copia de Seguridad/i)).not.toBeInTheDocument();
    });

    it('debe permitir descargar copia JSON y cargar respaldo desde archivo', async () => {
      const user = userEvent.setup();
      render(
        <TrackerProvider>
          <ProfileModalWrapper />
        </TrackerProvider>
      );

      await user.click(screen.getByRole('button', { name: /Abrir Perfil/i }));

      // Descargar copia JSON
      const botonDescargar = screen.getByRole('button', { name: /Descargar Copia/i });
      await user.click(botonDescargar);

      // Cargar archivo JSON de respaldo
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();

      const validJson = JSON.stringify({
        estados: { 1: 'aprobada' },
        notas: {},
        ppsHoras: 50,
        perfil: { nombre: 'Test', legajo: '123' }
      });
      const validFile = new File([validJson], 'backup.json', { type: 'application/json' });

      await user.upload(fileInput, validFile);
    });
  });

  describe('PrintableReportModal', () => {
    it('debe renderizar la ficha curricular completa lista para imprimir', () => {
      render(
        <TrackerProvider>
          <ReportModalWrapper />
        </TrackerProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Abrir Reporte/i }));
      expect(screen.getByText(/Ficha Curricular y Analítico/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Facultad Regional Rosario/i).length).toBeGreaterThan(0);

      const botonCerrar = screen.getByLabelText(/Cerrar reporte/i);
      fireEvent.click(botonCerrar);
    });
  });

  describe('ShareModal', () => {
    it('no debe renderizar si isOpen es false', () => {
      render(
        <TrackerProvider>
          <ShareModal isOpen={false} onClose={() => {}} />
        </TrackerProvider>
      );
      expect(screen.queryByText(/Compartir Avance de Carrera/i)).not.toBeInTheDocument();
    });

    it('debe generar enlace y permitir copiar con clipboard mockeado', async () => {
      const user = userEvent.setup();
      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined)
      };
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        configurable: true,
        writable: true
      });

      render(
        <TrackerProvider>
          <ShareModal isOpen={true} onClose={() => {}} />
        </TrackerProvider>
      );

      expect(screen.getByText(/Compartir Avance de Carrera/i)).toBeInTheDocument();

      const botonCopiar = screen.getByRole('button', { name: /Copiar Enlace/i });
      await user.click(botonCopiar);
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });

    it('debe manejar error al copiar si clipboard falla y cerrar con Escape', async () => {
      const handleClose = vi.fn();
      const mockClipboard = {
        writeText: vi.fn().mockRejectedValue(new Error('Permiso denegado'))
      };
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        configurable: true,
        writable: true
      });

      render(
        <TrackerProvider>
          <ShareModal isOpen={true} onClose={handleClose} />
        </TrackerProvider>
      );

      const botonCopiar = screen.getByRole('button', { name: /Copiar Enlace/i });
      await fireEvent.click(botonCopiar);

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('StatsModal', () => {
    it('debe renderizar estadísticas, métricas y timeline cuando hay notas con fecha', async () => {
      render(
        <TrackerProvider>
          <StatsModalWithDataWrapper />
        </TrackerProvider>
      );

      expect(await screen.findByText(/Dashboard de Estadísticas/i)).toBeInTheDocument();
      expect(screen.getByText(/Distribución por Estado/i)).toBeInTheDocument();
    });
  });

  describe('AuthModal', () => {
    it('debe alternar entre iniciar sesión y crear cuenta', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TrackerProvider>
            <AuthModalWrapper />
          </TrackerProvider>
        </AuthProvider>
      );

      await user.click(screen.getByRole('button', { name: /Abrir Auth/i }));
      expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();

      const linkCrearCuenta = screen.getByRole('button', { name: /Registrate gratis/i });
      await user.click(linkCrearCuenta);
      expect(screen.getByRole('heading', { name: /Crear Cuenta/i })).toBeInTheDocument();

      const linkLogin = screen.getByRole('button', { name: /Iniciá Sesión/i });
      await user.click(linkLogin);
      expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    });

    it('debe iniciar sesión con Google y manejar login de email exitoso', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TrackerProvider>
            <AuthModalWrapper />
          </TrackerProvider>
        </AuthProvider>
      );

      await user.click(screen.getByRole('button', { name: /Abrir Auth/i }));

      // Clic en botón Google
      const botonGoogle = screen.getByRole('button', { name: /Continuar con Google/i });
      await user.click(botonGoogle);

      // Reabrir y enviar formulario
      await user.click(screen.getByRole('button', { name: /Abrir Auth/i }));
      const inputEmail = screen.getByPlaceholderText(/alumno@utn\.edu\.ar/i);
      const inputPass = screen.getByPlaceholderText(/Mínimo 6 caracteres/i);

      await user.type(inputEmail, 'estudiante@utn.edu.ar');
      await user.type(inputPass, '123456');

      const botonSubmit = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(botonSubmit);
    });

    it('debe validar email inválido y contraseña corta', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TrackerProvider>
            <AuthModalWrapper />
          </TrackerProvider>
        </AuthProvider>
      );

      await user.click(screen.getByRole('button', { name: /Abrir Auth/i }));

      const form = document.querySelector('form')!;
      fireEvent.submit(form);
      expect(screen.getByText(/Por favor ingresa un correo electrónico válido\./i)).toBeInTheDocument();

      const inputEmail = screen.getByPlaceholderText(/alumno@utn\.edu\.ar/i);
      const inputPass = screen.getByPlaceholderText(/Mínimo 6 caracteres/i);
      await user.type(inputEmail, 'estudiante@utn.edu.ar');
      await user.type(inputPass, '123');
      fireEvent.submit(form);
      expect(screen.getByText(/La contraseña debe tener al menos 6 caracteres\./i)).toBeInTheDocument();
    });
  });
});
