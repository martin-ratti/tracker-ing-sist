import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';

describe('UI Primitives (StatusBadge y Modal)', () => {
  describe('StatusBadge', () => {
    it('debe renderizar el badge de Aprobada', () => {
      render(<StatusBadge estado="aprobada" />);
      expect(screen.getByText(/Aprobada/i)).toBeInTheDocument();
    });

    it('debe renderizar el badge de Regular', () => {
      render(<StatusBadge estado="regular" />);
      expect(screen.getByText(/Regular/i)).toBeInTheDocument();
    });

    it('debe renderizar el badge de Cursable cuando estado es pendiente pero cursable es true', () => {
      render(<StatusBadge estado="pendiente" cursable={true} />);
      expect(screen.getByText(/Cursable/i)).toBeInTheDocument();
    });

    it('debe renderizar el badge de Bloqueada cuando estado es pendiente y cursable es false', () => {
      render(<StatusBadge estado="pendiente" cursable={false} />);
      expect(screen.getByText(/Bloqueada/i)).toBeInTheDocument();
    });
  });

  describe('Modal', () => {
    it('no debe renderizar nada si isOpen es false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Test Modal">
          <p>Contenido Oculto</p>
        </Modal>
      );
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
      expect(screen.queryByText('Contenido Oculto')).not.toBeInTheDocument();
    });

    it('debe renderizar título, subtítulo, badge y contenido cuando isOpen es true', () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Título del Modal"
          subtitle="Subtítulo descriptivo"
          badge={<span>Badge Test</span>}
        >
          <p>Contenido Visible</p>
        </Modal>
      );

      expect(screen.getByText('Título del Modal')).toBeInTheDocument();
      expect(screen.getByText('Subtítulo descriptivo')).toBeInTheDocument();
      expect(screen.getByText('Badge Test')).toBeInTheDocument();
      expect(screen.getByText('Contenido Visible')).toBeInTheDocument();
    });

    it('debe llamar a onClose al hacer click en el botón de cerrar', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={handleClose} title="Cerrar Modal">
          <p>Test</p>
        </Modal>
      );

      const botonCerrar = screen.getByRole('button', { name: /Cerrar/i });
      await user.click(botonCerrar);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('debe llamar a onClose al presionar la tecla Escape', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={handleClose} title="Escape Modal">
          <p>Test</p>
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
