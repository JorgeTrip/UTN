import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de Normalización de Período Lectivo y Exclusión de 'Grado' / 'Gr'.
 * Valida que tanto en la importación desde SIU Guaraní como en el renderizado
 * de la tarjeta de materia, el período se exprese como '1er Cuatrimestre [Año]',
 * '2do Cuatrimestre [Año]' o 'Anual [Año]', sin 'Grado' ni 'Gr'.
 */

test.describe('Normalización de Período Lectivo y Formateo en Tarjetas', () => {
  test('debe normalizar el período lectivo extrayéndolo del SIU sin la palabra Grado', async ({ page }) => {
    await page.goto('/');

    const resultado = await page.evaluate(() => {
      if (typeof window.normalizarPeriodoLectivo !== 'function') return null;
      return {
        segundoCuat: window.normalizarPeriodoLectivo('Grado Segundo Cuatrimestre 2025'),
        primerCuat: window.normalizarPeriodoLectivo('Grado Primer Cuatrimestre 2026'),
        anual: window.normalizarPeriodoLectivo('Grado Anual 2024'),
        conCuatFrac: window.normalizarPeriodoLectivo('Grado 2019 Cuat 2/2'),
        soloGr: window.normalizarPeriodoLectivo('Gr'),
        soloGrado: window.normalizarPeriodoLectivo('Grado')
      };
    });

    expect(resultado).not.toBeNull();
    expect(resultado.segundoCuat).toBe('2do Cuatrimestre 2025');
    expect(resultado.primerCuat).toBe('1er Cuatrimestre 2026');
    expect(resultado.anual).toBe('Anual 2024');
    expect(resultado.conCuatFrac).toBe('2do Cuatrimestre 2019');
    expect(resultado.soloGr).toBeNull();
    expect(resultado.soloGrado).toBeNull();
  });

  test('debe mostrar en la tarjeta de materia el período limpio sin Gr ni Grado', async ({ page }) => {
    await page.goto('/');

    // Renderizamos una materia con período sucio que contenga "Grado Segundo Cuatrimestre 2025" y comisión
    const htmlTarjeta = await page.evaluate(() => {
      const materia = {
        id: '232032',
        nombre: 'Comunicación de Datos',
        estado: 'firmada',
        periodoLectivo: 'Grado Segundo Cuatrimestre 2025',
        comision: 'K3571'
      };
      return window.formatearCuerpoTarjetaMateria(materia);
    });

    expect(htmlTarjeta).toContain('2do Cuatrimestre 2025');
    expect(htmlTarjeta).toContain('Comisión: K3571');
    expect(htmlTarjeta).not.toContain('Gr ·');
    expect(htmlTarjeta).not.toContain('Grado');
  });
});
