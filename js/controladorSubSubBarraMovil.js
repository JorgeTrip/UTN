/**
 * Módulo Controlador de Sub-Sub-Barra Inferior Móvil (Cuatrimestres y Alternativas)
 * Permite conmutar con precisión táctil entre cuatrimestres y alternativas de cursada.
 */

let subSubCuatActivo = 0;
let subSubAltActiva = 0;

function asegurarSubSubTabBar() {
  if (document.getElementById('subSubTabBarInferiorMovil')) return;
  const barra = document.createElement('div');
  barra.id = 'subSubTabBarInferiorMovil';
  barra.className = 'sub-sub-tab-bar-inferior';
  barra.setAttribute('aria-label', 'Cuatrimestres y alternativas de cursada móviles');
  barra.style.display = 'none';
  document.body.appendChild(barra);
}

function actualizarSubSubTabBarMovil(superTabIndice, anioIndice = 0) {
  asegurarSubSubTabBar();
  const barra = document.getElementById('subSubTabBarInferiorMovil');
  if (!barra) return;

  const numSuper = Number(superTabIndice);
  const numAnio = Number(anioIndice);

  // La sub-sub-barra solo aplica al Planificador (superTab 2)
  if (numSuper !== 2) {
    barra.style.display = 'none';
    document.body.classList.remove('con-sub-sub-barra');
    return;
  }

  barra.replaceChildren();

  if (numAnio === 0) {
    // 2026: Cuatrimestres y Alternativas
    const items2026 = [
      { id: 'c0', tipo: 'cuat', valor: 0, label: '1° Cuat' },
      { id: 'c1', tipo: 'cuat', valor: 1, label: '2° Cuat' },
      { id: 'a0', tipo: 'alt', valor: 0, label: 'Alt 1' },
      { id: 'a1', tipo: 'alt', valor: 1, label: 'Alt 2' },
      { id: 'a2', tipo: 'alt', valor: 2, label: 'Alt 3' }
    ];

    items2026.forEach(it => {
      const pill = document.createElement('button');
      const esActivo = (it.tipo === 'cuat' && it.valor === subSubCuatActivo && subSubCuatActivo === 0) ||
                       (it.tipo === 'alt' && it.valor === subSubAltActiva && subSubCuatActivo === 1);
      pill.className = `sub-sub-pill ${esActivo ? 'active' : ''}`;
      pill.textContent = it.label;
      pill.dataset.tipo = it.tipo;
      pill.dataset.valor = String(it.valor);
      pill.onclick = () => navegarSubSubTabMovil(it.tipo, it.valor, 'tab2026');
      barra.appendChild(pill);
    });
  } else if (numAnio === 1 || numAnio === 2) {
    // 2027 y 2028: Cuatrimestres
    const contenedorId = numAnio === 1 ? 'tab2027' : 'tab2028';
    const itemsFuturo = [
      { id: 'c0', tipo: 'cuat', valor: 0, label: '1° Cuatrimestre' },
      { id: 'c1', tipo: 'cuat', valor: 1, label: '2° Cuatrimestre' }
    ];

    itemsFuturo.forEach(it => {
      const pill = document.createElement('button');
      pill.className = `sub-sub-pill ${it.valor === subSubCuatActivo ? 'active' : ''}`;
      pill.textContent = it.label;
      pill.dataset.tipo = it.tipo;
      pill.dataset.valor = String(it.valor);
      pill.onclick = () => navegarSubSubTabMovil(it.tipo, it.valor, contenedorId);
      barra.appendChild(pill);
    });
  } else {
    barra.style.display = 'none';
    document.body.classList.remove('con-sub-sub-barra');
    return;
  }

  barra.style.display = 'flex';
  document.body.classList.add('con-sub-sub-barra');
}

function navegarSubSubTabMovil(tipo, valor, contenedorId = 'tab2026') {
  const numVal = Number(valor);

  if (tipo === 'cuat') {
    subSubCuatActivo = numVal;
    if (typeof window.mainTabIn === 'function') {
      window.mainTabIn(contenedorId, numVal);
    }
  } else if (tipo === 'alt') {
    subSubCuatActivo = 1;
    subSubAltActiva = numVal;
    if (typeof window.mainTabIn === 'function') {
      window.mainTabIn('tab2026', 1);
    }
    if (typeof window.planSubTabIn === 'function') {
      window.planSubTabIn('mp2026q2', numVal);
    }
  }

  const barra = document.getElementById('subSubTabBarInferiorMovil');
  if (barra) {
    barra.querySelectorAll('.sub-sub-pill').forEach(btn => {
      const bTipo = btn.dataset.tipo;
      const bVal = Number(btn.dataset.valor);
      const activo = (tipo === 'cuat' && bTipo === 'cuat' && bVal === numVal) ||
                     (tipo === 'alt' && bTipo === 'alt' && bVal === numVal);
      btn.classList.toggle('active', activo);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', asegurarSubSubTabBar);
} else {
  asegurarSubSubTabBar();
}

window.asegurarSubSubTabBar = asegurarSubSubTabBar;
window.actualizarSubSubTabBarMovil = actualizarSubSubTabBarMovil;
window.navegarSubSubTabMovil = navegarSubSubTabMovil;
