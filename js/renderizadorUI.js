/**
 * Módulo Orquestador de Renderizado de la Interfaz
 * Coordina los renderizadores individuales para poblar todos los paneles del Dashboard.
 */

function renderizarHeaderYPerfil() {
  const datos = window.datosGlobales.datosAlumno;
  if (!datos || !datos.perfil) return;
  const p = datos.perfil;

  const subtituloHeader = document.querySelector('.g-sub');
  if (subtituloHeader) {
    subtituloHeader.textContent = `${p.nombreCompleto} · Leg. ${p.legajo} · Turno ${p.turno}`;
  }

  const avatar = document.querySelector('.profile-avatar');
  if (avatar) {
    const iniciales = p.nombre.charAt(0) + p.apellido.charAt(0);
    avatar.textContent = iniciales.toUpperCase();
  }

  const nombreMovil = document.querySelector('.profile-name');
  if (nombreMovil) nombreMovil.textContent = p.nombreCompleto;

  const legajoMovil = document.querySelector('.profile-legajo');
  if (legajoMovil) legajoMovil.textContent = `Leg. ${p.legajo} · ${p.turno}`;
}

function toggleAcc(tarjeta) {
  tarjeta.classList.toggle('open');
}

function renderizarTodoElDashboard() {
  renderizarHeaderYPerfil();
  if (typeof renderizarLinksUtiles === 'function') renderizarLinksUtiles();
  if (typeof renderizarHitosCarrera === 'function') renderizarHitosCarrera();
  if (typeof renderizarMapaCurricular === 'function') renderizarMapaCurricular();
  if (typeof renderizarPesoAcademico === 'function') renderizarPesoAcademico();
  if (typeof renderizarEstrategia === 'function') renderizarEstrategia();
  if (typeof renderizarPlanificadorCompleto === 'function') renderizarPlanificadorCompleto();
  if (typeof renderizarCalendariosPlanificador === 'function') renderizarCalendariosPlanificador();
}
