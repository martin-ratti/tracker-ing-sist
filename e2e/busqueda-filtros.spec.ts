import { test, expect } from '@playwright/test';

test.describe('Búsqueda y Filtros en Malla Curricular', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('debe buscar materias por nombre, filtrar resultados y permitir limpiar búsqueda', async ({ page }) => {
    // 1. Cambiar a la vista de Malla Curricular
    const botonMalla = page.locator('button:has-text("Malla Curricular"), button:has-text("Malla")').first();
    await botonMalla.click();

    // 2. Verificar que inicialmente se muestren materias de varios tipos
    await expect(page.locator('text=Análisis Matemático I').first()).toBeVisible();
    await expect(page.locator('text=Física I').first()).toBeVisible();

    // 3. Escribir en el input de búsqueda
    const searchInput = page.locator('input[placeholder*="Buscar materia"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Física');

    // 4. Debe mostrar materias de Física y ocultar otras
    await expect(page.locator('text=Física I').first()).toBeVisible();
    await expect(page.locator('text=Análisis Matemático I')).not.toBeVisible();

    // 5. Limpiar la búsqueda con el botón de limpiar
    const botonLimpiar = page.locator('button[aria-label="Limpiar búsqueda"]').first();
    await expect(botonLimpiar).toBeVisible();
    await botonLimpiar.click();

    // 6. Todas las materias deben volver a ser visibles
    await expect(page.locator('text=Análisis Matemático I').first()).toBeVisible();
  });

  test('debe permitir filtrar materias por nivel académico', async ({ page }) => {
    const botonMalla = page.locator('button:has-text("Malla Curricular"), button:has-text("Malla")').first();
    await botonMalla.click();

    // Filtrar por 1er Año
    const btnNivel1 = page.locator('button:has-text("1º Año")').first();
    await expect(btnNivel1).toBeVisible();
    await btnNivel1.click();

    // Materias de 1er nivel visibles
    await expect(page.locator('text=Análisis Matemático I').first()).toBeVisible();
    // Materia de 4to nivel no debe estar visible
    await expect(page.locator('text=Administración de Recursos')).not.toBeVisible();

    // Restablecer a Todos los niveles
    const btnTodos = page.locator('button:has-text("Todos")').first();
    await btnTodos.click();
    await expect(page.locator('text=Análisis Matemático I').first()).toBeVisible();
  });

  test('debe operar los filtros rápidos de estado (Cursables y Todas)', async ({ page }) => {
    const botonMalla = page.locator('button:has-text("Malla Curricular"), button:has-text("Malla")').first();
    await botonMalla.click();

    // Al inicio, Análisis Matemático I es Cursable (sin correlativas previas)
    const btnCursables = page.locator('button:has-text("Cursables")').first();
    await expect(btnCursables).toBeVisible();
    await btnCursables.click();

    await expect(page.locator('text=Análisis Matemático I').first()).toBeVisible();

    // Cambiar a Todas
    const btnTodas = page.locator('button:has-text("Todas")').first();
    await btnTodas.click();
    await expect(page.locator('text=Análisis Matemático I').first()).toBeVisible();
  });
});
