import { test, expect } from '@playwright/test';

test.describe('KPIs de Hitos, Bloque Electivas Nivel 4 y Cajas SIU Full-Width', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });
  });

  test('debe mostrar el chip de Bloque 3º/4º en Nivel 3 y también en Nivel 4 del Mapa Curricular', async ({ page }) => {
    await page.locator('.super-tab.sp1').click();
    await page.getByRole('button', { name: /Mapa Curricular K23/i }).click();

    // Verificamos que tanto en la columna de Nivel 3 como de Nivel 4 aparezca el chip del Bloque 3.º/4.º
    const chipsBloque34 = page.locator('.chip-bloque-electivas:has-text("Bloque 3.º/4.º")');
    await expect(chipsBloque34).toHaveCount(2);

    // Ambas deben mostrar las mismas horas y porcentaje
    const textoChip1 = await chipsBloque34.nth(0).textContent();
    const textoChip2 = await chipsBloque34.nth(1).textContent();
    expect(textoChip1).toContain('Bloque 3.º/4.º');
    expect(textoChip2).toContain('Bloque 3.º/4.º');
    expect(textoChip1).toEqual(textoChip2);
  });

  test('debe computar materias firmadas en el KPI de Finales Pendientes ("Mochila")', async ({ page }) => {
    // Inyectamos una materia con estado "firmada" en materiasEnCurso
    await page.evaluate(() => {
      const datos = window.datosGlobales.datosAlumno;
      datos.materiasEnCurso = datos.materiasEnCurso || [];
      datos.materiasEnCurso.push({
        id: '232018',
        nombre: 'Sistemas Operativos',
        estado: 'firmada',
        plan: 'K23'
      });
      if (typeof window.renderizarHitosCarrera === 'function') {
        window.renderizarHitosCarrera();
      }
    });

    await page.locator('.super-tab.sp1').click();
    await page.getByRole('button', { name: /Hitos & KPIs/i }).click();

    const kpiMochila = page.locator('.kpi-card:has(.kpi-lbl:has-text("Finales Pendientes"))');
    await expect(kpiMochila).toBeVisible();
    const valorMochila = await kpiMochila.locator('.kpi-val').textContent();
    expect(Number(valorMochila.trim())).toBeGreaterThanOrEqual(1);
    await expect(kpiMochila.locator('.kpi-sub')).not.toContainText('Sin finales pendientes registrados');
  });

  test('debe calcular la Distribución Real por Nivel usando el catálogo K23', async ({ page }) => {
    await page.locator('.super-tab.sp1').click();
    await page.getByRole('button', { name: /Hitos & KPIs/i }).click();

    // Verificamos que Nivel 1 no sea 0/8 si hay materias aprobadas de primer nivel en datosAlumno
    const kpiNivel1 = page.locator('.kpi-card:has(.kpi-lbl:has-text("Nivel 1")) .kpi-val');
    await expect(kpiNivel1).toBeVisible();
    const textoNivel1 = await kpiNivel1.textContent();
    const [aprobadasN1] = textoNivel1.split('/');
    expect(Number(aprobadasN1.trim())).toBeGreaterThan(0);
  });

  test('los textareas del SIU deben ser full-width y mostrar guías explicativas', async ({ page }) => {
    // 1. Textarea en modal de Materia (Exámenes)
    await page.locator('.super-tab.sp1').click();
    await page.getByRole('button', { name: /Mapa Curricular K23/i }).click();
    await page.evaluate(() => {
      if (typeof window.abrirModalEditarMateria === 'function') {
        window.abrirModalEditarMateria('232032');
      }
    });

    const btnToggle = page.locator('#btnTogglePegarExamenSIU');
    await btnToggle.click();

    const inputExamen = page.locator('#inputPegarExamenSIU');
    await expect(inputExamen).toBeVisible();
    const anchoInput = await inputExamen.evaluate(el => el.getBoundingClientRect().width);
    const anchoContenedor = await page.locator('#contenedorPegarExamenSIU').evaluate(el => el.getBoundingClientRect().width);
    // Debe ocupar al menos el 85% del contenedor del modal (full-width)
    expect(anchoInput / anchoContenedor).toBeGreaterThan(0.85);

    // 2. Textarea en modal Importador SIU (Historia Académica)
    await page.evaluate(() => {
      if (typeof window.cerrarModalMateria === 'function') {
        window.cerrarModalMateria();
      }
      if (typeof window.abrirModalImportadorSIU === 'function') {
        window.abrirModalImportadorSIU();
      }
    });

    const textoHistoria = page.locator('#textoHistoriaSIU');
    await expect(textoHistoria).toBeVisible();
    const anchoHistoria = await textoHistoria.evaluate(el => el.getBoundingClientRect().width);
    const anchoModal = await page.locator('#modalImportadorSIU .modal-body').evaluate(el => el.getBoundingClientRect().width);
    expect(anchoHistoria / anchoModal).toBeGreaterThan(0.85);
  });
});
