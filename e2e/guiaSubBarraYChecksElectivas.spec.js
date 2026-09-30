// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Sub-Barra Guía Académica, Chevrones y Checks en Electivas', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Las pestañas de cada año en el planificador no deben tener iconos de calendario ni birrete', async ({ page }) => {
    // Navega a Planificador
    await page.locator('#bottomTabBarMovil button[data-tab="2"]').click();

    const subPills = page.locator('#subTabBarInferiorMovil .sub-tab-pill');
    await expect(subPills.first()).toBeVisible();

    const count = await subPills.count();
    for (let i = 0; i < count; i++) {
      const texto = await subPills.nth(i).textContent();
      // No debe contener emojis de calendario ni birrete
      expect(texto).not.toMatch(/[📅🎓]/);
    }
  });

  test('La Guía Académica debe tener su sub-barra de opciones y buscador integrado', async ({ page }) => {
    // Navega a Guía Académica (tab 4)
    await page.locator('#bottomTabBarMovil button[data-tab="4"]').click();

    const subBarra = page.locator('#subTabBarInferiorMovil');
    await expect(subBarra).toBeVisible();

    // Debe contener las opciones de Guía (Todo, Plan, Transición, Electivas, Normativas)
    const pills = subBarra.locator('.sub-tab-pill');
    await expect(pills).toHaveCount(5);

    // Debe existir un buscador integrado visible para Guía
    const buscador = page.locator('#guiaBuscadorFlotanteMovil');
    await expect(buscador).toBeVisible();
  });

  test('Las materias electivas cursadas/aprobadas deben tener el check verde en la esquina superior derecha', async ({ page }) => {
    // Navega a Guía Académica
    await page.locator('#bottomTabBarMovil button[data-tab="4"]').click();

    // Conmuta a la sección de electivas
    const btnElectivas = page.locator('#subTabBarInferiorMovil button:has-text("Electivas")').first();
    if (await btnElectivas.isVisible()) {
      await btnElectivas.click();
    }

    // Al menos una electiva o tarjeta con check verde debe evaluarse
    const checks = page.locator('.guia-card .badge-check-cursada');
    // Verificar selector y que el elemento tenga estilo con fondo verde o texto '✔'
    const primerCheck = checks.first();
    await expect(primerCheck).toBeVisible();
    await expect(primerCheck).toHaveText(/✔/);
  });

  test('Las barras que desborden horizontalmente deben contener indicadores chevron de scroll lateral', async ({ page }) => {
    // Al cargar la vista en móvil (390px), las barras con scroll horizontal deben inyectar sus chevrones
    const chevrons = page.locator('.tab-chevron');
    await expect(chevrons.first()).toBeAttached();
  });
});

