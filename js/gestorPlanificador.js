/**
 * Módulo Gestor del Planificador Cuatrimestral
 * Maneja las operaciones de lectura, agregado y eliminación de materias en la planificación,
 * asegurando la persistencia de datos y actualización reactiva de la interfaz.
 */

/**
 * Obtiene la estructura de planificación del alumno o la inicializa si no existe.
 * @returns {Object} Objeto de planificación por años y cuatrimestres.
 */
function obtenerPlanificacion() {
  if (!window.datosGlobales) window.datosGlobales = {};
  if (!window.datosGlobales.datosAlumno) window.datosGlobales.datosAlumno = {};
  if (!window.datosGlobales.datosAlumno.planificacion) {
    window.datosGlobales.datosAlumno.planificacion = {
      "2026": { "1c": { alternativaElegida: 0, alternativas: [{ nombre: "Única", hasSat: false, eventos: [] }] }, "2c": { alternativaElegida: 0, alternativas: [{ nombre: "Alt 1 (Recomendada)", hasSat: true, eventos: [] }] } },
      "2027": { "1c": { alternativaElegida: 0, alternativas: [{ nombre: "Plan 2027 · 1C", hasSat: false, eventos: [] }] }, "2c": { alternativaElegida: 0, alternativas: [{ nombre: "Plan 2027 · 2C", hasSat: false, eventos: [] }] } },
      "2028": { "1c": { alternativaElegida: 0, alternativas: [{ nombre: "Plan 2028 · 1C", hasSat: false, eventos: [] }] }, "2c": { alternativaElegida: 0, alternativas: [{ nombre: "Plan 2028 · 2C", hasSat: false, eventos: [] }] } }
    };
  }
  return window.datosGlobales.datosAlumno.planificacion;
}

/**
 * Obtiene el arreglo de eventos para un año, cuatrimestre y alternativa específicos.
 * @param {string} anio - Ej. '2026'
 * @param {string} cuatrimestre - Ej. '1c' o '2c'
 * @param {number} alternativa - Índice de alternativa (0, 1, 2)
 * @returns {Array} Lista de eventos.
 */
function obtenerEventosPlanificacion(anio, cuatrimestre, alternativa) {
  const plan = obtenerPlanificacion();
  const bloqueAnio = plan[anio] && plan[anio][cuatrimestre];
  if (!bloqueAnio || !bloqueAnio.alternativas) return [];
  const alt = bloqueAnio.alternativas[alternativa] || bloqueAnio.alternativas[0];
  return alt ? alt.eventos || [] : [];
}

/**
 * Agrega una materia/evento a la planificación indicada y persiste los cambios.
 * @param {string} anio - Año lectivo
 * @param {string} cuatrimestre - '1c' o '2c'
 * @param {number} alternativa - Índice de alternativa
 * @param {Object} evento - Datos del evento a ubicar
 */
function agregarEventoPlanificador(anio, cuatrimestre, alternativa, evento) {
  const plan = obtenerPlanificacion();
  if (!plan[anio]) plan[anio] = {};
  if (!plan[anio][cuatrimestre]) {
    plan[anio][cuatrimestre] = { alternativaElegida: 0, alternativas: [{ nombre: "Principal", hasSat: false, eventos: [] }] };
  }
  const alternativas = plan[anio][cuatrimestre].alternativas;
  if (!alternativas[alternativa]) {
    alternativas[alternativa] = { nombre: `Alternativa ${alternativa + 1}`, hasSat: false, eventos: [] };
  }
  
  if (!evento.id) {
    evento.id = 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }
  
  alternativas[alternativa].eventos.push(evento);
  if (evento.day === 5) alternativas[alternativa].hasSat = true;

  if (typeof guardarDatosAlumnoEnStorage === 'function') {
    guardarDatosAlumnoEnStorage();
  }

  if (typeof renderizarPlanificadorCompleto === 'function') {
    renderizarPlanificadorCompleto();
  }

  mostrarToastPlanificador(`Se ubicó "${evento.name}" en la planificación (${anio} ${cuatrimestre.toUpperCase()}).`);
}

/**
 * Elimina una materia de la planificación indicada por su ID y guarda cambios.
 * @param {string} anio - Año lectivo
 * @param {string} cuatrimestre - '1c' o '2c'
 * @param {number} alternativa - Índice de alternativa
 * @param {string} eventoId - Identificador del evento
 */
function eliminarEventoPlanificador(anio, cuatrimestre, alternativa, eventoId) {
  const plan = obtenerPlanificacion();
  const bloque = plan[anio] && plan[anio][cuatrimestre];
  if (!bloque || !bloque.alternativas || !bloque.alternativas[alternativa]) return;

  const alt = bloque.alternativas[alternativa];
  const indice = alt.eventos.findIndex(e => e.id === eventoId);
  if (indice === -1) return;

  const eventoEliminado = alt.eventos[indice];
  alt.eventos.splice(indice, 1);
  alt.hasSat = alt.eventos.some(e => e.day === 5);

  if (typeof guardarDatosAlumnoEnStorage === 'function') {
    guardarDatosAlumnoEnStorage();
  }

  if (typeof renderizarPlanificadorCompleto === 'function') {
    renderizarPlanificadorCompleto();
  }

  mostrarToastPlanificador(`Se eliminó "${eventoEliminado.name}" del planificador.`, 'danger');
}

/**
 * Muestra una notificación emergente tipo toast estilo Apple.
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - 'success' o 'danger'
 */
function mostrarToastPlanificador(mensaje, tipo = 'success') {
  let toast = document.getElementById('toastPlanificador');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastPlanificador';
    toast.className = 'toast-planificador';
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.style.borderColor = tipo === 'danger' ? 'var(--accent)' : 'var(--asi)';
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3200);
}

/**
 * Obtiene el índice de la alternativa elegida para un año y cuatrimestre.
 * @param {string} anio 
 * @param {string} cuatrimestre 
 * @returns {number} Índice de la alternativa elegida (0 por defecto).
 */
function obtenerAlternativaElegida(anio, cuatrimestre) {
  const plan = obtenerPlanificacion();
  return plan[anio]?.[cuatrimestre]?.alternativaElegida ?? 0;
}

/**
 * Establece la alternativa elegida/asignada para un año y cuatrimestre.
 * @param {string} anio - Ej. '2026'
 * @param {string} cuatrimestre - Ej. '2c'
 * @param {number} indiceAlternativa - Índice de la alternativa asignada
 */
function seleccionarAlternativaDefinitiva(anio, cuatrimestre, indiceAlternativa) {
  const plan = obtenerPlanificacion();
  if (!plan[anio]) plan[anio] = {};
  if (!plan[anio][cuatrimestre]) {
    plan[anio][cuatrimestre] = { alternativaElegida: 0, alternativas: [] };
  }

  plan[anio][cuatrimestre].alternativaElegida = Number(indiceAlternativa);

  if (typeof guardarDatosAlumnoEnStorage === 'function') {
    guardarDatosAlumnoEnStorage();
  }

  if (typeof renderizarPlanificadorCompleto === 'function') {
    renderizarPlanificadorCompleto();
  }

  const alt = plan[anio][cuatrimestre].alternativas?.[indiceAlternativa];
  const nombreAlt = alt?.nombre || `Alt ${indiceAlternativa + 1}`;
  mostrarToastPlanificador(`🏆 Se seleccionó "${nombreAlt}" como la alternativa definitiva asignada.`);
}
