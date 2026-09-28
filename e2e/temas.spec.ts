import { test, expect } from '@playwright/test';

test.describe('Temas Visuales y Modo Claro / Oscuro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe permitir cambiar de paleta de colores y alternar modo claro y oscuro', async ({ page }) => {
    // Abrir menú de temas
    const botonTemas = page.locator('button[aria-label="Cambiar tema visual"]').first();
    await botonTemas.click();

    // Cambiar a Modo Claro
    const botonClaro = page.locator('button:has-text("Claro")');
    await botonClaro.click();

    // Verificar data-mode en el elemento <html>
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-mode', 'light');

    // Cambiar paleta a Synthwave (con el menú abierto)
    const opcionSynthwave = page.locator('text=Neon Synthwave');
    await opcionSynthwave.click();

    await expect(html).toHaveAttribute('data-theme', 'synthwave');
  });
});
