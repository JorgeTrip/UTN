/**
 * Módulo de Conmutación de Tema Claro / Oscuro (Estilo Apple "Grises Pro")
 * Permite cambiar dinámicamente el tema estético y recordar la preferencia del usuario,
 * asegurando por regla de gobernanza que el Modo Oscuro sea el tema predeterminado.
 */

/**
 * Alterna entre el tema claro y el tema oscuro en el documento.
 */
function alternarTema() {
  const temaActual = document.documentElement.getAttribute('data-tema') || 'oscuro';
  const nuevoTema = temaActual === 'claro' ? 'oscuro' : 'claro';
  aplicarTema(nuevoTema);
}

/**
 * Aplica el tema seleccionado a la raíz del documento, actualiza localStorage y sincroniza la UI.
 * @param {string} nombreTema - 'oscuro' | 'claro'.
 */
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

/**
 * Inicializa el tema al cargar la página: respeta la elección previa o fuerza 'oscuro' por defecto.
 */
function inicializarTema() {
  const temaGuardado = localStorage.getItem('pulso_tema_preferido');
  aplicarTema(temaGuardado || 'oscuro');
}
