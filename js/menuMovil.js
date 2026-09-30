/**
 * Módulo de Menú Hamburguesa y Navegación Móvil Lateral (Drawer)
 * Gestiona la sincronización visual del título de la cabecera móvil, la apertura y cierre
 * del panel lateral emergente y la navegación táctil entre solapas principales.
 */

const nombresTabMovil = [
  "🔗 Links útiles",
  "📊 Seguimiento de Carrera",
  "📅 Planificador 2026",
  "📅 Visor de Materia",
  "📖 Guía Académica & FAQ"
];

/**
 * Actualiza el texto de título visible en la barra de navegación para móviles.
 * @param {number} indice - Índice de la solapa activa.
 */
function actualizarTituloCabeceraMovil(indice) {
  const tituloEl = document.getElementById('gMobileTitle');
  if (tituloEl && nombresTabMovil[indice]) {
    tituloEl.textContent = nombresTabMovil[indice];
  }
}
const updateMobileHeaderTitle = actualizarTituloCabeceraMovil;

/**
 * Alterna el estado abierto/cerrado del menú lateral móvil y bloquea el desplazamiento del fondo.
 */
function alternarMenu() {
  const overlay = document.getElementById('mobileMenuOverlay');
  if (!overlay) return;
  const toggle = document.getElementById('menuToggle');
  const estaAbierto = overlay.classList.contains('open');

  if (estaAbierto) {
    cerrarMenu();
  } else {
    overlay.classList.add('open');
    if (toggle) toggle.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
const toggleMenu = alternarMenu;

/**
 * Cierra el menú lateral móvil y restaura el scroll estándar del cuerpo del documento.
 */
function cerrarMenu() {
  const overlay = document.getElementById('mobileMenuOverlay');
  const toggle = document.getElementById('menuToggle');
  if (overlay) {
    overlay.classList.remove('open');
    if (toggle) toggle.classList.remove('open');
    document.body.style.overflow = '';
  }
}
const closeMenu = cerrarMenu;

/**
 * Selecciona una solapa principal desde el menú móvil y cierra automáticamente el panel lateral.
 * @param {number} i - Índice de la solapa elegida.
 */
function seleccionarSolapaMovil(i) {
  if (typeof seleccionarSolapaPrincipal === 'function') {
    seleccionarSolapaPrincipal(i);
  } else if (typeof superTab === 'function') {
    superTab(i);
  }
  cerrarMenu();
}
const selectMobileTab = seleccionarSolapaMovil;

/**
 * Despliega o repliega subgrupos de menú anidados en la vista móvil.
 * @param {number|string} indice - Identificador del subgrupo.
 */
function alternarSubgrupoMenu(indice) {
  const subgrupo = document.getElementById('menuSubgroup' + indice);
  const chevron = document.getElementById('menuChevron' + indice);
  if (subgrupo && chevron) {
    const abierto = subgrupo.classList.contains('open');
    subgrupo.classList.toggle('open', !abierto);
    chevron.textContent = abierto ? '▶' : '▼';
  }
}
const toggleMenuSubgroup = alternarSubgrupoMenu;

window.alternarMenu = alternarMenu;
window.cerrarMenu = cerrarMenu;
window.seleccionarSolapaMovil = seleccionarSolapaMovil;
window.actualizarTituloCabeceraMovil = actualizarTituloCabeceraMovil;
