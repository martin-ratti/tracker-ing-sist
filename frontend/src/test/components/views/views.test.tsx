import { describe, it, expect } from 'vitest';
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

    it('debe permitir buscar materias por nombre o código mediante el input de búsqueda', async () => {
      const user = userEvent.setup();
      render(
        <TrackerProvider>
          <GridView />
        </TrackerProvider>
      );

      const input = screen.getByPlaceholderText(/Buscar materia o código/i);
      await user.type(input, 'Álgebra');

      expect(screen.getByText('Álgebra y Geometría Analítica')).toBeInTheDocument();
    });

    it('debe filtrar materias por estado con los botones de filtro rápido', async () => {
      const user = userEvent.setup();
      render(
        <TrackerProvider>
          <GridView />
        </TrackerProvider>
      );

      const botonCursables = screen.getByRole('button', { name: /Cursables/i });
      await user.click(botonCursables);

      // Verificamos que las materias de primer año estén presentes
      expect(screen.getByText('Análisis Matemático I')).toBeInTheDocument();
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

    it('debe abrir el drawer al invocar setElectivasOpen y listar electivas', async () => {
      const user = userEvent.setup();
      render(
        <TrackerProvider>
          <ElectivasWrapper />
        </TrackerProvider>
      );

      const boton = screen.getByRole('button', { name: /Abrir Electivas/i });
      await user.click(boton);

      expect(screen.getByText(/Materias Electivas/i)).toBeInTheDocument();
      expect(screen.getByText(/Entornos Gráficos/i)).toBeInTheDocument();
    });

    it('MobileElectivasView debe renderizar correctamente para vista móvil', () => {
      render(
        <TrackerProvider>
          <MobileElectivasView onBack={() => {}} />
        </TrackerProvider>
      );
      expect(screen.getByText(/Materias Electivas/i)).toBeInTheDocument();
    });

    it('debe permitir seleccionar y alternar electivas en ElectivasDrawer', async () => {
      const user = userEvent.setup();
      render(
        <TrackerProvider>
          <ElectivasWrapper />
        </TrackerProvider>
      );

      await user.click(screen.getByRole('button', { name: /Abrir Electivas/i }));
      const materiaElectiva = screen.getByText(/Entornos Gráficos/i);
      expect(materiaElectiva).toBeInTheDocument();
      await user.click(materiaElectiva);

      const botonCerrar = screen.getByLabelText(/Cerrar panel de electivas/i);
      if (botonCerrar) {
        await user.click(botonCerrar);
      }
    });

    it('GridView debe permitir interactuar con una materia', async () => {
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
});
