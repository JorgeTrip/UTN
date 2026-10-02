/**
 * Controlador de Efectos Visuales Parallax en Scroll
 * Anima el fondo hero y genera convergencia lateral interactiva de las tarjetas de beneficios.
 */

let listenerScrollActivo = null;
let animacionFrameId = null;

/**
 * Inicia el observador de scroll y actualiza las transformaciones de capas.
 */
function inicializarEfectoParallax() {
  if (typeof window === 'undefined') return;

  const bgHero = document.getElementById('heroParallaxBg');
  const grilla = document.getElementById('grillaCardsParallax');
  const cardsIzq = document.querySelectorAll('.card-izq');
  const cardsCentro = document.querySelectorAll('.card-centro');
  const cardsDer = document.querySelectorAll('.card-der');

  const aplicarTransformaciones = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const altoVentana = window.innerHeight || 800;

    // 1. Desplazamiento parallax de la imagen hero
    if (bgHero) {
      const offsetHero = Math.min(260, scrollY * 0.35);
      bgHero.style.transform = `translate3d(0, ${offsetHero}px, 0)`;
    }

    // 2. Convergencia interactiva de tarjetas desde los laterales hacia el centro
    if (grilla) {
      const rectGrilla = grilla.getBoundingClientRect();
      const puntoEntrada = altoVentana * 0.95;
      const puntoConsolidado = altoVentana * 0.35;

      // Progreso de 0 (recién entra) a 1 (totalmente centrada)
      const factorDistancia = (puntoEntrada - rectGrilla.top) / (puntoEntrada - puntoConsolidado);
      const progreso = Math.min(1, Math.max(0, factorDistancia));

      const desplazamientoLateral = (1 - progreso) * (window.innerWidth < 768 ? 40 : 80);
      const desplazamientoVertical = (1 - progreso) * 35;
      const opacidad = 0.35 + progreso * 0.65;
      const escala = 0.93 + progreso * 0.07;

      cardsIzq.forEach(card => {
        card.style.transform = `translate3d(-${desplazamientoLateral}px, 0, 0)`;
        card.style.opacity = String(opacidad);
      });

      cardsDer.forEach(card => {
        card.style.transform = `translate3d(${desplazamientoLateral}px, 0, 0)`;
        card.style.opacity = String(opacidad);
      });

      cardsCentro.forEach(card => {
        card.style.transform = `translate3d(0, ${desplazamientoVertical}px, 0) scale(${escala})`;
        card.style.opacity = String(opacidad);
      });
    }

    animacionFrameId = null;
  };

  const onScrollHandler = () => {
    if (!animacionFrameId) {
      animacionFrameId = window.requestAnimationFrame(aplicarTransformaciones);
    }
  };

  destruirEfectoParallax();

  window.addEventListener('scroll', onScrollHandler, { passive: true });
  listenerScrollActivo = onScrollHandler;

  // Ejecuta una primera pasada
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
