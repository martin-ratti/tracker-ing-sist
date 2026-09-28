import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useEffect } from 'react';
import { TrackerProvider, useTracker } from '../context/TrackerContext';
import { CalendarModal } from '../components/modals/CalendarModal';

const TestApp: React.FC<{ initialOpen?: boolean }> = ({ initialOpen = false }) => {
  const { calendarOpen, setCalendarOpen } = useTracker();

  useEffect(() => {
    if (initialOpen) {
      setCalendarOpen(true);
    }
  }, [initialOpen, setCalendarOpen]);

  return (
    <div>
      <button type="button" onClick={() => setCalendarOpen(true)}>
        Abrir Calendario
      </button>
      <CalendarModal />
      <span data-testid="status">{calendarOpen ? 'Abierto' : 'Cerrado'}</span>
    </div>
  );
};

describe('CalendarModal - Componente de Calendario Académico', () => {
  it('no debe renderizar el contenido del modal cuando calendarOpen es false', () => {
    render(
      <TrackerProvider>
        <TestApp initialOpen={false} />
      </TrackerProvider>
    );

    expect(screen.queryByText(/Calendario Académico/i)).not.toBeInTheDocument();
  });

  it('debe renderizar el modal al estar abierto con vista mensual y navegación', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <TestApp initialOpen={false} />
      </TrackerProvider>
    );

    // Abrimos el modal
    const botonAbrir = screen.getByRole('button', { name: /Abrir Calendario/i });
    await user.click(botonAbrir);

    // Debe mostrar el título del modal
    expect(screen.getByText(/Calendario Académico/i)).toBeInTheDocument();

    // Debe mostrar los encabezados de días de semana (LUN, MAR, etc.)
    expect(screen.getByText('LUN')).toBeInTheDocument();
    expect(screen.getByText('VIE')).toBeInTheDocument();

    // Debe permitir cambiar de mes con los botones de flecha
    const botonMesSiguiente = screen.getByTitle(/Mes siguiente/i);
    expect(botonMesSiguiente).toBeInTheDocument();
    await user.click(botonMesSiguiente);

    const botonMesAnterior = screen.getByTitle(/Mes anterior/i);
    expect(botonMesAnterior).toBeInTheDocument();
    await user.click(botonMesAnterior);

    // Debe permitir cambiar entre pestañas
    const tabMetas = screen.getByRole('button', { name: /Metas/i });
    await user.click(tabMetas);
    expect(screen.getByText(/No tienes finales programados aún/i)).toBeInTheDocument();

    const tabTurnos = screen.getByRole('button', { name: /Turnos/i });
    await user.click(tabTurnos);
    expect(screen.getByText(/Regla Oficial de Cierre en Sysacad/i)).toBeInTheDocument();

    // Volver a pestaña calendario
    const tabCalendario = screen.getByRole('button', { name: /Calendario Mensual Interactivo/i });
    await user.click(tabCalendario);

    // Debe permitir cerrar el modal
    const botonCerrar = screen.getByLabelText(/Cerrar calendario académico/i);
    await user.click(botonCerrar);

    expect(screen.getByTestId('status').textContent).toBe('Cerrado');
  });

  it('debe cerrar el modal al presionar la tecla Escape', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <TestApp initialOpen={true} />
      </TrackerProvider>
    );

    expect(screen.getByText(/Calendario Académico/i)).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.getByTestId('status').textContent).toBe('Cerrado');
  });
});
