/**
 * Módulo Controlador de Experiencia y Navegación Móvil (Bottom Tab Bar)
 * Gestiona la barra de pestañas inferior nativa de iOS/Android y la sincronización de paneles.
 */

function asegurarBottomTabBarEnDOM() {
  if (document.getElementById('bottomTabBarMovil')) return;

  const tabsConfig = [
    { indice: 1, icono: '🏆', texto: 'Seguimiento' },
    { indice: 2, icono: '🗓️', texto: 'Planificador' },
    { indice: 4, icono: '📖', texto: 'Guía' },
    { indice: 0, icono: '🔗', texto: 'Links' }
  ];

  const barra = document.createElement('nav');
  barra.id = 'bottomTabBarMovil';
  barra.className = 'bottom-tab-bar';
  barra.setAttribute('aria-label', 'Navegación principal inferior móvil');

  tabsConfig.forEach(t => {
    const btn = document.createElement('button');
    btn.className = `bottom-tab-item ${t.indice === 1 ? 'active' : ''}`;
    btn.dataset.tab = String(t.indice);
    btn.onclick = () => navegarDesdeBottomTab(t.indice);

    const iconoSpan = document.createElement('span');
    iconoSpan.className = 'tab-icon';
    iconoSpan.textContent = t.icono;

    const labelSpan = document.createElement('span');
    labelSpan.className = 'tab-label';
    labelSpan.textContent = t.texto;

    btn.appendChild(iconoSpan);
    btn.appendChild(labelSpan);
    barra.appendChild(btn);
  });

  document.body.appendChild(barra);
  engancharSincronizacionSuperTab();
}

function navegarDesdeBottomTab(indice) {
  const num = Number(indice);
  if (typeof window.seleccionarSolapaPrincipal === 'function') {
    window.seleccionarSolapaPrincipal(num);
  } else if (typeof window.superTab === 'function') {
    window.superTab(num);
  }
  sincronizarBottomTabBar(num);
}

function sincronizarBottomTabBar(indice) {
  const items = document.querySelectorAll('#bottomTabBarMovil .bottom-tab-item');
  items.forEach(btn => {
    const tabNum = Number(btn.dataset.tab);
    btn.classList.toggle('active', tabNum === Number(indice));
  });
}

function engancharSincronizacionSuperTab() {
  const original = window.seleccionarSolapaPrincipal || window.superTab;
  if (typeof original === 'function' && !window._superTabMovilInterceptado) {
    window.seleccionarSolapaPrincipal = function(idx) {
      original(idx);
      sincronizarBottomTabBar(idx);
    };
    window.superTab = window.seleccionarSolapaPrincipal;
    window._superTabMovilInterceptado = true;
  }
}

// Inicialización automática al cargar el DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', asegurarBottomTabBarEnDOM);
} else {
  asegurarBottomTabBarEnDOM();
}

window.asegurarBottomTabBarEnDOM = asegurarBottomTabBarEnDOM;
window.sincronizarBottomTabBar = sincronizarBottomTabBar;
window.navegarDesdeBottomTab = navegarDesdeBottomTab;
