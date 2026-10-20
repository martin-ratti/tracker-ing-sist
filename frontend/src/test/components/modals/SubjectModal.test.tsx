import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TrackerProvider, useTracker } from '../../../context/TrackerContext';
import { SubjectModal } from '../../../components/modals/SubjectModal';

const SubjectModalTester: React.FC<{ initialSubjectId?: number }> = ({ initialSubjectId = 1 }) => {
  const { setSelectedSubjectId, estados } = useTracker();

  return (
    <div>
      <button type="button" onClick={() => setSelectedSubjectId(initialSubjectId)}>
        Seleccionar Materia {initialSubjectId}
      </button>
      <button type="button" onClick={() => setSelectedSubjectId(18)}>
        Seleccionar Economía
      </button>
      <button type="button" onClick={() => setSelectedSubjectId(9)}>
        Seleccionar AM II
      </button>
      <button type="button" onClick={() => setSelectedSubjectId(null)}>
        Deseleccionar
      </button>
      <SubjectModal />
      <div data-testid="current-estado-1">{estados[1] || 'pendiente'}</div>
      <div data-testid="current-estado-9">{estados[9] || 'pendiente'}</div>
      <div data-testid="current-estado-18">{estados[18] || 'pendiente'}</div>
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

  it('debe mostrar la información completa de la materia y alternar estados (regular, aprobada, pendiente)', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <SubjectModalTester initialSubjectId={1} />
      </TrackerProvider>
    );

    await user.click(screen.getByRole('button', { name: /Seleccionar Materia 1/i }));

    expect(screen.getByText('Análisis Matemático I')).toBeInTheDocument();
    expect(screen.getByText(/1º Nivel/i)).toBeInTheDocument();

    // 1. Regular
    const botonRegular = screen.getByRole('button', { name: /Regular/i });
    await user.click(botonRegular);
    expect(screen.getByTestId('current-estado-1').textContent).toBe('regular');

    // 2. Aprobada
    const botonAprobada = screen.getByRole('button', { name: /Aprobada/i });
    await user.click(botonAprobada);
    expect(screen.getByTestId('current-estado-1').textContent).toBe('aprobada');

    // 3. Pendiente
    const botonPendiente = screen.getByRole('button', { name: /Pendiente/i });
    await user.click(botonPendiente);
    expect(screen.getByTestId('current-estado-1').textContent).toBe('pendiente');
  });

  it('debe permitir guardar calificación cuando la materia está aprobada y no mostrarla en otros estados', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <SubjectModalTester initialSubjectId={1} />
      </TrackerProvider>
    );

    await user.click(screen.getByRole('button', { name: /Seleccionar Materia 1/i }));

    // En estado pendiente no debe mostrar sección de calificación
    expect(screen.queryByText(/Calificación de la Materia/i)).not.toBeInTheDocument();

    // Cambiar a regular: tampoco debe mostrarla
    await user.click(screen.getByRole('button', { name: /Regular/i }));
    expect(screen.queryByText(/Calificación de la Materia/i)).not.toBeInTheDocument();

    // Cambiar a aprobada: debe aparecer la sección de calificación
    await user.click(screen.getByRole('button', { name: /Aprobada/i }));
    expect(screen.getByText(/Calificación de la Materia/i)).toBeInTheDocument();

    // Input Nota
    const inputNota = screen.getByPlaceholderText(/Ej: 8/i);
    await user.clear(inputNota);
    await user.type(inputNota, '8.5');

    // Submit del formulario de nota (botón "Guardar Nota")
    const botonGuardar = screen.getByRole('button', { name: /Guardar Nota/i });
    await user.click(botonGuardar);

    expect(screen.getByText(/Nota: 8.5/i)).toBeInTheDocument();
  });

  it('debe permitir programar y gestionar metas de examen cuando la materia está regular', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <SubjectModalTester initialSubjectId={1} />
      </TrackerProvider>
    );

    await user.click(screen.getByRole('button', { name: /Seleccionar Materia 1/i }));
    await user.click(screen.getByRole('button', { name: /Regular/i }));

    // Botón programar mesa
    const botonProgramar = screen.getByRole('button', { name: /Programar mesa tentativa de final/i });
    await user.click(botonProgramar);

    // Cambiar turno en el select
    const turnoSelect = screen.getByLabelText(/Seleccionar Turno Oficial/i);
    const options = (turnoSelect as HTMLSelectElement).options;
    if (options.length > 1) {
      fireEvent.change(turnoSelect, { target: { value: options[1].value } });
    }

    // Ingresar comentario de meta
    const inputMetaComent = screen.getByPlaceholderText(/Repasar unidades/i);
    await user.type(inputMetaComent, 'Repasar integrales dobles');

    // Guardar meta
    const botonGuardarMeta = screen.getByRole('button', { name: /Guardar Meta/i });
    await user.click(botonGuardarMeta);

    expect(screen.getByText(/"Repasar integrales dobles"/i)).toBeInTheDocument();

    // Cambiar meta y cancelar
    const botonCambiar = screen.getByRole('button', { name: /Cambiar/i });
    await user.click(botonCambiar);
    const botonCancelar = screen.getByRole('button', { name: /Cancelar/i });
    await user.click(botonCancelar);

    // Remover meta
    const botonEliminarMeta = screen.getByTitle(/Quitar meta de examen/i);
    await user.click(botonEliminarMeta);

    expect(screen.getByRole('button', { name: /Programar mesa tentativa de final/i })).toBeInTheDocument();
  });

  it('debe mostrar correlativas requeridas y materias que ayuda a destrabar', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <SubjectModalTester initialSubjectId={9} />
      </TrackerProvider>
    );

    // Seleccionar AM II (id 9), que requiere AM I y Álgebra
    await user.click(screen.getByRole('button', { name: /Seleccionar AM II/i }));

    expect(screen.getByText('Análisis Matemático II')).toBeInTheDocument();
    expect(screen.getByText(/Para Cursar \(Regulares \/ Aprobadas\)/i)).toBeInTheDocument();
    expect(screen.getByText(/AM I \(Regular\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Álgebra \(Regular\)/i)).toBeInTheDocument();
    // Requisitos para rendir examen final
    expect(screen.getByText(/Para Rendir Examen Final/i)).toBeInTheDocument();
    expect(screen.getByText(/AM I \(Aprobada\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Álgebra \(Aprobada\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Materias que ayuda a destrabar:/i)).toBeInTheDocument();
    expect(screen.getByText(/Para Cursar \(Regularidad\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Para Rendir \(Aprobación\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Análisis Num\. \(3º Año\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulación \(4º Año\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Automatización \(4º Año\)/i)).toBeInTheDocument();
  });

  it('debe mostrar requisitos de aprobación para cursar cuando la materia los exige (Economía)', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <SubjectModalTester initialSubjectId={18} />
      </TrackerProvider>
    );

    await user.click(screen.getByRole('button', { name: /Seleccionar Economía/i }));

    expect(screen.getByText('Economía')).toBeInTheDocument();
    expect(screen.getAllByText(/AM I \(Aprobada\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Álgebra \(Aprobada\)/i).length).toBeGreaterThanOrEqual(1);
  });

  it('debe cerrar el modal al hacer click en el botón de cerrar o presionar Escape', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <SubjectModalTester initialSubjectId={1} />
      </TrackerProvider>
    );

    await user.click(screen.getByRole('button', { name: /Seleccionar Materia 1/i }));
    expect(screen.getByText('Análisis Matemático I')).toBeInTheDocument();

    const botonCerrar = screen.getByLabelText(/Cerrar detalles de la materia/i);
    await user.click(botonCerrar);

    await waitFor(() => {
      expect(screen.queryByText('Análisis Matemático I')).not.toBeInTheDocument();
    });

    // Reabrir y cerrar con Escape
    await user.click(screen.getByRole('button', { name: /Seleccionar Materia 1/i }));
    expect(screen.getByText('Análisis Matemático I')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByText('Análisis Matemático I')).not.toBeInTheDocument();
    });
  });
});
