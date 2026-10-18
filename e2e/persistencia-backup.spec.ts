import { test, expect } from '@playwright/test';

test.describe('Persistencia en LocalStorage y Modal de Ayuda', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('debe persistir el estado de materias y perfil de usuario tras recargar la página', async ({ page }) => {
    // 1. Cambiar a vista Malla
    const btnMalla = page.locator('button:has-text("Malla Curricular"), button:has-text("Malla")').first();
    await btnMalla.click();

    // 2. Marcar Análisis Matemático I como Regular
    const am1Card = page.locator('div[role="button"]:has-text("Análisis Matemático I")').first();
    await am1Card.click();
    await expect(am1Card.locator('text=Regular')).toBeVisible();

    // 3. Abrir modal de Perfil y guardar datos
    const btnPerfil = page.locator('button:has-text("Perfil")').first();
    await btnPerfil.click();

    const modalPerfil = page.locator('role=dialog');
    await expect(modalPerfil).toBeVisible();

    const inputNombre = modalPerfil.locator('input[placeholder*="Martín Ratti"]').first();
    await inputNombre.fill('Lautaro Martínez');

    const inputLegajo = modalPerfil.locator('input[placeholder*="48210"]').first();
    await inputLegajo.fill('998877');

    const btnGuardar = modalPerfil.locator('button:has-text("Guardar Datos Alumno")');
    await btnGuardar.click();
    await expect(modalPerfil).not.toBeVisible();

    // 4. Recargar la página completamente
    await page.reload();

    // 5. Ir a Malla y verificar que Análisis Matemático I continúe Regular
    await btnMalla.click();
    const am1CardReloaded = page.locator('div[role="button"]:has-text("Análisis Matemático I")').first();
    await expect(am1CardReloaded.locator('text=Regular')).toBeVisible();

    // 6. Verificar que el perfil mantenga el nombre en el header
    await expect(page.locator('button:has-text("Lautaro Martínez")')).toBeVisible();
  });

  test('debe abrir y explorar la guía interactiva y lista de atajos desde el modal de Ayuda', async ({ page }) => {
    // Abrir modal de Ayuda desde el botón del Header
    const btnAyuda = page.locator('button[title*="Ayuda y atajos"]').first();
    await expect(btnAyuda).toBeVisible();
    await btnAyuda.click();

    const modalAyuda = page.locator('role=dialog');
    await expect(modalAyuda).toBeVisible();
    await expect(modalAyuda.locator('#help-modal-title')).toContainText('Guía del Tracker Plan 2023');

    // Cerrar con tecla Escape
    await page.keyboard.press('Escape');
    await expect(modalAyuda).not.toBeVisible();
  });
});
