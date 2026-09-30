import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de Selección de Materias en Estrategia, Modal de Avance
 * y Separación de Carga de PDF vs Análisis de Horarios en Planificador.
 */

test.describe('Estrategia con Selección y Planificador Separado', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });
  });

  test('el cliente resiliente de Gemini debe usar los modelos de alta disponibilidad', async ({ page }) => {
    const modelos = await page.evaluate(() => {
      return window.MODELOS_GEMINI_OFICIALES || null;
    });

    expect(modelos).not.toBeNull();
    expect(modelos).toEqual(['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.8-flash']);
  });

  test('debe permitir seleccionar materias sugeridas en Estrategia y persistirlas', async ({ page }) => {
    await page.locator('.super-tab.sp1').click();
    await page.getByRole('button', { name: /Estrategia & Correlatividades/i }).click();

    // Guardamos una estrategia simulada para probar la UI de checkboxes
    await page.evaluate(() => {
      const estrategiaSim = {
        materiasPrioritarias: [
          { id: '232034', nombre: 'Diseño de Sistemas de Información', tipo: 'Anual', motivo: 'Eje integrador' },
          { id: '232032', nombre: 'Comunicación de Datos', tipo: 'Cuatrimestral', motivo: 'Redes' }
        ],
        finalesUrgentes: [],
        diagnosticoRuta: 'Ruta simulada para pruebas'
      };
      window.guardarEstrategiaRecomendada(estrategiaSim);
      window.renderizarEstrategia();
    });

    const panelEstrategia = page.locator('#sp1p3');
    const checkboxes = panelEstrategia.locator('.chk-materia-estrategia');
    await expect(checkboxes).toHaveCount(2);

    // Tildamos la primera materia
    await checkboxes.first().check();

    const seleccionadas = await page.evaluate(() => {
      return typeof window.obtenerMateriasSeleccionadasEstrategia === 'function'
        ? window.obtenerMateriasSeleccionadasEstrategia()
        : null;
    });

    expect(seleccionadas).not.toBeNull();
    expect(seleccionadas).toContain('232034');
  });

  test('el planificador debe tener los botones "Cargar horarios" y "Analizar horarios de cursada"', async ({ page }) => {
    await page.locator('.super-tab.sp2').click();
    const panelPlanificador = page.locator('#sp2');

    // Botón 1: Cargar horarios (solo PDF a Firebase)
    const btnCargar = panelPlanificador.locator('.btn-oferta-horarios');
    await expect(btnCargar).toBeVisible();
    await expect(btnCargar).toHaveText('Cargar horarios');

    // Botón 2: Analizar horarios de cursada
    const btnAnalizar = panelPlanificador.locator('.btn-analizar-horarios');
    await expect(btnAnalizar).toBeVisible();
    await expect(btnAnalizar).toContainText('Analizar horarios de cursada');
  });

  test('debe existir el modal de progreso interactivo con etapas de avance', async ({ page }) => {
    const existeModal = await page.evaluate(() => {
      if (typeof window.abrirModalProgresoIA !== 'function') return false;
      window.abrirModalProgresoIA('Analizando con IA...');
      const modal = document.getElementById('modalProgresoIa');
      const tieneBarra = !!document.getElementById('barraProgresoIa');
      window.cerrarModalProgresoIA();
      return !!modal && tieneBarra;
    });

    expect(existeModal).toBe(true);
  });
});
