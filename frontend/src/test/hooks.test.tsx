import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const FocusTrapComponent: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const ref = useFocusTrap(isActive);
  return (
    <div ref={ref}>
      <button type="button">Primer Botón</button>
      <input placeholder="Campo de texto" />
      <button type="button">Último Botón</button>
    </div>
  );
};

const ShortcutsComponent: React.FC<{ shortcuts: Record<string, () => void> }> = ({ shortcuts }) => {
  useKeyboardShortcuts(shortcuts);
  return (
    <div>
      <input data-testid="test-input" />
      <span>Shortcuts Tester</span>
    </div>
  );
};

describe('Custom Hooks (useFocusTrap y useKeyboardShortcuts)', () => {
  describe('useFocusTrap', () => {
    it('debe enfocar el primer elemento interactivo cuando isActive es true', () => {
      render(<FocusTrapComponent isActive={true} />);
      const firstButton = screen.getByRole('button', { name: /Primer Botón/i });
      expect(document.activeElement).toBe(firstButton);
    });

    it('debe ciclar al primer elemento al presionar Tab en el último elemento', async () => {
      const user = userEvent.setup();
      render(<FocusTrapComponent isActive={true} />);

      const firstButton = screen.getByRole('button', { name: /Primer Botón/i });
      const lastButton = screen.getByRole('button', { name: /Último Botón/i });

      lastButton.focus();
      expect(document.activeElement).toBe(lastButton);

      await user.keyboard('{Tab}');
      expect(document.activeElement).toBe(firstButton);
    });

    it('debe ciclar al último elemento al presionar Shift+Tab en el primer elemento', async () => {
      const user = userEvent.setup();
      render(<FocusTrapComponent isActive={true} />);

      const firstButton = screen.getByRole('button', { name: /Primer Botón/i });
      const lastButton = screen.getByRole('button', { name: /Último Botón/i });

      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);

      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(document.activeElement).toBe(lastButton);
    });
  });

  describe('useKeyboardShortcuts', () => {
    it('debe ejecutar la acción asociada a una tecla al disparar keydown', async () => {
      const user = userEvent.setup();
      const mockG = vi.fn();
      const mockM = vi.fn();

      render(<ShortcutsComponent shortcuts={{ g: mockG, m: mockM }} />);

      await user.keyboard('g');
      expect(mockG).toHaveBeenCalledTimes(1);

      await user.keyboard('m');
      expect(mockM).toHaveBeenCalledTimes(1);
    });

    it('no debe disparar el atajo si el foco está dentro de un input', async () => {
      const user = userEvent.setup();
      const mockG = vi.fn();

      render(<ShortcutsComponent shortcuts={{ g: mockG }} />);

      const input = screen.getByTestId('test-input');
      await user.click(input);
      await user.keyboard('g');

      expect(mockG).not.toHaveBeenCalled();
    });
  });
});
