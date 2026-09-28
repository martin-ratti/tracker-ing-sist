import { test, expect } from '@playwright/test';

test.describe('Calendario Académico y Mesas de Examen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe abrir el modal de Calendario Académico desde la barra superior o inferior', async ({ page }) => {
    // Click en el botón de Calendario
    const botonCalendario = page.locator('button:has-text("Calendario")').first();
    await botonCalendario.click();

    // Debe abrir el modal
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Calendario Académico')).toBeVisible();

    // Navegar mes siguiente
    const botonSiguiente = modal.locator('button[title*="Mes siguiente"]');
    await botonSiguiente.click();

    // Cerrar modal
    const botonCerrar = modal.locator('button[aria-label="Cerrar calendario académico"]');
    await botonCerrar.click();
    await expect(modal).not.toBeVisible();
  });
});
