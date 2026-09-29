import { test, expect } from '@playwright/test';

test.describe('Dashboard de Estadísticas y Titulación Universitaria', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('debe abrir y explorar el Dashboard de Estadísticas', async ({ page }) => {
    // 1. Abrir modal de Estadísticas desde el botón del Header
    const btnStats = page.locator('button:has-text("Estadísticas")').first();
    await expect(btnStats).toBeVisible();
    await btnStats.click();

    // 2. Comprobar que se muestre el modal
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('#stats-title')).toContainText('Dashboard de Estadísticas');

    // 3. Verificar que se muestren las métricas principales
    await expect(modal.locator('text=Distribución por Estado')).toBeVisible();
    await expect(modal.locator('text=/Aprobadas \\(\\d+\\)/')).toBeVisible();
    await expect(modal.locator('text=/Regulares \\(\\d+\\)/')).toBeVisible();

    // 4. Cerrar con la tecla Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('debe abrir el modal de Títulos, verificar ADUSI e Ingeniería, y modificar horas PPS', async ({ page }) => {
    // 1. Abrir modal de Títulos desde el Header
    const btnTitulos = page.locator('button:has-text("Títulos")').first();
    await expect(btnTitulos).toBeVisible();
    await btnTitulos.click();

    // 2. Verificar diálogo
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('#titles-modal-title')).toContainText('Titulación Universitaria');

    // 3. Verificar que contenga ADUSI e Ingeniería de grado
    await expect(modal.locator('text=Analista Desarrollador Univ. en Sistemas de Información (ADUSI)')).toBeVisible();
    await expect(modal.locator('text=Ingeniero/a en Sistemas de Información')).toBeVisible();

    // 4. Modificar horas de PPS (Práctica Profesional Supervisada) si está disponible
    const ppsInput = modal.locator('input[type="number"]');
    if (await ppsInput.isVisible()) {
      await ppsInput.fill('200');
      await expect(ppsInput).toHaveValue('200');
    }

    // 5. Cerrar con el botón de cierre
    const btnCerrar = modal.locator('button[aria-label="Cerrar seguimiento de títulos"]');
    await btnCerrar.click();
    await expect(modal).not.toBeVisible();
  });
});
