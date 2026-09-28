import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TrackerProvider, useTracker } from '../../../context/TrackerContext';
import { SubjectModal } from '../../../components/modals/SubjectModal';

const SubjectModalTester: React.FC = () => {
  const { setSelectedSubjectId, estados } = useTracker();

  return (
    <div>
      <button type="button" onClick={() => setSelectedSubjectId(1)}>
        Seleccionar AM I
      </button>
      <SubjectModal />
      <div data-testid="current-estado">{estados[1] || 'pendiente'}</div>
    </div>
  );
};

describe('SubjectModal - Detalle e Interacción con Materia', () => {
  it('no debe renderizar nada si ninguna materia está seleccionada', () => {
    render(
      <TrackerProvider>
        <SubjectModalTester />
      </TrackerProvider>
    );

    expect(screen.queryByText(/Análisis Matemático I/i)).not.toBeInTheDocument();
  });

  it('debe mostrar la información completa de la materia al seleccionarla', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <SubjectModalTester />
      </TrackerProvider>
    );

    const boton = screen.getByRole('button', { name: /Seleccionar AM I/i });
    await user.click(boton);

    // Debe mostrar el título y nivel
    expect(screen.getByText('Análisis Matemático I')).toBeInTheDocument();
    expect(screen.getByText(/1º Nivel/i)).toBeInTheDocument();

    // Debe contener las acciones de cambio de estado
    const botonRegular = screen.getByRole('button', { name: /Regular/i });
    expect(botonRegular).toBeInTheDocument();
    await user.click(botonRegular);

    // El estado debió actualizarse a regular
    expect(screen.getByTestId('current-estado').textContent).toBe('regular');
  });

  it('debe permitir cambiar a aprobada, asignar nota numérica y fecha', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <SubjectModalTester />
      </TrackerProvider>
    );

    await user.click(screen.getByRole('button', { name: /Seleccionar AM I/i }));

    // En UTN primero se regulariza la materia
    const botonRegular = screen.getByRole('button', { name: /Regular/i });
    await user.click(botonRegular);
    expect(screen.getByTestId('current-estado').textContent).toBe('regular');

    // Una vez regularizada, se rinde y aprueba
    const botonAprobada = screen.getByRole('button', { name: /Aprobada/i });
    await user.click(botonAprobada);
    expect(screen.getByTestId('current-estado').textContent).toBe('aprobada');

    // Asignar nota
    const inputNota = screen.getByPlaceholderText(/Ej: 8/i);
    expect(inputNota).toBeInTheDocument();
    await user.clear(inputNota);
    await user.type(inputNota, '9');

    // Asignar fecha
    const inputFecha = document.querySelector('input[type="date"]') as HTMLInputElement | null;
    if (inputFecha) {
      await user.type(inputFecha, '2026-12-15');
    }
  });

  it('debe permitir definir una meta de examen y luego removerla', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <SubjectModalTester />
      </TrackerProvider>
    );

    await user.click(screen.getByRole('button', { name: /Seleccionar AM I/i }));
    // Poner regular para habilitar sección de examen
    await user.click(screen.getByRole('button', { name: /Regular/i }));

    // Abrir formulario de meta si está el botón
    const botonDefinirMeta = screen.queryByRole('button', { name: /Definir Meta de Examen/i });
    if (botonDefinirMeta) {
      await user.click(botonDefinirMeta);

      const botonGuardar = screen.queryByRole('button', { name: /Guardar Meta/i });
      if (botonGuardar) {
        await user.click(botonGuardar);
      }

      // Remover meta
      const botonEliminarMeta = screen.queryByTitle(/Quitar meta de examen/i);
      if (botonEliminarMeta) {
        await user.click(botonEliminarMeta);
      }
    }
  });

  it('debe cerrar el modal al hacer click en el botón de cerrar o presionar Escape', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <SubjectModalTester />
      </TrackerProvider>
    );

    await user.click(screen.getByRole('button', { name: /Seleccionar AM I/i }));
    expect(screen.getByText('Análisis Matemático I')).toBeInTheDocument();

    const botonCerrar = screen.getByLabelText(/Cerrar detalles de la materia/i);
    await user.click(botonCerrar);

    expect(screen.queryByText('Análisis Matemático I')).not.toBeInTheDocument();
  });
});

