import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de Visualización de Materias Electivas y Acreditación de Horas en el Mapa Curricular.
 * Valida que materias como Comunicación Gráfica y Visual, Química y optativas de 3º nivel
 * se muestren en el Mapa Curricular con sus tarjetas y cómputo de horas del bloque.
 */

test.describe('Materias Electivas y Acreditación de Horas en Mapa Curricular', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });
  });

  test('debe mostrar las materias electivas y acreditaciones K08 en la columna de Nivel 3 con el chip de horas', async ({ page }) => {
    await page.locator('.super-tab.sp1').click();
    await page.getByRole('button', { name: /Mapa Curricular K23/i }).click();

    // Inyecta en datosAlumno: Comunicación Gráfica (232071) y Química (081420)
    await page.evaluate(() => {
      const datos = window.datosGlobales.datosAlumno;
      datos.materiasAprobadas = datos.materiasAprobadas.filter(m => m.id !== '082092' && m.id !== '082091' && m.id !== '232071');
      datos.materiasAprobadas.push({
        id: '082092',
        codigoSIU: '232071',
        nombre: 'Comunicación Gráfica y Visual',
        estado: 'aprobada',
        modalidad: 'equivalencia_k08',
        origenPlan: 'K08_homologada',
        materiaOrigenK08: 'Sistemas de Representación (951601)',
        nota: 8,
        fechaAprobacion: '2026-02-24',
        libro: 'EQ01',
        folio: '55',
        plan: 'K23',
        esAcreditacionElectiva: true,
        horasRelojAcreditadas: 72
      });
      datos.materiasAprobadas.push({
        id: '082091',
        codigoSIU: '081420',
        nombre: 'Química',
        estado: 'aprobada',
        modalidad: 'promocion',
        origenPlan: 'K08_homologada',
        materiaOrigenK08: 'Química (081420)',
        nota: 9,
        fechaAprobacion: '2020-12-10',
        libro: 'XX01',
        folio: '10',
        plan: 'K23',
        esAcreditacionElectiva: true,
        horasRelojAcreditadas: 72
      });
      if (typeof window.renderizarMapaCurricular === 'function') {
        window.renderizarMapaCurricular();
      }
    });

    // 1. Valida que la tarjeta de Comunicación Gráfica y Visual sea visible en el Mapa Curricular
    const tarjetaGrafica = page.locator('.acc-card:has-text("Comunicación Gráfica y Visual")');
    await expect(tarjetaGrafica).toBeVisible();
    await expect(tarjetaGrafica.locator('.acc-badges')).toContainText(/Acredita 72hs/i);

    // 2. Valida que la tarjeta de Química sea visible en el Mapa Curricular
    const tarjetaQuimica = page.locator('.acc-card:has-text("Química")');
    await expect(tarjetaQuimica).toBeVisible();
    await expect(tarjetaQuimica.locator('.acc-badges')).toContainText(/Acredita 72hs/i);

    // 3. Valida el chip de progreso acumulado del Bloque 3º/4º (144 / 240 hs)
    const chipProgreso = page.locator('.chip-bloque-electivas:has-text("Bloque 3.º/4.º")');
    await expect(chipProgreso).toContainText(/304\s*\/\s*240\s*hs/i);
    await expect(chipProgreso).toContainText(/Cumplido/i);
  });
});
