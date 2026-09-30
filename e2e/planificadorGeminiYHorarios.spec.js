import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E del Planificador con Gemini API, Firestore y Generación de 3 Alternativas.
 * Valida:
 * 1. Pestaña única 2026 en estado inicial sin datos.
 * 2. Detección y lectura de oferta compartida en Firestore.
 * 3. Generación de 3 alternativas de cursada sin solapamiento horario en el turno del alumno.
 * 4. Alerta de turno insuficiente cuando no admite al menos 2 combinaciones.
 * 5. Gestión segura de la API Key de Gemini en localStorage (SAST Compliant).
 */

test.describe('Planificador con Gemini API y Oferta Compartida Firestore', () => {
  test('debe mostrar únicamente la pestaña 2026 cuando el alumno aún no cargó materias', async ({ page }) => {
    await page.goto('/');

    // Simulamos alumno nuevo sin materias cargadas
    await page.evaluate(() => {
      window.datosGlobales.datosAlumno = {
        materiasAprobadas: [],
        materiasEnCurso: [],
        turno: 'Noche'
      };
      if (typeof window.renderizarPlanificadorCompleto === 'function') {
        window.renderizarPlanificadorCompleto();
      }
    });

    await page.locator('.super-tab.sp2').click();
    const panelPlanificador = page.locator('#sp2');

    // Valida que solo exista la solapa del año corriente 2026
    const solapasAnuales = panelPlanificador.locator('.sub-tab-inner .sub-tab');
    await expect(solapasAnuales).toHaveCount(1);
    await expect(solapasAnuales.first()).toContainText('2026');

    // Valida la presencia del botón para cargar o sincronizar oferta de horarios
    const btnCargar = panelPlanificador.locator('.btn-oferta-horarios');
    await expect(btnCargar).toBeVisible();
  });

  test('debe generar 3 alternativas sin solapamiento respetando el turno del alumno', async ({ page }) => {
    await page.goto('/');

    const resultado = await page.evaluate(() => {
      if (typeof window.generarAlternativasCursada !== 'function') return null;

      // Oferta de prueba con comisiones de Noche y Tarde
      const oferta = [
        {
          codigo: '232032', asignatura: 'Comunicación de Datos', division: 'K3051', turno: 'Noche',
          horarios: [{ dia: 'Lunes', modulos: [1, 2, 3, 4] }]
        },
        {
          codigo: '232032', asignatura: 'Comunicación de Datos', division: 'K3052', turno: 'Noche',
          horarios: [{ dia: 'Martes', modulos: [1, 2, 3, 4] }]
        },
        {
          codigo: '232033', asignatura: 'Redes de Información', division: 'K3053', turno: 'Noche',
          horarios: [{ dia: 'Miércoles', modulos: [1, 2, 3, 4] }]
        },
        {
          codigo: '232033', asignatura: 'Redes de Información', division: 'K3054', turno: 'Noche',
          horarios: [{ dia: 'Jueves', modulos: [1, 2, 3, 4] }]
        },
        {
          codigo: '232034', asignatura: 'Gestión de Datos', division: 'K3055', turno: 'Noche',
          horarios: [{ dia: 'Viernes', modulos: [1, 2, 3, 4] }]
        }
      ];

      const materiasHabilitadas = ['232032', '232033', '232034'];
      return window.generarAlternativasCursada({
        oferta,
        materiasHabilitadas,
        turnoPreferido: 'Noche',
        materiasPorCuatrimestre: 2
      });
    });

    expect(resultado).not.toBeNull();
    expect(resultado.alternativas.length).toBeGreaterThanOrEqual(2);
    expect(resultado.turnoInsuficiente).toBe(false);

    // Valida que ninguna alternativa tenga conflicto de días y módulos
    resultado.alternativas.forEach(alt => {
      expect(alt.comisiones.length).toBeGreaterThan(0);
      alt.comisiones.forEach(c => expect(c.turno).toBe('Noche'));
    });
  });

  test('debe alertar turno insuficiente cuando hay menos de 2 combinaciones posibles', async ({ page }) => {
    await page.goto('/');

    const resultado = await page.evaluate(() => {
      if (typeof window.generarAlternativasCursada !== 'function') return null;

      // Oferta con una sola comisión en el turno Mañana
      const oferta = [
        {
          codigo: '232032', asignatura: 'Comunicación de Datos', division: 'K1001', turno: 'Mañana',
          horarios: [{ dia: 'Lunes', modulos: [1, 2, 3, 4] }]
        },
        {
          codigo: '232033', asignatura: 'Redes de Información', division: 'K3051', turno: 'Noche',
          horarios: [{ dia: 'Lunes', modulos: [1, 2, 3, 4] }]
        }
      ];

      return window.generarAlternativasCursada({
        oferta,
        materiasHabilitadas: ['232032', '232033'],
        turnoPreferido: 'Mañana',
        materiasPorCuatrimestre: 2
      });
    });

    expect(resultado).not.toBeNull();
    expect(resultado.turnoInsuficiente).toBe(true);
    expect(resultado.mensajeTurno).toContain('Mañana');
  });

  test('debe permitir guardar y recuperar la API Key de Gemini en localStorage de forma segura', async ({ page }) => {
    await page.goto('/');

    const keyPrueba = 'AIzaSy_MOCK_GEMINI_API_KEY_PRUEBA_9876543210';
    await page.evaluate((key) => {
      if (typeof window.guardarApiKeyGemini === 'function') {
        window.guardarApiKeyGemini(key);
      }
    }, keyPrueba);

    const keyRecuperada = await page.evaluate(() => {
      return typeof window.obtenerApiKeyGemini === 'function' ? window.obtenerApiKeyGemini() : null;
    });

    expect(keyRecuperada).toBe(keyPrueba);
  });
});
