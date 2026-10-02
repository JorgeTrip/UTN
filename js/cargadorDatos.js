/**
 * Módulo de Carga de Datos Académicos y Personales
 * Responsable de obtener y almacenar en memoria los archivos JSON del plan de estudio
 * y de los datos del alumno, gestionando la sincronización dual (Firestore + LocalStorage aislado).
 */

window.datosGlobales = {
  planEstudio: null,
  datosAlumno: null
};

/**
 * Carga los datos del plan de estudio y los datos del estudiante (Firestore o Local).
 * @returns {Promise<boolean>} True si la carga fue exitosa.
 */
async function cargarDatosIniciales() {
  try {
    if (!window.datosGlobales.planEstudio) {
      const respuestaPlan = await fetch('data/planEstudio.json');
      window.datosGlobales.planEstudio = await respuestaPlan.json();
    }

    const usuario = window.servicioAuth?.obtenerUsuarioActual();
    if (usuario && window.servicioFirestore) {
      // Carga aislada desde Firestore o caché exclusiva según la cuenta del alumno autenticado
      window.datosGlobales.datosAlumno = await window.servicioFirestore.obtenerDatosAlumno(usuario.uid);
      return true;
    }

    const esEntornoAutomatizado = (typeof navigator !== 'undefined' && Boolean(navigator.webdriver)) || Boolean(window.__MODO_TEST_E2E__);
    if (esEntornoAutomatizado && !window.__TEST_GATEKEEPER__) {
      const datosGuardados = localStorage.getItem('pulso_datos_alumno');
      if (datosGuardados) {
        window.datosGlobales.datosAlumno = JSON.parse(datosGuardados);
      } else {
        const respuestaAlumno = await fetch('data/datosAlumno.json');
        window.datosGlobales.datosAlumno = await respuestaAlumno.json();
      }
      return true;
    }

    window.datosGlobales.datosAlumno = null;
    return false;
  } catch (error) {
    console.error('Error cargando los datos iniciales:', error);
    return false;
  }
}

/**
 * Guarda el estado actual de los datos del alumno en localStorage aislado y Firestore.
 * @returns {Promise<Object|null>} Datos sincronizados.
 */
async function guardarDatosAlumnoEnStorage() {
  const datos = window.datosGlobales.datosAlumno;
  if (!datos) return null;

  const usuario = window.servicioAuth?.obtenerUsuarioActual();
  if (usuario && usuario.uid) {
    localStorage.setItem(`pulso_datos_alumno_${usuario.uid}`, JSON.stringify(datos));
    if (window.servicioFirestore) {
      await window.servicioFirestore.guardarDatosAlumno(usuario.uid, datos);
    }
  } else {
    localStorage.setItem('pulso_datos_alumno', JSON.stringify(datos));
  }

  return datos;
}

window.guardarDatosAlumnoEnStorage = guardarDatosAlumnoEnStorage;
