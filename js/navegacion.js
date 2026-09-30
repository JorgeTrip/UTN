/**
 * Módulo de Navegación por Solapas y Persistencia de Estado
 * Controla la activación de Solapas Principales, Sub-solapas y el visor Iframe de materias,
 * recordando las elecciones de navegación del usuario en el almacenamiento local.
 */

/**
 * Activa una de las tres solapas principales (Links Útiles, Seguimiento, Planificador).
 * @param {number} indice - 0: Links Útiles, 1: Plan y Seguimiento, 2: Planificador.
 */
function seleccionarSolapaPrincipal(indice) {
  const targetId = typeof indice === 'string'
    ? indice
    : (indice === 0 ? 'sp0' : (indice === 1 ? 'sp1' : (indice === 2 ? 'sp2' : (indice === 4 ? 'sp4' : `sp${indice}`))));

  document.querySelectorAll('.super-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.classList.contains(targetId));
  });
  document.querySelectorAll('.super-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === targetId);
  });

  const vistaIframe = document.getElementById('materiaViewContainer');
  if (vistaIframe) vistaIframe.style.display = 'none';
  const panelSp3 = document.getElementById('sp3');
  if (panelSp3) panelSp3.classList.remove('active');

  localStorage.setItem('activeViewType', 'tab');
  localStorage.setItem('dashboardSuperTab', indice);

  if (targetId === 'sp0' && typeof renderizarLinksUtiles === 'function') {
    renderizarLinksUtiles();
  } else if (targetId === 'sp2' && typeof renderizarPlanificadorCompleto === 'function') {
    renderizarPlanificadorCompleto();
  } else if (targetId === 'sp4' && typeof renderizarGuiaAcademica === 'function') {
    renderizarGuiaAcademica();
  }

  if (typeof actualizarTituloCabeceraMovil === 'function') {
    actualizarTituloCabeceraMovil(indice);
  }
}
const superTab = seleccionarSolapaPrincipal;

/**
 * Conmuta entre las sub-solapas de Seguimiento (Hitos, Mapa Curricular, Peso, Estrategia).
 * @param {number} indice - 0: Hitos, 1: Mapa, 2: Peso Académico, 3: Estrategia.
 */
function seleccionarSubSolapaSeguimiento(indice) {
  document.querySelectorAll('#sp1 .sub-tab-bar .sub-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === indice);
  });
  document.querySelectorAll('#sp1 .sub-panel').forEach((panel, i) => {
    panel.classList.toggle('active', i === indice);
  });
  localStorage.setItem('dashboardSp1Tab', indice);

  if (indice === 0 && typeof renderizarHitosCarrera === 'function') renderizarHitosCarrera();
  else if (indice === 1 && typeof renderizarMapaCurricular === 'function') renderizarMapaCurricular();
  else if (indice === 2 && typeof renderizarPesoAcademico === 'function') renderizarPesoAcademico();
  else if (indice === 3 && typeof renderizarEstrategia === 'function') renderizarEstrategia();
}
const sp1Tab = seleccionarSubSolapaSeguimiento;

/**
 * Alterna entre pestañas primarias dentro de un contenedor específico (ej. cuatrimestres).
 * @param {string} contenedorId - ID del contenedor padre.
 * @param {number} indice - Índice de la solapa a activar.
 */
function seleccionarSolapaContenedor(contenedorId, indice) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;
  contenedor.querySelectorAll('.main-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === indice);
  });
  contenedor.querySelectorAll('.main-panel').forEach((panel, i) => {
    panel.classList.toggle('active', i === indice);
  });
  localStorage.setItem('dashboardMainTab_' + contenedorId, indice);
}
const mainTabIn = seleccionarSolapaContenedor;

/**
 * Alterna entre sub-pestañas de alternativas en el planificador cuatrimestral.
 * @param {string} contenedorId - ID del contenedor de la solapa.
 * @param {number} indice - Índice de la alternativa.
 */
function seleccionarSubSolapaPlanificador(contenedorId, indice) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;
  contenedor.querySelectorAll('.plan-sub-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === indice);
  });
  contenedor.querySelectorAll('.plan-sub-panel').forEach((panel, i) => {
    panel.classList.toggle('active', i === indice);
  });
  localStorage.setItem('dashboardPlanSubTab_' + contenedorId, indice);
}
const planSubTabIn = seleccionarSubSolapaPlanificador;

/**
 * Abre el visor iframe embebido de una asignatura específica activando el panel correspondiente.
 * @param {string} url - Ruta relativa o absoluta del recurso HTML de la materia.
 * @param {string} titulo - Denominación de la asignatura para persistencia y cabecera.
 */
function abrirMateria(url, titulo) {
  const vistaIframe = document.getElementById('materiaViewContainer');
  const iframe = document.getElementById('materiaIframe');
  const panelSp3 = document.getElementById('sp3');

  if (vistaIframe && iframe) {
    document.querySelectorAll('.super-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.super-tab').forEach(tab => tab.classList.remove('active'));

    iframe.src = url;
    if (panelSp3) panelSp3.classList.add('active');
    vistaIframe.style.display = 'block';

    localStorage.setItem('activeViewType', 'materia');
    localStorage.setItem('activeMateriaUrl', url);
    localStorage.setItem('activeMateriaTitulo', titulo || '');
  }
}

window.seleccionarSolapaPrincipal = seleccionarSolapaPrincipal;
window.superTab = seleccionarSolapaPrincipal;
window.seleccionarSubSolapaSeguimiento = seleccionarSubSolapaSeguimiento;
window.subTab = seleccionarSubSolapaSeguimiento;
window.abrirMateria = abrirMateria;
window.mainTabIn = seleccionarSolapaContenedor;
window.seleccionarSolapaContenedor = seleccionarSolapaContenedor;
window.planSubTabIn = seleccionarSubSolapaPlanificador;
window.seleccionarSubSolapaPlanificador = seleccionarSubSolapaPlanificador;

