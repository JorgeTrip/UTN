/**
 * Controlador de Efectos Visuales Parallax en Scroll
 * Provee animaciones fluidas y aceleradas por hardware para la imagen de fondo Hero y formas.
 */

let listenerScrollActivo = null;
let animacionFrameId = null;

/**
 * Inicia el observador de scroll y actualiza las transformaciones de capas.
 */
function inicializarEfectoParallax() {
  if (typeof window === 'undefined') return;

  const bgHero = document.getElementById('heroParallaxBg');
  const formasParallax = document.querySelectorAll('.parallax-shape');

  if (!bgHero && formasParallax.length === 0) return;

  const aplicarTransformaciones = () => {
    const scrollY = window.scrollY || window.pageYOffset;

    // Desplazamiento parallax de la imagen de fondo Hero (velocidad relativa suave ~0.35)
    if (bgHero) {
      const offsetHero = Math.min(250, scrollY * 0.35);
      bgHero.style.transform = `translate3d(0, ${offsetHero}px, 0)`;
    }

    // Desplazamiento sutil de formas de fondo a diferentes profundidades
    formasParallax.forEach((forma, idx) => {
      const factor = (idx + 1) * 0.15;
      const desplazamiento = scrollY * factor;
      forma.style.transform = `translate3d(0, ${desplazamiento}px, 0)`;
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
