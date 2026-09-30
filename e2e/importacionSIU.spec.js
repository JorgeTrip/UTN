import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de Importación de Historia Académica SIU Guaraní y Vaciado Seguro.
 * Valida el parser de texto con comisiones, actas, parciales y homologación K08 -> K23.
 */

const TEXTO_SIU_PRUEBA_ENRIQUECIDO = `
Análisis Numérico (232033)
Equivalencia Total - Aprobada (Aprobada) Aprobado 24/02/2026 - [Cerrar](https://guarani.frba.utn.edu.ar)
Nro. resolución: Sin definirTemas a rendir: Sin definirOrigen: Sin definir
Equivalencia Regularidad - Aprobado 24/02/2026 - [Cerrar](https://guarani.frba.utn.edu.ar)
Nro. resolución: Sin definirTemas a rendir: Sin definirOrigen: Sin definir
Matemática Superior (082032)
Examen - 8 (OCHO) Aprobado 16/12/2025 - Libro K0126 - Folio 209 - [Cerrar](https://guarani.frba.utn.edu.ar)
Turno: FINALES DE DICIEMBRE 2025 - GRADOCondición: RegularAño académico: 2025
Regularidad - 7 (SIETE) Aprobado 28/11/2025 - Libro XXV200002 - Folio 85 - [Cerrar](https://guarani.frba.utn.edu.ar)
Período lectivo: Grado Segundo Cuatrimestre 2025Comisión: K3575No hay información sobre evaluaciones
Análisis Matemático II (950703)
Regularidad - 9 (NUEVE) Aprobado 11/07/2025 - Libro XXV070001 - Folio 65 - [Cerrar](https://guarani.frba.utn.edu.ar)
Período lectivo: Grado Primer Cuatrimestre 2025Comisión: Z2061Evaluaciones parciales:
Fecha
Descripción
Tipo
Nota
Resultado
27/05/2025
1º Parcial
Parcial
8 (OCHO)
Aprobado
11/07/2025
2º Parcial
Parcial
9 (NUEVE)
Aprobado
Promoción - 9 (NUEVE) Promocionado 11/07/2025 - Libro PR120 - Folio 157 - [Cerrar](https://guarani.frba.utn.edu.ar)
Período lectivo: Grado Primer Cuatrimestre 2025Evaluaciones parciales:
Fecha
Descripción
Tipo
Nota
Resultado
27/05/2025
1º Parcial
Parcial
8 (OCHO)
Aprobado
11/07/2025
2º Parcial
Parcial
9 (NUEVE)
Aprobado
Comunicación de Datos (232032)
Examen - Ausente 29/07/2026 - Libro K0128 - Folio 147 - [Cerrar](https://guarani.frba.utn.edu.ar)
Turno: FINALES DE JULIO AGOSTO 2026 - GRADOCondición: RegularAño académico: 2026
Regularidad - 6 (SEIS) Aprobado 08/07/2026 - Libro XXVI200001 - Folio 101 - [Cerrar](https://guarani.frba.utn.edu.ar)
Período lectivo: Grado Primer Cuatrimestre 2026Comisión: K3055Evaluaciones parciales:
Fecha
Descripción
Tipo
Nota
Resultado
15/05/2026
1º Parcial
Parcial
6 (SEIS)
Aprobado
26/06/2026
2º Parcial
Parcial
6 (SEIS)
Aprobado
`;

test.describe('Importador de Historia Académica SIU Guaraní con Homologación K08', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null, { timeout: 15000 });
  });

  test('debe importar el texto del SIU, vincular K08 con K23, mostrar actas, comisiones y parciales', async ({ page }) => {
    await page.locator('.super-tab.sp1').click();
    await page.getByRole('button', { name: /Mapa Curricular K23/i }).click();

    const botonImportar = page.locator('button:has-text("📥 Importar SIU")');
    await expect(botonImportar).toBeVisible();
    await botonImportar.click();

    const modalImportar = page.locator('#modalImportadorSIU');
    await expect(modalImportar).toHaveClass(/open/);

    await page.locator('#textoHistoriaSIU').fill(TEXTO_SIU_PRUEBA_ENRIQUECIDO);
    await page.locator('button:has-text("🔍 Procesar y Previsualizar")').click();

    const preview = page.locator('#previewImportacionSIU');
    await expect(preview).toBeVisible();

    page.once('dialog', async dialog => { await dialog.accept(); });
    await page.locator('#btnAplicarImportacionSIU').click();
    await expect(modalImportar).not.toHaveClass(/open/);

    // Valida Análisis Numérico (homologada desde Matemática Superior K08 con nota 8)
    const tarjetaNum = page.locator('.acc-card:has-text("Análisis Numérico")');
    await expect(tarjetaNum).toBeVisible();
    await expect(tarjetaNum.locator('.acc-grade')).toContainText('8');
    await expect(tarjetaNum.locator('.acc-badges')).toContainText(/Homologación K08/i);

    // Despliega y valida detalles de origen K08 y acta
    await tarjetaNum.click();
    await expect(tarjetaNum).toContainText(/Plan K08 \(Matemática Superior \(082032\)\)/i);
    await expect(tarjetaNum).toContainText(/Libro K0126 · Folio 209/i);
    await expect(tarjetaNum).toContainText(/Comisión: K3575/i);

    // Valida Análisis Matemático II con parciales
    const tarjetaAM2 = page.locator('.acc-card:has-text("Análisis Matemático II")');
    await expect(tarjetaAM2.locator('.acc-grade')).toContainText('9');
    await tarjetaAM2.click();
    await expect(tarjetaAM2).toContainText(/1º Parcial: 8 · 2º Parcial: 9/i);
    await expect(tarjetaAM2).toContainText(/Comisión: Z2061/i);

    // Valida Comunicación de Datos firmada en K23
    const tarjetaCom = page.locator('.acc-card:has-text("Comunicación de Datos")');
    await expect(tarjetaCom.locator('.acc-grade')).toContainText('✍️');
    await tarjetaCom.click();
    await expect(tarjetaCom).toContainText(/Comisión: K3055/i);
    await expect(tarjetaCom).toContainText(/1º Parcial: 6 · 2º Parcial: 6/i);

    // Prueba vaciado del mapa
    const botonVaciar = page.locator('button:has-text("🗑️ Vaciar Mapa")');
    await botonVaciar.click();
    const modalConfirmacion = page.locator('#modalConfirmacionReinicio');
    await expect(modalConfirmacion).toHaveClass(/open/);

    page.once('dialog', async dialog => { await dialog.accept(); });
    await modalConfirmacion.locator('button:has-text("🗑️ Sí, vaciar todo")').click();
    await expect(modalConfirmacion).not.toHaveClass(/open/);

    await expect(tarjetaNum.locator('.acc-grade')).toContainText('–');
    await expect(tarjetaNum.locator('.acc-badges')).toContainText(/Pendiente/i);
  });
});
