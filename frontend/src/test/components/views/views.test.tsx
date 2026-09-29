import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TrackerProvider, useTracker } from '../../../context/TrackerContext';
import { GridView } from '../../../components/views/GridView';
import { ElectivasDrawer } from '../../../components/views/ElectivasDrawer';
import { MobileElectivasView } from '../../../components/views/MobileElectivasView';
import { GraphSkeleton } from '../../../components/views/GraphSkeleton';

const ElectivasWrapper: React.FC = () => {
  const { setElectivasOpen } = useTracker();
  return (
    <div>
      <button type="button" onClick={() => setElectivasOpen(true)}>
        Abrir Electivas
      </button>
      <ElectivasDrawer />
    </div>
  );
};

describe('Componentes de Vistas (GridView, ElectivasDrawer, GraphSkeleton)', () => {
  describe('GraphSkeleton', () => {
    it('debe renderizar la pantalla de carga del grafo', () => {
      render(<GraphSkeleton />);
      expect(screen.getByText(/Cargando Grafo Interactivo/i)).toBeInTheDocument();
      expect(screen.getByText(/Optimizando motor de visualización/i)).toBeInTheDocument();
    });
  });

  describe('GridView', () => {
    it('debe renderizar el título de la malla y las secciones de niveles', () => {
      render(
        <TrackerProvider>
          <GridView />
        </TrackerProvider>
      );

      expect(screen.getByText(/Malla Curricular Plan 2023/i)).toBeInTheDocument();
      expect(screen.getByText(/1º NIVEL/i)).toBeInTheDocument();
      expect(screen.getByText(/5º NIVEL/i)).toBeInTheDocument();
    });

    it('debe permitir buscar materias por nombre o código mediante el input de búsqueda y limpiar', async () => {
      const user = userEvent.setup();
      render(
        <TrackerProvider>
          <GridView />
        </TrackerProvider>
      );

      const input = screen.getByPlaceholderText(/Buscar materia o código/i);
      await user.type(input, 'Álgebra');
      expect(screen.getByText('Álgebra y Geometría Analítica')).toBeInTheDocument();

      // Limpiar búsqueda
      const botonLimpiar = screen.getByLabelText(/Limpiar búsqueda/i);
      await user.click(botonLimpiar);
      expect(input).toHaveValue('');
    });

    it('debe filtrar materias por estado y por nivel con los botones de filtro rápido', async () => {
      const user = userEvent.setup();
      render(
        <TrackerProvider>
          <GridView />
        </TrackerProvider>
      );

      // Filtros por estado
      const botonCursables = screen.getByRole('button', { name: /Cursables/i });
      await user.click(botonCursables);
      expect(screen.getByText('Análisis Matemático I')).toBeInTheDocument();

      const botonRegulares = screen.getByRole('button', { name: /Regulares/i });
      await user.click(botonRegulares);

      const botonAprobadas = screen.getByRole('button', { name: /Aprobadas/i });
      await user.click(botonAprobadas);

      const botonTodas = screen.getByRole('button', { name: /^Todas$/i });
      await user.click(botonTodas);

      // Filtros por nivel
      const botonNivel1 = screen.getByRole('button', { name: /1º Año/i });
      await user.click(botonNivel1);
      expect(screen.getByText('Análisis Matemático I')).toBeInTheDocument();

      const botonTodosNiveles = screen.getByRole('button', { name: /^Todos \(\d+\)$/i });
      await user.click(botonTodosNiveles);
    });

    it('GridView debe permitir interactuar con una materia y su botón de info', async () => {
      const user = userEvent.setup();
      render(
        <TrackerProvider>
          <GridView />
        </TrackerProvider>
      );

      const am1 = screen.getByText('Análisis Matemático I');
      expect(am1).toBeInTheDocument();
      await user.click(am1);

      const botonInfo = screen.getAllByRole('button', { name: /Ver detalles/i })[0];
      if (botonInfo) {
        await user.click(botonInfo);
      }
    });
  });

  describe('ElectivasDrawer y MobileElectivasView', () => {
    it('no debe renderizar el drawer si electivasOpen es false', () => {
      render(
        <TrackerProvider>
          <ElectivasDrawer />
        </TrackerProvider>
      );
      expect(screen.queryByText(/Materias Electivas/i)).not.toBeInTheDocument();
    });

    it('debe abrir el drawer al invocar setElectivasOpen y permitir filtrar por nivel', async () => {
      const user = userEvent.setup();
      render(
        <TrackerProvider>
          <ElectivasWrapper />
        </TrackerProvider>
      );

      const boton = screen.getByRole('button', { name: /Abrir Electivas/i });
      await user.click(boton);

      expect(screen.getByText(/Materias Electivas/i)).toBeInTheDocument();

      // Filtrar por 2º Año
      const botonNivel2 = screen.getByRole('button', { name: /2º Año/i });
      await user.click(botonNivel2);
      expect(screen.getByText(/Entornos Gráficos/i)).toBeInTheDocument();

      // Clic en la tarjeta de la electiva
      await user.click(screen.getByText(/Entornos Gráficos/i));

      // Cerrar drawer
      const botonCerrar = screen.getByLabelText(/Cerrar panel de electivas/i);
      await user.click(botonCerrar);
    });

    it('MobileElectivasView debe renderizar correctamente y responder a onBack y onClose', async () => {
      const user = userEvent.setup();
      const handleBack = vi.fn();
      const handleClose = vi.fn();

      render(
        <TrackerProvider>
          <MobileElectivasView onBack={handleBack} onClose={handleClose} />
        </TrackerProvider>
      );

      expect(screen.getByText(/Materias Electivas/i)).toBeInTheDocument();

      const botonMenu = screen.getByRole('button', { name: /Menú/i });
      await user.click(botonMenu);
      expect(handleBack).toHaveBeenCalledTimes(1);

      const botonCerrar = screen.getByLabelText(/Cerrar panel/i);
      await user.click(botonCerrar);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
