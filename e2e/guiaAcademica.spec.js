import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de la Guía Académica, Normativas y FAQ Institucional (Super Panel 4).
 * Valida la conmutación al panel, carga de sedes, sistema RTF y conversor de horas.
 */

test.describe('Guía Académica y Normativa UTN (Super Panel 4)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.planEstudio !== null, { timeout: 15000 });
    // Navega a la solapa de Guía Académica & FAQ
    await page.locator('.super-tab.sp4').click();
  });

  test('debe mostrar la cabecera de la guía institucional y el buscador', async ({ page }) => {
    const panelGuia = page.locator('#sp4');
    await expect(panelGuia).toHaveClass(/active/);

    // Valida títulos y descripción
    await expect(panelGuia.getByText(/Guía Académica, Normativas & FAQ/i)).toBeVisible();
    await expect(panelGuia.locator('#guiaBuscadorInput')).toBeVisible();
  });

  test('debe listar las sedes institucionales Campus y Medrano', async ({ page }) => {
    const panelGuia = page.locator('#sp4');

    // Valida tarjetas de sedes
    await expect(panelGuia.getByText('Campus Mozorelos')).toBeVisible();
    await expect(panelGuia.getByText(/Mozart 2300/i)).toBeVisible();
    await expect(panelGuia.getByText('Medrano (Sede Central)')).toBeVisible();
    await expect(panelGuia.getByText(/Av. Medrano 951/i)).toBeVisible();
  });

  test('debe mostrar el Sistema RTF y optimización de Peso Académico', async ({ page }) => {
    const panelGuia = page.locator('#sp4');

    // Valida Sistema RTF y Peso Académico
    await expect(panelGuia.getByText(/Sistema RTF/i)).toBeVisible();
    await expect(panelGuia.getByText(/Optimización de Peso Académico/i)).toBeVisible();
  });

  test('debe operar el conversor dinámico de horas cátedra a reloj', async ({ page }) => {
    const panelGuia = page.locator('#sp4');
    const inputCatedra = panelGuia.locator('#inputHorasCatedra');
    const resultado = panelGuia.locator('#resultadoHorasReloj');

    await expect(inputCatedra).toBeVisible();
    await expect(resultado).toContainText('3.75 hs reloj');

    // Modifica las horas cátedra a 10
    await inputCatedra.fill('10');
    await expect(resultado).toContainText('7.50 hs reloj');
  });

  test('debe filtrar contenido en vivo mediante el buscador', async ({ page }) => {
    const panelGuia = page.locator('#sp4');
    const buscador = panelGuia.locator('#guiaBuscadorInput');

    // Filtra por 'Campus'
    await buscador.fill('Campus');
    await expect(panelGuia.getByText('Campus Mozorelos')).toBeVisible();

    // Limpia y filtra por 'RTF'
    await buscador.fill('RTF');
    await expect(panelGuia.getByText(/Sistema RTF/i)).toBeVisible();
  });

  test('debe permitir conmutar a la tabla oficial de equivalencias K08 -> K23 y catálogo de electivas', async ({ page }) => {
    const panelGuia = page.locator('#sp4');

    // Conmuta a Transición K08 -> K23
    await panelGuia.locator('button:has-text("🔄 Transición K08 ➔ K23")').click();
    await expect(panelGuia.getByRole('cell', { name: 'Matemática Discreta' })).toBeVisible();
    await expect(panelGuia.getByRole('cell', { name: 'Lógica y Estructuras Discretas' })).toBeVisible();
    await expect(panelGuia.getByRole('cell', { name: 'Matemática Superior' })).toBeVisible();
    await expect(panelGuia.getByRole('cell', { name: 'Análisis Numérico' })).toBeVisible();

    // Conmuta a Electivas & Bloques
    await panelGuia.locator('button:has-text("🧩 Electivas & Bloques")').click();
    await expect(panelGuia.getByText(/Bloque 3.º y 4.º Nivel/i)).toBeVisible();
    await expect(panelGuia.getByText('Ciberseguridad', { exact: true })).toBeVisible();
  });
});
