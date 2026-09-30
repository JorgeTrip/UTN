import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de Experiencia Móvil de Alta Fidelidad:
 * Bottom Tab Bar, Ocultamiento de barra de escritorio en móvil y Bottom Sheets.
 */

test.describe('Experiencia Móvil de Alta Fidelidad', () => {
  test('en viewport móvil debe mostrarse la Bottom Tab Bar fija y ocultarse la barra superior de escritorio', async ({ page }) => {
    // Configurar viewport móvil típico (iPhone / Android)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });

    const bottomBar = page.locator('#bottomTabBarMovil');
    await expect(bottomBar).toBeVisible();

    const tabsDesktop = page.locator('.super-tab-bar');
    await expect(tabsDesktop).toBeHidden();

    // Debe contener las 4 opciones
    const items = bottomBar.locator('.bottom-tab-item');
    await expect(items).toHaveCount(4);
  });

  test('debe permitir navegar entre los 4 módulos principales usando la Bottom Tab Bar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });

    const bottomBar = page.locator('#bottomTabBarMovil');

    // Clic en Planificador (tab 2)
    const btnPlanificador = bottomBar.locator('.bottom-tab-item[data-tab="2"]');
    await btnPlanificador.click();
    const panelPlanificador = page.locator('#sp2');
    await expect(panelPlanificador).toHaveClass(/active/);

    // Clic en Guía (tab 4)
    const btnGuia = bottomBar.locator('.bottom-tab-item[data-tab="4"]');
    await btnGuia.click();
    const panelGuia = page.locator('#sp4');
    await expect(panelGuia).toHaveClass(/active/);

    // Clic en Seguimiento (tab 1)
    const btnSeguimiento = bottomBar.locator('.bottom-tab-item[data-tab="1"]');
    await btnSeguimiento.click();
    const panelSeguimiento = page.locator('#sp1');
    await expect(panelSeguimiento).toHaveClass(/active/);
  });

  test('en viewport de escritorio debe ocultarse la Bottom Tab Bar y mostrarse la barra superior', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });

    const bottomBar = page.locator('#bottomTabBarMovil');
    await expect(bottomBar).toBeHidden();

    const tabsDesktop = page.locator('.super-tab-bar');
    await expect(tabsDesktop).toBeVisible();
  });
});
