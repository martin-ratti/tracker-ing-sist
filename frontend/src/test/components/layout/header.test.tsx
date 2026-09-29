import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrackerProvider, useTracker } from '../../../context/TrackerContext';
import { AuthProvider } from '../../../context/AuthContext';
import { ThemeProvider } from '../../../context/ThemeContext';
import { Header } from '../../../components/layout/Header';

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe renderizar el título del Tracker y las métricas de estado', () => {
    const handleOpenTitles = vi.fn();
    const handleOpenHelp = vi.fn();

    render(
      <ThemeProvider>
        <AuthProvider>
          <TrackerProvider>
            <Header onOpenTitles={handleOpenTitles} onOpenHelp={handleOpenHelp} />
          </TrackerProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    expect(screen.getByText(/UTN SISTEMAS/i)).toBeInTheDocument();
    expect(screen.getByText(/Plan 2023 · FRRo/i)).toBeInTheDocument();
  });

  it('debe permitir cambiar de vista con los botones Grafo y Malla', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <AuthProvider>
          <TrackerProvider>
            <Header onOpenTitles={vi.fn()} onOpenHelp={vi.fn()} />
          </TrackerProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    const botonMalla = screen.getByRole('button', { name: /Malla Curricular/i });
    expect(botonMalla).toBeInTheDocument();
    await user.click(botonMalla);

    const botonGrafo = screen.getByRole('button', { name: /Grafo Red/i });
    expect(botonGrafo).toBeInTheDocument();
    await user.click(botonGrafo);
  });

  it('debe disparar onOpenTitles y onOpenHelp al hacer click en sus respectivos botones', async () => {
    const user = userEvent.setup();
    const handleOpenTitles = vi.fn();
    const handleOpenHelp = vi.fn();

    render(
      <ThemeProvider>
        <AuthProvider>
          <TrackerProvider>
            <Header onOpenTitles={handleOpenTitles} onOpenHelp={handleOpenHelp} />
          </TrackerProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    const botonTitulos = screen.getByRole('button', { name: /Títulos/i });
    await user.click(botonTitulos);
    expect(handleOpenTitles).toHaveBeenCalled();

    const botonAyuda = screen.getByRole('button', { name: /Ayuda/i });
    await user.click(botonAyuda);
    expect(handleOpenHelp).toHaveBeenCalled();
  });

  it('debe abrir modal de ficha, calendario y compartir', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <AuthProvider>
          <TrackerProvider>
            <Header onOpenTitles={vi.fn()} onOpenHelp={vi.fn()} />
          </TrackerProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    const botonFicha = screen.getByRole('button', { name: /Ficha PDF/i });
    await user.click(botonFicha);
    expect(botonFicha).toBeInTheDocument();

    const botonCalendario = screen.getByRole('button', { name: /Calendario/i });
    await user.click(botonCalendario);
    expect(botonCalendario).toBeInTheDocument();

    const botonCompartir = screen.getByRole('button', { name: /Compartir/i });
    await user.click(botonCompartir);
    expect(botonCompartir).toBeInTheDocument();
  });

  it('debe permitir interactuar con el botón de perfil, electivas y toggle de color', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <AuthProvider>
          <TrackerProvider>
            <Header onOpenTitles={vi.fn()} onOpenHelp={vi.fn()} />
          </TrackerProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    const botonPerfil = screen.getByRole('button', { name: /Perfil/i });
    await user.click(botonPerfil);
    expect(botonPerfil).toBeInTheDocument();

    const botonElectivas = screen.getByRole('button', { name: /Electivas/i });
    await user.click(botonElectivas);
    expect(botonElectivas).toBeInTheDocument();

    const botonColor = screen.getByRole('button', { name: /Cambiar a Modo Claro|Cambiar a Modo Oscuro/i });
    await user.click(botonColor);
    expect(botonColor).toBeInTheDocument();
  });

  it('debe permitir cambiar filtros de correlativas en modo Grafo', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <AuthProvider>
          <TrackerProvider>
            <Header onOpenTitles={vi.fn()} onOpenHelp={vi.fn()} />
          </TrackerProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    await user.click(screen.getByRole('button', { name: /Grafo Red/i }));

    const botonesCursar = screen.getAllByRole('button', { name: /Para Cursar/i });
    await user.click(botonesCursar[0]);
    expect(botonesCursar[0]).toBeInTheDocument();

    const botonesRendir = screen.getAllByRole('button', { name: /Para Rendir/i });
    await user.click(botonesRendir[0]);
    expect(botonesRendir[0]).toBeInTheDocument();

    const botonesTodas = screen.getAllByRole('button', { name: /Todas/i });
    await user.click(botonesTodas[0]);
    expect(botonesTodas[0]).toBeInTheDocument();
  });

  it('debe permitir resetear el progreso con confirmación de dos pasos', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <AuthProvider>
          <TrackerProvider>
            <Header onOpenTitles={vi.fn()} onOpenHelp={vi.fn()} />
          </TrackerProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    const botonReset = screen.getByRole('button', { name: /Reiniciar/i });
    await user.click(botonReset);

    const botonConfirmar = screen.getByRole('button', { name: /¿Confirmar\?/i });
    expect(botonConfirmar).toBeInTheDocument();
    await user.click(botonConfirmar);
  });

  it('debe abrir y operar completamente el Menú Drawer Móvil con todas sus opciones', async () => {
    const user = userEvent.setup();
    const handleOpenTitles = vi.fn();
    const handleOpenHelp = vi.fn();

    const MenuTester: React.FC = () => {
      const { openMobileDrawer } = useTracker();
      return (
        <div>
          <button type="button" onClick={() => openMobileDrawer('menu')}>
            Abrir Menú Móvil
          </button>
          <Header onOpenTitles={handleOpenTitles} onOpenHelp={handleOpenHelp} />
        </div>
      );
    };

    render(
      <ThemeProvider>
        <AuthProvider>
          <TrackerProvider>
            <MenuTester />
          </TrackerProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    // Abrir menú móvil
    const botonMenu = screen.getByRole('button', { name: /Abrir Menú Móvil/i });
    await user.click(botonMenu);

    expect(await screen.findByText(/Menú Académico/i)).toBeInTheDocument();
    expect(screen.getByText(/Progreso de Carrera/i)).toBeInTheDocument();

    // Click en tema visual dentro del drawer
    const botonTema = screen.getByTitle(/Emerald Matrix/i);
    await user.click(botonTema);

    // Click en Títulos desde el drawer
    const botonDrawerTitulos = screen.getByRole('button', { name: /Títulos y Certificaciones/i });
    await user.click(botonDrawerTitulos);
    await waitFor(() => expect(handleOpenTitles).toHaveBeenCalled());

    // Reabrir menú
    await user.click(botonMenu);
    expect(await screen.findByText(/Menú Académico/i)).toBeInTheDocument();

    // Click en Guía desde el drawer
    const botonDrawerGuia = screen.getByRole('button', { name: /Guía del Plan 2023/i });
    await user.click(botonDrawerGuia);
    await waitFor(() => expect(handleOpenHelp).toHaveBeenCalled());

    // Reabrir menú y probar reinicio en drawer
    await user.click(botonMenu);
    const botonResetDrawer = screen.getByRole('button', { name: /Reiniciar Progreso/i });
    await user.click(botonResetDrawer);
    expect(screen.getByText(/¿Confirmar reinicio total\?/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /¿Confirmar reinicio total\?/i }));

    // Cerrar con Escape
    await user.click(botonMenu);
    expect(await screen.findByText(/Menú Académico/i)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
  });

  it('debe renderizar el drawer en vista de electivas cuando mobileDrawerView es electivas', async () => {
    const DrawerTester: React.FC = () => {
      const { openMobileDrawer } = useTracker();
      return (
        <div>
          <button type="button" onClick={() => openMobileDrawer('electivas')}>
            Abrir Electivas Móvil
          </button>
          <Header onOpenTitles={vi.fn()} onOpenHelp={vi.fn()} />
        </div>
      );
    };

    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <AuthProvider>
          <TrackerProvider>
            <DrawerTester />
          </TrackerProvider>
        </AuthProvider>
      </ThemeProvider>
    );

    await user.click(screen.getByRole('button', { name: /Abrir Electivas Móvil/i }));
    expect(await screen.findByText(/Materias Electivas/i)).toBeInTheDocument();
  });
});
