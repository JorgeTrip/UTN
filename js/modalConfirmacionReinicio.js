/**
 * Módulo Controlador del Modal de Confirmación para Vaciar / Reiniciar el Mapa Curricular
 * Provee compuerta de seguridad antes de restablecer los datos académicos del estudiante.
 */

function abrirModalConfirmacionReinicio() {
  const modal = document.getElementById('modalConfirmacionReinicio');
  if (modal) modal.classList.add('open');
}

function cerrarModalConfirmacionReinicio() {
  const modal = document.getElementById('modalConfirmacionReinicio');
  if (modal) modal.classList.remove('open');
}

function ejecutarReinicioMapaCurricular() {
  if (!window.datosGlobales?.datosAlumno) return;
  const datos = window.datosGlobales.datosAlumno;
  datos.materiasAprobadas = [];
  datos.materiasEnCurso = [];
  datos.historialSIU = [];

  if (typeof guardarDatosAlumnoEnStorage === 'function') guardarDatosAlumnoEnStorage();
  cerrarModalConfirmacionReinicio();
  if (typeof renderizarTodoElDashboard === 'function') renderizarTodoElDashboard();
  alert('🧹 Se vació el mapa curricular exitosamente.');
}
