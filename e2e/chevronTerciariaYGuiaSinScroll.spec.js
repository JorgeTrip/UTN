// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Conector Chevron Terciario y Guía Académica Sin Scroll', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('La píldora activa de la sub-barra secundaria debe tener el conector chevron hacia la sub-sub-barra', async ({ page }) => {
    // Navegar a Planificador (tab 2)
    await page.locator('#bottomTabBarMovil button[data-tab="2"]').click();
    await page.waitForTimeout(300);

    // Debe existir un conector .tab-connector-arrow dentro de la píldora de año activa en #subTabBarInferiorMovil
    const conectorSecundario = page.locator('#subTabBarInferiorMovil .sub-tab-pill.active .tab-connector-arrow');
    await expect(conectorSecundario).toBeVisible();
  });

  test('Las opciones de la sub-barra de Guía Académica no deben requerir scroll horizontal en 390px', async ({ page }) => {
    // Navegar a Guía Académica (tab 4)
    await page.locator('#bottomTabBarMovil button[data-tab="4"]').click();
    await page.waitForTimeout(300);

    const subPillsRow = page.locator('#subTabBarInferiorMovil .sub-tab-pills-row');
    await expect(subPillsRow).toBeVisible();

    const noDesborda = await subPillsRow.evaluate((el) => el.scrollWidth <= el.clientWidth);
    expect(noDesborda).toBe(true);

    // No debe tener chevrons activos
    const chevronsVisibles = page.locator('#subTabBarInferiorMovil .tab-chevron.visible');
    await expect(chevronsVisibles).toHaveCount(0);
  });

  test('El buscador de la Guía Académica debe tener una altura mayor o igual a 36px', async ({ page }) => {
    await page.locator('#bottomTabBarMovil button[data-tab="4"]').click();
    await page.waitForTimeout(300);

    const buscador = page.locator('#guiaBuscadorFlotanteMovil');
    await expect(buscador).toBeVisible();

    const box = await buscador.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.height).toBeGreaterThanOrEqual(36);
  });

  test('No deben existir botones de opciones duplicadas dentro del cuerpo de la Guía Académica', async ({ page }) => {
    await page.locator('#bottomTabBarMovil button[data-tab="4"]').click();
    await page.waitForTimeout(300);

    const opcionesEnCuerpo = page.locator('#sp4 .guia-tab-btn:visible');
    await expect(opcionesEnCuerpo).toHaveCount(0);
  });
});
