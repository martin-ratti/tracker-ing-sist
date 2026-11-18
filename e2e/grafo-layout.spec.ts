import { test, expect } from '@playwright/test';

test.describe('Estabilidad de Layout y Filtros en Grafo de Red', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('no debe romper las posiciones del grafo al alternar Req. Regular, Req. Aprobada y Todas', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(500);

    const initialRender = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return c ? c.toDataURL() : '';
    });
    expect(initialRender.length).toBeGreaterThan(100);

    // Cambiar a Req. Regular y Req. Aprobada, luego volver a Todas
    await page.getByRole('button', { name: 'Req. Regular' }).first().click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: 'Req. Aprobada' }).first().click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: 'Todas' }).first().click();
    await page.waitForTimeout(300);

    const afterFilterCycle = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return c ? c.toDataURL() : '';
    });

    expect(afterFilterCycle).toBe(initialRender);
  });

  test('el botón de reiniciar debe restablecer posiciones movidas en Modo Libre y el zoom', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(500);

    // Activar Modo Libre
    const switchLibre = page.getByRole('switch', { name: /Interruptor de Modo Libre/i });
    await switchLibre.click();
    await expect(switchLibre).toHaveAttribute('aria-checked', 'true');
    await page.waitForTimeout(450);

    const beforeMoveRender = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return c ? c.toDataURL() : '';
    });

    // Arrastrar en el canvas y hacer zoom in para alterar vista/posiciones
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 140, box.y + box.height / 2 + 90, { steps: 6 });
      await page.mouse.up();
    }
    await page.getByRole('button', { name: /Acercar vista del grafo/i }).click();
    await page.waitForTimeout(400);

    const movedRender = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return c ? c.toDataURL() : '';
    });
    expect(movedRender).not.toBe(beforeMoveRender);

    // Presionar el botón de Reiniciar disposición del grafo
    await page.getByRole('button', { name: /Restablecer disposición del grafo/i }).click();
    await expect(switchLibre).toHaveAttribute('aria-checked', 'false');
    await page.waitForTimeout(600);

    const savedFreeMode = await page.evaluate(() => localStorage.getItem('tracker_graph_free_mode'));
    const savedPositions = await page.evaluate(() => localStorage.getItem('tracker_graph_custom_positions'));
    expect(savedFreeMode).toBe('false');
    expect(savedPositions).toBeNull();

    const resetRender = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return c ? c.toDataURL() : '';
    });
    expect(resetRender).not.toBe(movedRender);
  });
});
