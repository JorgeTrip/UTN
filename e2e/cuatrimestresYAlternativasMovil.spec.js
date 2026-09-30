// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Cuatrimestres y Alternativas en Móvil: Ocultación en Cuerpo y Sincronización Inferior', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Navega a Planificador (tab 2)
    await page.locator('#bottomTabBarMovil button[data-tab="2"]').click();
    await page.waitForTimeout(300);
  });

  test('Las pestañas de cuatrimestres y alternativas en el cuerpo del planificador deben estar ocultas en móvil', async ({ page }) => {
    // Las pestañas .main-tab y .plan-sub-tab dentro de #sp2 no deben ser visibles en viewport móvil
    const mainTabsVisibles = page.locator('#sp2 .main-tabs-inner:visible, #sp2 .main-tab:visible');
    await expect(mainTabsVisibles).toHaveCount(0);

    const planSubTabsVisibles = page.locator('#sp2 .plan-sub-tab-inner:visible, #sp2 .plan-sub-tab:visible');
    await expect(planSubTabsVisibles).toHaveCount(0);
  });

  test('Al seleccionar una alternativa, se debe marcar la alternativa y el cuatrimestre padre correspondiente', async ({ page }) => {
    const barraTerciaria = page.locator('#subSubTabBarInferiorMovil');
    await expect(barraTerciaria).toBeVisible();

    const btnAlt2 = barraTerciaria.locator('.sub-sub-pill[data-tipo="alt"][data-valor="1"]'); // Alt 2
    await btnAlt2.click();

    // Alt 2 debe estar activa
    await expect(btnAlt2).toHaveClass(/active/);

    // 2° Cuat debe estar activo como cuatrimestre padre
    const btnCuat2 = barraTerciaria.locator('.sub-sub-pill[data-tipo="cuat"][data-valor="1"]');
    await expect(btnCuat2).toHaveClass(/active/);

    // 1° Cuat y Alt 1 deben estar inactivos
    const btnCuat1 = barraTerciaria.locator('.sub-sub-pill[data-tipo="cuat"][data-valor="0"]');
    const btnAlt1 = barraTerciaria.locator('.sub-sub-pill[data-tipo="alt"][data-valor="0"]');
    await expect(btnCuat1).not.toHaveClass(/active/);
    await expect(btnAlt1).not.toHaveClass(/active/);
  });

  test('Al seleccionar un cuatrimestre con alternativas, se debe marcar el cuatrimestre y la primer alternativa por defecto', async ({ page }) => {
    const barraTerciaria = page.locator('#subSubTabBarInferiorMovil');
    const btnCuat2 = barraTerciaria.locator('.sub-sub-pill[data-tipo="cuat"][data-valor="1"]'); // 2° Cuat
    await btnCuat2.click();

    // 2° Cuat debe estar activo
    await expect(btnCuat2).toHaveClass(/active/);

    // La primera alternativa (Alt 1) debe marcarse por defecto
    const btnAlt1 = barraTerciaria.locator('.sub-sub-pill[data-tipo="alt"][data-valor="0"]');
    await expect(btnAlt1).toHaveClass(/active/);

    // 1° Cuat debe estar inactivo
    const btnCuat1 = barraTerciaria.locator('.sub-sub-pill[data-tipo="cuat"][data-valor="0"]');
    await expect(btnCuat1).not.toHaveClass(/active/);
  });

  test('Al seleccionar 1° Cuatrimestre, únicamente se marca 1° Cuat y ninguna alternativa', async ({ page }) => {
    const barraTerciaria = page.locator('#subSubTabBarInferiorMovil');
    const btnCuat1 = barraTerciaria.locator('.sub-sub-pill[data-tipo="cuat"][data-valor="0"]'); // 1° Cuat
    await btnCuat1.click();

    // 1° Cuat debe estar activo
    await expect(btnCuat1).toHaveClass(/active/);

    // 2° Cuat y todas las alternativas deben estar inactivas
    const btnCuat2 = barraTerciaria.locator('.sub-sub-pill[data-tipo="cuat"][data-valor="1"]');
    await expect(btnCuat2).not.toHaveClass(/active/);

    const altsActivas = barraTerciaria.locator('.sub-sub-pill[data-tipo="alt"].active');
    await expect(altsActivas).toHaveCount(0);
  });
});
