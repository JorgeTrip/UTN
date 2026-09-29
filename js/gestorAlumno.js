/**
 * Módulo de Gestión de Datos del Alumno (Importación / Exportación / Soberanía de Datos)
 * Garantiza la portabilidad completa permitiendo descargar y cargar toda la información
 * personal, académica y de planificación en formato JSON estándar.
 */

/**
 * Genera un archivo JSON con todos los datos del alumno y dispara su descarga automática.
 */
function exportarDatosAlumno() {
  const datos = window.datosGlobales.datosAlumno;
  if (!datos) return;
  const cadenaJson = JSON.stringify(datos, null, 2);
  const blob = new Blob([cadenaJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `datos_alumno_${datos.perfil?.legajo || 'utn'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Lee un archivo JSON cargado por el usuario, valida su esquema básico y restaura el estado.
 * @param {Event} evento - Evento 'change' del input type="file".
 */
function importarDatosAlumno(evento) {
  const archivo = evento.target.files[0];
  if (!archivo) return;
  const lector = new FileReader();
  lector.onload = function(e) {
    try {
      const datosImportados = JSON.parse(e.target.result);
      if (datosImportados.perfil && datosImportados.materiasAprobadas) {
        window.datosGlobales.datosAlumno = datosImportados;
        guardarDatosAlumnoEnStorage();
        alert('¡Datos importados correctamente!');
        location.reload();
      } else {
        alert('El archivo JSON no tiene una estructura válida.');
      }
    } catch (err) {
      alert('Error al leer el archivo JSON: ' + err.message);
    }
  };
  lector.readAsText(archivo);
}
