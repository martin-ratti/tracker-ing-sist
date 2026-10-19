import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { GraphSearchBar } from '../../../components/views/graph/GraphSearchBar';
import { GraphNodeInspector } from '../../../components/views/graph/GraphNodeInspector';

describe('Graph Floating Components (GraphSearchBar, GraphNodeInspector)', () => {
  describe('GraphSearchBar', () => {
    it('debe filtrar materias al escribir y llamar a onSelectSubject al seleccionar', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<GraphSearchBar onSelectSubject={onSelect} estados={{}} />);

      const input = screen.getByLabelText(/Buscar materia para enfocar en el grafo/i);
      await user.type(input, 'Algoritmos');

      // Debe sugerir Algoritmos
      const opcion = await screen.findByText(/Algoritmos y Estructuras de Datos/i);
      expect(opcion).toBeInTheDocument();

      await user.click(opcion);
      expect(onSelect).toHaveBeenCalledWith(6); // ID de Algoritmos es 6
    });

    it('debe encontrar materias sin tildes ni acentos (ej. "analisis" encuentra Análisis Matemático)', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<GraphSearchBar onSelectSubject={onSelect} estados={{}} />);

      const input = screen.getByLabelText(/Buscar materia para enfocar en el grafo/i);
      await user.type(input, 'analisis');

      // Debe sugerir materias que contienen Análisis Matemático
      const opciones = await screen.findAllByText(/Análisis Matemático/i);
      expect(opciones.length).toBeGreaterThanOrEqual(1);

      await user.click(opciones[0]);
      expect(onSelect).toHaveBeenCalled();
    });

    it('debe permitir navegar y seleccionar materias usando las flechas de teclado (ArrowDown, ArrowUp, Enter)', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<GraphSearchBar onSelectSubject={onSelect} estados={{}} />);

      const input = screen.getByLabelText(/Buscar materia para enfocar en el grafo/i);
      await user.type(input, 'analisis');

      // Presionar ArrowDown para pasar a la segunda opción y luego Enter
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalled();

      // Probar Escape para cerrar
      await user.type(input, 'fisica');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('GraphNodeInspector', () => {
    it('debe renderizar detalles de la materia enfocada y responder a cambio de estado', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onOpenDetails = vi.fn();
      const onSetEstado = vi.fn();

      render(
        <GraphNodeInspector
          focusedSubjectId={6} // Algoritmos
          estados={{ 6: 'regular' }}
          onClose={onClose}
          onOpenDetails={onOpenDetails}
          onSetEstadoDirecto={onSetEstado}
        />
      );

      expect(screen.getByText(/Algoritmos y Estructuras de Datos/i)).toBeInTheDocument();
      expect(screen.getByText(/1º Nivel/i)).toBeInTheDocument();

      // Botón para marcar aprobada
      const botonAprobada = screen.getByRole('button', { name: /Aprobada/i });
      await user.click(botonAprobada);
      expect(onSetEstado).toHaveBeenCalledWith(6, 'aprobada');

      // Botón abrir ficha
      const botonFicha = screen.getByRole('button', { name: /Abrir Ficha/i });
      await user.click(botonFicha);
      expect(onOpenDetails).toHaveBeenCalledWith(6);

      // Botón cerrar
      const botonCerrar = screen.getByLabelText(/Cerrar inspector/i);
      await user.click(botonCerrar);
      expect(onClose).toHaveBeenCalled();
    });

    it('no debe renderizar nada si focusedSubjectId es null', () => {
      const { container } = render(
        <GraphNodeInspector
          focusedSubjectId={null}
          estados={{}}
          onClose={vi.fn()}
          onOpenDetails={vi.fn()}
          onSetEstadoDirecto={vi.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Graph Positions Engine (graphPositions)', () => {
    it('debe generar coordenadas canónicas limpias en UD y LR para las 36 materias', async () => {
      const { getCanonicalGraphPositions, isValidPositions } = await import('../../../components/views/graph/graphPositions');
      
      const posUD = getCanonicalGraphPositions('UD');
      expect(Object.keys(posUD).length).toBe(36);
      expect(isValidPositions(posUD)).toBe(true);
      // Nivel 1 debe tener Y = 0 y Nivel 5 debe tener Y = 640
      expect(posUD[1].y).toBe(0);
      expect(posUD[36].y).toBe(640);

      const posLR = getCanonicalGraphPositions('LR');
      expect(Object.keys(posLR).length).toBe(36);
      expect(isValidPositions(posLR, 'LR')).toBe(true);
      // Nivel 1 debe tener X = 0 y Nivel 5 debe tener X = 1080
      expect(posLR[1].x).toBe(0);
      expect(posLR[36].x).toBe(1080);
    });

    it('debe rechazar posiciones corruptas o colapsadas en isValidPositions', async () => {
      const { isValidPositions } = await import('../../../components/views/graph/graphPositions');
      
      expect(isValidPositions(null)).toBe(false);
      expect(isValidPositions({})).toBe(false);

      // 36 nodos amontonados en una caja de 100x100
      const collapsed: Record<number, { x: number; y: number }> = {};
      for (let i = 1; i <= 36; i++) {
        collapsed[i] = { x: Math.random() * 50, y: Math.random() * 50 };
      }
      expect(isValidPositions(collapsed)).toBe(false);
    });
  });
});
