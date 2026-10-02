import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de la Landing Page Pública con Parallax y el Simulador de Ritmo de Cursada.
 */

test.describe('Landing Page y Simulador de Ritmo', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__MODO_TEST_E2E__ = true;
      window.__TEST_GATEKEEPER__ = true;
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.planEstudio !== null, { timeout: 15000 });
  });

  test('debe mostrar la landing pública con parallax, beneficios y footer con autoría', async ({ page }) => {
    const landing = page.locator('#landingPageRoot');
    await expect(landing).toBeVisible();

    // Valida elementos del Hero y fondo con imagen parallax
    await expect(landing.locator('.landing-title')).toContainText('Tomá el control total de tu carrera en UTN');
    await expect(landing.locator('.landing-badge')).toContainText('Portal Académico Gratuito');
    await expect(landing.locator('#heroParallaxBg')).toBeAttached();

    // Valida que exista únicamente el botón principal de acceso
    const botonesAcceso = landing.locator('.landing-actions button');
    await expect(botonesAcceso).toHaveCount(1);
    await expect(botonesAcceso.first()).toContainText('Comenzar Gratis / Ingresar');

    // Valida formas para el efecto parallax
    await expect(landing.locator('.shape-1')).toBeAttached();
    await expect(landing.locator('.shape-2')).toBeAttached();
    await expect(landing.locator('.shape-3')).toBeAttached();

    // Valida que existan las 6 tarjetas de funcionalidades
    const tarjetas = landing.locator('.landing-card');
    await expect(tarjetas).toHaveCount(6);

    // Valida footer con autoría de Jorge O. Tripodi y copyright
    const footer = landing.locator('.landing-footer');
    await expect(footer).toContainText('Jorge O. Tripodi');
    await expect(footer).toContainText('Todos los derechos reservados');
  });

  test('debe permitir simular el ritmo de cursada y recalcular el año de graduación en vivo', async ({ page }) => {
    // 1. Ingresa a la app desde la Landing
    await page.locator('.btn-landing-prim').first().click();
    const modalAuth = page.locator('#modalAuth');
    await modalAuth.locator('#authInputEmail').fill('estudiante.ritmo@alumnos.utn.ba');
    await modalAuth.locator('#authInputPassword').fill('ClaveSegura123!');
    await modalAuth.locator('#btnAuthSubmit').click();

    // 2. Espera a estar en el Dashboard
    await expect(modalAuth).not.toHaveClass(/open/);
    await expect(page.locator('.super-tab-bar')).toBeVisible();

    // 3. Valida presencia del Simulador de Ritmo en Hitos
    const cardSimulador = page.locator('.simulador-ritmo-card');
    await expect(cardSimulador).toBeVisible();

    // 4. Modifica el slider de ritmo a 4 materias por año
    const slider = page.locator('#sliderRitmoMaterias');
    await expect(slider).toBeVisible();
    await slider.fill('4');
    await slider.dispatchEvent('input');

    // 5. Valida que el texto y el año se actualicen reactivamente
    await expect(page.locator('#txtRitmoSeleccionado')).toContainText('4 materias / año');
    const anioGraduacion = await page.locator('#txtAnioGraduacionSimulado').textContent();
    expect(Number(anioGraduacion)).toBeGreaterThanOrEqual(2026);

    // 6. Diagnóstico explicativo
    await expect(page.locator('#txtDiagnosticoSimulador')).toBeVisible();
  });
});
