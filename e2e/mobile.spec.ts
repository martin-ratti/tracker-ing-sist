import { test, expect } from '@playwright/test';

test.describe('Navegación Móvil y Drawer Adaptativo', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('debe operar la barra inferior BottomNav y navegar entre Malla y Grafo', async ({ page }) => {
    const bottomNav = page.locator('nav[aria-label="Navegación principal móvil"]');
    await expect(bottomNav).toBeVisible();

    // 1. Cambiar a vista Malla
    const btnMalla = bottomNav.locator('button:has-text("Malla")');
    await btnMalla.click();
    await expect(page.locator('text=Análisis Matemático I').first()).toBeVisible();

    // 2. Cambiar a vista Grafo
    const btnGrafo = bottomNav.locator('button:has-text("Grafo")');
    await btnGrafo.click();
    // En modo Grafo debe verse la barra de correlativas móvil
    await expect(page.locator('button:has-text("Todas")').first()).toBeVisible();
  });

  test('debe abrir y operar el Drawer Móvil desde el botón Más', async ({ page }) => {
    const bottomNav = page.locator('nav[aria-label="Navegación principal móvil"]');
    const btnMas = bottomNav.locator('button:has-text("Más")');
    await btnMas.click();

    // Drawer visible con sus opciones
    await expect(page.locator('text=Progreso de Carrera')).toBeVisible();

    // Abrir Perfil desde la tarjeta del drawer móvil mediante dispatchEvent directo
    const btnEditarPerfil = page.locator('button:has-text("Editar")');
    await btnEditarPerfil.dispatchEvent('click');

    // Debe abrir el modal de perfil
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Perfil y Copia de Seguridad')).toBeVisible();

    // Cerrar modal con Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('debe abrir y visualizar electivas en vista móvil', async ({ page }) => {
    const bottomNav = page.locator('nav[aria-label="Navegación principal móvil"]');
    const btnElectivas = bottomNav.locator('button:has-text("Electivas")');
    await btnElectivas.click();

    // Debe mostrar la vista o encabezado de electivas
    await expect(page.locator('text=Materias Electivas').first()).toBeVisible();
  });
});
