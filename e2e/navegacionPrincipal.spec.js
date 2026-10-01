import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de Navegación de Solapas Principales (Super Tabs).
 * Verifica que las solapas principales carguen y alternen correctamente
 * mostrando el contenido esperado en cada panel.
 */

test.describe('Navegación de Solapas Principales', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Espera a que los datos globales se hayan cargado en memoria
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null && window.datosGlobales?.planEstudio !== null, { timeout: 15000 });
  });

  test('debe cargar la cabecera institucional con datos del alumno', async ({ page }) => {
    // Verifica título institucional según la solapa activa inicial y datos del alumno
    const titulo = page.locator('#gMobileTitle');
    await expect(titulo).toBeVisible();

    const subtitulo = page.locator('.g-sub');
    await expect(subtitulo).toContainText('Jorge Osvaldo Tripodi');
    await expect(subtitulo).toContainText('172-060.0');

    // Verifica badges de UTN y Plan K23
    await expect(page.locator('.gb-utn')).toHaveText('UTN · FRBA');
    await expect(page.locator('.gb-k23')).toHaveText('Plan K23');
  });

  test('debe mostrar la pestaña de Plan de Estudios & Seguimiento por defecto', async ({ page }) => {
    const panelSeguimiento = page.locator('#sp1');
    await expect(panelSeguimiento).toHaveClass(/active/);

    // Debe mostrar la barra de sub-solapas de seguimiento
    await expect(page.getByRole('button', { name: /Hitos & KPIs/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Mapa Curricular K23/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Peso Académico UTN/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Estrategia & Correlatividades/i })).toBeVisible();
  });

  test('debe navegar a Links Útiles al presionar su solapa al final de la barra', async ({ page }) => {
    // Clic en la solapa de Links Útiles (ubicada al final)
    await page.locator('.super-tab.sp0').click();

    const panelLinks = page.locator('#sp0');
    await expect(panelLinks).toHaveClass(/active/);
    await expect(page.locator('#sp1')).not.toHaveClass(/active/);

    // Verifica que se rendericen accesos institucionales clave
    await expect(panelLinks.locator('.link-title', { hasText: 'SIU Guaraní' })).toBeVisible();
    await expect(panelLinks.locator('.link-title', { hasText: 'Ventanilla DISI' })).toBeVisible();
    await expect(panelLinks.locator('.link-title', { hasText: 'Aulas Virtuales' })).toBeVisible();
    await expect(panelLinks.locator('.link-title', { hasText: 'CEIT-FMyT' })).toBeVisible();
    await expect(panelLinks.locator('.link-title', { hasText: 'Biblioteca UTN' })).toBeVisible();
  });

  test('debe navegar a Planificador Cuatrimestral al presionar su solapa', async ({ page }) => {
    // Clic en la tercera solapa principal
    await page.locator('.super-tab.sp2').click();

    const panelPlanificador = page.locator('#sp2');
    await expect(panelPlanificador).toHaveClass(/active/);
    await expect(page.locator('#sp0')).not.toHaveClass(/active/);

    // Debe mostrar las solapas anuales calculadas dinámicamente para el alumno
    await expect(panelPlanificador.locator('.sub-tab', { hasText: '2026' })).toBeVisible();
    await expect(panelPlanificador.locator('.sub-tab', { hasText: '2027' })).toBeVisible();
  });
});
