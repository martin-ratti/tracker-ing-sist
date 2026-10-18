import { describe, it, expect } from 'vitest';
import { DONATION_CONFIG } from '../../data/donations';

describe('Configuración de Donaciones (donations.ts)', () => {
  it('debe tener definido el alias, titular y plataforma de Mercado Pago', () => {
    expect(DONATION_CONFIG.alias).toBe('epi321');
    expect(DONATION_CONFIG.titular).toBe('Martín Ratti');
    expect(DONATION_CONFIG.plataforma).toBe('Mercado Pago');
  });

  it('el alias no debe contener espacios ni caracteres inválidos', () => {
    expect(DONATION_CONFIG.alias.trim()).toBe(DONATION_CONFIG.alias);
    expect(DONATION_CONFIG.alias.length).toBeGreaterThan(0);
  });
});
