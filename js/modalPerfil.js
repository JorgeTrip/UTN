/**
 * Módulo de Gestión del Menú de Avatar y Modal de Perfil del Alumno
 * Permite desplegar opciones de usuario, conmutar temas y editar información personal
 * y académica con persistencia directa en el estado global y almacenamiento local.
 */

/**
 * Alterna la visibilidad del menú desplegable del avatar en la cabecera.
 * @param {Event} [evento] - Evento de clic del usuario para detener la propagación.
 */
function alternarMenuAvatar(evento) {
  if (evento) evento.stopPropagation();
  const menu = document.getElementById('avatarDropdown');
  if (menu) menu.classList.toggle('open');
}
const toggleAvatarDropdown = alternarMenuAvatar;

/**
 * Cierra el menú desplegable del avatar cuando se hace clic fuera o se selecciona una opción.
 */
function cerrarMenuAvatar() {
  const menu = document.getElementById('avatarDropdown');
  if (menu) menu.classList.remove('open');
}
const cerrarAvatarDropdown = cerrarMenuAvatar;

// Cierre automático al hacer clic en cualquier área externa
document.addEventListener('click', (e) => {
  const avatarWrap = document.getElementById('avatarWrap');
  if (avatarWrap && !avatarWrap.contains(e.target)) {
    cerrarMenuAvatar();
  }
});

/**
 * Abre la ventana modal de edición del perfil del estudiante y puebla los campos.
 */
function abrirModalPerfil() {
  cerrarMenuAvatar();
  const modal = document.getElementById('modalPerfil');
  if (!modal) return;

  const p = window.datosGlobales?.datosAlumno?.perfil || {};
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('inputNombre', p.nombre);
  setVal('inputApellido', p.apellido);
  setVal('inputNombreCompleto', p.nombreCompleto);
  setVal('inputDni', p.dni);
  setVal('inputLegajo', p.legajo);
  setVal('inputTelefono', p.telefono);
  setVal('inputDireccion', p.direccion);
  setVal('inputTurno', p.turno || '');
  setVal('inputPlanActual', p.planActual || '');
  setVal('inputPlanOriginal', p.planOriginal || '');
  setVal('inputFechaIngreso', p.fechaIngreso || '');
  setVal('inputFechaTransicion', p.fechaTransicion || '');

  modal.classList.add('open');
  cambiarSolapaModal(0);
}

/**
 * Cierra la ventana modal de edición del perfil.
 */
function cerrarModalPerfil() {
  const modal = document.getElementById('modalPerfil');
  if (modal) modal.classList.remove('open');
}

/**
 * Conmuta entre las pestañas internas de la ventana modal (Personal vs Académico).
 * @param {number} indice - 0: Personal, 1: Académico.
 */
function cambiarSolapaModal(indice) {
  document.querySelectorAll('#modalPerfil .modal-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === indice);
  });
  document.querySelectorAll('#modalPerfil .modal-panel').forEach((panel, i) => {
    panel.classList.toggle('active', i === indice);
  });
}
const modalTab = cambiarSolapaModal;

/**
 * Guarda las modificaciones del perfil en memoria y en localStorage, refrescando la UI.
 */
function guardarDatosPerfil() {
  if (!window.datosGlobales?.datosAlumno) return;
  const p = window.datosGlobales.datosAlumno.perfil || {};
  const getVal = (id, fallback = '') => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : fallback;
  };

  p.nombre = getVal('inputNombre', p.nombre);
  p.apellido = getVal('inputApellido', p.apellido);
  p.nombreCompleto = getVal('inputNombreCompleto', `${p.nombre} ${p.apellido}`);
  p.dni = getVal('inputDni', p.dni);
  p.legajo = getVal('inputLegajo', p.legajo);
  p.telefono = getVal('inputTelefono', p.telefono);
  p.direccion = getVal('inputDireccion', p.direccion);
  p.turno = getVal('inputTurno', p.turno || '');
  p.planActual = getVal('inputPlanActual', p.planActual || '');
  p.planOriginal = getVal('inputPlanOriginal', p.planOriginal || '');
  p.fechaIngreso = getVal('inputFechaIngreso', p.fechaIngreso || '');
  p.fechaTransicion = getVal('inputFechaTransicion', p.fechaTransicion || '');

  guardarDatosAlumnoEnStorage();
  renderizarHeaderYPerfil();
  cerrarModalPerfil();
}
