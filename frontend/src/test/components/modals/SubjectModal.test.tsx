import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
      <button type="button" onClick={() => setSelectedSubjectId(9)}>
        Seleccionar AM II
      </button>
      <button type="button" onClick={() => setSelectedSubjectId(null)}>
        Deseleccionar
      </button>
      <SubjectModal />
      <div data-testid="current-estado-1">{estados[1] || 'pendiente'}</div>
      <div data-testid="current-estado-9">{estados[9] || 'pendiente'}</div>
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

  it('debe permitir guardar calificación completa (nota, fecha, libro, folio, comentario)', async () => {
    const user = userEvent.setup();
    render(
      <TrackerProvider>
        <SubjectModalTester initialSubjectId={1} />
      </TrackerProvider>
    );

    await user.click(screen.getByRole('button', { name: /Seleccionar Materia 1/i }));
    await user.click(screen.getByRole('button', { name: /Aprobada/i }));

    // Input Nota
    const inputNota = screen.getByPlaceholderText(/Ej: 8/i);
    await user.clear(inputNota);
    await user.type(inputNota, '8.5');

    // Input Fecha
    const inputFecha = document.querySelector('input[type="date"]') as HTMLInputElement | null;
    if (inputFecha) {
      fireEvent.change(inputFecha, { target: { value: '2026-12-18' } });
    }

    // Input Libro
    const inputLibro = screen.getByPlaceholderText(/Libro/i);
    await user.type(inputLibro, '12');

    // Input Folio
    const inputFolio = screen.getByPlaceholderText(/Folio/i);
    await user.type(inputFolio, '45');

    // Input Comentario
    const inputComentario = screen.getByPlaceholderText(/Ej: Aprobado con el Ing/i);
    await user.type(inputComentario, 'Aprobada con final oral muy completo');

    // Submit del formulario de notas (botón "Guardar Datos")
    const botonGuardar = screen.getByRole('button', { name: /Guardar Datos/i });
    await user.click(botonGuardar);

    expect(screen.getByText(/Calificación: 8.5/i)).toBeInTheDocument();
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
    expect(screen.getByText(/Materias que ayuda a destrabar:/i)).toBeInTheDocument();
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

    expect(screen.queryByText('Análisis Matemático I')).not.toBeInTheDocument();

    // Reabrir y cerrar con Escape
    await user.click(screen.getByRole('button', { name: /Seleccionar Materia 1/i }));
    expect(screen.getByText('Análisis Matemático I')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Análisis Matemático I')).not.toBeInTheDocument();
  });
});
