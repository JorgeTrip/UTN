// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Menú Avatar Móvil Completo, No Ocluido y Chevron Hacia Abajo', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('El saludo en el encabezado móvil debe estar oculto para liberar espacio', async ({ page }) => {
    const saludoHeader = page.locator('#saludoUsuarioHeader');
    await expect(saludoHeader).toBeHidden();
  });

  test('El chevron conector de la barra inferior debe apuntar hacia abajo', async ({ page }) => {
    const conector = page.locator('#bottomTabBarMovil .bottom-tab-item.active .tab-connector-arrow');
    await expect(conector).toBeVisible();

    const borderTopWidth = await conector.evaluate(el => window.getComputedStyle(el).borderTopWidth);
    const borderBottomWidth = await conector.evaluate(el => window.getComputedStyle(el).borderBottomWidth);

    // Apuntando hacia abajo implica que tiene border-top sólido y border-bottom 0
    expect(parseFloat(borderTopWidth)).toBeGreaterThan(0);
    expect(parseFloat(borderBottomWidth)).toBe(0);
  });

  test('Al hacer clic en el avatar en móvil, se debe abrir el menú de usuario sin ser tapado por el header', async ({ page }) => {
    const avatar = page.locator('.avatar-btn-header');
    await avatar.click();

    // El drawer u overlay debe estar abierto
    const drawer = page.locator('.mobile-menu-drawer');
    await expect(drawer).toBeVisible();

    // Verificar que el z-index del drawer sea mayor al del header (header suele ser 900)
    const zIndexDrawer = await drawer.evaluate(el => parseInt(window.getComputedStyle(el).zIndex, 10));
    expect(zIndexDrawer).toBeGreaterThanOrEqual(1000);

    // Saludo al tope del menú móvil
    const saludoMenu = page.locator('#saludoUsuarioMenuMovil');
    await expect(saludoMenu).toBeVisible();
    await expect(saludoMenu).toContainText('Hola');

    // Paridad 1:1 de opciones de cuenta
    await expect(page.locator('#btnEditarPerfilMovil')).toBeVisible();
    await expect(page.locator('#btnTemaMovil')).toBeVisible();
    await expect(page.locator('#btnExportarBackupMovil')).toBeVisible();
    await expect(page.locator('#inputImportarBackupMovilWrap')).toBeVisible();
    await expect(page.locator('#btnAcercaDeMovil')).toBeVisible();
    await expect(page.locator('#btnCerrarSesionMovil')).toBeVisible();
  });
});
