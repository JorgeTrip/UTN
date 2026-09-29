/**
 * Módulo de Edición Interactiva de Materias, Evaluaciones y SIU
 * Permite gestionar notas, estados de cursada (firmada/aprobada/en curso),
 * evaluaciones parciales e historial de exámenes rendidos en SIU Guaraní.
 */

let materiaIdActualEdicion = null;

/**
 * Abre el modal para editar el estado, nota y evaluaciones de una materia curricular.
 * @param {string} materiaId - Identificador único de la asignatura.
 * @param {Event} [evento] - Evento de clic para evitar propagación de eventos contenedores.
 */
function abrirModalEditarMateria(materiaId, evento) {
  if (evento) evento.stopPropagation();
  materiaIdActualEdicion = materiaId;
  const modal = document.getElementById('modalMateria');
  if (!modal) return;

  const datos = window.datosGlobales?.datosAlumno || {};
  const matAprobada = (datos.materiasAprobadas || []).find(m => m.id === materiaId);
  const matEnCurso = (datos.materiasEnCurso || []).find(m => m.id === materiaId);
  const matObj = matAprobada || matEnCurso || {};

  let estado = 'pendiente', nota = '', modalidad = 'promocion', fechaAprob = '', nombreMat = materiaId;
  if (matAprobada) {
    if (matAprobada.estado === 'firmada' || matAprobada.modalidad === 'final_pendiente') estado = 'firmada';
    else estado = matAprobada.modalidad?.startsWith('equivalencia') ? 'equivalencia' : 'aprobada';
    nota = matAprobada.nota !== null && matAprobada.nota !== undefined ? matAprobada.nota : '';
    modalidad = matAprobada.modalidad || 'promocion';
    fechaAprob = matAprobada.fechaAprobacion || '';
    nombreMat = matAprobada.nombre || materiaId;
  } else if (matEnCurso) {
    estado = matEnCurso.estado === 'firmada' ? 'firmada' : 'en_curso';
    nombreMat = matEnCurso.nombre || materiaId;
  }

  const setTexto = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

  setTexto('editNombreMateria', nombreMat);
  setVal('selectEstadoMateria', estado);
  setVal('inputNotaMateria', nota);
  setVal('selectModalidadMateria', modalidad);
  setVal('inputFechaAprobacion', fechaAprob);

  renderizarHistorialSIUEnModal(materiaId);
  if (typeof renderizarSeccionEvaluacionesModal === 'function') renderizarSeccionEvaluacionesModal(matObj);
  modal.classList.add('open');
}

/**
 * Renderiza la lista de intentos de exámenes y regularidades cargados en SIU para la materia.
 * @param {string} materiaId - ID de la asignatura a consultar.
 */
function renderizarHistorialSIUEnModal(materiaId) {
  const contenedor = document.getElementById('listaHistorialSIU');
  if (!contenedor) return;
  const historial = (window.datosGlobales?.datosAlumno?.historialSIU || []).filter(h => h.materiaId === materiaId);
  if (historial.length === 0) {
    contenedor.replaceChildren();
    contenedor.insertAdjacentHTML('beforeend', '<div style="font-size:11.5px;color:var(--muted);padding:4px 0;">No hay intentos de examen/regularidad registrados en el SIU.</div>');
    return;
  }
  contenedor.replaceChildren();
  contenedor.insertAdjacentHTML('beforeend', historial.map((h, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px;background:var(--s1);border:1px solid var(--border);border-radius:5px;margin-bottom:4px;font-size:11.5px;">
      <div><strong style="color:${h.resultado === 'Aprobado' || h.resultado === 'Promocionado' ? 'var(--green)' : (h.resultado === 'Reprobado' ? 'var(--accent)' : 'var(--muted)')}">${h.tipo} ${h.nota !== null ? '(' + h.nota + ')' : ''}</strong> · ${h.resultado} <span style="font-size:10px;color:var(--muted);">(${h.fecha})</span></div>
      <button class="btn-sec" style="padding:1px 5px;font-size:9.5px;color:var(--accent);" onclick="eliminarIntentoSIU('${materiaId}', ${i})">🗑</button>
    </div>
  `).join(''));
}

/**
 * Añade un nuevo intento de examen o regularidad SIU al historial del alumno.
 */
function agregarIntentoSIU() {
  if (!materiaIdActualEdicion) return;
  const elFecha = document.getElementById('siuFecha');
  const elTipo = document.getElementById('siuTipo');
  const elNota = document.getElementById('siuNota');
  const elRes = document.getElementById('siuResultado');
  if (!elFecha || !elFecha.value.trim()) { alert('Ingresá una fecha válida'); return; }

  const fecha = elFecha.value.trim();
  const tipo = elTipo ? elTipo.value : 'Examen';
  const notaVal = elNota ? elNota.value.trim() : '';
  const nota = notaVal !== '' && !isNaN(notaVal) ? Number(notaVal) : null;
  const resultado = elRes ? elRes.value : 'Aprobado';

  const datos = window.datosGlobales.datosAlumno;
  if (!datos.historialSIU) datos.historialSIU = [];
  datos.historialSIU.push({ materiaId: materiaIdActualEdicion, fecha, tipo, nota, resultado });

  if (typeof guardarDatosAlumnoEnStorage === 'function') guardarDatosAlumnoEnStorage();
  renderizarHistorialSIUEnModal(materiaIdActualEdicion);
  if (elFecha) elFecha.value = '';
  if (elNota) elNota.value = '';
}

/**
 * Elimina un registro individual del historial de exámenes del SIU.
 * @param {string} materiaId - ID de la materia.
 * @param {number} indexFiltrado - Índice en la lista filtrada de la asignatura.
 */
function eliminarIntentoSIU(materiaId, indexFiltrado) {
  const datos = window.datosGlobales.datosAlumno;
  if (!datos.historialSIU) return;
  let contador = 0;
  datos.historialSIU = datos.historialSIU.filter(h => {
    if (h.materiaId === materiaId) { const mantener = contador !== indexFiltrado; contador++; return mantener; }
    return true;
  });
  if (typeof guardarDatosAlumnoEnStorage === 'function') guardarDatosAlumnoEnStorage();
  renderizarHistorialSIUEnModal(materiaId);
}

/**
 * Cierra la ventana modal de edición de materia activa.
 */
function cerrarModalEditarMateria() {
  const modal = document.getElementById('modalMateria');
  if (modal) modal.classList.remove('open');
  materiaIdActualEdicion = null;
}

/**
 * Persiste los cambios de la materia editada en el estado del alumno y actualiza todo el dashboard.
 */
function guardarEdicionMateria() {
  if (!materiaIdActualEdicion || !window.datosGlobales?.datosAlumno) return;
  const datos = window.datosGlobales.datosAlumno;
  let aprobadas = datos.materiasAprobadas || [];
  let enCurso = datos.materiasEnCurso || [];

  const estado = document.getElementById('selectEstadoMateria')?.value || 'pendiente';
  const notaVal = document.getElementById('inputNotaMateria')?.value.trim() || '';
  const nota = notaVal !== '' && !isNaN(notaVal) ? Number(notaVal) : null;
  const modalidad = document.getElementById('selectModalidadMateria')?.value || 'promocion';
  const fechaAprobacion = document.getElementById('inputFechaAprobacion')?.value.trim() || '';
  const evalData = (typeof obtenerEvaluacionesModalData === 'function') ? obtenerEvaluacionesModalData() : {};
  const nombreMat = document.getElementById('editNombreMateria')?.textContent || materiaIdActualEdicion;

  aprobadas = aprobadas.filter(m => m.id !== materiaIdActualEdicion);
  enCurso = enCurso.filter(m => m.id !== materiaIdActualEdicion);

  const matData = { id: materiaIdActualEdicion, nombre: nombreMat, estado, nota, modalidad, fechaAprobacion, plan: 'K23', ...evalData };

  if (estado === 'aprobada' || estado === 'equivalencia') aprobadas.push(matData);
  else if (estado === 'en_curso' || estado === 'firmada') enCurso.push(matData);

  datos.materiasAprobadas = aprobadas;
  datos.materiasEnCurso = enCurso;

  if (typeof guardarDatosAlumnoEnStorage === 'function') guardarDatosAlumnoEnStorage();
  cerrarModalEditarMateria();
  if (typeof renderizarTodoElDashboard === 'function') renderizarTodoElDashboard();
}
