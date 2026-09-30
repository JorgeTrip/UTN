/**
 * Módulo Controlador de Navegación Móvil (Bottom Tab Bar y Sub-Barra en Cascada)
 * Orquesta la barra principal, el conector visual de origen y la sub-barra contextual apilada.
 */

const CONFIGURACION_SUBTABS = {
  1: [{ sub: 0, label: '📈 Hitos' }, { sub: 1, label: '🗺️ Mapa' }, { sub: 2, label: '⚖️ Peso' }, { sub: 3, label: '💡 Estrategia' }],
  2: [{ sub: 0, label: '2026' }, { sub: 1, label: '2027' }, { sub: 2, label: '2028' }, { sub: 3, label: '2029' }],
  4: [{ sub: 'todas', label: 'Todo' }, { sub: 'plan', label: 'Plan' }, { sub: 'transicion', label: 'Transición' }, { sub: 'electivas', label: 'Electivas' }, { sub: 'normativas', label: 'Normativas' }]
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
    { indice: 1, icono: '🏆', texto: 'Seguimiento' }, { indice: 2, icono: '🗓️', texto: 'Planificador' },
    { indice: 4, icono: '📖', texto: 'Guía' }, { indice: 0, icono: '🔗', texto: 'Links' }
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
    const spIcon = document.createElement('span');
    spIcon.className = 'tab-icon';
    spIcon.textContent = t.icono;
    const spTxt = document.createElement('span');
    spTxt.className = 'tab-label';
    spTxt.textContent = t.texto;
    btn.append(spIcon, spTxt);
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
  if (typeof window.seleccionarSolapaPrincipal === 'function') window.seleccionarSolapaPrincipal(num);
  else if (typeof window.superTab === 'function') window.superTab(num);
  sincronizarBottomTabBar(num);
}

function sincronizarBottomTabBar(indice) {
  const num = Number(indice);
  superTabActivoActual = num;
  document.querySelectorAll('#bottomTabBarMovil .bottom-tab-item').forEach(btn => {
    const esActivo = Number(btn.dataset.tab) === num;
    btn.classList.toggle('active', esActivo);
    const conector = btn.querySelector('.tab-connector-arrow');
    if (esActivo && CONFIGURACION_SUBTABS[num]) {
      if (!conector) {
        const arrow = document.createElement('div');
        arrow.className = 'tab-connector-arrow';
        btn.appendChild(arrow);
      }
    } else if (conector) conector.remove();
  });
  actualizarSubTabBarMovil(num);
  if (typeof window.actualizarSubSubTabBarMovil === 'function') window.actualizarSubSubTabBarMovil(num, 0);
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
    if (superTabIndice === 1) subActivo = Number(localStorage.getItem('dashboardSp1Tab') || 0);
    else if (superTabIndice === 2) subActivo = Number(localStorage.getItem('dashboardPlanYearTab') || 0);
    else if (superTabIndice === 4) subActivo = 'todas';
  }

  const pillsWrap = document.createElement('div');
  pillsWrap.className = 'sub-tab-pills-row';
  pillsWrap.style.cssText = 'display:flex;gap:3px;width:100%;overflow:visible;justify-content:space-between;align-items:center;box-sizing:border-box;';

  lista.forEach(item => {
    const pill = document.createElement('button');
    pill.className = `sub-tab-pill ${String(item.sub) === String(subActivo) ? 'active' : ''}`;
    pill.textContent = item.label;
    pill.dataset.sub = String(item.sub);
    if (superTabIndice === 4) pill.style.cssText = 'padding:5px 4px;font-size:10.5px;flex:1 1 auto;text-align:center;';
    pill.onclick = () => navegarSubTabMovil(superTabIndice, item.sub);
    pillsWrap.appendChild(pill);
  });
  subBarra.appendChild(pillsWrap);

  if (superTabIndice === 4) {
    subBarra.style.flexDirection = 'column';
    const searchWrap = document.createElement('div');
    searchWrap.style.cssText = 'width:100%;margin-top:6px;';
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.id = 'guiaBuscadorFlotanteMovil';
    inp.placeholder = '🔍 Buscar en la guía...';
    inp.style.cssText = 'width:100%;height:38px;padding:8px 12px;border-radius:10px;border:1px solid rgba(58,58,60,0.8);background:rgba(20,20,22,0.85);color:var(--text);font-size:12.5px;box-sizing:border-box;';
    inp.oninput = (e) => { if (typeof window.filtrarContenidoGuia === 'function') window.filtrarContenidoGuia(e.target.value); };
    searchWrap.appendChild(inp);
    subBarra.appendChild(searchWrap);
  } else {
    subBarra.style.flexDirection = 'row';
  }
  if (typeof window.actualizarChevronesDesplazamiento === 'function') window.actualizarChevronesDesplazamiento();
}

function navegarSubTabMovil(superTabIndice, subTabIndice) {
  const numSub = Number(subTabIndice);
  if (superTabIndice === 1) {
    if (typeof window.seleccionarSubSolapaSeguimiento === 'function') window.seleccionarSubSolapaSeguimiento(numSub);
    else if (typeof window.subTab === 'function') window.subTab(numSub);
  } else if (superTabIndice === 2) {
    if (typeof window.seleccionarAnioPlanificador === 'function') window.seleccionarAnioPlanificador(numSub);
    else if (typeof window.planYearTab === 'function') window.planYearTab(numSub);
  } else if (superTabIndice === 4 && typeof window.conmutarSeccionGuia === 'function') {
    window.conmutarSeccionGuia(subTabIndice);
  }

  document.querySelectorAll('#subTabBarInferiorMovil .sub-tab-pill').forEach(p => {
    p.classList.toggle('active', String(p.dataset.sub) === String(subTabIndice));
  });

  if (typeof window.actualizarSubSubTabBarMovil === 'function') {
    window.actualizarSubSubTabBarMovil(superTabIndice, subTabIndice);
  }
  if (typeof window.actualizarChevronesDesplazamiento === 'function') {
    window.actualizarChevronesDesplazamiento();
  }
}

function engancharSincronizaciones() {
  if (window._controladorMovilSincronizado) return;
  const origSuperTab = window.seleccionarSolapaPrincipal || window.superTab;
  if (typeof origSuperTab === 'function') {
    window.seleccionarSolapaPrincipal = (idx) => { origSuperTab(idx); sincronizarBottomTabBar(idx); };
    window.superTab = window.seleccionarSolapaPrincipal;
  }
  const origSubTab1 = window.seleccionarSubSolapaSeguimiento || window.subTab;
  if (typeof origSubTab1 === 'function') {
    window.seleccionarSubSolapaSeguimiento = (idx) => {
      origSubTab1(idx);
      if (superTabActivoActual === 1) actualizarSubTabBarMovil(1, Number(idx));
    };
    window.subTab = window.seleccionarSubSolapaSeguimiento;
  }
  const origPlan = window.seleccionarAnioPlanificador || window.planYearTab;
  if (typeof origPlan === 'function') {
    window.seleccionarAnioPlanificador = (idx) => {
      origPlan(idx);
      if (superTabActivoActual === 2) {
        actualizarSubTabBarMovil(2, Number(idx));
        if (typeof window.actualizarSubSubTabBarMovil === 'function') window.actualizarSubSubTabBarMovil(2, Number(idx));
      }
    };
    window.planYearTab = window.seleccionarAnioPlanificador;
  }
  window._controladorMovilSincronizado = true;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', asegurarBarrasInferioresEnDOM);
else asegurarBarrasInferioresEnDOM();

window.asegurarBarrasInferioresEnDOM = asegurarBarrasInferioresEnDOM;
window.sincronizarBottomTabBar = sincronizarBottomTabBar;
window.actualizarSubTabBarMovil = actualizarSubTabBarMovil;
window.navegarSubTabMovil = navegarSubTabMovil;
