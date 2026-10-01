import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de Segregación Estricta entre Vista Escritorio y Vista Móvil.
 * Valida:
 * 1. En resolución de escritorio (1280x800), las barras de navegación móviles inferiores
 *    (#bottomTabBarMovil, #subTabBarInferiorMovil, #subSubTabBarInferiorMovil) están estrictamente ocultas.
 * 2. Ningún botón móvil ("Hitos", "Mapa", "Peso", "Estrategia") es visible en la base del viewport en escritorio.
 * 3. En resolución móvil (390x844), la barra inferior móvil opera adecuadamente.
 */

test.describe('Segregación Estricta Escritorio vs Móvil', () => {
  test('en escritorio (1280x800) ninguna barra inferior móvil debe ser visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });

    // Navegamos a Plan de Estudios (super-tab 1)
    await page.locator('.super-tab.sp1').click();
    await page.waitForTimeout(300);

    const bottomBar = page.locator('#bottomTabBarMovil');
    const subTabBar = page.locator('#subTabBarInferiorMovil');
    const subSubTabBar = page.locator('#subSubTabBarInferiorMovil');

    await expect(bottomBar).toBeHidden();
    await expect(subTabBar).toBeHidden();
    await expect(subSubTabBar).toBeHidden();

    // Verificamos que los botones móviles contextuales no sean visibles en escritorio
    const botonesContextuales = page.locator('#subTabBarInferiorMovil .sub-tab-pill');
    await expect(botonesContextuales).toHaveCount(0);

    // Navegamos a Planificador (super-tab 2)
    await page.locator('.super-tab.sp2').click();
    await page.waitForTimeout(300);

    await expect(subTabBar).toBeHidden();
    await expect(subSubTabBar).toBeHidden();
  });

  test('en móvil (390x844) la barra de navegación inferior móvil debe ser visible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });

    const bottomBar = page.locator('#bottomTabBarMovil');
    await expect(bottomBar).toBeVisible();
  });
});
