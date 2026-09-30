// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Sub-Sub-Barra Inferior Móvil (Cuatrimestres y Alternativas)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('La sub-sub-barra debe estar oculta en Seguimiento y visible al entrar a Planificador', async ({ page }) => {
    const subSubBarra = page.locator('#subSubTabBarInferiorMovil');

    // En Seguimiento (inicio) debe estar oculta
    if (await subSubBarra.count() > 0) {
      await expect(subSubBarra).toBeHidden();
    }

    // Navega a Planificador desde la barra inferior
    const btnPlanificador = page.locator('#bottomTabBarMovil button[data-tab="2"]');
    await btnPlanificador.click();

    // Ahora la sub-sub-barra debe existir y ser visible
    await expect(subSubBarra).toBeVisible();
  });

  test('En Planificador 2026 debe permitir conmutar entre 1° Cuatrimestre y Alternativas de 2° Cuatrimestre', async ({ page }) => {
    // Navega a Planificador
    await page.locator('#bottomTabBarMovil button[data-tab="2"]').click();

    const subSubBarra = page.locator('#subSubTabBarInferiorMovil');
    await expect(subSubBarra).toBeVisible();

    // 1. Clic en botón de 1° Cuatrimestre en la sub-sub-barra
    const btn1C = subSubBarra.locator('button:has-text("1° Cuat"), button:has-text("1C")').first();
    await expect(btn1C).toBeVisible();
    await btn1C.click();

    // Verifica que el calendario de 1er cuatrimestre q1body sea visible
    const calQ1 = page.locator('#q1body');
    await expect(calQ1).toBeVisible();

    // 2. Clic en botón de Alternativa 2 en la sub-sub-barra
    const btnAlt2 = subSubBarra.locator('button:has-text("Alt 2")').first();
    await expect(btnAlt2).toBeVisible();
    await btnAlt2.click();

    // Verifica que el calendario de la alternativa 2 q2a2body sea visible
    const calQ2A2 = page.locator('#q2a2body');
    await expect(calQ2A2).toBeVisible();
  });

  test('Al volver a Seguimiento la sub-sub-barra debe ocultarse automáticamente', async ({ page }) => {
    // Ir a Planificador y luego regresar a Seguimiento
    await page.locator('#bottomTabBarMovil button[data-tab="2"]').click();
    await expect(page.locator('#subSubTabBarInferiorMovil')).toBeVisible();

    await page.locator('#bottomTabBarMovil button[data-tab="1"]').click();
    await expect(page.locator('#subSubTabBarInferiorMovil')).toBeHidden();
  });
});
