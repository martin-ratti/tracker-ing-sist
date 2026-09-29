import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useEffect, useRef } from 'react';
import { TrackerProvider, useTracker } from '../../../context/TrackerContext';
import { CalendarModal } from '../../../components/modals/CalendarModal';

const TestApp: React.FC<{ initialOpen?: boolean; withMetas?: boolean }> = ({
  initialOpen = false,
  withMetas = false
}) => {
  const { setCalendarOpen, setEstadoDirecto, setMetaExamen } = useTracker();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (withMetas) {
      setEstadoDirecto(1, 'regular');
      setEstadoDirecto(2, 'regular');
      setMetaExamen(1, {
        materiaId: 1,
        turnoId: 'feb-2026-l1',
        turnoNombre: 'Febrero 1° Llamado',
        fechaEstimada: '2026-02-16',
        llamado: 1,
        comentario: 'Estudiar teoremas de límites'
      });
    }
    if (initialOpen) {
      setCalendarOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <button type="button" onClick={() => setCalendarOpen(true)}>
        Abrir Calendario
      </button>
      <CalendarModal />
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

  it('debe renderizar el modal al estar abierto con vista mensual y navegación entre meses', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <TestApp initialOpen={true} />
      </TrackerProvider>
    );

    expect(screen.getByText(/Calendario Académico/i)).toBeInTheDocument();

    // Navegar meses
    const botonMesSiguiente = screen.getByTitle(/Mes siguiente/i);
    await user.click(botonMesSiguiente);
    const botonMesAnterior = screen.getByTitle(/Mes anterior/i);
    await user.click(botonMesAnterior);

    // Botón Hoy
    const botonHoy = screen.getByRole('button', { name: /Hoy/i });
    await user.click(botonHoy);
  });

  it('debe mostrar las metas programadas en la pestaña Metas y permitir gestionarlas y exportar .ics', async () => {
    const user = userEvent.setup();
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:dummy');
    globalThis.URL.revokeObjectURL = vi.fn();

    render(
      <TrackerProvider>
        <TestApp initialOpen={true} withMetas={true} />
      </TrackerProvider>
    );

    // Ir a pestaña Metas
    const tabMetas = screen.getByRole('button', { name: /Metas/i });
    await user.click(tabMetas);

    // Debe mostrar la materia con su comentario
    expect(await screen.findByText(/Análisis Matemático I/i)).toBeInTheDocument();
    expect(screen.getByText(/"Estudiar teoremas de límites"/i)).toBeInTheDocument();

    // Probar exportar .ics
    const botonICS = screen.getByRole('button', { name: /Exportar \.ics/i });
    expect(botonICS).toBeInTheDocument();
    await user.click(botonICS);

    // Probar botón "Ver materia y correlativas" (cierra el calendario y abre la materia)
    const botonVerMateria = screen.getByRole('button', { name: /Ver materia y correlativas/i });
    await user.click(botonVerMateria);
  });

  it('debe mostrar la información de Sysacad en la pestaña Turnos', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <TestApp initialOpen={true} />
      </TrackerProvider>
    );

    const tabTurnos = screen.getByRole('button', { name: /Turnos/i });
    await user.click(tabTurnos);
    expect(screen.getByText(/Regla Oficial de Cierre en Sysacad/i)).toBeInTheDocument();
  });

  it('debe cerrar el modal al presionar la tecla Escape', () => {
    render(
      <TrackerProvider>
        <TestApp initialOpen={true} />
      </TrackerProvider>
    );

    expect(screen.getByText(/Calendario Académico/i)).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText(/Calendario Académico/i)).not.toBeInTheDocument();
  });
});
