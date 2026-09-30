import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de Sub-solapas de Plan de Estudios y Seguimiento.
 * Valida la conmutación y renderizado dinámico de los cuatro sub-paneles:
 * Hitos & KPIs, Mapa Curricular K23, Peso Académico y Estrategia.
 */

test.describe('Sub-solapas de Plan de Estudios y Seguimiento', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Espera a que los datos globales se hayan cargado en memoria
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null && window.datosGlobales?.planEstudio !== null, { timeout: 15000 });
    // Activa la solapa de Plan de Estudios & Seguimiento
    await page.locator('.super-tab.sp1').click();
  });

  test('debe mostrar Hitos & KPIs con métricas de carrera por defecto', async ({ page }) => {
    const subpanelHitos = page.locator('#sp1p0');
    await expect(subpanelHitos).toHaveClass(/active/);

    // Valida títulos e hitos principales
    await expect(subpanelHitos.getByText('Títulos e Hitos Principales')).toBeVisible();
    await expect(subpanelHitos.getByText('Título Intermedio', { exact: true })).toBeVisible();
    await expect(subpanelHitos.getByText(/Analista Desarrollador Univ/i)).toBeVisible();
    await expect(subpanelHitos.getByText(/Ingeniero en Sistemas de Información/i).first()).toBeVisible();

    // Valida KPIs de métricas académicas
    await expect(subpanelHitos.getByText('Materias Aprobadas', { exact: true })).toBeVisible();
    await expect(subpanelHitos.getByText(/Promedio/i).first()).toBeVisible();
  });

  test('debe mostrar el Mapa Curricular K23 con niveles y asignaturas', async ({ page }) => {
    // Clic en la sub-solapa de Mapa Curricular
    await page.getByRole('button', { name: /Mapa Curricular K23/i }).click();

    const subpanelMapa = page.locator('#sp1p1');
    await expect(subpanelMapa).toHaveClass(/active/);
    await expect(page.locator('#sp1p0')).not.toHaveClass(/active/);

    // Valida banner explicativo
    await expect(subpanelMapa.getByText(/Mapa Curricular K23:/i)).toBeVisible();

    // Valida presencia de niveles 1 al 5 en el mapa
    await expect(subpanelMapa.locator('.map-lvl', { hasText: 'Nivel 1' })).toBeVisible();
    await expect(subpanelMapa.locator('.map-lvl', { hasText: 'Nivel 2' })).toBeVisible();
    await expect(subpanelMapa.locator('.map-lvl', { hasText: 'Nivel 3' })).toBeVisible();

    // Valida materias troncales visibles
    await expect(subpanelMapa.getByText('Álgebra y Geometría Analítica').first()).toBeVisible();
    await expect(subpanelMapa.getByText('Análisis Matemático I').first()).toBeVisible();
    await expect(subpanelMapa.getByText('Algoritmos y Estructuras de Datos').first()).toBeVisible();
  });

  test('debe mostrar Peso Académico con ambas fórmulas polinomiales', async ({ page }) => {
    // Clic en la sub-solapa de Peso Académico
    await page.getByRole('button', { name: /Peso Académico UTN/i }).click();

    const subpanelPeso = page.locator('#sp1p2');
    await expect(subpanelPeso).toHaveClass(/active/);

    // Valida presencia de ambos modelos
    await expect(subpanelPeso.locator('h3', { hasText: /Polinomio Histórico/i })).toBeVisible();
    await expect(subpanelPeso.getByText(/PESO = 11 × CMA/i)).toBeVisible();
    await expect(subpanelPeso.locator('h3', { hasText: /Nuevo Polinomio/i })).toBeVisible();

    // Valida glosario de variables
    await expect(subpanelPeso.getByText(/Glosario Completo de Referencias/i)).toBeVisible();
  });

  test('debe mostrar Estrategia & Correlatividades con cadenas troncales y asesor', async ({ page }) => {
    // Clic en la sub-solapa de Estrategia
    await page.getByRole('button', { name: /Estrategia & Correlatividades/i }).click();

    const subpanelEstrategia = page.locator('#sp1p3');
    await expect(subpanelEstrategia).toHaveClass(/active/);

    // Valida presencia de las cadenas troncales
    await expect(subpanelEstrategia.getByText(/Rama Integradora Sistemas/i)).toBeVisible();
    await expect(subpanelEstrategia.getByText(/Rama Redes y Comunicaciones/i)).toBeVisible();
  });
});
