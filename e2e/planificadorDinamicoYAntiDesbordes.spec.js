import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de:
 * 1. Menú Avatar Anti-Desbordes con emails extensos.
 * 2. Planificador Cuatrimestral dinámico sin textos hardcodeados.
 * 3. Desglose en hover de tarjetas de Peso Académico y Glosario dinámico.
 */

test.describe('Planificador Dinámico, Menú Anti-Desbordes y Tooltips de Peso', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });
  });

  test('el menú avatar no debe desbordar con email largo y debe mostrar subtítulo elíptico', async ({ page }) => {
    // Simulamos usuario autenticado con email extenso
    await page.evaluate(() => {
      window.servicioAuth = {
        obtenerUsuarioActual: () => ({ email: 'universomecanico2022@gmail.com', uid: 'test-uid' }),
        cerrarSesion: async () => {}
      };
      if (typeof window.actualizarOpcionesSesionDropdown === 'function') {
        window.actualizarOpcionesSesionDropdown({ email: 'universomecanico2022@gmail.com', uid: 'test-uid' });
      }
    });

    // Abrimos el menú del avatar
    await page.locator('.avatar-btn-header').click();
    const dropdown = page.locator('#avatarDropdown');
    await expect(dropdown).toHaveClass(/open/);

    // Verificamos que el botón de cierre de sesión contenga el grupo de texto con subtítulo
    const itemAuth = page.locator('#dropdownItemAuth');
    await expect(itemAuth).toBeVisible();
    await expect(itemAuth).toContainText('Cerrar Sesión');
    await expect(itemAuth).toContainText('universomecanico2022@gmail.com');

    // Comprobamos que el ancho del dropdown contenga al item sin desborde horizontal
    const dropdownBox = await dropdown.boundingBox();
    const itemBox = await itemAuth.boundingBox();
    expect(itemBox.width).toBeLessThanOrEqual(dropdownBox.width + 2);

    // Verificamos que el dropdown no exceda el viewport
    const viewport = page.viewportSize();
    expect(dropdownBox.x + dropdownBox.width).toBeLessThanOrEqual(viewport.width);
  });

  test('en Planificador las solapas y alternativas no deben contener textos fijos hardcodeados', async ({ page }) => {
    await page.locator('.super-tab.sp2').click();
    await page.waitForTimeout(300);

    const textoPlanificador = await page.locator('#sp2').textContent();
    // No deben existir los textos fijos del prototipo
    expect(textoPlanificador).not.toContain('· Nivel 4 y 5');
    expect(textoPlanificador).not.toContain('· Proyecto Final');
    expect(textoPlanificador).not.toContain('· Cierre & Graduación');
    expect(textoPlanificador).not.toContain('· N4');
    expect(textoPlanificador).not.toContain('N4/N5');
  });

  test('en Peso Académico las tarjetas individuales deben mostrar tooltip con materias computadas en hover', async ({ page }) => {
    await page.locator('.super-tab.sp1').click();
    await page.locator('button:has-text("Peso Académico UTN")').click();
    await page.waitForTimeout(300);

    // Verificamos que exista al menos una tarjeta con tooltip
    const subpanelPeso = page.locator('#sp1p2');
    await expect(subpanelPeso).toHaveClass(/active/);

    const tarjetaCma = subpanelPeso.locator('.calc-item').first();
    await expect(tarjetaCma).toBeVisible();

    const tooltip = tarjetaCma.locator('.tooltip-desglose');
    await expect(tooltip).toBeAttached();

    // Hacemos hover y comprobamos que se active
    await tarjetaCma.hover();
    await expect(tooltip).toBeVisible();
  });
});
