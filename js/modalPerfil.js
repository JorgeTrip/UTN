/**
 * Módulo de Gestión de Menú de Avatar y Modal de Perfil del Alumno
 * Permite la apertura de opciones de cuenta y la edición en pestañas de los datos personales y académicos.
 */

function toggleAvatarDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('avatarDropdown');
  if (dropdown) dropdown.classList.toggle('open');
}

function cerrarAvatarDropdown() {
  const dropdown = document.getElementById('avatarDropdown');
  if (dropdown) dropdown.classList.remove('open');
}

document.addEventListener('click', (e) => {
  const avatarWrap = document.getElementById('avatarWrap');
  if (avatarWrap && !avatarWrap.contains(e.target)) {
    cerrarAvatarDropdown();
  }
});

function abrirModalPerfil() {
  cerrarAvatarDropdown();
  const modal = document.getElementById('modalPerfil');
  if (!modal) return;

  const p = window.datosGlobales?.datosAlumno?.perfil || {};
  document.getElementById('inputNombre').value = p.nombre || '';
  document.getElementById('inputApellido').value = p.apellido || '';
  document.getElementById('inputNombreCompleto').value = p.nombreCompleto || '';
  document.getElementById('inputDni').value = p.dni || '';
  document.getElementById('inputLegajo').value = p.legajo || '';
  document.getElementById('inputTelefono').value = p.telefono || '';
  document.getElementById('inputDireccion').value = p.direccion || '';
  document.getElementById('inputTurno').value = p.turno || 'Noche';
  document.getElementById('inputPlanActual').value = p.planActual || 'K23';
  document.getElementById('inputPlanOriginal').value = p.planOriginal || 'K08';
  document.getElementById('inputFechaIngreso').value = p.fechaIngreso || '2019';
  document.getElementById('inputFechaTransicion').value = p.fechaTransicion || '2026-02';

  modal.classList.add('open');
  modalTab(0);
}

function cerrarModalPerfil() {
  const modal = document.getElementById('modalPerfil');
  if (modal) modal.classList.remove('open');
}

function modalTab(indice) {
  document.querySelectorAll('.modal-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === indice);
  });
  document.querySelectorAll('.modal-panel').forEach((panel, i) => {
    panel.classList.toggle('active', i === indice);
  });
}

function guardarDatosPerfil() {
  if (!window.datosGlobales?.datosAlumno) return;
  const p = window.datosGlobales.datosAlumno.perfil || {};

  p.nombre = document.getElementById('inputNombre').value.trim();
  p.apellido = document.getElementById('inputApellido').value.trim();
  p.nombreCompleto = document.getElementById('inputNombreCompleto').value.trim();
  p.dni = document.getElementById('inputDni').value.trim();
  p.legajo = document.getElementById('inputLegajo').value.trim();
  p.telefono = document.getElementById('inputTelefono').value.trim();
  p.direccion = document.getElementById('inputDireccion').value.trim();
  p.turno = document.getElementById('inputTurno').value;
  p.planActual = document.getElementById('inputPlanActual').value;
  p.planOriginal = document.getElementById('inputPlanOriginal').value;
  p.fechaIngreso = document.getElementById('inputFechaIngreso').value.trim();
  p.fechaTransicion = document.getElementById('inputFechaTransicion').value.trim();

  guardarDatosAlumnoEnStorage();
  renderizarHeaderYPerfil();
  cerrarModalPerfil();
  alert('¡Información personal actualizada correctamente!');
}
