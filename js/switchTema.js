/**
 * Módulo de Conmutación de Tema Claro / Oscuro
 * Permite cambiar dinámicamente el tema estético y recordar la preferencia del usuario.
 */

function alternarTema() {
  const temaActual = document.documentElement.getAttribute('data-tema');
  const nuevoTema = temaActual === 'claro' ? 'oscuro' : 'claro';
  aplicarTema(nuevoTema);
}

function aplicarTema(nombreTema) {
  document.documentElement.setAttribute('data-tema', nombreTema);
  localStorage.setItem('pulso_tema_preferido', nombreTema);

  const etiquetaTexto = document.getElementById('switchTemaTexto');
  const etiquetaIcono = document.getElementById('switchTemaIcono');

  if (etiquetaTexto && etiquetaIcono) {
    if (nombreTema === 'claro') {
      etiquetaTexto.textContent = 'Modo Claro';
      etiquetaIcono.textContent = '☀️';
    } else {
      etiquetaTexto.textContent = 'Modo Oscuro';
      etiquetaIcono.textContent = '🌙';
    }
  }
}

function inicializarTema() {
  const temaGuardado = localStorage.getItem('pulso_tema_preferido');
  if (temaGuardado) {
    aplicarTema(temaGuardado);
  } else {
    const prefiereOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    aplicarTema(prefiereOscuro ? 'oscuro' : 'claro');
  }
}
