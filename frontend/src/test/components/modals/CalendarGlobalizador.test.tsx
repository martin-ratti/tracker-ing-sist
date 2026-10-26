import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { CalendarScheduleGlobalizadorDialog } from '../../../components/modals/calendar/CalendarScheduleGlobalizadorDialog';
import { CalendarDayDetailModal } from '../../../components/modals/calendar/CalendarDayDetailModal';
import { CalendarMetasTab } from '../../../components/modals/calendar/CalendarMetasTab';
import { MATERIAS_TRONCALES } from '../../../data/plan2023';
import type { MetaExamen, MetaGlobalizador } from '../../../types/plan';

describe('Funcionalidad de Globalizadores', () => {
  describe('CalendarScheduleGlobalizadorDialog', () => {
    it('debe permitir seleccionar una materia cursable, ingresar notas y confirmar', async () => {
      const user = userEvent.setup();
      const mockConfirm = vi.fn();
      const mockClose = vi.fn();
      const materiasDisponibles = MATERIAS_TRONCALES.slice(0, 3);

      render(
        <CalendarScheduleGlobalizadorDialog
          fechaStr="2026-06-18"
          onClose={mockClose}
          materiasCursables={materiasDisponibles}
          onConfirm={mockConfirm}
        />
      );

      expect(screen.getByText(/Anotar Meta de Globalizador/i)).toBeInTheDocument();
      expect(screen.getByText(/18\/06\/2026/i)).toBeInTheDocument();

      const inputComentario = screen.getByPlaceholderText(/Ej: Repasar unidades/i);
      await user.type(inputComentario, 'Estudiar para el 1er recuperatorio');

      const submitBtn = screen.getByRole('button', { name: /Guardar Meta/i });
      await user.click(submitBtn);

      expect(mockConfirm).toHaveBeenCalledWith(
        materiasDisponibles[0].id,
        '2026-06-18',
        'Estudiar para el 1er recuperatorio'
      );
      expect(mockClose).toHaveBeenCalled();
    });

    it('debe mostrar mensaje cuando no hay materias cursables disponibles', () => {
      render(
        <CalendarScheduleGlobalizadorDialog
          fechaStr="2026-06-18"
          onClose={vi.fn()}
          materiasCursables={[]}
          onConfirm={vi.fn()}
        />
      );

      expect(screen.getByText(/No tienes materias pendientes habilitadas para cursar/i)).toBeInTheDocument();
    });
  });

  describe('CalendarDayDetailModal', () => {
    it('debe mostrar los globalizadores agendados en el día y permitir pasarlo a Regular con ¡Aprobé!', async () => {
      const user = userEvent.setup();
      const mockAprobar = vi.fn();
      const mockRemove = vi.fn();
      const mockOpenGlob = vi.fn();

      const metasGlob: MetaGlobalizador[] = [
        {
          materiaId: 1, // Análisis Matemático I
          fecha: '2026-06-18',
          comentario: 'Unidades 1 a 4'
        }
      ];

      render(
        <CalendarDayDetailModal
          fechaStr="2026-06-18"
          onClose={vi.fn()}
          turno={null}
          hito={null}
          metasFinalEnEsteDia={[]}
          metasGlobalizadorEnEsteDia={metasGlob}
          onOpenAgendarFinal={vi.fn()}
          onOpenAgendarGlobalizador={mockOpenGlob}
          onRemoveMetaFinal={vi.fn()}
          onRemoveMetaGlobalizador={mockRemove}
          onAprobarGlobalizador={mockAprobar}
        />
      );

      expect(screen.getByText(/18\/06\/2026/i)).toBeInTheDocument();
      expect(screen.getByText(/Análisis Matemático I/i)).toBeInTheDocument();
      expect(screen.getByText(/"Unidades 1 a 4"/i)).toBeInTheDocument();

      // Botón "¡Aprobé! Pasar a Regular"
      const aprobarBtn = screen.getByRole('button', { name: /¡Aprobé! Pasar a Regular/i });
      await user.click(aprobarBtn);
      expect(mockAprobar).toHaveBeenCalledWith(1);

      // Botón "+ Agendar Globalizador"
      const agendarBtn = screen.getByRole('button', { name: /\+ Agendar Globalizador/i });
      await user.click(agendarBtn);
      expect(mockOpenGlob).toHaveBeenCalledWith('2026-06-18');
    });
  });

  describe('CalendarMetasTab', () => {
    it('debe filtrar entre Todas, Finales y Globalizadores y permitir acción ¡Aprobé!', async () => {
      const user = userEvent.setup();
      const mockAprobar = vi.fn();
      const mockRemoveGlob = vi.fn();

      const metasFinal: MetaExamen[] = [
        {
          materiaId: 2, // Álgebra
          turnoId: 'dic-2026-l1',
          turnoNombre: 'Turno Diciembre 1',
          fechaEstimada: '2026-12-10'
        }
      ];

      const metasGlob: MetaGlobalizador[] = [
        {
          materiaId: 1, // AM I
          fecha: '2026-06-18',
          comentario: 'Recuperatorio global'
        }
      ];

      render(
        <CalendarMetasTab
          metasArray={metasFinal}
          metasGlobalizadorArray={metasGlob}
          onRemoveMeta={vi.fn()}
          onRemoveMetaGlobalizador={mockRemoveGlob}
          onAprobarGlobalizador={mockAprobar}
          onExportICS={vi.fn()}
          onSelectSubject={vi.fn()}
          getDaysRemaining={() => ({ days: 10, text: 'Faltan 10 días', badgeColor: 'bg-cyan-500/20' })}
        />
      );

      // Vista inicial "Todas (2)"
      expect(screen.getByText(/Álgebra y Geometría Analítica/i)).toBeInTheDocument();
      expect(screen.getByText(/Análisis Matemático I/i)).toBeInTheDocument();

      // Filtrar solo Finales
      const filtroFinales = screen.getByRole('button', { name: /Finales \(1\)/i });
      await user.click(filtroFinales);
      expect(screen.getByText(/Álgebra y Geometría Analítica/i)).toBeInTheDocument();
      expect(screen.queryByText(/Análisis Matemático I/i)).not.toBeInTheDocument();

      // Filtrar solo Globalizadores
      const filtroGlobs = screen.getByRole('button', { name: /Globalizadores \(1\)/i });
      await user.click(filtroGlobs);
      expect(screen.queryByText(/Álgebra y Geometría Analítica/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Análisis Matemático I/i)).toBeInTheDocument();

      // Clic en ¡Aprobé! Pasar a Regular
      const botonAprobo = screen.getByRole('button', { name: /¡Aprobé! Pasar a Regular/i });
      await user.click(botonAprobo);
      expect(mockAprobar).toHaveBeenCalledWith(1);
    });
  });
});
