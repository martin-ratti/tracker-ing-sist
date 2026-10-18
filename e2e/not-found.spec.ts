import { test, expect } from '@playwright/test';

test.describe('Página 404 y Recuperación de Navegación', () => {
  test('debe mostrar la vista 404 ante rutas inexistentes y permitir volver a la Malla', async ({ page }) => {
    // 1. Navegar a una ruta no existente
    await page.goto('/ruta-inexistente-404');

    // 2. Verificar que se renderiza NotFoundView
    await expect(page.locator('text=Error 404 · Ruta No Encontrada')).toBeVisible();

    // 3. Click en "Ver Malla Curricular"
    const btnMalla = page.locator('button:has-text("Ver Malla Curricular")');
    await expect(btnMalla).toBeVisible();
    await btnMalla.click();

    // 4. Debe retornar a la aplicación y mostrar materias de la Malla
    await expect(page.locator('text=Análisis Matemático I').first()).toBeVisible();
  });

  test('debe permitir navegar al Grafo desde la pantalla 404', async ({ page }) => {
    await page.goto('/seccion-invalida');

    // Click en "Explorar Grafo"
    const btnGrafo = page.locator('button:has-text("Explorar Grafo")');
    await expect(btnGrafo).toBeVisible();
    await btnGrafo.click();

    // Debe salir de la pantalla 404 y volver a la vista principal
    await expect(page.locator('text=Error 404 · Ruta No Encontrada')).not.toBeVisible();
    await expect(page.locator('button:has-text("Malla Curricular"), button:has-text("Malla")').first()).toBeVisible();
  });
});
