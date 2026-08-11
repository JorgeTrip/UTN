/**
 * Módulo de Chevrones Indicadores de Scroll en Barras de Pestañas
 * Inyecta dinámicamente botones de desplazamiento horizontal suave.
 */

(function inicializarChevronesDesplazamiento() {
  const CANTIDAD_DESPLAZAMIENTO = 200;
  const configuraciones = [
    { barra: '.super-tab-bar', interno: '.super-tab-inner' },
    { barra: '.sub-tab-bar', interno: '.sub-tab-inner' },
    { barra: '.main-tabs', interno: '.main-tabs-inner' },
    { barra: '.plan-sub-tab-bar', interno: '.plan-sub-tab-inner' }
  ];

  document.addEventListener('DOMContentLoaded', () => {
    configuraciones.forEach(cfg => {
      document.querySelectorAll(cfg.barra).forEach(elementoBarra => {
        const elementoInterno = elementoBarra.querySelector(cfg.interno);
        if (!elementoInterno) return;

        const botonIzquierda = document.createElement('button');
        const botonDerecha = document.createElement('button');
        botonIzquierda.className = 'tab-chevron left';
        botonDerecha.className = 'tab-chevron right';
        botonIzquierda.innerHTML = '‹';
        botonDerecha.innerHTML = '›';

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
  });
})();
