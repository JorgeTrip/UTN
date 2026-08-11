/**
 * Módulo de Navegación por Solapas y Persistencia de Estado
 * Controla la activación de Super Tabs, Sub Tabs y Main Tabs en el dashboard y planificador.
 */

function superTab(indice) {
  document.querySelectorAll('.super-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === indice);
  });
  document.querySelectorAll('.super-panel').forEach((panel, i) => {
    panel.classList.toggle('active', i === indice);
  });
  const vistaIframe = document.getElementById('materiaViewContainer');
  if (vistaIframe) vistaIframe.style.display = 'none';

  localStorage.setItem('activeViewType', 'tab');
  localStorage.setItem('dashboardSuperTab', indice);

  if (indice === 0 && typeof renderizarLinksUtiles === 'function') {
    renderizarLinksUtiles();
  } else if (indice === 2 && typeof renderizarPlanificadorCompleto === 'function') {
    renderizarPlanificadorCompleto();
  }

  if (typeof updateMobileHeaderTitle === 'function') {
    updateMobileHeaderTitle(indice);
  }
}

function sp1Tab(indice) {
  document.querySelectorAll('#sp1 .sub-tab-bar .sub-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === indice);
  });
  document.querySelectorAll('#sp1 .sub-panel').forEach((panel, i) => {
    panel.classList.toggle('active', i === indice);
  });
  localStorage.setItem('dashboardSp1Tab', indice);
}

function mainTabIn(contenedorId, indice) {
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

function planSubTabIn(contenedorId, indice) {
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

function abrirMateria(url, titulo) {
  const vistaIframe = document.getElementById('materiaViewContainer');
  const iframe = document.getElementById('materiaIframe');
  if (vistaIframe && iframe) {
    iframe.src = url;
    vistaIframe.style.display = 'block';
    document.querySelectorAll('.super-panel').forEach(panel => panel.classList.remove('active'));
    localStorage.setItem('activeViewType', 'materia');
    localStorage.setItem('activeMateriaUrl', url);
    localStorage.setItem('activeMateriaTitulo', titulo);
  }
}
