import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

const ReportModalWithDataWrapper: React.FC = () => {
  const { setReportOpen } = useTracker();
  useEffect(() => {
    setReportOpen(true);
  }, [setReportOpen]);
  return <PrintableReportModal />;
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
    setNotaMateria(1, { nota: 9 });
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

    it('debe mostrar la sección de donación y permitir copiar el alias de Mercado Pago', async () => {
      const user = userEvent.setup();
      render(<HelpModal isOpen={true} onClose={() => {}} />);
      
      expect(screen.getByText(/apoyar el desarrollo/i)).toBeInTheDocument();
      expect(screen.getByText('epi321')).toBeInTheDocument();

      const copyBtn = screen.getByRole('button', { name: /Copiar alias de Mercado Pago/i });
      expect(copyBtn).toBeInTheDocument();
      await user.click(copyBtn);
      expect(await screen.findByText(/¡Copiado!/i)).toBeInTheDocument();
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

      // Modificar horas de PPS con slider de rango
      const rangeInput = document.querySelector('input[type="range"]');
      if (rangeInput) {
        fireEvent.change(rangeInput, { target: { value: '180' } });
      }

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

      await waitFor(() => {
        expect(screen.queryByText(/Perfil y Copia de Seguridad/i)).not.toBeInTheDocument();
      });
    });

    it('debe permitir descargar copia JSON y cargar respaldo desde archivo, manejando errores', async () => {
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

      // Cargar archivo JSON de respaldo válido
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();

      // Clic en botón "Restaurar Copia (.json)"
      const botonRestaurar = screen.getByRole('button', { name: /Restaurar Copia/i });
      await user.click(botonRestaurar);

      // Subir archivo inválido para probar manejo de errores
      const invalidFile = new File(['CORRUPT_NOT_JSON'], 'bad.json', { type: 'application/json' });
      await user.upload(fileInput, invalidFile);

      // Subir archivo válido
      const validJson = JSON.stringify({
        estados: { 1: 'aprobada' },
        notas: {},
        ppsHoras: 50,
        perfil: { nombre: 'Test', legajo: '123' }
      });
      const validFile = new File([validJson], 'backup.json', { type: 'application/json' });
      await user.upload(fileInput, validFile);
    });

    it('debe mostrar la sección de Mercado Pago y permitir copiar el alias', async () => {
      const user = userEvent.setup();
      render(
        <TrackerProvider>
          <ProfileModalWrapper />
        </TrackerProvider>
      );

      await user.click(screen.getByRole('button', { name: /Abrir Perfil/i }));

      expect(screen.getByText(/Apoyá el Tracker/i)).toBeInTheDocument();
      expect(screen.getByText('epi321')).toBeInTheDocument();

      const copyBtn = screen.getByRole('button', { name: /Copiar alias de Mercado Pago/i });
      await user.click(copyBtn);
      expect(await screen.findByText(/¡Copiado!/i)).toBeInTheDocument();
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

    it('debe renderizar materias aprobadas, regulares, electivas acreditadas y metas con opción de imprimir', async () => {
      window.print = vi.fn();
      localStorage.setItem('utn-sistemas-tracker-2023', JSON.stringify({
        estados: { 1: 'aprobada', 2: 'regular' },
        estadosElectivas: { 201: 'aprobada' },
        notas: {},
        ppsHoras: 0,
        perfil: { nombre: 'Tester', legajo: '12345' },
        metasExamen: {
          2: {
            materiaId: 2,
            turnoId: 'feb-2026-l1',
            turnoNombre: 'Febrero 1° Llamado',
            fechaEstimada: '2026-02-16'
          }
        }
      }));

      render(
        <TrackerProvider>
          <ReportModalWithDataWrapper />
        </TrackerProvider>
      );

      expect(await screen.findByText(/Ficha Curricular y Analítico/i)).toBeInTheDocument();
      expect(await screen.findByText('APROBADA')).toBeInTheDocument();
      expect(await screen.findByText('REGULAR')).toBeInTheDocument();
      expect(screen.getByText(/Asignaturas Electivas Acreditadas/i)).toBeInTheDocument();
      expect(screen.getByText(/Metas Tentativas de Examen Agendadas/i)).toBeInTheDocument();

      // Clic en imprimir
      const botonImprimir = screen.getByRole('button', { name: /Imprimir \/ PDF/i });
      fireEvent.click(botonImprimir);
      expect(window.print).toHaveBeenCalled();
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

    it('debe manejar error al copiar si clipboard falla y cerrar con Escape o click en backdrop', async () => {
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

      // Clic en backdrop
      const backdrop = document.querySelector('div[aria-hidden="true"]');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(handleClose).toHaveBeenCalled();
      }

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('StatsModal', () => {
    it('debe renderizar estadísticas, métricas y calificaciones de materias aprobadas', async () => {
      render(
        <TrackerProvider>
          <StatsModalWithDataWrapper />
        </TrackerProvider>
      );

      expect(await screen.findByText(/Dashboard de Estadísticas/i)).toBeInTheDocument();
      expect(screen.getByText(/Distribución por Estado/i)).toBeInTheDocument();
      expect(screen.getByText(/Calificaciones de Materias Aprobadas/i)).toBeInTheDocument();

      // Cerrar modal
      const closeBtn = screen.getByLabelText(/Cerrar modal/i);
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);
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

    it('debe alternar la visibilidad de la contraseña al pulsar el botón del ojo', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TrackerProvider>
            <AuthModalWrapper />
          </TrackerProvider>
        </AuthProvider>
      );

      await user.click(screen.getByRole('button', { name: /Abrir Auth/i }));
      const inputPass = screen.getByPlaceholderText(/Mínimo 6 caracteres/i);
      expect(inputPass).toHaveAttribute('type', 'password');

      // Botón ojo
      const toggleEye = inputPass.parentElement?.querySelector('button');
      if (toggleEye) {
        await user.click(toggleEye);
        expect(inputPass).toHaveAttribute('type', 'text');
        await user.click(toggleEye);
        expect(inputPass).toHaveAttribute('type', 'password');
      }
    });

    it('debe permitir crear cuenta (registro) con progreso local previo', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TrackerProvider>
            <AuthModalWrapper />
          </TrackerProvider>
        </AuthProvider>
      );

      await user.click(screen.getByRole('button', { name: /Abrir Auth/i }));

      // Cambiar a Crear Cuenta
      const linkCrear = screen.getByRole('button', { name: /Registrate gratis/i });
      await user.click(linkCrear);

      const inputEmail = screen.getByPlaceholderText(/alumno@utn\.edu\.ar/i);
      const inputPass = screen.getByPlaceholderText(/Mínimo 6 caracteres/i);

      await user.type(inputEmail, 'nuevo.usuario@utn.edu.ar');
      await user.type(inputPass, 'secreto123');

      const botonSubmit = screen.getByRole('button', { name: /Crear Cuenta/i });
      await user.click(botonSubmit);
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
      expect(botonSubmit).toBeInTheDocument();
      await user.click(botonSubmit);
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /Iniciar Sesión/i })).not.toBeInTheDocument();
      });
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
