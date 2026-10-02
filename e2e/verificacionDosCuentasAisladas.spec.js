import { test, expect } from '@playwright/test';

test.describe('Aislamiento estricto entre dos cuentas de usuario', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__MODO_TEST_E2E__ = true;
      window.__TEST_GATEKEEPER__ = true;
    });
  });

  test('dos cuentas distintas deben mantener datos de cursada completamente separados', async ({ page }) => {
    // 1. Visitar la aplicación
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.planEstudio !== null, { timeout: 15000 });

    // 2. Iniciar sesión con Cuenta A
    await page.locator('.btn-landing-prim').first().click();
    const modalAuth = page.locator('#modalAuth');
    await modalAuth.locator('#authInputEmail').fill('cuentaA@utn.ba');
    await modalAuth.locator('#authInputPassword').fill('ClaveSeguraA123!');
    await modalAuth.locator('#btnAuthSubmit').click();
    
    // Si hay error en el modal lo capturamos:
    const errorMsg = await modalAuth.locator('#authErrorMsg').textContent();
    console.log('Mensaje de error en modal auth:', errorMsg);
    await expect(modalAuth).not.toHaveClass(/open/);

    // Esperar a que se carguen los datos de la Cuenta A
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 10000 });

    // 3. Cargar información de cursada en Cuenta A (ej: agregar Análisis Matemático I aprobada con 8)
    await page.evaluate(async () => {
      window.datosGlobales.datosAlumno.materiasAprobadas = [
        { id: '232001', nombre: 'Análisis Matemático I', nota: 8, estado: 'aprobada', modalidad: 'promocion' }
      ];
      window.datosGlobales.datosAlumno.perfil.legajo = '111-AAA';
      await window.guardarDatosAlumnoEnStorage();
      if (typeof window.renderizarUI === 'function') window.renderizarUI();
    });

    // Validar que en Cuenta A se refleja la materia aprobada y su legajo
    const materiasA = await page.evaluate(() => window.datosGlobales?.datosAlumno?.materiasAprobadas?.length || 0);
    expect(materiasA).toBe(1);

    // 4. Cerrar sesión de Cuenta A
    await page.locator('.avatar-btn-header').click();
    await page.locator('#dropdownItemAuth').click();
    await expect(page.locator('#landingPageRoot')).toBeVisible();

    // 5. Iniciar sesión con Cuenta B (cuenta distinta)
    await page.locator('.btn-landing-prim').first().click();
    await modalAuth.locator('#authInputEmail').fill('cuentaB@utn.ba');
    await modalAuth.locator('#authInputPassword').fill('ClaveSeguraB123!');
    await modalAuth.locator('#btnAuthSubmit').click();
    await expect(modalAuth).not.toHaveClass(/open/);

    // Esperar a que cargue la sesión de Cuenta B
    await page.waitForFunction(() => {
      const u = window.servicioAuth?.obtenerUsuarioActual();
      return u && (u.email === 'cuentaB@utn.ba');
    }, { timeout: 10000 });

    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 10000 });

    // 6. ¡VERIFICACIÓN CRÍTICA! Cuenta B no debe heredar materias ni legajo de Cuenta A
    const materiasB = await page.evaluate(() => window.datosGlobales?.datosAlumno?.materiasAprobadas || []);
    const legajoB = await page.evaluate(() => window.datosGlobales?.datosAlumno?.perfil?.legajo || '');

    expect(materiasB).toHaveLength(0);
    expect(legajoB).not.toBe('111-AAA');
  });
});
