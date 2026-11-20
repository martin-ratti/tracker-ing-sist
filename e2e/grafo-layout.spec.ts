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

    await expect.poll(async () => {
      return await page.evaluate(() => {
        const c = document.querySelector('canvas');
        return c ? c.toDataURL().length : 0;
      });
    }).toBeGreaterThan(100);

    const initialRender = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return c ? c.toDataURL() : '';
    });

    // Cambiar a Req. Regular y Req. Aprobada, luego volver a Todas
    const btnRegular = page.getByRole('button', { name: 'Req. Regular' }).first();
    await btnRegular.click();

    const btnAprobada = page.getByRole('button', { name: 'Req. Aprobada' }).first();
    await btnAprobada.click();

    const btnTodas = page.getByRole('button', { name: 'Todas' }).first();
    await btnTodas.click();

    await expect.poll(async () => {
      return await page.evaluate(() => {
        const c = document.querySelector('canvas');
        return c ? c.toDataURL() : '';
      });
    }).toBe(initialRender);
  });

  test('el botón de reiniciar debe restablecer posiciones movidas en Modo Libre y el zoom', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();

    // Activar Modo Libre
    const switchLibre = page.getByRole('switch', { name: /Interruptor de Modo Libre/i });
    await switchLibre.click();
    await expect(switchLibre).toHaveAttribute('aria-checked', 'true');

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

    await expect.poll(async () => {
      return await page.evaluate(() => {
        const c = document.querySelector('canvas');
        return c ? c.toDataURL() : '';
      });
    }).not.toBe(beforeMoveRender);

    const movedRender = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return c ? c.toDataURL() : '';
    });

    // Presionar el botón de Reiniciar disposición del grafo
    await page.getByRole('button', { name: /Restablecer disposición del grafo/i }).click();
    await expect(switchLibre).toHaveAttribute('aria-checked', 'false');

    await expect.poll(async () => {
      return await page.evaluate(() => localStorage.getItem('tracker_graph_free_mode'));
    }).toBe('false');

    const savedPositions = await page.evaluate(() => localStorage.getItem('tracker_graph_custom_positions'));
    expect(savedPositions).toBeNull();

    await expect.poll(async () => {
      return await page.evaluate(() => {
        const c = document.querySelector('canvas');
        return c ? c.toDataURL() : '';
      });
    }).not.toBe(movedRender);
  });
});
