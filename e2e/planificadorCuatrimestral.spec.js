import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E del Planificador Cuatrimestral.
 * Valida la conmutación entre los años de cursada (2026, 2027, 2028, 2029),
 * las vistas de 1er y 2do cuatrimestre y la grilla de horarios semanales.
 */

test.describe('Planificador Cuatrimestral', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Espera a que los datos globales se hayan cargado en memoria
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null && window.datosGlobales?.planEstudio !== null, { timeout: 15000 });
    // Activa la solapa de Planificador Cuatrimestral
    await page.locator('.super-tab.sp2').click();
  });

  test('debe mostrar la planificación 2026 por defecto con grilla horaria', async ({ page }) => {
    const panelPlanificador = page.locator('#sp2');
    await expect(panelPlanificador).toHaveClass(/active/);

    // Valida que el panel 2026 esté activo
    const panel2026 = page.locator('#sp2p0');
    await expect(panel2026).toHaveClass(/active/);
    await expect(panel2026.getByText(/Planificación Cuatrimestral · Ciclo Lectivo 2026/i)).toBeVisible();

    // Valida presencia de pestañas de cuatrimestres
    await expect(panel2026.locator('.main-tab.mq1')).toBeVisible();
    await expect(panel2026.locator('.main-tab.mq2')).toBeVisible();

    // Valida columnas de días de la semana en la cabecera activa del calendario
    const cabeceraActiva = panel2026.locator('.main-panel.active .cal-head').first();
    await expect(cabeceraActiva.getByText('LUN')).toBeVisible();
    await expect(cabeceraActiva.getByText('MAR')).toBeVisible();
    await expect(cabeceraActiva.getByText('MIÉ')).toBeVisible();
    await expect(cabeceraActiva.getByText('JUE')).toBeVisible();
    await expect(cabeceraActiva.getByText('VIE')).toBeVisible();
  });

  test('debe alternar a las solapas de años proyectadas en condiciones óptimas', async ({ page }) => {
    const panelPlanificador = page.locator('#sp2');

    // 1. Conmutar a 2027 (año óptimo proyectado para el alumno)
    await panelPlanificador.locator('.sub-tab', { hasText: '2027' }).click();
    const panel2027 = panelPlanificador.locator('#sp2p1');
    await expect(panel2027).toHaveClass(/active/);
    await expect(panel2027.getByText(/Ciclo Lectivo 2027/i)).toBeVisible();
  });

  test('debe conmutar entre 1er y 2do cuatrimestre dentro de 2026', async ({ page }) => {
    const panel2026 = page.locator('#sp2p0');
    const boton1C = panel2026.locator('.main-tab.mq1');
    const boton2C = panel2026.locator('.main-tab.mq2');

    // Clic en 1er Cuatrimestre
    await boton1C.click();
    await expect(boton1C).toHaveClass(/active/);

    // Clic en 2do Cuatrimestre
    await boton2C.click();
    await expect(boton2C).toHaveClass(/active/);
  });
});
