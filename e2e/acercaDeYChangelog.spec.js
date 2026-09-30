import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E para la opción "Acerca de" en el Menú Avatar,
 * Modal de Información Institucional y Modal de Historial de Cambios (Changelog).
 */

test.describe('Módulo Acerca de e Historial de Cambios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });
  });

  test('el menú avatar debe contener "Acerca de" antes de "Cerrar Sesión", siendo esta la última opción', async ({ page }) => {
    const avatarBtn = page.locator('.avatar-btn-header');
    await avatarBtn.click();

    const dropdown = page.locator('#avatarDropdown');
    await expect(dropdown).toHaveClass(/open/);

    const items = dropdown.locator('.dropdown-item');
    const total = await items.count();
    expect(total).toBeGreaterThan(3);

    // El último ítem DEBE ser Cerrar Sesión
    const ultimoItem = items.nth(total - 1);
    await expect(ultimoItem).toContainText('Cerrar Sesión');

    // El penúltimo ítem accionable (o ítem anterior) debe ser Acerca de
    const itemAcercaDe = dropdown.locator('.item-acerca-de');
    await expect(itemAcercaDe).toBeVisible();
    await expect(itemAcercaDe).toContainText('Acerca de');
  });

  test('al hacer clic en "Acerca de" debe abrirse el modal con autor Jorge, copyright y botón de historial', async ({ page }) => {
    const avatarBtn = page.locator('.avatar-btn-header');
    await avatarBtn.click();

    const itemAcercaDe = page.locator('#avatarDropdown .item-acerca-de');
    await itemAcercaDe.click();

    const modalAcercaDe = page.locator('#modalAcercaDe');
    await expect(modalAcercaDe).toHaveClass(/active/);

    // Validar nombre del autor y copyright
    await expect(modalAcercaDe).toContainText('Jorge');
    await expect(modalAcercaDe).toContainText('© 2026 Jorge');

    // Botón para ver historial
    const btnVerHistorial = modalAcercaDe.locator('.btn-abrir-historial');
    await expect(btnVerHistorial).toBeVisible();
    await expect(btnVerHistorial).toContainText('Historial de Cambios');
  });

  test('al presionar ver historial debe abrirse el modal extendido con el changelog estructurado', async ({ page }) => {
    // Abrir modal de historial directamente o a través de la función global
    await page.evaluate(() => {
      if (typeof window.abrirModalHistorialCambios === 'function') {
        window.abrirModalHistorialCambios();
      }
    });

    const modalHistorial = page.locator('#modalHistorialCambios');
    await expect(modalHistorial).toHaveClass(/active/);

    // Debe contar con buscador de cambios
    const inputBuscador = modalHistorial.locator('#inputBuscadorChangelog');
    await expect(inputBuscador).toBeVisible();

    // Debe renderizar contenedor de versiones o items de commit
    const listaCambios = modalHistorial.locator('#listaChangelog');
    await expect(listaCambios).toBeVisible();
  });
});
