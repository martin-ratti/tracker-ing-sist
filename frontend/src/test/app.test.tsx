import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

vi.mock('../components/views/NetworkGraph', () => ({
  NetworkGraph: () => <div data-testid="mock-network-graph">Mock Grafo de Red</div>,
}));

describe('App Root Component', () => {
  it('debe montar la aplicación completa con todos sus providers y vista principal', async () => {
    render(<App />);

    expect(screen.getByText(/UTN SISTEMAS/i)).toBeInTheDocument();
    // Debe renderizar la barra de navegación o el grafo
    const grafo = await screen.findByTestId('mock-network-graph');
    expect(grafo).toBeInTheDocument();
  });
});
