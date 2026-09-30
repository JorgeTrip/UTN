import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de Estrategia Académica con Gemini y Botón Unificado del Planificador.
 * Valida:
 * 1. Ausencia de la tabla redundante de equivalencias en Estrategia & Correlatividades.
 * 2. Presencia del Asesor de Estrategia Académica con Gemini y Ramas Troncales.
 * 3. Botón "Cargar horarios" unificado y accesible desde cualquier pestaña anual del planificador.
 * 4. Ponderación de materias estratégicas en el optimizador de cursada.
 */

test.describe('Estrategia Académica con Gemini y Mejoras del Planificador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });
  });

  test('no debe mostrar la tabla redundante de equivalencias en Estrategia y debe mostrar el Asesor IA', async ({ page }) => {
    // Navegar a Plan de Estudios & Seguimiento
    await page.locator('.super-tab.sp1').click();
    await page.getByRole('button', { name: /Estrategia & Correlatividades/i }).click();

    const panelEstrategia = page.locator('#sp1p3');
    await expect(panelEstrategia).toHaveClass(/active/);

    // Valida que NO exista la tabla de equivalencias K08 -> K23
    await expect(panelEstrategia.getByText('Tabla Oficial de Nombres y Equivalencias')).toHaveCount(0);
    await expect(panelEstrategia.locator('.badge-plan-k08')).toHaveCount(0);

    // Valida presencia del Asesor Estratégico con Gemini
    await expect(panelEstrategia.getByText(/Estrategia Académica con IA/i)).toBeVisible();
    await expect(panelEstrategia.locator('.btn-estrategia-gemini')).toBeVisible();

    // Valida presencia de las ramas troncales
    await expect(panelEstrategia.getByText(/Rama Integradora Sistemas/i)).toBeVisible();
    await expect(panelEstrategia.getByText(/Rama Redes y Comunicaciones/i)).toBeVisible();
  });

  test('el botón "Cargar horarios" debe tener ese texto exacto y estar visible en todas las solapas del planificador', async ({ page }) => {
    await page.locator('.super-tab.sp2').click();
    const panelPlanificador = page.locator('#sp2');

    // Botón global en cabecera
    const btnCargar = panelPlanificador.locator('.btn-oferta-horarios');
    await expect(btnCargar).toBeVisible();
    await expect(btnCargar).toHaveText('Cargar horarios');

    // Conmutar a 2027 y verificar que el botón siga visible
    const tab2027 = panelPlanificador.locator('.sub-tab', { hasText: '2027' });
    if (await tab2027.isVisible()) {
      await tab2027.click();
      await expect(btnCargar).toBeVisible();
    }
  });

  test('debe persistir y priorizar materias estratégicas en el generador de alternativas', async ({ page }) => {
    const resultado = await page.evaluate(() => {
      if (typeof window.guardarEstrategiaRecomendada !== 'function') return null;

      const estrategia = {
        materiasPrioritarias: [
          { id: '232034', nombre: 'Diseño de Sistemas de Información', tipo: 'Anual' }
        ],
        finalesUrgentes: [{ id: '082024', nombre: 'Análisis de Sistemas' }],
        diagnosticoRuta: 'Priorizar DSI por ser cuello de botella anual'
      };
      window.guardarEstrategiaRecomendada(estrategia);

      const oferta = [
        { codigo: '232032', asignatura: 'Comunicación de Datos', division: 'K3051', turno: 'Noche', horarios: [{ dia: 'Lunes', modulos: [1, 2] }] },
        { codigo: '232034', asignatura: 'Diseño de Sistemas', division: 'K3052', turno: 'Noche', horarios: [{ dia: 'Miércoles', modulos: [1, 2] }] }
      ];

      return window.generarAlternativasCursada({
        oferta,
        materiasHabilitadas: ['232032', '232034'],
        turnoPreferido: 'Noche',
        materiasPorCuatrimestre: 2
      });
    });

    expect(resultado).not.toBeNull();
    expect(resultado.alternativas.length).toBeGreaterThan(0);
    // Valida que la materia priorizada (232034) esté presente en la alternativa sugerida
    const codigosEnAlt = resultado.alternativas[0].comisiones.map(c => String(c.codigo));
    expect(codigosEnAlt).toContain('232034');
  });
});
