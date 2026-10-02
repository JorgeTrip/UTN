/**
 * Controlador de Efectos Visuales Parallax en Scroll
 * Provee animaciones fluidas y aceleradas por hardware para las capas de fondo y tarjetas.
 */

let listenerScrollActivo = null;
let animacionFrameId = null;

/**
 * Inicia el observador de scroll y actualiza las transformaciones de capas.
 */
function inicializarEfectoParallax() {
  if (typeof window === 'undefined') return;

  const formasParallax = document.querySelectorAll('.parallax-shape');
  const tarjetasParallax = document.querySelectorAll('.landing-card');

  if (formasParallax.length === 0 && tarjetasParallax.length === 0) return;

  const aplicarTransformaciones = () => {
    const scrollY = window.scrollY || window.pageYOffset;

    // Transformación de formas de fondo a diferentes profundidades (velocidades relativas)
    formasParallax.forEach((forma, idx) => {
      const factor = (idx + 1) * 0.18;
      const desplazamiento = scrollY * factor;
      forma.style.transform = `translate3d(0, ${desplazamiento}px, 0)`;
    });

    // Inclinación sutil de tarjetas al entrar en el viewport
    const alturaVentana = window.innerHeight;
    tarjetasParallax.forEach(tarjeta => {
      const rect = tarjeta.getBoundingClientRect();
      const puntoMedio = rect.top + rect.height / 2;
      const distanciaAlCentro = puntoMedio - alturaVentana / 2;

      if (rect.top < alturaVentana && rect.bottom > 0) {
        const factorInclinacion = Math.max(-10, Math.min(10, distanciaAlCentro * 0.02));
        tarjeta.style.setProperty('--scroll-offset', `${factorInclinacion}px`);
      }
    });

    animacionFrameId = null;
  };

  const onScrollHandler = () => {
    if (!animacionFrameId) {
      animacionFrameId = window.requestAnimationFrame(aplicarTransformaciones);
    }
  };

  // Limpia cualquier listener previo
  destruirEfectoParallax();

  window.addEventListener('scroll', onScrollHandler, { passive: true });
  listenerScrollActivo = onScrollHandler;

  // Ejecuta una primera pasada de posicionamiento
  onScrollHandler();
}

/**
 * Desactiva el observador y libera recursos al desmontar la vista.
 */
function destruirEfectoParallax() {
  if (typeof window === 'undefined') return;

  if (listenerScrollActivo) {
    window.removeEventListener('scroll', listenerScrollActivo);
    listenerScrollActivo = null;
  }
  if (animacionFrameId) {
    window.cancelAnimationFrame(animacionFrameId);
    animacionFrameId = null;
  }
}

const exportacionParallax = {
  inicializarEfectoParallax,
  destruirEfectoParallax
};

if (typeof window !== 'undefined') {
  window.landingParallax = exportacionParallax;
}
if (typeof globalThis !== 'undefined') {
  globalThis.landingParallax = exportacionParallax;
}
