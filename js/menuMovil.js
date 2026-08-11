/**
 * Módulo de Menú Hamburguesa y Navegación Móvil Drawer
 * Controla la apertura, cierre y sincronización de solapas en dispositivos móviles.
 */

const nombresTabMovil = [
  "🔗 Links útiles",
  "📊 Seguimiento de Carrera",
  "📅 Planificador 2026",
  "📅 Planificador 2027",
  "📅 Planificador 2028",
  "📅 Planificador 2029"
];

function updateMobileHeaderTitle(indice) {
  const tituloEl = document.getElementById('gMobileTitle');
  if (tituloEl && nombresTabMovil[indice]) {
    tituloEl.textContent = nombresTabMovil[indice];
  }
}

function toggleMenu() {
  const overlay = document.getElementById('mobileMenuOverlay');
  const toggle = document.getElementById('menuToggle');
  if (!overlay || !toggle) return;
  const estaAbierto = overlay.classList.contains('open');

  if (estaAbierto) {
    closeMenu();
  } else {
    overlay.classList.add('open');
    toggle.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeMenu() {
  const overlay = document.getElementById('mobileMenuOverlay');
  const toggle = document.getElementById('menuToggle');
  if (overlay && toggle) {
    overlay.classList.remove('open');
    toggle.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function selectMobileTab(i) {
  superTab(i);
  closeMenu();
}

function toggleMenuSubgroup(indice) {
  const subgrupo = document.getElementById('menuSubgroup' + indice);
  const chevron = document.getElementById('menuChevron' + indice);
  if (subgrupo && chevron) {
    const abierto = subgrupo.classList.contains('open');
    subgrupo.classList.toggle('open', !abierto);
    chevron.textContent = abierto ? '▶' : '▼';
  }
}
