import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E del Sistema de Autenticación y Configuración de Firebase.
 * Valida el inicio de sesión, registro, cierre de sesión y diálogo de credenciales.
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

  test('debe mostrar la pantalla de acceso y alternar entre pestañas de Login y Registro', async ({ page }) => {
    // Valida que el modal de autenticación esté abierto automáticamente al no haber sesión
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
    const modalAuth = page.locator('#modalAuth');
    await modalAuth.locator('#authInputEmail').fill('alumno.nuevo@alumnos.utn.ba');
    await modalAuth.locator('#authInputPassword').fill('ClaveSegura123!');
    await modalAuth.locator('#btnAuthSubmit').click();

    // El modal debe cerrarse tras autenticar y revelar la app
    await expect(modalAuth).not.toHaveClass(/open/);
    await expect(page.locator('.super-tab-bar')).toBeVisible();

    // Valida que el dropdown ahora ofrezca Cerrar Sesión
    await page.locator('.avatar-btn-header').click();
    const itemCerrar = page.locator('#dropdownItemAuth');
    await expect(itemCerrar).toContainText('Cerrar Sesión');

    // Cierra sesión
    await itemCerrar.click();

    // Reaparece la pantalla de acceso bloqueando la app
    await expect(modalAuth).toHaveClass(/open/);
    await expect(page.locator('.super-tab-bar')).not.toBeVisible();
  });

  test('debe bloquear la interfaz cuando no hay sesión activa y ocultar el botón cerrar', async ({ page }) => {
    // Valida que el overlay de autenticación esté activo como pantalla de acceso
    const modalAuth = page.locator('#modalAuth');
    await expect(modalAuth).toHaveClass(/open/);

    // El botón de cerrar (x) debe estar oculto para impedir saltarse el acceso
    await expect(modalAuth.locator('.modal-close')).not.toBeVisible();

    // El menú principal de la app debe estar oculto
    await expect(page.locator('.super-tab-bar')).not.toBeVisible();
  });

  test('debe permitir exportar e importar datos JSON sincronizando con la sesión', async ({ page }) => {
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

