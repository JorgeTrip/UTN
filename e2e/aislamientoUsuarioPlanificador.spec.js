import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E de Aislamiento Estricto de Datos y Planificador por Usuario.
 * Valida:
 * 1. Un usuario nuevo arranca con esquema limpio sin heredar materias de otro usuario.
 * 2. Las grillas del planificador están vacías para un usuario nuevo.
 * 3. Cada usuario almacena y recupera sus datos bajo su propio UID sin contaminación cruzada.
 */

test.describe('Aislamiento de Datos y Planificador por Usuario', () => {
  test('un usuario nuevo no debe heredar materias ni planificacion de datos locales preexistentes', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Simulamos que existían datos previos de otro alumno en la clave compartida antigua
    await page.evaluate(() => {
      localStorage.setItem('pulso_datos_alumno', JSON.stringify({
        perfil: { nombre: 'Otro Alumno', turno: 'Noche' },
        materiasAprobadas: [{ id: '999999', nombre: 'Materia Heredada Ajena', nota: 10 }],
        materiasEnCurso: [{ id: '888888', nombre: 'En Curso Ajena', comision: 'Z999' }],
        planificacion: {
          '2026': {
            '1c': {
              alternativaElegida: 0,
              alternativas: [{
                nombre: 'Única',
                eventos: [{ id: 'ev_fantasma', name: 'Materia Fantasma No Deseada', day: 1, h1: 19, m1: 0, h2: 22, m2: 0, cls: 'isi' }]
              }]
            }
          }
        }
      }));
    });

    // Inicializamos un usuario nuevo autenticado (UID nuevo)
    const nuevoUsuario = { uid: 'usr_nuevo_estudiante_123', email: 'nuevo@alumnos.utn.ba', displayName: 'Estudiante Nuevo' };
    const datosCargados = await page.evaluate(async (usuarioMock) => {
      if (typeof window.servicioFirestore?.obtenerDatosAlumno === 'function') {
        return await window.servicioFirestore.obtenerDatosAlumno(usuarioMock.uid, usuarioMock);
      }
      return null;
    }, nuevoUsuario);

    // Debe ser un esquema limpio generado para el nuevo usuario
    expect(datosCargados).not.toBeNull();
    expect(datosCargados.perfil?.nombre).toBe('Estudiante Nuevo');
    expect(datosCargados.materiasAprobadas).toEqual([]);
    expect(datosCargados.materiasEnCurso).toEqual([]);

    // En el planificador no deben existir los eventos del alumno previo
    const eventos1C = datosCargados.planificacion?.['2026']?.['1c']?.alternativas?.[0]?.eventos || [];
    expect(eventos1C.some(e => e.name === 'Materia Fantasma No Deseada')).toBe(false);
  });

  test('el planificador de un usuario nuevo debe renderizar grillas horarias limpias sin materias en el calendario', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Inyectamos un usuario nuevo limpio en memoria y en storage
    await page.evaluate(() => {
      const esquemaLimpio = window.servicioFirestore.crearEsquemaInicial({
        uid: 'usr_limpio_456',
        displayName: 'Alumno Limpio',
        email: 'alumno.limpio@utn.ba'
      });
      localStorage.setItem('pulso_datos_alumno', JSON.stringify(esquemaLimpio));
      window.datosGlobales.datosAlumno = esquemaLimpio;
      window.renderizarPlanificadorCompleto();
    });

    // Vamos al planificador
    await page.locator('.super-tab.sp2').click();

    // Verificamos que la pestaña diga 2026 · Cursada Actual (0)
    const tab2026 = page.locator('#sp2 .sub-tab.active');
    await expect(tab2026).toContainText('Cursada Actual (0)');

    // Verificamos que la grilla horaria no tenga bloques .ev
    const eventosEnGrilla = page.locator('#q1body .ev');
    await expect(eventosEnGrilla).toHaveCount(0);
  });
});
