import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
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
        if (event === 'dragStart') this.dragStartHandler = handler;
        if (event === 'dragEnd') this.dragEndHandler = handler;
        if (event === 'oncontext') this.contextHandler = handler;
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
      getNodeAt = vi.fn(() => 1);
      getScale = vi.fn(() => 1);
      getPositions = vi.fn(() => ({ 19: { x: 100, y: 200 } }));
      clickHandler: any = null;
      dragStartHandler: any = null;
      dragEndHandler: any = null;
      contextHandler: any = null;
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

    // Controles superiores: Interruptor Modo Libre / Jerárquico
    const switchModoLibre = screen.getByRole('switch', { name: /Interruptor de Modo Libre/i });
    expect(switchModoLibre).toBeInTheDocument();
    await user.click(switchModoLibre);

    // Volver a modo jerárquico
    await user.click(switchModoLibre);

    // Filtros: Atenuar Aprobadas
    const botonAtenuar = screen.getByRole('button', { name: /Atenuar Aprobadas/i });
    await user.click(botonAtenuar);

    // Probar controles de dirección (Horizontal / Vertical) y Reset Layout
    const botonDireccion = screen.getByTitle(/Orientación actual:/i);
    await user.click(botonDireccion);

    const botonResetLayout = screen.getByTitle(/Restablecer Disposición \/ Layout/i);
    await user.click(botonResetLayout);

    // Buscar una materia en la barra flotante para enfocarla y activar cadena crítica
    const searchInput = screen.getByLabelText(/Buscar materia para enfocar en el grafo/i);
    await user.type(searchInput, 'Base de Datos');
    const opcion = await screen.findByText(/Base de Datos/i);
    await user.click(opcion);

    // Debe mostrar inspector con Base de Datos
    expect(screen.getAllByText(/Base de Datos/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/3º Nivel/i)).toBeInTheDocument();

    // Clic en botón Abrir Ficha del inspector
    const botonFicha = screen.getByRole('button', { name: /Abrir Ficha/i });
    await user.click(botonFicha);

    // Clic simple en nodo sobre el grafo -> alterna estado directamente
    if (mockNetworkInstance?.clickHandler) {
      act(() => {
        mockNetworkInstance.clickHandler({ nodes: ['19'] });
      });
    }

    // Arrastre iniciado (dragStart) y finalizado (dragEnd) -> congela fondo y gestiona layout
    if (mockNetworkInstance?.dragStartHandler) {
      act(() => {
        mockNetworkInstance.dragStartHandler({ nodes: ['19'] });
      });
    }
    if (mockNetworkInstance?.dragEndHandler) {
      act(() => {
        mockNetworkInstance.dragEndHandler({ nodes: ['19'] });
      });
    }

    // Probar redimensionamiento de ventana
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    // Resetear foco al hacer clic en fondo
    if (mockNetworkInstance?.clickHandler) {
      act(() => {
        mockNetworkInstance.clickHandler({ nodes: [] });
      });
    }
    if (mockNetworkInstance?.contextHandler) {
      act(() => {
        mockNetworkInstance.contextHandler({
          event: { preventDefault: vi.fn() },
          pointer: { DOM: { x: 100, y: 100 } }
        });
      });
    }
  });
});
