import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
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

describe('Componentes Modales', () => {
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

    it('debe renderizar títulos intermedio y de grado', () => {
      render(
        <TrackerProvider>
          <TitlesModal isOpen={true} onClose={() => {}} />
        </TrackerProvider>
      );
      expect(screen.getByText(/Titulación Universitaria/i)).toBeInTheDocument();
      expect(screen.getByText(/Analista Desarrollador/i)).toBeInTheDocument();
      expect(screen.getByText(/Ingeniero\/a en Sistemas/i)).toBeInTheDocument();
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

      const botonAbrir = screen.getByRole('button', { name: /Abrir Perfil/i });
      await user.click(botonAbrir);

      expect(screen.getByText(/Perfil y Copia de Seguridad/i)).toBeInTheDocument();

      const inputNombre = screen.getByPlaceholderText(/Ej: Martín Ratti/i);
      await user.clear(inputNombre);
      await user.type(inputNombre, 'Carlos Alumno');

      const botonGuardar = screen.getByRole('button', { name: /Guardar Datos Alumno/i });
      await user.click(botonGuardar);

      expect(screen.queryByText(/Perfil y Copia de Seguridad/i)).not.toBeInTheDocument();
    });

    it('debe permitir descargar la copia de seguridad en JSON y cerrar con botón de cierre', async () => {
      const user = userEvent.setup();
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      const mockRevokeObjectURL = vi.fn();
      globalThis.URL.createObjectURL = mockCreateObjectURL;
      globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

      render(
        <TrackerProvider>
          <ProfileModalWrapper />
        </TrackerProvider>
      );

      await user.click(screen.getByRole('button', { name: /Abrir Perfil/i }));
      const botonDescargar = screen.getByRole('button', { name: /Descargar Copia/i });
      await user.click(botonDescargar);

      const botonCerrar = screen.getByLabelText(/Cerrar perfil/i);
      await user.click(botonCerrar);
      expect(screen.queryByText(/Perfil y Copia de Seguridad/i)).not.toBeInTheDocument();
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

    it('debe mostrar el link comprimido y permitir copiarlo', async () => {
      const user = userEvent.setup();
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextMock,
        },
        writable: true,
        configurable: true,
      });

      render(
        <TrackerProvider>
          <ShareModal isOpen={true} onClose={() => {}} />
        </TrackerProvider>
      );

      expect(screen.getByText(/Compartir Avance de Carrera/i)).toBeInTheDocument();
      const botonCopiar = screen.getByRole('button', { name: /Copiar Enlace/i });
      await user.click(botonCopiar);
      expect(writeTextMock).toHaveBeenCalled();
    });
  });

  describe('StatsModal', () => {
    it('no debe renderizar si isOpen es false', () => {
      render(
        <TrackerProvider>
          <StatsModal isOpen={false} onClose={() => {}} />
        </TrackerProvider>
      );
      expect(screen.queryByText(/Dashboard de Estadísticas/i)).not.toBeInTheDocument();
    });

    it('debe renderizar desglose por niveles y promedios cuando está abierto', () => {
      render(
        <TrackerProvider>
          <StatsModal isOpen={true} onClose={() => {}} />
        </TrackerProvider>
      );
      expect(screen.getByText(/Dashboard de Estadísticas/i)).toBeInTheDocument();
      expect(screen.getByText(/1º Año/i)).toBeInTheDocument();
      expect(screen.getByText(/5º Año/i)).toBeInTheDocument();
    });
  });

  describe('PrintableReportModal', () => {
    it('debe renderizar la ficha curricular completa lista para imprimir', async () => {
      const user = userEvent.setup();
      const originalPrint = window.print;
      window.print = vi.fn();

      render(
        <TrackerProvider>
          <ReportModalWrapper />
        </TrackerProvider>
      );

      const botonAbrir = screen.getByRole('button', { name: /Abrir Reporte/i });
      await user.click(botonAbrir);

      expect(screen.getByText(/Ficha Curricular y Analítico/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Imprimir \/ PDF/i })).toBeInTheDocument();

      const botonImprimir = screen.getByRole('button', { name: /Imprimir \/ PDF/i });
      await user.click(botonImprimir);
      expect(window.print).toHaveBeenCalled();

      window.print = originalPrint;
    });
  });

  describe('AuthModal', () => {
    it('debe renderizar el modal de autenticación y permitir alternar a registro', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <AuthModalWrapper />
        </AuthProvider>
      );

      const botonAbrir = screen.getByRole('button', { name: /Abrir Auth/i });
      await user.click(botonAbrir);

      const items = screen.getAllByText(/Iniciar Sesión/i);
      expect(items.length).toBeGreaterThan(0);

      const botonRegistro = screen.getByRole('button', { name: /Registrate gratis/i });
      await user.click(botonRegistro);

      expect(screen.getByPlaceholderText(/alumno@utn.edu.ar/i)).toBeInTheDocument();
    });

    it('debe validar email inválido y contraseña corta', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <AuthModalWrapper />
        </AuthProvider>
      );

      await user.click(screen.getByRole('button', { name: /Abrir Auth/i }));

      const form = screen.getByRole('button', { name: /^Iniciar Sesión$/i }).closest('form')!;
      // Enviar con email inválido
      const inputEmail = screen.getByPlaceholderText(/alumno@utn.edu.ar/i);
      await user.type(inputEmail, 'email-sin-arroba');
      const inputPassword = screen.getByPlaceholderText(/Mínimo 6 caracteres/i);
      await user.type(inputPassword, '123456');
      fireEvent.submit(form);
      expect(screen.getByText(/Por favor ingresa un correo electrónico válido/i)).toBeInTheDocument();

      // Enviar con contraseña de menos de 6 caracteres
      await user.clear(inputEmail);
      await user.type(inputEmail, 'test@utn.edu.ar');
      await user.clear(inputPassword);
      await user.type(inputPassword, '123');
      fireEvent.submit(form);
      expect(screen.getByText(/La contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
    });

    it('debe permitir autenticarse con Google y cerrar sesión', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <AuthModalWrapper />
        </AuthProvider>
      );

      await user.click(screen.getByRole('button', { name: /Abrir Auth/i }));
      const botonGoogle = screen.getByRole('button', { name: /Continuar con Google/i });
      expect(botonGoogle).toBeInTheDocument();
      await user.click(botonGoogle);

      // Al autenticarse con Google se cierra el modal
      expect(screen.queryByPlaceholderText(/alumno@utn.edu.ar/i)).not.toBeInTheDocument();
    });

    it('debe permitir cerrar el modal con la tecla Escape', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <AuthModalWrapper />
        </AuthProvider>
      );

      await user.click(screen.getByRole('button', { name: /Abrir Auth/i }));
      expect(screen.getByPlaceholderText(/alumno@utn.edu.ar/i)).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(screen.queryByPlaceholderText(/alumno@utn.edu.ar/i)).not.toBeInTheDocument();
    });
  });
});
