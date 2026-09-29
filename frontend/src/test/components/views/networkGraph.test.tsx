import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrackerProvider } from '../../../context/TrackerContext';
import { ThemeProvider } from '../../../context/ThemeContext';
import { NetworkGraph } from '../../../components/views/NetworkGraph';

let mockNetworkInstance: any = null;
const setMockInstance = (instance: any) => {
  mockNetworkInstance = instance;
};

vi.mock('vis-network/standalone', () => {
  return {
    Network: class {
      on = vi.fn((event, handler) => {
        if (event === 'click') this.clickHandler = handler;
        if (event === 'doubleClick') this.doubleClickHandler = handler;
        if (event === 'stabilizationIterationsDone') this.stabilizedHandler = handler;
      });
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
      clickHandler: any = null;
      doubleClickHandler: any = null;
      stabilizedHandler: any = null;
      constructor() {
        setMockInstance(this);
      }
    },
  };
});

describe('NetworkGraph Component', () => {
  it('debe montar el contenedor del grafo interactivo y responder a todos los controles flotantes', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TrackerProvider>
          <NetworkGraph />
        </TrackerProvider>
      </ThemeProvider>
    );

    // Controles de zoom y centrado
    const zoomIn = screen.getByLabelText(/Acercar vista del grafo/i);
    expect(zoomIn).toBeInTheDocument();
    await user.click(zoomIn);

    const zoomOut = screen.getByLabelText(/Alejar vista del grafo/i);
    expect(zoomOut).toBeInTheDocument();
    await user.click(zoomOut);

    const fitBtn = screen.getByLabelText(/Ajustar y centrar grafo/i);
    expect(fitBtn).toBeInTheDocument();
    await user.click(fitBtn);

    // Controles superiores: Alternar Estado y Camino Crítico
    const botonCamino = screen.getByRole('button', { name: /Camino Crítico/i });
    await user.click(botonCamino);

    const botonEstado = screen.getByRole('button', { name: /Alternar Estado/i });
    await user.click(botonEstado);

    // Filtros: Atenuar Aprobadas y Cadena Crítica
    const botonAtenuar = screen.getByRole('button', { name: /Atenuar Aprobadas/i });
    await user.click(botonAtenuar);

    const botonCadena = screen.getByRole('button', { name: /Cadena Crítica/i });
    await user.click(botonCadena);

    // Simular eventos de click y doubleClick en vis-network
    if (mockNetworkInstance?.clickHandler) {
      mockNetworkInstance.clickHandler({ nodes: ['1'] });
      mockNetworkInstance.clickHandler({ nodes: [] });
    }
    if (mockNetworkInstance?.doubleClickHandler) {
      mockNetworkInstance.doubleClickHandler({ nodes: ['1'] });
    }
  });
});
