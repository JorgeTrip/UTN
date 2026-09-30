// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Título de Módulo Bajo Badges y Header Solo-Avatar', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('El menú sándwich superior debe estar eliminado o completamente oculto', async ({ page }) => {
    const menuToggle = page.locator('#menuToggle');
    await expect(menuToggle).toBeHidden();
  });

  test('El título del módulo activo debe ubicarse verticalmente debajo de los badges institucionales', async ({ page }) => {
    const badgeRow = page.locator('.g-header .g-badge-row');
    const titulo = page.locator('#gMobileTitle');

    await expect(badgeRow).toBeVisible();
    await expect(titulo).toBeVisible();

    const boxBadge = await badgeRow.boundingBox();
    const boxTitulo = await titulo.boundingBox();

    expect(boxBadge).not.toBeNull();
    expect(boxTitulo).not.toBeNull();

    if (boxBadge && boxTitulo) {
      // La coordenada Y del título debe ser mayor o igual al fondo de la fila de badges (debajo y no al lado)
      expect(boxTitulo.y).toBeGreaterThanOrEqual(boxBadge.y + boxBadge.height - 2);
    }
  });

  test('El avatar debe ser el único botón de menú en la cabecera móvil y abrir el panel de cuenta', async ({ page }) => {
    const avatar = page.locator('.g-header .avatar-btn-header');
    await expect(avatar).toBeVisible();

    // Al hacer clic en el avatar se debe abrir el menú lateral drawer
    await avatar.click();
    const drawer = page.locator('.mobile-menu-drawer');
    await expect(drawer).toBeVisible();
  });
});
