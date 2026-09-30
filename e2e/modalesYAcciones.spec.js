import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de Modales y Flujos de Edición.
 * Valida la apertura, cambio de solapas internas, carga de datos y cierre
 * de los modales de Perfil del Alumno, Edición de Materia y Materias Electivas.
 */

test.describe('Modales y Formularios de Edición', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Espera a que los datos globales se hayan cargado en memoria
    await page.waitForFunction(() => window.datosGlobales?.datosAlumno !== null && window.datosGlobales?.planEstudio !== null, { timeout: 15000 });
  });

  test('debe abrir, alternar solapas y cerrar el modal de perfil de estudiante', async ({ page }) => {
    const modalPerfil = page.locator('#modalPerfil');
    await expect(modalPerfil).not.toHaveClass(/open/);

    // Abre el menú del avatar y selecciona Editar Perfil
    await page.locator('.avatar-btn-header').click();
    await page.getByRole('button', { name: /Editar Perfil \/ Datos/i }).click();

    // Valida que el modal se muestre abierto
    await expect(modalPerfil).toHaveClass(/open/);
    await expect(modalPerfil.getByText('Editar Perfil de Estudiante')).toBeVisible();

    // Solapa de datos personales activa por defecto
    const panelPersonal = page.locator('#modalPanelPersonal');
    await expect(panelPersonal).toHaveClass(/active/);
    await expect(page.locator('#inputNombreCompleto')).toHaveValue(/Jorge Osvaldo Tripodi/i);

    // Conmuta a solapa de datos académicos
    await page.getByRole('button', { name: /Datos Académicos/i }).click();
    const panelAcademico = page.locator('#modalPanelAcademico');
    await expect(panelAcademico).toHaveClass(/active/);
    await expect(panelPersonal).not.toHaveClass(/active/);
    await expect(page.locator('#inputLegajo')).toHaveValue(/172-060.0/i);

    // Cierra el modal con el botón de cancelar
    await modalPerfil.getByRole('button', { name: /Cancelar/i }).click();
    await expect(modalPerfil).not.toHaveClass(/open/);
  });

  test('debe abrir y cerrar el modal de edición de materia desde el mapa curricular', async ({ page }) => {
    // Navega a Plan de Estudios & Seguimiento -> Mapa Curricular
    await page.locator('.super-tab.sp1').click();
    await page.getByRole('button', { name: /Mapa Curricular K23/i }).click();

    // Despliega el primer acordeón de materia y hace clic en Editar
    const primeraTarjeta = page.locator('#sp1p1 .acc-card').first();
    await expect(primeraTarjeta).toBeVisible();
    await primeraTarjeta.click();

    const botonEditar = primeraTarjeta.locator('button:has-text("✏️ Editar")');
    await expect(botonEditar).toBeVisible();
    await botonEditar.click();

    // Valida que el modal de materia esté abierto y con contenido
    const modalMateria = page.locator('#modalMateria');
    await expect(modalMateria).toHaveClass(/open/);
    await expect(modalMateria.getByText(/Materia:/i)).toBeVisible();
    await expect(page.locator('#selectEstadoMateria')).toBeVisible();
    await expect(page.locator('#listaLlamadosFinales')).toBeVisible();

    // Cierra el modal con el botón cancelar
    await modalMateria.getByRole('button', { name: /Cancelar/i }).click();
    await expect(modalMateria).not.toHaveClass(/open/);
  });

  test('debe abrir y cerrar el modal de selección de electivas institucionales', async ({ page }) => {
    // Navega al Mapa Curricular
    await page.locator('.super-tab.sp1').click();
    await page.getByRole('button', { name: /Mapa Curricular K23/i }).click();

    // Hace clic en el botón de agregar electiva
    const botonElectiva = page.locator('button:has-text("➕ Agregar Electiva")').first();
    await expect(botonElectiva).toBeVisible();
    await botonElectiva.click();

    // Valida que el modal de electivas esté abierto
    const modalElectiva = page.locator('#modalElectiva');
    await expect(modalElectiva).toHaveClass(/open/);
    await expect(modalElectiva.getByText(/Seleccionar Materia Electiva/i)).toBeVisible();

    // Valida que el selector de electivas esté poblado
    const opcionesElectivas = page.locator('#selectMateriaElectiva option');
    await expect(opcionesElectivas.first()).toBeAttached();
    const totalOpciones = await opcionesElectivas.count();
    expect(totalOpciones).toBeGreaterThan(0);

    // Cierra el modal de electiva
    await modalElectiva.getByRole('button', { name: /Cancelar/i }).click();
    await expect(modalElectiva).not.toHaveClass(/open/);
  });
});
