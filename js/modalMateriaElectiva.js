/**
 * Módulo Selector de Materias Electivas Institucionales
 * Administra la apertura, filtrado por bloque (Nivel 3/4 vs Nivel 5) e incorporación
 * de asignaturas electivas al plan académico del estudiante.
 */

let nivelElectivaSeleccionada = 3;

/**
 * Abre la ventana modal para seleccionar e incorporar una nueva materia electiva institucional.
 * @param {number} [nivel=3] - Nivel académico objetivo (3, 4 o 5).
 */
function abrirModalElectiva(nivel) {
  nivelElectivaSeleccionada = nivel || 3;
  const modal = document.getElementById('modalElectiva');
  if (!modal) return;
  const esBloque34 = nivelElectivaSeleccionada <= 4;
  const txtNivel = document.getElementById('txtNivelElectiva');
  if (txtNivel) txtNivel.textContent = esBloque34 ? 'Bloque Combinado 3.º / 4.º Nivel' : 'Bloque 5.º Nivel (Especialización)';

  const todas = window.datosGlobales?.planEstudio?.materias_electivas || window.datosGlobales?.planEstudio?.oferta_materias_electivas || [];
  const oferta = todas.filter(e => esBloque34 ? (e.nivel <= 4 || (e.nivel_asignado && e.nivel_asignado.includes('3.er'))) : (e.nivel === 5 || (e.nivel_asignado && e.nivel_asignado.includes('5.º'))));
  const select = document.getElementById('selectMateriaElectiva');

  if (select) {
    select.replaceChildren();
    select.insertAdjacentHTML('beforeend', oferta.map(e => `<option value="${e.codigo || e.id}">${e.nombre} (${e.horas_reloj_estimadas || e.horas_reloj || 80}hs reloj · ${e.area_tematica || 'Electiva'})</option>`).join(''));
  }
  actualizarInfoElectivaSeleccionada();
  modal.classList.add('open');
}

/**
 * Cierra la ventana modal del selector de materias electivas.
 */
function cerrarModalElectiva() {
  const modal = document.getElementById('modalElectiva');
  if (modal) modal.classList.remove('open');
}

/**
 * Actualiza la ficha de detalles de la electiva seleccionada en el combo desplegable.
 */
function actualizarInfoElectivaSeleccionada() {
  const select = document.getElementById('selectMateriaElectiva');
  if (!select) return;
  const todas = window.datosGlobales?.planEstudio?.materias_electivas || window.datosGlobales?.planEstudio?.oferta_materias_electivas || [];
  const elObj = todas.find(e => (e.codigo || e.id) === select.value) || {};

  const hsReloj = elObj.horas_reloj_estimadas || elObj.horas_reloj || 80;
  const hsSem = elObj.horas_catedra_semanales || elObj.horas_semanales || 4;
  const area = elObj.area_tematica ? ` · Área: ${elObj.area_tematica}` : '';
  const correlativas = elObj.correlativas_para_cursar?.length ? ` · Correlativas: ${elObj.correlativas_para_cursar.join(', ')}` : '';

  const setTexto = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTexto('infoElectivaNombre', elObj.nombre || '-');
  setTexto('infoElectivaCarga', `⏱️ ${hsReloj}hs Reloj (${hsSem}hs/semana)${area}${correlativas}`);
  setTexto('infoElectivaDesc', elObj.descripcion || 'Sin descripción disponible.');
}

/**
 * Guarda la electiva configurada en el modal en la lista de aprobadas o en curso del estudiante.
 */
function guardarMateriaElectivaModal() {
  const select = document.getElementById('selectMateriaElectiva');
  if (!select || !window.datosGlobales?.datosAlumno) return;
  const idSel = select.value;
  const todas = window.datosGlobales?.planEstudio?.materias_electivas || window.datosGlobales?.planEstudio?.oferta_materias_electivas || [];
  const elObj = todas.find(e => (e.codigo || e.id) === idSel) || {};

  const estado = document.getElementById('selectEstadoElectiva')?.value || 'aprobada';
  const notaVal = document.getElementById('inputNotaElectiva')?.value.trim() || '';
  const nota = notaVal !== '' && !isNaN(notaVal) ? Number(notaVal) : null;
  const fecha = document.getElementById('inputFechaElectiva')?.value.trim() || '2026-03-01';

  const datos = window.datosGlobales.datosAlumno;
  let aprobadas = (datos.materiasAprobadas || []).filter(m => m.id !== idSel);
  let enCurso = (datos.materiasEnCurso || []).filter(m => m.id !== idSel);

  if (estado === 'aprobada') aprobadas.push({ id: idSel, nombre: elObj.nombre, nota, modalidad: 'promocion', fechaAprobacion: fecha, plan: 'K23' });
  else if (estado === 'en_curso' || estado === 'firmada') enCurso.push({ id: idSel, nombre: elObj.nombre, estado, plan: 'K23' });

  datos.materiasAprobadas = aprobadas;
  datos.materiasEnCurso = enCurso;

  if (typeof guardarDatosAlumnoEnStorage === 'function') guardarDatosAlumnoEnStorage();
  cerrarModalElectiva();
  if (typeof renderizarTodoElDashboard === 'function') renderizarTodoElDashboard();
}
