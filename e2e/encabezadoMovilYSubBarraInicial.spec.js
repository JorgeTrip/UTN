// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Encabezado Móvil Visible y Sub-Barra en Cascada Inicial', () => {
  test.beforeEach(async ({ page }) => {
    // Configurar viewport móvil típico (iPhone 12/13/14 o Android estándar)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('El encabezado en móvil debe mostrar badges, título y avatar sin quedar en negro', async ({ page }) => {
    const encabezado = page.locator('.g-header');
    await expect(encabezado).toBeVisible();

    // 1. Badge institucional UTN visible
    const badgeUtn = page.locator('.g-header .gb-utn');
    await expect(badgeUtn).toBeVisible();
    await expect(badgeUtn).toContainText('UTN');

    // 2. Título de carrera visible
    const titulo = page.locator('.g-header #gMobileTitle');
    await expect(titulo).toBeVisible();

    // 3. Avatar de usuario en el header visible
    const avatar = page.locator('.g-header .avatar-btn-header');
    await expect(avatar).toBeVisible();

    // 4. El contenedor g-header-inner no debe tener altura colapsada
    const box = await encabezado.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('La sub-barra contextual y el conector visual deben estar visibles de inmediato al iniciar', async ({ page }) => {
    // 1. Sub-barra inferior visible de inmediato
    const subBarra = page.locator('#subTabBarInferiorMovil');
    await expect(subBarra).toBeVisible();

    // 2. Contiene las opciones de Seguimiento (Hitos, Mapa, Peso, Estrategia)
    const pills = subBarra.locator('.sub-tab-pill');
    await expect(pills).toHaveCount(4);
    await expect(pills.first()).toBeVisible();

    // 3. Conector visual (flecha en cascada) visible en la pestaña activa
    const conector = page.locator('#bottomTabBarMovil .bottom-tab-item.active .tab-connector-arrow');
    await expect(conector).toBeVisible();
  });
});
