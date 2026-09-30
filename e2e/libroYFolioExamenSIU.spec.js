import { test, expect } from '@playwright/test';

test.describe('Libro y Folio de Exámenes SIU en Tarjeta de Materia', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });
  });

  test('debe mostrar Libro, Folio y Acta Oficial en la tarjeta desplegada tras pegar examen de SIU', async ({ page }) => {
    await page.locator('.super-tab.sp1').click();
    await page.getByRole('button', { name: /Mapa Curricular K23/i }).click();

    // Abrimos el modal para editar Comunicación de Datos
    await page.evaluate(() => {
      window.abrirModalEditarMateria('232032');
    });

    // Abrimos el área de pegado de SIU
    await page.locator('#btnTogglePegarExamenSIU').click();

    // Pegamos la fila copiada de la sección Exámenes del SIU
    const filaSIU = 'ISI\tComunicación de Datos\t29/09/2026\t10\tAprobado\t283282\t2026\tFINALES DE SETIEMBRE 2026 - GRADO\tK0128\t197';
    await page.locator('#inputPegarExamenSIU').fill(filaSIU);
    await page.locator('#btnProcesarExamenSIU').click();

    // Guardamos la materia
    await page.getByRole('button', { name: /Guardar Materia/i }).click();

    // Buscamos la tarjeta de Comunicación de Datos en el Mapa Curricular
    const tarjeta = page.locator('.acc-card:has-text("Comunicación de Datos")');
    await expect(tarjeta).toBeVisible();

    // Desplegamos el acordeón si no está desplegado
    await tarjeta.locator('.acc-header').click();

    // Validamos que se muestre el Acta Oficial con Libro K0128 y Folio 197
    const filaActa = tarjeta.locator('.acc-row:has(.acc-row-lbl:has-text("Acta Oficial"))');
    await expect(filaActa).toBeVisible();
    await expect(filaActa).toContainText('K0128');
    await expect(filaActa).toContainText('197');
  });
});
