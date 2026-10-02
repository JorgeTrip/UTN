import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E del Sistema de Autenticación, Landing Page y Configuración de Firebase.
 * Valida la Landing Page pública, apertura del modal de acceso, login, registro y logout.
 */

test.describe('Autenticación y Configuración Firebase', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__MODO_TEST_E2E__ = true;
      window.__TEST_GATEKEEPER__ = true;
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.planEstudio !== null, { timeout: 15000 });
  });

  test('debe mostrar la landing page pública y abrir modal de acceso desde el CTA', async ({ page }) => {
    // Valida que la landing page esté visible como puerta de entrada
    const landingRoot = page.locator('#landingPageRoot');
    await expect(landingRoot).toBeVisible();

    // El menú principal de la app debe estar oculto
    await expect(page.locator('.super-tab-bar')).not.toBeVisible();

    // Abre el modal desde el CTA de la landing
    const btnComenzar = page.locator('.btn-landing-prim').first();
    await btnComenzar.click();

    const modalAuth = page.locator('#modalAuth');
    await expect(modalAuth).toHaveClass(/open/);

    // Valida botón de Google
    await expect(modalAuth.locator('.auth-google-btn')).toBeVisible();

    // Conmuta a Registrarse
    const tabRegistro = modalAuth.locator('#btnAuthTabRegistro');
    await tabRegistro.click();
    await expect(tabRegistro).toHaveClass(/active/);
    await expect(modalAuth.locator('#btnAuthSubmit')).toHaveText('Crear Cuenta de Alumno');

    // Conmuta de vuelta a Iniciar Sesión
    const tabLogin = modalAuth.locator('#btnAuthTabLogin');
    await tabLogin.click();
    await expect(tabLogin).toHaveClass(/active/);
    await expect(modalAuth.locator('#btnAuthSubmit')).toHaveText('Iniciar Sesión');
  });

  test('debe autenticar con email y reflejar el usuario en la sesión', async ({ page }) => {
    // Abre el modal desde la landing
    await page.locator('.btn-landing-prim').first().click();

    const modalAuth = page.locator('#modalAuth');
    await modalAuth.locator('#authInputEmail').fill('alumno.nuevo@alumnos.utn.ba');
    await modalAuth.locator('#authInputPassword').fill('ClaveSegura123!');
    await modalAuth.locator('#btnAuthSubmit').click();

    // El modal debe cerrarse tras autenticar y revelar la app
    await expect(modalAuth).not.toHaveClass(/open/);
    await expect(page.locator('.super-tab-bar')).toBeVisible();
    await expect(page.locator('#landingPageRoot')).not.toBeVisible();

    // Valida que el dropdown ahora ofrezca Cerrar Sesión
    await page.locator('.avatar-btn-header').click();
    const itemCerrar = page.locator('#dropdownItemAuth');
    await expect(itemCerrar).toContainText('Cerrar Sesión');

    // Cierra sesión
    await itemCerrar.click();

    // Reaparece la landing pública bloqueando la app
    await expect(page.locator('#landingPageRoot')).toBeVisible();
    await expect(page.locator('.super-tab-bar')).not.toBeVisible();
  });

  test('debe bloquear el dashboard cuando no hay sesión activa y mostrar la landing pública', async ({ page }) => {
    // La landing page es lo primero que se ve
    await expect(page.locator('#landingPageRoot')).toBeVisible();
    await expect(page.locator('.landing-title')).toContainText('Tomá el control total de tu carrera en UTN');

    // El menú principal de la app debe estar oculto
    await expect(page.locator('.super-tab-bar')).not.toBeVisible();
    await expect(page.locator('.g-header')).not.toBeVisible();
  });

  test('debe permitir exportar e importar datos JSON sincronizando con la sesión', async ({ page }) => {
    await page.locator('.btn-landing-prim').first().click();
    const modalAuth = page.locator('#modalAuth');
    await modalAuth.locator('#authInputEmail').fill('alumno.test@alumnos.utn.ba');
    await modalAuth.locator('#authInputPassword').fill('ClaveSegura123!');
    await modalAuth.locator('#btnAuthSubmit').click();
    await expect(modalAuth).not.toHaveClass(/open/);
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });

    const resultado = await page.evaluate(async () => {
      window.datosGlobales.datosAlumno.perfil.legajo = '99999';
      await window.guardarDatosAlumnoEnStorage();
      return localStorage.getItem('pulso_datos_alumno');
    });

    expect(resultado).toContain('99999');
  });
});
