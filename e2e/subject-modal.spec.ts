import { test, expect } from '@playwright/test';

test.describe('Detalle de Materia, Notas y Planificación de Metas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('debe abrir modal de materia, cambiar estados, cargar calificación y gestionar metas de examen', async ({ page }) => {
    // 1. Cambiar a la vista de Malla Curricular
    const botonMalla = page.locator('button:has-text("Malla Curricular"), button:has-text("Malla")').first();
    await botonMalla.click();

    // 2. Localizar tarjeta de Análisis Matemático I y ponerla Regular
    const am1Card = page.locator('div[role="button"]:has-text("Análisis Matemático I")').first();
    await expect(am1Card).toBeVisible();
    await am1Card.click();
    await expect(am1Card.locator('text=Regular')).toBeVisible();

    // 3. Abrir modal de detalles
    const botonInfo = am1Card.locator('button[aria-label*="Ver detalles"]');
    await botonInfo.click();

    // 4. Verificar apertura del modal
    const modal = page.locator('role=dialog');
    await expect(modal).toBeVisible();
    await expect(modal.locator('#subject-modal-title')).toContainText('Análisis Matemático I');

    // 5. Planificar meta de examen (la materia ya está Regular)
    const btnProgramar = modal.locator('button:has-text("Programar mesa tentativa de final")');
    await btnProgramar.scrollIntoViewIfNeeded();
    await btnProgramar.click();

    // Completar formulario de meta
    const commentInput = modal.locator('input[placeholder*="Repasar unidades"]');
    await expect(commentInput).toBeVisible();
    await commentInput.fill('Repasar integrales dobles y series');

    const btnGuardarMeta = modal.locator('button:has-text("Guardar Meta")');
    await btnGuardarMeta.click();

    // Verificar que la meta guardada se muestre en el modal
    await expect(modal.getByText(/Repasar integrales dobles/)).toBeVisible();

    // 6. Cambiar estado a Aprobada desde el modal
    const btnAprobada = modal.locator('button:has-text("Aprobada")');
    await btnAprobada.click();

    // 7. Cargar notas del examen final
    const notaInput = modal.locator('input[placeholder="Ej: 8"]');
    await notaInput.scrollIntoViewIfNeeded();
    await notaInput.fill('9.5');

    const libroInput = modal.locator('input[placeholder="Libro"]');
    await libroInput.fill('Libro ISI 14');

    const folioInput = modal.locator('input[placeholder="Folio"]');
    await folioInput.fill('88');

    const btnGuardarDatos = modal.locator('button:has-text("Guardar Datos")');
    await btnGuardarDatos.click();

    // Verificar indicador de calificación guardada en el modal
    await expect(modal.locator('text=Calificación: 9.5')).toBeVisible();

    // 8. Cerrar modal con el botón de cierre
    const btnCerrar = modal.locator('button[aria-label="Cerrar detalles de la materia"]');
    await btnCerrar.click();
    await expect(modal).not.toBeVisible();

    // 9. Comprobar que en la tarjeta de la malla figure como aprobada
    await expect(am1Card.locator('text=Aprobada')).toBeVisible();
  });
});
