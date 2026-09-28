import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrackerProvider } from '../context/TrackerContext';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { Header } from '../components/layout/Header';

describe('Header Component', () => {
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

    const botonCalendario = screen.getByRole('button', { name: /Calendario/i });
    await user.click(botonCalendario);

    const botonCompartir = screen.getByRole('button', { name: /Compartir/i });
    await user.click(botonCompartir);
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

    // Botón perfil
    const botonPerfil = screen.getByRole('button', { name: /Perfil/i });
    await user.click(botonPerfil);

    // Botón electivas
    const botonElectivas = screen.getByRole('button', { name: /Electivas/i });
    await user.click(botonElectivas);

    // Toggle modo claro / oscuro
    const botonColor = screen.getByRole('button', { name: /Cambiar a Modo Claro|Cambiar a Modo Oscuro/i });
    await user.click(botonColor);
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

    // Cambiar a modo Grafo
    await user.click(screen.getByRole('button', { name: /Grafo Red/i }));

    // Clic en Para Cursar
    const botonesCursar = screen.getAllByRole('button', { name: /Para Cursar/i });
    await user.click(botonesCursar[0]);

    // Clic en Para Rendir
    const botonesRendir = screen.getAllByRole('button', { name: /Para Rendir/i });
    await user.click(botonesRendir[0]);

    // Clic en Todas
    const botonesTodas = screen.getAllByRole('button', { name: /Todas/i });
    await user.click(botonesTodas[0]);
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

    // Debe cambiar a ¿Confirmar?
    const botonConfirmar = screen.getByRole('button', { name: /¿Confirmar\?/i });
    expect(botonConfirmar).toBeInTheDocument();
    await user.click(botonConfirmar);
  });
});
