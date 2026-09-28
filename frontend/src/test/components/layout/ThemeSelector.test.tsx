import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../../context/ThemeContext';
import { ThemeSelector } from '../../../components/layout/ThemeSelector';

describe('ThemeSelector - Selector de Temas y Modo Claro/Oscuro', () => {
  it('debe renderizar el botón selector de tema cerrado por defecto', () => {
    render(
      <ThemeProvider>
        <ThemeSelector />
      </ThemeProvider>
    );

    const boton = screen.getByRole('button', { name: /Cambiar tema visual/i });
    expect(boton).toBeInTheDocument();
    expect(boton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('debe desplegar el menú al hacer click y permitir cambiar a Modo Claro', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeSelector />
      </ThemeProvider>
    );

    const boton = screen.getByRole('button', { name: /Cambiar tema visual/i });
    await user.click(boton);

    expect(boton).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();

    // Verificamos que contenga la opción de Claro
    const botonClaro = screen.getByRole('button', { name: /Claro/i });
    expect(botonClaro).toBeInTheDocument();
    await user.click(botonClaro);

    expect(document.documentElement.getAttribute('data-mode')).toBe('light');
  });

  it('debe permitir seleccionar otra paleta cromática (ej. Synthwave)', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeSelector />
      </ThemeProvider>
    );

    const boton = screen.getByRole('button', { name: /Cambiar tema visual/i });
    await user.click(boton);

    const opcionSynthwave = screen.getByText(/Neon Synthwave/i);
    await user.click(opcionSynthwave);

    expect(document.documentElement.getAttribute('data-theme')).toBe('synthwave');
  });
});
