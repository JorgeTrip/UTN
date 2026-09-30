// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Apertura y Cierre Confiable del Menú Avatar (Móvil y Desktop)', () => {
  test('En móvil (390px), al hacer clic en el avatar se debe abrir el menú drawer móvil', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const avatarBtn = page.locator('.avatar-btn-header');
    await expect(avatarBtn).toBeVisible();

    // Estado inicial: overlay cerrado
    const overlay = page.locator('#mobileMenuOverlay');
    await expect(overlay).not.toHaveClass(/open/);

    // Clic en avatar
    await avatarBtn.click();

    // Debe abrirse el menú móvil
    await expect(overlay).toHaveClass(/open/);
    const drawer = page.locator('.mobile-menu-drawer');
    await expect(drawer).toBeVisible();

    // Las opciones deben ser visibles
    await expect(page.locator('#saludoUsuarioMenuMovil')).toBeVisible();
    await expect(page.locator('#btnEditarPerfilMovil')).toBeVisible();

    // Cerrar con el botón de cerrar
    const btnCerrar = page.locator('.mobile-menu-close-btn');
    await btnCerrar.click();
    await expect(overlay).not.toHaveClass(/open/);
  });

  test('En escritorio (1280px), al hacer clic en el avatar se debe desplegar el avatarDropdown', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const avatarBtn = page.locator('.avatar-btn-header');
    await expect(avatarBtn).toBeVisible();

    const dropdown = page.locator('#avatarDropdown');
    await expect(dropdown).not.toHaveClass(/open/);

    // Clic en avatar
    await avatarBtn.click();

    // Debe desplegarse el dropdown
    await expect(dropdown).toHaveClass(/open/);
    await expect(dropdown).toBeVisible();
    await expect(dropdown.locator('text=Editar Perfil / Datos')).toBeVisible();

    // Clic afuera para cerrar
    await page.locator('header').click({ position: { x: 10, y: 10 } });
    await expect(dropdown).not.toHaveClass(/open/);
  });
});
