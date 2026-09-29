import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { encodeProgress } from '../utils/share';

vi.mock('../components/views/NetworkGraph', () => ({
  NetworkGraph: () => <div data-testid="mock-network-graph">Mock Grafo de Red</div>,
}));

describe('App Root Component', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('debe montar la aplicación completa con todos sus providers y vista principal', async () => {
    render(<App />);

    expect(screen.getByText(/UTN SISTEMAS/i)).toBeInTheDocument();
    const grafo = await screen.findByTestId('mock-network-graph');
    expect(grafo).toBeInTheDocument();
  });

  it('debe responder a todos los atajos de teclado globales (m, g, c, r, p, s, ?, e)', async () => {
    render(<App />);

    // 'm': Cambiar a malla
    fireEvent.keyDown(document, { key: 'm' });
    expect(await screen.findByPlaceholderText(/Buscar materia o código/i)).toBeInTheDocument();

    // 'g': Cambiar a grafo
    fireEvent.keyDown(document, { key: 'g' });
    expect(await screen.findByTestId('mock-network-graph')).toBeInTheDocument();

    // 'c': Abrir calendario
    fireEvent.keyDown(document, { key: 'c' });
    expect(await screen.findByText(/Calendario Académico/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Cerrar calendario académico/i));
    (document.activeElement as HTMLElement)?.blur();

    // 'p': Abrir perfil
    fireEvent.keyDown(document, { key: 'p' });
    expect(await screen.findByText(/Perfil y Copia de Seguridad/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Cerrar perfil/i));
    (document.activeElement as HTMLElement)?.blur();

    // 's': Abrir compartir
    fireEvent.keyDown(document, { key: 's' });
    expect(await screen.findByText(/Compartir Avance de Carrera/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/^Cerrar$/i));
    (document.activeElement as HTMLElement)?.blur();

    // '?': Abrir ayuda
    fireEvent.keyDown(document, { key: '?' });
    expect(await screen.findByText(/Guía del Tracker Plan 2023/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Cerrar guía de ayuda/i));
    (document.activeElement as HTMLElement)?.blur();

    // 'r': Abrir reporte imprimible
    fireEvent.keyDown(document, { key: 'r' });
    expect(await screen.findByText(/Ficha Curricular y Analítico/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Cerrar reporte/i));
    (document.activeElement as HTMLElement)?.blur();

    // 'e': Alternar drawer de electivas
    fireEvent.keyDown(document, { key: 'e' });
    expect(await screen.findByText(/Materias Electivas/i)).toBeInTheDocument();
  });

  it('debe mostrar el banner de modo compartido si la URL tiene hash de compartido y permitir importar o salir', async () => {
    const user = userEvent.setup();
    const encoded = encodeProgress({
      estados: { 1: 'aprobada', 2: 'regular' },
      estadosElectivas: {},
      perfil: { nombre: 'Carlos Alumno', legajo: '998877' },
      ppsHoras: 0
    });
    window.location.hash = `#share=${encoded}`;

    render(<App />);
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    // Debe mostrar banner de compartido
    const bannerText = await screen.findByText(/Estás visualizando el progreso compartido/i);
    expect(bannerText).toBeInTheDocument();
    expect(screen.getAllByText('Carlos Alumno').length).toBeGreaterThan(0);

    // Botón Volver a mi progreso
    const botonSalir = screen.getByRole('button', { name: /Volver a mi progreso/i });
    await user.click(botonSalir);

    expect(window.location.hash).toBe('');
    expect(screen.queryByText(/Estás visualizando el progreso compartido/i)).not.toBeInTheDocument();
  });

  it('debe interactuar con BottomNav para abrir drawer móvil de menú y de electivas', async () => {
    const user = userEvent.setup();
    render(<App />);

    const bottomNav = screen.getByRole('navigation', { name: /Navegación principal móvil/i });

    // Clic en botón "Más" de BottomNav
    const botonMenu = within(bottomNav).getByRole('button', { name: /Más/i });
    await user.click(botonMenu);

    expect(await screen.findByText(/Menú Académico/i)).toBeInTheDocument();

    // Cerrar menú con botón X
    const botonCerrar = screen.getByRole('button', { name: /Cerrar menú/i });
    await user.click(botonCerrar);

    // Clic en electivas de BottomNav
    const botonElectivas = within(bottomNav).getByRole('button', { name: /Electivas/i });
    await user.click(botonElectivas);
    expect(await screen.findByText(/Materias Electivas/i)).toBeInTheDocument();
  });
});
