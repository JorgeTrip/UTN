import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E para la persistencia en Firestore de la Estrategia Académica,
 * registro de fecha de generación y remoción de paréntesis en el título.
 */

test.describe('Estrategia Académica Persistente con Fecha y Título Limpio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });
  });

  test('el título de la sección debe ser "💡 Estrategia Académica con IA" sin paréntesis de modelos', async ({ page }) => {
    await page.locator('.super-tab.sp1').click();
    await page.getByRole('button', { name: /Estrategia & Correlatividades/i }).click();

    const panelEstrategia = page.locator('#sp1p3');
    await expect(panelEstrategia).toBeVisible();

    const titulo = panelEstrategia.locator('.sec').first();
    await expect(titulo).toHaveText('💡 Estrategia Académica con IA');
  });

  test('debe registrar y mostrar la fecha de la última consulta en la interfaz', async ({ page }) => {
    await page.locator('.super-tab.sp1').click();
    await page.getByRole('button', { name: /Estrategia & Correlatividades/i }).click();

    // Inyectamos una estrategia simulada con fecha
    await page.evaluate(() => {
      const fechaPrueba = '2026-09-30T20:30:00.000Z';
      window.guardarEstrategiaRecomendada({
        fechaGeneracion: fechaPrueba,
        fechaFormateada: '30/09/2026, 17:30 hs',
        diagnosticoRuta: 'Ruta académica de prueba persistida',
        materiasPrioritarias: [
          { id: '232034', nombre: 'Diseño de Sistemas de Información', tipo: 'Anual', motivo: 'Eje troncal' }
        ],
        finalesUrgentes: []
      });
      window.renderizarEstrategia();
    });

    const badgeFecha = page.locator('#sp1p3 .badge-fecha-estrategia');
    await expect(badgeFecha).toBeVisible();
    await expect(badgeFecha).toContainText('30/09/2026');
  });

  test('debe existir la función de sincronización con Firestore para persistir la estrategia', async ({ page }) => {
    const tieneFuncion = await page.evaluate(() => {
      return typeof window.persistirEstrategiaFirestore === 'function' ||
             typeof window.servicioFirestore?.guardarEstrategia === 'function';
    });

    expect(tieneFuncion).toBe(true);
  });
});
