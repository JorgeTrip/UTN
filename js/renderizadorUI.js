/**
 * Módulo Orquestador de Renderizado de la Interfaz
 * Coordina los renderizadores individuales para poblar todos los paneles del Dashboard.
 */

/**
 * Actualiza los elementos visuales de la cabecera, avatar e iniciales del perfil del alumno.
 */
function renderizarHeaderYPerfil() {
  const datos = window.datosGlobales?.datosAlumno;
  const p = datos?.perfil || {};
  const usuario = window.servicioAuth?.obtenerUsuarioActual();

  const tienePerfil = Boolean(p.nombre || p.nombreCompleto || p.legajo);
  const nombreMostrar = p.nombreCompleto || p.nombre || usuario?.displayName || (usuario?.email ? usuario.email.split('@')[0] : 'Estudiante');

  // Actualiza badge de plan (solo visible si el alumno tiene un plan cargado)
  const badgePlan = document.getElementById('headerBadgePlan');
  const mobilePlan = document.getElementById('mobileProfilePlan');
  if (badgePlan) {
    if (p.planActual) {
      badgePlan.textContent = `Plan ${p.planActual}`;
      badgePlan.style.display = 'inline-block';
    } else {
      badgePlan.style.display = 'none';
    }
  }
  if (mobilePlan) {
    if (p.planActual) {
      mobilePlan.textContent = `Plan ${p.planActual} ${p.planOriginal ? '(Orig. ' + p.planOriginal + ')' : ''}`;
      mobilePlan.style.display = 'block';
    } else {
      mobilePlan.style.display = 'none';
    }
  }

  // Genera el subtítulo con solo los datos existentes
  const partesSubtitulo = [nombreMostrar];
  if (p.legajo) partesSubtitulo.push(`Leg. ${p.legajo}`);
  if (p.turno) partesSubtitulo.push(`Turno ${p.turno}`);
  if (!tienePerfil && !usuario) partesSubtitulo.push('Sin sesión activa');

  const subtituloHeader = document.querySelector('.g-sub');
  if (subtituloHeader) {
    subtituloHeader.textContent = partesSubtitulo.join(' · ');
  }

  // Avatar con iniciales o marcador genérico
  const avatar = document.querySelector('.profile-avatar');
  if (avatar) {
    if (tienePerfil) {
      const i1 = (p.nombre || nombreMostrar).charAt(0);
      const i2 = (p.apellido || (nombreMostrar.includes(' ') ? nombreMostrar.split(' ')[1] : '')).charAt(0);
      avatar.textContent = (i1 + (i2 || '')).toUpperCase();
    } else {
      avatar.textContent = usuario?.email ? usuario.email.charAt(0).toUpperCase() : '--';
    }
  }

  const nombreMovil = document.querySelector('.profile-name');
  if (nombreMovil) nombreMovil.textContent = nombreMostrar;

  const legajoMovil = document.getElementById('mobileProfileLegajo');
  if (legajoMovil) {
    legajoMovil.textContent = p.legajo ? `Leg. ${p.legajo}${p.turno ? ' · ' + p.turno : ''}` : 'Sin datos cargados';
  }

  // Actualiza los botones de sesión en el dropdown
  actualizarOpcionesSesionDropdown(usuario);
}

/**
 * Actualiza las opciones de Iniciar/Cerrar sesión en el menú de usuario.
 * @param {Object|null} usuario - Usuario actualmente autenticado.
 */
function actualizarOpcionesSesionDropdown(usuario) {
  const itemAuth = document.getElementById('dropdownItemAuth');
  if (!itemAuth) return;
  itemAuth.replaceChildren();
  if (usuario) {
    itemAuth.insertAdjacentHTML('beforeend', `<span>🚪</span> Cerrar Sesión (${usuario.email || 'Alumno'})`);
    itemAuth.onclick = async () => {
      await window.servicioAuth.cerrarSesion();
      cerrarMenuAvatar();
    };
  } else {
    itemAuth.insertAdjacentHTML('beforeend', `<span>🔐</span> Iniciar Sesión / Registro`);
    itemAuth.onclick = () => {
      abrirModalAuth();
      cerrarMenuAvatar();
    };
  }
}

/**
 * Alterna el despliegue del cuerpo de una tarjeta acordeón del mapa curricular.
 * @param {HTMLElement} tarjeta - Elemento contenedor del acordeón.
 */
function alternarAcordeon(tarjeta) {
  if (tarjeta) tarjeta.classList.toggle('open');
}
const toggleAcc = alternarAcordeon;

/**
 * Orquesta la ejecución secuencial de todos los módulos de renderizado del panel.
 */
function renderizarTodoElDashboard() {
  renderizarHeaderYPerfil();
  if (typeof renderizarLinksUtiles === 'function') renderizarLinksUtiles();
  if (typeof renderizarHitosCarrera === 'function') renderizarHitosCarrera();
  if (typeof renderizarMapaCurricular === 'function') renderizarMapaCurricular();
  if (typeof renderizarPesoAcademico === 'function') renderizarPesoAcademico();
  if (typeof renderizarEstrategia === 'function') renderizarEstrategia();
  if (typeof renderizarPlanificadorCompleto === 'function') renderizarPlanificadorCompleto();
  if (typeof renderizarGuiaAcademica === 'function') renderizarGuiaAcademica();
}
const renderizarUI = renderizarTodoElDashboard;
