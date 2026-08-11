/**
 * Módulo de Carga de Datos Académicos y Personales
 * Responsable de obtener y almacenar en memoria los archivos JSON del plan de estudio
 * y de los datos del alumno, gestionando además el respaldo en localStorage.
 */

window.datosGlobales = {
  planEstudio: null,
  datosAlumno: null
};

/**
 * Carga los archivos JSON iniciales mediante fetch y gestiona caché local.
 * @returns {Promise<boolean>} True si la carga fue exitosa.
 */
async function cargarDatosIniciales() {
  try {
    const respuestaPlan = await fetch('json/planEstudio.json');
    window.datosGlobales.planEstudio = await respuestaPlan.json();

    const datosGuardados = localStorage.getItem('pulso_datos_alumno');
    if (datosGuardados) {
      window.datosGlobales.datosAlumno = JSON.parse(datosGuardados);
    } else {
      const respuestaAlumno = await fetch('json/datosAlumno.json');
      window.datosGlobales.datosAlumno = await respuestaAlumno.json();
      guardarDatosAlumnoEnStorage();
    }
    return true;
  } catch (error) {
    console.error('Error cargando los datos JSON:', error);
    return false;
  }
}

/**
 * Guarda el estado actual de los datos del alumno en localStorage.
 */
function guardarDatosAlumnoEnStorage() {
  if (window.datosGlobales.datosAlumno) {
    localStorage.setItem('pulso_datos_alumno', JSON.stringify(window.datosGlobales.datosAlumno));
  }
}
