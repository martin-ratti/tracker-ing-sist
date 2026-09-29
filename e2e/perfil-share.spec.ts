import { test, expect } from '@playwright/test';

test.describe('Perfil de Usuario y Compartir Avance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('debe permitir actualizar nombre y legajo del estudiante en el perfil', async ({ page }) => {
    // 1. Abrir modal de Perfil
    const btnPerfil = page.locator('button:has-text("Perfil")').first();
    await expect(btnPerfil).toBeVisible();
    await btnPerfil.click();

    // 2. Verificar diálogo
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('#profile-modal-title')).toContainText('Perfil y Copia de Seguridad');

    // 3. Escribir nombre y legajo
    const inputNombre = modal.locator('input[placeholder*="Martín Ratti"]');
    await inputNombre.fill('Juan Pérez');

    const inputLegajo = modal.locator('input[placeholder*="48210"]');
    await inputLegajo.fill('54321');

    // 4. Guardar datos
    const btnGuardar = modal.locator('button:has-text("Guardar Datos Alumno")');
    await btnGuardar.click();

    // 5. Verificar que el modal se cierre y el nombre aparezca en el header
    await expect(modal).not.toBeVisible();
    await expect(page.locator('button:has-text("Juan Pérez")')).toBeVisible();
  });

  test('debe abrir modal de Compartir, generar URL hash y permitir copiar enlace', async ({ page }) => {
    // 1. Abrir modal Compartir
    const btnCompartir = page.locator('button:has-text("Compartir")').first();
    await expect(btnCompartir).toBeVisible();
    await btnCompartir.click();

    // 2. Verificar diálogo de compartir
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Compartir Avance de Carrera')).toBeVisible();

    // 3. Verificar que el input contenga el hash generado
    const inputShare = modal.locator('input[readonly]');
    await expect(inputShare).toBeVisible();
    const valorShare = await inputShare.inputValue();
    expect(valorShare).toContain('#share=');

    // 4. Click en Copiar Enlace
    const btnCopiar = modal.locator('button:has-text("Copiar Enlace"), button:has-text("Copiado")');
    await btnCopiar.click();

    // 5. Cerrar modal con el botón de cerrar
    const btnCerrar = modal.locator('button[aria-label="Cerrar"]');
    await btnCerrar.click();
    await expect(modal).not.toBeVisible();
  });
});
