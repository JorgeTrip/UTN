/**
 * Módulo Controlador de Navegación Móvil (Bottom Tab Bar y Sub-Barra en Cascada)
 * Orquesta la barra principal, el conector visual de origen y la sub-barra contextual apilada.
 */

const CONFIGURACION_SUBTABS = {
  1: [{ sub: 0, label: '📈 Hitos' }, { sub: 1, label: '🗺️ Mapa' }, { sub: 2, label: '⚖️ Peso' }, { sub: 3, label: '💡 Estrategia' }],
  2: [{ sub: 0, label: '📅 2026' }, { sub: 1, label: '📅 2027' }, { sub: 2, label: '📅 2028' }, { sub: 3, label: '🎓 2029' }]
};

let superTabActivoActual = 1;

function asegurarBarrasInferioresEnDOM() {
  asegurarBottomTabBar();
  asegurarSubTabBar();
  engancharSincronizaciones();
  sincronizarBottomTabBar(superTabActivoActual);
}

function asegurarBottomTabBar() {
  if (document.getElementById('bottomTabBarMovil')) return;
  const tabs = [
    { indice: 1, icono: '🏆', texto: 'Seguimiento' },
    { indice: 2, icono: '🗓️', texto: 'Planificador' },
    { indice: 4, icono: '📖', texto: 'Guía' },
    { indice: 0, icono: '🔗', texto: 'Links' }
  ];

  const barra = document.createElement('nav');
  barra.id = 'bottomTabBarMovil';
  barra.className = 'bottom-tab-bar';
  barra.setAttribute('aria-label', 'Navegación principal inferior móvil');

  tabs.forEach(t => {
    const btn = document.createElement('button');
    btn.className = `bottom-tab-item ${t.indice === 1 ? 'active' : ''}`;
    btn.dataset.tab = String(t.indice);
    btn.onclick = () => navegarDesdeBottomTab(t.indice);

    const icono = document.createElement('span');
    icono.className = 'tab-icon';
    icono.textContent = t.icono;

    const label = document.createElement('span');
    label.className = 'tab-label';
    label.textContent = t.texto;

    btn.appendChild(icono);
    btn.appendChild(label);
    barra.appendChild(btn);
  });
  document.body.appendChild(barra);
}

function asegurarSubTabBar() {
  if (document.getElementById('subTabBarInferiorMovil')) return;
  const subBarra = document.createElement('div');
  subBarra.id = 'subTabBarInferiorMovil';
  subBarra.className = 'sub-tab-bar-inferior';
  subBarra.setAttribute('aria-label', 'Subpestañas contextuales móviles');
  document.body.appendChild(subBarra);
}

function navegarDesdeBottomTab(indice) {
  const num = Number(indice);
  superTabActivoActual = num;
  if (typeof window.seleccionarSolapaPrincipal === 'function') {
    window.seleccionarSolapaPrincipal(num);
  } else if (typeof window.superTab === 'function') {
    window.superTab(num);
  }
  sincronizarBottomTabBar(num);
}

function sincronizarBottomTabBar(indice) {
  const num = Number(indice);
  superTabActivoActual = num;

  document.querySelectorAll('#bottomTabBarMovil .bottom-tab-item').forEach(btn => {
    const esActivo = Number(btn.dataset.tab) === num;
    btn.classList.toggle('active', esActivo);

    const conector = btn.querySelector('.tab-connector-arrow');
    const tieneSubTabs = Boolean(CONFIGURACION_SUBTABS[num]);

    if (esActivo && tieneSubTabs) {
      if (!conector) {
        const arrow = document.createElement('div');
        arrow.className = 'tab-connector-arrow';
        btn.appendChild(arrow);
      }
    } else if (conector) {
      conector.remove();
    }
  });

  actualizarSubTabBarMovil(num);
  if (typeof window.actualizarSubSubTabBarMovil === 'function') {
    window.actualizarSubSubTabBarMovil(num, 0);
  }
}

function actualizarSubTabBarMovil(superTabIndice, subActivoForzado = null) {
  const subBarra = document.getElementById('subTabBarInferiorMovil');
  if (!subBarra) return;

  const lista = CONFIGURACION_SUBTABS[superTabIndice];
  if (!lista || lista.length === 0) {
    subBarra.style.display = 'none';
    return;
  }

  subBarra.style.display = 'flex';
  subBarra.replaceChildren();

  let subActivo = subActivoForzado;
  if (subActivo === null) {
    subActivo = superTabIndice === 1
      ? Number(localStorage.getItem('dashboardSp1Tab') || 0)
      : (superTabIndice === 2 ? Number(localStorage.getItem('dashboardPlanYearTab') || 0) : 0);
  }

  lista.forEach(item => {
    const pill = document.createElement('button');
    pill.className = `sub-tab-pill ${item.sub === subActivo ? 'active' : ''}`;
    pill.textContent = item.label;
    pill.dataset.sub = String(item.sub);
    pill.onclick = () => navegarSubTabMovil(superTabIndice, item.sub);
    subBarra.appendChild(pill);
  });
}

function navegarSubTabMovil(superTabIndice, subTabIndice) {
  const numSub = Number(subTabIndice);
  if (superTabIndice === 1) {
    if (typeof window.seleccionarSubSolapaSeguimiento === 'function') window.seleccionarSubSolapaSeguimiento(numSub);
    else if (typeof window.subTab === 'function') window.subTab(numSub);
  } else if (superTabIndice === 2) {
    if (typeof window.seleccionarAnioPlanificador === 'function') window.seleccionarAnioPlanificador(numSub);
    else if (typeof window.planYearTab === 'function') window.planYearTab(numSub);
  }

  document.querySelectorAll('#subTabBarInferiorMovil .sub-tab-pill').forEach(p => {
    p.classList.toggle('active', Number(p.dataset.sub) === numSub);
  });

  if (typeof window.actualizarSubSubTabBarMovil === 'function') {
    window.actualizarSubSubTabBarMovil(superTabIndice, numSub);
  }
}

function engancharSincronizaciones() {
  if (window._controladorMovilSincronizado) return;

  const origSuperTab = window.seleccionarSolapaPrincipal || window.superTab;
  if (typeof origSuperTab === 'function') {
    window.seleccionarSolapaPrincipal = function(idx) {
      origSuperTab(idx);
      sincronizarBottomTabBar(idx);
    };
    window.superTab = window.seleccionarSolapaPrincipal;
  }

  const origSubTab1 = window.seleccionarSubSolapaSeguimiento || window.subTab;
  if (typeof origSubTab1 === 'function') {
    window.seleccionarSubSolapaSeguimiento = function(idx) {
      origSubTab1(idx);
      if (superTabActivoActual === 1) actualizarSubTabBarMovil(1, Number(idx));
    };
    window.subTab = window.seleccionarSubSolapaSeguimiento;
  }

  const origPlan = window.seleccionarAnioPlanificador || window.planYearTab;
  if (typeof origPlan === 'function') {
    window.seleccionarAnioPlanificador = function(idx) {
      origPlan(idx);
      if (superTabActivoActual === 2) {
        actualizarSubTabBarMovil(2, Number(idx));
        if (typeof window.actualizarSubSubTabBarMovil === 'function') {
          window.actualizarSubSubTabBarMovil(2, Number(idx));
        }
      }
    };
    window.planYearTab = window.seleccionarAnioPlanificador;
  }

  window._controladorMovilSincronizado = true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', asegurarBarrasInferioresEnDOM);
} else {
  asegurarBarrasInferioresEnDOM();
}

window.asegurarBarrasInferioresEnDOM = asegurarBarrasInferioresEnDOM;
window.sincronizarBottomTabBar = sincronizarBottomTabBar;
window.actualizarSubTabBarMovil = actualizarSubTabBarMovil;
window.navegarSubTabMovil = navegarSubTabMovil;
