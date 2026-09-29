import { test, expect } from '@playwright/test';

test.describe('Materias Electivas y Acumulación de Horas', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      const initialProgress = {
        estados: { 1: 'aprobada', 2: 'aprobada', 5: 'aprobada', 6: 'aprobada', 8: 'aprobada' },
        estadosElectivas: {},
        notas: {},
        ppsHoras: 0,
        perfil: { nombre: 'Estudiante', legajo: '12345' },
        metasExamen: {}
      };
      localStorage.setItem('utn-sistemas-tracker-2023', JSON.stringify(initialProgress));
    });
    await page.reload();
  });

  test('debe abrir el panel de electivas, filtrar por nivel y alternar estados sumando horas', async ({ page }) => {
    // 1. Abrir panel de electivas desde el Header
    const botonElectivas = page.getByRole('button', { name: /Electivas/i }).first();
    await expect(botonElectivas).toBeVisible();
    await botonElectivas.click();

    // 2. Localizar el contenedor aislado del drawer
    const drawer = page.getByTestId('electivas-drawer');
    await expect(drawer).toBeVisible();

    // 3. Filtrar por 2º Año dentro del drawer
    const filtro2do = drawer.getByRole('button', { name: '2º Año' });
    await filtro2do.click();

    // 4. Localizar la electiva "Entornos Gráficos" dentro del drawer
    const electiva = drawer.locator('h3:has-text("Entornos Gráficos")');
    await electiva.scrollIntoViewIfNeeded();
    await expect(electiva).toBeVisible();

    // Estado inicial de horas: 0 / 20 hs
    await expect(drawer.locator('text=0 / 20 hs')).toBeVisible();

    // 5. Clickeamos la electiva para cambiar a Regular
    await electiva.click();

    // 6. Clickeamos nuevamente para cambiar a Aprobada (+4hs)
    await electiva.click();

    // 7. Verificar que las horas de Ingeniería aumentaron a 4 / 20 hs
    await expect(drawer.locator('text=4 / 20 hs')).toBeVisible();

    // 8. Cerrar panel de electivas con el botón de cierre
    const botonCerrar = drawer.locator('button[aria-label="Cerrar panel de electivas"]');
    await botonCerrar.click();
    await expect(drawer).not.toBeVisible();
  });
});
