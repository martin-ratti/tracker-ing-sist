import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
      localStorage.setItem('utn-sistemas-tracker-2023', JSON.stringify({
        estados: { 1: 'regular', 2: 'regular' },
        estadosElectivas: {},
        notas: {},
        ppsHoras: 0,
        perfil: { nombre: '', legajo: '' },
        metasExamen: {
          1: {
            materiaId: 1,
            turnoId: 'feb-2026-l1',
            turnoNombre: 'Febrero 1° Llamado',
            fechaEstimada: '2026-02-16',
            llamado: 1,
            comentario: 'Estudiar teoremas de límites'
          }
        }
      }));
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

    localStorage.setItem('utn-sistemas-tracker-2023', JSON.stringify({
      estados: { 1: 'regular', 2: 'regular' },
      estadosElectivas: {},
      notas: {},
      ppsHoras: 0,
      perfil: { nombre: '', legajo: '' },
      metasExamen: {
        1: {
          materiaId: 1,
          turnoId: 'feb-2026-l1',
          turnoNombre: 'Febrero 1° Llamado',
          fechaEstimada: '2026-02-16',
          llamado: 1,
          comentario: 'Estudiar teoremas de límites'
        }
      }
    }));

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

    // Probar botón "Ver materia y correlativas"
    const botonVerMateria = screen.getByRole('button', { name: /Ver materia y correlativas/i });
    expect(botonVerMateria).toBeInTheDocument();

    // Quitar la meta
    const botonQuitar = screen.getByTitle(/Quitar meta/i);
    await user.click(botonQuitar);
    expect(screen.queryByText(/"Estudiar teoremas de límites"/i)).not.toBeInTheDocument();
  });

  it('debe mostrar la información de Sysacad y materias programadas en la pestaña Turnos', async () => {
    const user = userEvent.setup();
    localStorage.setItem('utn-sistemas-tracker-2023', JSON.stringify({
      estados: { 1: 'regular', 2: 'regular' },
      estadosElectivas: {},
      notas: {},
      ppsHoras: 0,
      perfil: { nombre: '', legajo: '' },
      metasExamen: {
        1: {
          materiaId: 1,
          turnoId: 'feb-2026-l1',
          turnoNombre: 'Febrero 1° Llamado',
          fechaEstimada: '2026-02-16',
          llamado: 1,
          comentario: 'Estudiar teoremas de límites'
        }
      }
    }));

    render(
      <TrackerProvider>
        <TestApp initialOpen={true} withMetas={true} />
      </TrackerProvider>
    );

    const tabTurnos = screen.getByRole('button', { name: /Turnos/i });
    await user.click(tabTurnos);
    expect(screen.getByText(/Regla Oficial de Cierre en Sysacad/i)).toBeInTheDocument();
    expect(await screen.findByText(/Planeas rendir:/i)).toBeInTheDocument();
  });

  it('debe abrir y operar el diálogo de meta desde una celda de examen en la vista mensual', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <TestApp initialOpen={true} withMetas={true} />
      </TrackerProvider>
    );

    // Buscar botón de Anotar en la celda interactiva
    const botonesAnotar = screen.queryAllByRole('button', { name: /^Anotar$/i });
    if (botonesAnotar.length > 0) {
      await user.click(botonesAnotar[0]);
      expect(await screen.findByText(/Anotar Meta de Examen/i)).toBeInTheDocument();

      // Completar notas u opciones
      const commentInput = screen.getByPlaceholderText(/Repasar finales anteriores/i);
      await user.type(commentInput, 'Notas del test');

      // Si hay select de materias regulares, cambiar selección
      const selectMateria = screen.queryByLabelText(/Materia Regular a Rendir:/i);
      if (selectMateria) {
        fireEvent.change(selectMateria, { target: { value: '2' } });
      }

      // Enviar formulario para confirmar meta
      const btnConfirmar = screen.getByRole('button', { name: /Confirmar Meta/i });
      await user.click(btnConfirmar);
      expect(screen.queryByText(/Anotar Meta de Examen/i)).not.toBeInTheDocument();
    }

    // Probar click en un hito o feriado si está presente
    const btnHito = screen.queryAllByRole('button').find(b => b.getAttribute('aria-label')?.startsWith('Ver:'));
    if (btnHito) {
      await user.click(btnHito);
      const closeHitoBtn = screen.queryByLabelText(/Cerrar detalle/i);
      if (closeHitoBtn) {
        await user.click(closeHitoBtn);
      }
    }
  });

  it('debe cerrar el modal al presionar la tecla Escape', async () => {
    render(
      <TrackerProvider>
        <TestApp initialOpen={true} />
      </TrackerProvider>
    );

    expect(screen.getByText(/Calendario Académico/i)).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByText(/Calendario Académico/i)).not.toBeInTheDocument();
    });
  });
});
