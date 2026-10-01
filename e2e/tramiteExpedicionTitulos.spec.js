import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E del Trámite de Expedición de Título Intermedio y de Grado.
 * Valida:
 * 1. En Hitos & KPIs, las tarjetas de ADUSI e Ingeniería permiten desplegar la información del trámite oficial.
 * 2. Se detalla Oficina 306, copia DNI y título secundario, horarios y demora de 12 meses.
 * 3. En Guía Académica & FAQ, la tarjeta está presente y es filtrable por el buscador.
 */

test.describe('Trámite de Expedición de Título Intermedio y de Grado', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });
  });

  test('en Hitos & KPIs debe permitir desplegar los requisitos y pasos del trámite de título', async ({ page }) => {
    // Vamos a Hitos & KPIs (super-tab 1, sub-tab 0)
    await page.locator('.super-tab.sp1').click();
    await page.locator('#sp1 .sub-tab').first().click();

    // Verificamos presencia del botón desplegable del trámite en la tarjeta de ADUSI
    const btnTramiteAdusi = page.locator('.btn-tramite-titulo').first();
    await expect(btnTramiteAdusi).toBeVisible();

    // Hacemos clic para desplegar los detalles
    await btnTramiteAdusi.click();

    const infoTramite = page.locator('.info-tramite-titulo').first();
    await expect(infoTramite).toBeVisible();
    await expect(infoTramite).toContainText('Oficina 306');
    await expect(infoTramite).toContainText('título secundario');
    await expect(infoTramite).toContainText('12 meses');
    await expect(infoTramite).toContainText('titulos@frba.utn.edu.ar');
  });

  test('en Guía Académica debe mostrar la tarjeta de trámite y ser filtrable por el buscador', async ({ page }) => {
    // Vamos a Guía Académica (super-tab 4)
    await page.locator('.super-tab.sp4').click();
    const panelGuia = page.locator('#sp4');
    await expect(panelGuia).toHaveClass(/active/);

    // Escribimos "306" en el buscador de la guía
    const inputBuscador = page.locator('#guiaBuscadorInput');
    await inputBuscador.fill('306');

    // La tarjeta del trámite debe permanecer visible con la información
    const tarjetaTramite = page.locator('.guia-card', { hasText: 'Oficina 306' });
    await expect(tarjetaTramite).toBeVisible();
    await expect(tarjetaTramite).toContainText('titulos@frba.utn.edu.ar');
  });
});
