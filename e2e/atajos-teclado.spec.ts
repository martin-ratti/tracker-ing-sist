import { test, expect } from '@playwright/test';

test.describe('Atajos de Teclado Globales', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.locator('body').click();
  });

  test('debe cambiar de vistas y abrir/cerrar modales mediante atajos de teclado', async ({ page }) => {
    // 1. Presionar 'm' para alternar a la Malla Curricular
    await page.keyboard.press('m');
    await expect(page.locator('text=Análisis Matemático I').first()).toBeVisible();

    // 2. Presionar 'c' para abrir Calendario Académico
    await page.keyboard.press('c');
    let modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Calendario Académico')).toBeVisible();

    // Cerrar con Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // 3. Presionar 'p' para abrir Perfil
    await page.keyboard.press('p');
    modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Perfil y Copia de Seguridad')).toBeVisible();

    // Cerrar con Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // 4. Presionar 's' para abrir Compartir
    await page.keyboard.press('s');
    modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Compartir Avance de Carrera')).toBeVisible();

    // Cerrar con Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // 5. Presionar 'r' para abrir Ficha / Reporte Imprimible
    await page.keyboard.press('r');
    modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Ficha Curricular y Analítico')).toBeVisible();

    // Cerrar con Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // 6. Presionar '?' para abrir Ayuda y Atajos
    await page.keyboard.press('?');
    modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('#help-modal-title')).toBeVisible();

    // Cerrar con Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // 7. Presionar 'e' para alternar panel de Electivas
    await page.keyboard.press('e');
    await expect(page.locator('text=Materias Electivas').first()).toBeVisible();

    // Cerrar con Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('button[aria-label="Cerrar panel de electivas"]')).not.toBeVisible();
  });
});
