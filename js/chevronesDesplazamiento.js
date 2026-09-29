/**
 * Módulo de Chevrones Indicadores de Scroll en Barras de Pestañas
 * Inyecta dinámicamente botones de desplazamiento horizontal suave cuando el contenido excede el ancho visual.
 */

const CANTIDAD_DESPLAZAMIENTO = 200;
const configuracionesBarras = [
  { barra: '.super-tab-bar', interno: '.super-tab-inner' },
  { barra: '.sub-tab-bar', interno: '.sub-tab-inner' },
  { barra: '.main-tabs', interno: '.main-tabs-inner' },
  { barra: '.plan-sub-tab-bar', interno: '.plan-sub-tab-inner' }
];

/**
 * Recorre las barras de navegación e inyecta botones chevrones si no están ya presentes.
 */
function inicializarChevronesDesplazamiento() {
  configuracionesBarras.forEach(cfg => {
    document.querySelectorAll(cfg.barra).forEach(elementoBarra => {
      const elementoInterno = elementoBarra.querySelector(cfg.interno);
      if (!elementoInterno || elementoBarra.querySelector('.tab-chevron')) return;

      const botonIzquierda = document.createElement('button');
      const botonDerecha = document.createElement('button');
      botonIzquierda.className = 'tab-chevron left';
      botonDerecha.className = 'tab-chevron right';
      botonIzquierda.textContent = '‹';
      botonDerecha.textContent = '›';
      botonIzquierda.type = 'button';
      botonDerecha.type = 'button';

      elementoBarra.appendChild(botonIzquierda);
      elementoBarra.appendChild(botonDerecha);

      function actualizarVisibilidad() {
        const puedeIzquierda = elementoInterno.scrollLeft > 4;
        const puedeDerecha = (elementoInterno.scrollWidth - elementoInterno.clientWidth - elementoInterno.scrollLeft) > 4;
        botonIzquierda.classList.toggle('visible', puedeIzquierda);
        botonDerecha.classList.toggle('visible', puedeDerecha);
      }

      botonIzquierda.addEventListener('click', () => {
        elementoInterno.scrollBy({ left: -CANTIDAD_DESPLAZAMIENTO, behavior: 'smooth' });
      });
      botonDerecha.addEventListener('click', () => {
        elementoInterno.scrollBy({ left: CANTIDAD_DESPLAZAMIENTO, behavior: 'smooth' });
      });

      elementoInterno.addEventListener('scroll', actualizarVisibilidad, { passive: true });
      window.addEventListener('resize', actualizarVisibilidad);
      setTimeout(actualizarVisibilidad, 150);
    });
  });
}

document.addEventListener('DOMContentLoaded', inicializarChevronesDesplazamiento);
