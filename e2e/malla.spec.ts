import { test, expect } from '@playwright/test';

test.describe('Malla Curricular e Interacción con Materias', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('debe cambiar a la Malla Curricular y mostrar las materias del Plan 2023', async ({ page }) => {
    await expect(page).toHaveTitle(/Tracker|UTN/i);

    // Cambiar a la vista de Malla Curricular
    const botonMalla = page.locator('button:has-text("Malla Curricular"), button:has-text("Malla")').first();
    await botonMalla.click();

    // Debe mostrar materias troncales de primer nivel en la malla
    const am1 = page.locator('text=Análisis Matemático I').first();
    await expect(am1).toBeVisible();
  });

  test('debe alternar estado al clickear la tarjeta y abrir el modal al clickear el botón de detalles', async ({ page }) => {
    // Cambiar a la vista de Malla Curricular
    const botonMalla = page.locator('button:has-text("Malla Curricular"), button:has-text("Malla")').first();
    await botonMalla.click();

    // Click en la tarjeta de Análisis Matemático I para alternar a Regular
    const am1Card = page.locator('div[role="button"]:has-text("Análisis Matemático I")').first();
    await am1Card.click();
    await expect(am1Card.locator('text=Regular')).toBeVisible();

    // Click en el botón de información y detalles de la materia
    const botonInfo = am1Card.locator('button[aria-label*="Ver detalles"]');
    await botonInfo.click();

    // Debe abrir el diálogo modal de detalles
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Análisis Matemático I')).toBeVisible();

    // Cerrar modal con la tecla Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });
});
