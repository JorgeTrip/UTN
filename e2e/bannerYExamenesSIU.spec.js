import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E para:
 * 1. Banner de horas cumplidas en modal de electivas de 3º/4º nivel.
 * 2. Pegado rápido y extracción de filas de la sección "Exámenes" del SIU Guaraní.
 */

test.describe('Banner de Electivas y Parser de Exámenes SIU', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });
  });

  test('debe mostrar el banner de horas cumplidas al abrir el modal de electivas de 3º nivel si supera 240 hs', async ({ page }) => {
    // Inyecta datos que superen 240 hs (Química 72hs + Sistemas Repr 72hs + 2 electivas de 80hs = 304 hs)
    await page.evaluate(() => {
      const datos = window.datosGlobales.datosAlumno;
      datos.materiasAprobadas.push({
        id: '082092',
        nombre: 'Comunicación Gráfica y Visual',
        estado: 'aprobada',
        horasRelojAcreditadas: 72,
        esAcreditacionElectiva: true
      });
      datos.materiasAprobadas.push({
        id: '081420',
        nombre: 'Química',
        estado: 'aprobada',
        horasRelojAcreditadas: 72,
        esAcreditacionElectiva: true
      });
      datos.materiasAprobadas.push({
        id: '082116',
        nombre: 'Ciberseguridad',
        estado: 'aprobada',
        horasReloj: 80,
        esElectiva: true
      });
      datos.materiasAprobadas.push({
        id: '082117',
        nombre: 'Gestión del Talento Humano',
        estado: 'aprobada',
        horasReloj: 80,
        esElectiva: true
      });
      if (typeof window.abrirModalElectiva === 'function') {
        window.abrirModalElectiva(3);
      }
    });

    const modalElectiva = page.locator('#modalElectiva');
    await expect(modalElectiva).toHaveClass(/open/);

    const bannerAviso = modalElectiva.locator('#bannerHorasElectivasCumplidas');
    await expect(bannerAviso).toBeVisible();
    await expect(bannerAviso).toContainText(/Horas de Electivas Cumplidas|¡Requisito de horas cumplido!/i);
    await expect(bannerAviso).toContainText(/No es necesario/i);
    await expect(bannerAviso).toContainText(/(304|608)\s*\/\s*240\s*hs/i);
  });

  test('debe parsear la fila tabular de Exámenes del SIU y registrar el final con nota, libro y folio', async ({ page }) => {
    await page.locator('.super-tab.sp1').click();
    await page.getByRole('button', { name: /Mapa Curricular K23/i }).click();

    // Abre el modal para editar Comunicación de Datos (232032)
    await page.evaluate(() => {
      window.abrirModalEditarMateria('232032');
    });

    const modalEditar = page.locator('#modalMateria');
    await expect(modalEditar).toHaveClass(/open/);

    // Muestra el área de pegado de examen SIU
    const btnToggleSiu = modalEditar.locator('#btnTogglePegarExamenSIU');
    await expect(btnToggleSiu).toBeVisible();
    await btnToggleSiu.click();

    const inputPegarSiu = modalEditar.locator('#inputPegarExamenSIU');
    await expect(inputPegarSiu).toBeVisible();

    const filaExamenSIU = `Propuesta	Actividad	Fecha	Nota	Resultado	Nro. Acta	Año Académico	Turno Examen	Libro	Folio
ISI	Comunicación de Datos	29/09/2026	10	Aprobado	283282	2026	FINALES DE SETIEMBRE 2026 - GRADO	K0128	197`;

    await inputPegarSiu.fill(filaExamenSIU);
    await modalEditar.locator('#btnProcesarExamenSIU').click();

    // Valida que la lista de finales ahora contenga el examen importado con nota 10, libro y folio
    const listaFinales = modalEditar.locator('#listaLlamadosFinales');
    await expect(listaFinales).toContainText('10');
    await expect(listaFinales).toContainText('K0128');
    await expect(listaFinales).toContainText('197');
    await expect(listaFinales).toContainText('283282');

    // Valida que la evaluación refleja el final aprobado en avisoFinalesModal
    await expect(modalEditar.locator('#avisoFinalesModal')).toContainText(/Examen final aprobado con nota 10/i);
  });
});
