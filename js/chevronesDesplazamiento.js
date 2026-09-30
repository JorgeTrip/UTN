/**
 * Módulo de Chevrones Indicadores de Scroll en Barras de Pestañas
 * Inyecta dinámicamente botones de desplazamiento horizontal suave cuando el contenido excede el ancho visual.
 */

const CANTIDAD_DESPLAZAMIENTO = 180;
const configuracionesBarras = [
  { barra: '.super-tab-bar', interno: '.super-tab-inner' },
  { barra: '.sub-tab-bar', interno: '.sub-tab-inner' },
  { barra: '.main-tabs', interno: '.main-tabs-inner' },
  { barra: '.plan-sub-tab-bar', interno: '.plan-sub-tab-inner' },
  { barra: '#subTabBarInferiorMovil', interno: '.sub-tab-pills-row' },
  { barra: '#subSubTabBarInferiorMovil', interno: null }
];

function refrescarVisibilidad(interno, btnIzq, btnDer) {
  if (!interno || !btnIzq || !btnDer) return;
  const puedeIzquierda = interno.scrollLeft > 4;
  const puedeDerecha = (interno.scrollWidth - interno.clientWidth - interno.scrollLeft) > 4;
  btnIzq.classList.toggle('visible', puedeIzquierda);
  btnDer.classList.toggle('visible', puedeDerecha);
}

/**
 * Recorre las barras de navegación e inyecta o actualiza botones chevrones.
 */
function actualizarChevronesDesplazamiento() {
  configuracionesBarras.forEach(cfg => {
    document.querySelectorAll(cfg.barra).forEach(elementoBarra => {
      const elementoInterno = cfg.interno ? elementoBarra.querySelector(cfg.interno) : elementoBarra;
      if (!elementoInterno) return;

      let botonIzquierda = elementoBarra.querySelector(':scope > .tab-chevron.left');
      let botonDerecha = elementoBarra.querySelector(':scope > .tab-chevron.right');

      if (!botonIzquierda || !botonDerecha) {
        botonIzquierda = document.createElement('button');
        botonDerecha = document.createElement('button');
        botonIzquierda.className = 'tab-chevron left';
        botonDerecha.className = 'tab-chevron right';
        botonIzquierda.textContent = '‹';
        botonDerecha.textContent = '›';
        botonIzquierda.type = 'button';
        botonDerecha.type = 'button';
        botonIzquierda.setAttribute('aria-label', 'Desplazar a la izquierda');
        botonDerecha.setAttribute('aria-label', 'Desplazar a la derecha');

        elementoBarra.appendChild(botonIzquierda);
        elementoBarra.appendChild(botonDerecha);

        botonIzquierda.addEventListener('click', (e) => {
          e.stopPropagation();
          elementoInterno.scrollBy({ left: -CANTIDAD_DESPLAZAMIENTO, behavior: 'smooth' });
        });
        botonDerecha.addEventListener('click', (e) => {
          e.stopPropagation();
          elementoInterno.scrollBy({ left: CANTIDAD_DESPLAZAMIENTO, behavior: 'smooth' });
        });

        elementoInterno.addEventListener('scroll', () => refrescarVisibilidad(elementoInterno, botonIzquierda, botonDerecha), { passive: true });
      }

      refrescarVisibilidad(elementoInterno, botonIzquierda, botonDerecha);
    });
  });
}

function inicializarChevronesDesplazamiento() {
  actualizarChevronesDesplazamiento();
  window.addEventListener('resize', actualizarChevronesDesplazamiento);
  setTimeout(actualizarChevronesDesplazamiento, 200);
}

document.addEventListener('DOMContentLoaded', inicializarChevronesDesplazamiento);

window.inicializarChevronesDesplazamiento = inicializarChevronesDesplazamiento;
window.actualizarChevronesDesplazamiento = actualizarChevronesDesplazamiento;
