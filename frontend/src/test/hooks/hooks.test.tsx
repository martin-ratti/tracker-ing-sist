import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

const ShortcutsComponent: React.FC<{ shortcuts: Record<string, () => void> }> = ({ shortcuts }) => {
  useKeyboardShortcuts(shortcuts);
  return (
    <div>
      <input data-testid="test-input" />
      <span>Shortcuts Tester</span>
    </div>
  );
};

describe('Custom Hooks (useKeyboardShortcuts)', () => {
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
