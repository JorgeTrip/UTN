import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de Cabecera, Menú Avatar, Gemini Transparente y Links Útiles al Final.
 * Valida:
 * 1. Saludo "Hola, [Nombre]!" a la izquierda inmediata del avatar.
 * 2. "Cerrar Sesión" como última opción del menú dropdown del avatar.
 * 3. Gemini API disponible internamente sin requerir configuración previa (transparente).
 * 4. Links Útiles ubicada al final de las solapas y Plan de Estudios activa por defecto.
 */

test.describe('Cabecera, Menú Avatar, Gemini Transparente y Links al Final', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });
  });

  test('debe mostrar el saludo "Hola, Jorge!" a la izquierda del avatar', async ({ page }) => {
    const saludo = page.locator('#saludoUsuarioHeader');
    await expect(saludo).toBeVisible();
    await expect(saludo).toContainText('Hola, Jorge!');
  });

  test('debe ubicar "Cerrar Sesión" como la última opción del menú avatar', async ({ page }) => {
    // Abrir menú avatar
    await page.locator('.avatar-btn-header').click();
    const dropdown = page.locator('#avatarDropdown');
    await expect(dropdown).toHaveClass(/open/);

    const items = dropdown.locator('.dropdown-item');
    const ultimoItem = items.last();
    await expect(ultimoItem).toContainText('Cerrar Sesión');
  });

  test('la API Key de Gemini debe estar disponible internamente sin requerir ingreso manual', async ({ page }) => {
    // Limpiamos cualquier clave manual de localStorage
    await page.evaluate(() => localStorage.removeItem('gemini_api_key_utn'));

    const key = await page.evaluate(() => {
      return typeof window.obtenerApiKeyGemini === 'function' ? window.obtenerApiKeyGemini() : null;
    });

    expect(key).not.toBeNull();
    expect(key.length).toBeGreaterThan(20);
    expect(key).toContain('AQ.');
  });

  test('Links Útiles debe ser la última solapa y Plan de Estudios la primera y activa por defecto', async ({ page }) => {
    const solapas = page.locator('.super-tab-bar .super-tab');
    await expect(solapas).toHaveCount(4);

    // Primera solapa: Plan de Estudios & Seguimiento (activa)
    const primeraSolapa = solapas.first();
    await expect(primeraSolapa).toContainText('Plan de Estudios & Seguimiento');
    await expect(primeraSolapa).toHaveClass(/active/);

    // Última solapa: Links Útiles
    const ultimaSolapa = solapas.last();
    await expect(ultimaSolapa).toContainText('Links Útiles');

    // Panel sp1 activo por defecto
    await expect(page.locator('#sp1')).toHaveClass(/active/);
  });
});
