import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrackerProvider } from '../../../context/TrackerContext';
import { ThemeProvider } from '../../../context/ThemeContext';
import { NetworkGraph } from '../../../components/views/NetworkGraph';

vi.mock('vis-network/standalone', () => {
  return {
    Network: class {
      on = vi.fn();
      once = vi.fn();
      off = vi.fn();
      destroy = vi.fn();
      fit = vi.fn();
      moveTo = vi.fn();
      focus = vi.fn();
      setOptions = vi.fn();
      setData = vi.fn();
      redraw = vi.fn();
      getScale = vi.fn(() => 1);
    },
  };
});

describe('NetworkGraph Component', () => {
  it('debe montar el contenedor del grafo interactivo y sus controles flotantes', () => {
    render(
      <ThemeProvider>
        <TrackerProvider>
          <NetworkGraph />
        </TrackerProvider>
      </ThemeProvider>
    );

    // Controles de zoom y centrado
    expect(screen.getByLabelText(/Acercar vista del grafo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Alejar vista del grafo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ajustar y centrar grafo/i)).toBeInTheDocument();
  });
});
