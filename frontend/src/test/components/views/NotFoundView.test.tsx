import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { NotFoundView } from '../../../components/views/NotFoundView';

describe('NotFoundView Component (Página 404)', () => {
  it('debe renderizar la pantalla de error 404 con información de ruta no encontrada', () => {
    const handleHome = vi.fn();
    render(<NotFoundView onNavigateHome={handleHome} />);

    expect(screen.getByText(/Error 404 · Ruta No Encontrada/i)).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/Materia o ruta fuera del plan de estudios/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Volver al Tracker Principal/i })).toBeInTheDocument();
  });

  it('debe responder a las acciones de navegación (malla, grafo, home y calendario)', async () => {
    const user = userEvent.setup();
    const handleHome = vi.fn();
    const handleMalla = vi.fn();
    const handleGrafo = vi.fn();
    const handleCalendar = vi.fn();

    render(
      <NotFoundView 
        onNavigateHome={handleHome}
        onNavigateMalla={handleMalla}
        onNavigateGrafo={handleGrafo}
        onOpenCalendar={handleCalendar}
      />
    );

    const btnMalla = screen.getByRole('button', { name: /Ver Malla Curricular/i });
    await user.click(btnMalla);
    expect(handleMalla).toHaveBeenCalledTimes(1);

    const btnGrafo = screen.getByRole('button', { name: /Explorar Grafo/i });
    await user.click(btnGrafo);
    expect(handleGrafo).toHaveBeenCalledTimes(1);

    const btnCalendar = screen.getByRole('button', { name: /Consultar Calendario de Exámenes/i });
    await user.click(btnCalendar);
    expect(handleCalendar).toHaveBeenCalledTimes(1);

    const btnHome = screen.getByRole('button', { name: /Volver al Tracker Principal/i });
    await user.click(btnHome);
    expect(handleHome).toHaveBeenCalledTimes(1);
  });
});
