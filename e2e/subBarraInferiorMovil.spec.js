import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de Sub-Barra Inferior Móvil y Conector Visual en Cascada:
 * - Sub-barra apilada sobre la barra principal
 * - Conector visual en el tab activo inferior que apunta a la sub-barra
 * - Navegación de subpestañas sincronizada
 */

test.describe('Sub-Barra Inferior Móvil con Conector Visual de Origen', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });
  });

  test('en Seguimiento debe mostrarse la sub-barra inferior con Hitos, Mapa, Peso y Estrategia', async ({ page }) => {
    const subBar = page.locator('#subTabBarInferiorMovil');
    await expect(subBar).toBeVisible();

    const pills = subBar.locator('.sub-tab-pill');
    await expect(pills).toHaveCount(4);
    await expect(pills.nth(0)).toContainText('Hitos');
    await expect(pills.nth(1)).toContainText('Mapa');
    await expect(pills.nth(2)).toContainText('Peso');
    await expect(pills.nth(3)).toContainText('Estrategia');
  });

  test('el tab activo de la barra principal inferior debe tener el conector visual que señala a la sub-barra', async ({ page }) => {
    const tabActivo = page.locator('#bottomTabBarMovil .bottom-tab-item.active');
    await expect(tabActivo).toBeVisible();

    const conector = tabActivo.locator('.tab-connector-arrow');
    await expect(conector).toBeVisible();
  });

  test('al hacer clic en una subpestaña debe conmutar el subpanel activo', async ({ page }) => {
    const subBar = page.locator('#subTabBarInferiorMovil');
    const pillEstrategia = subBar.locator('.sub-tab-pill', { hasText: 'Estrategia' });
    await pillEstrategia.click();

    // El subpanel 3 de seguimiento (Estrategia) debe activarse
    const panelEstrategia = page.locator('#sp1p3');
    await expect(panelEstrategia).toHaveClass(/active/);
    await expect(pillEstrategia).toHaveClass(/active/);
  });

  test('al alternar al Planificador debe conmutar las opciones de la sub-barra y mover el conector', async ({ page }) => {
    const btnPlanificador = page.locator('#bottomTabBarMovil .bottom-tab-item[data-tab="2"]');
    await btnPlanificador.click();

    // El conector visual ahora debe estar en el tab del planificador
    await expect(btnPlanificador).toHaveClass(/active/);
    await expect(btnPlanificador.locator('.tab-connector-arrow')).toBeVisible();

    // La sub-barra debe mostrar los años
    const subBar = page.locator('#subTabBarInferiorMovil');
    await expect(subBar).toBeVisible();
    const pills = subBar.locator('.sub-tab-pill');
    await expect(pills.first()).toContainText('2026');
  });
});
