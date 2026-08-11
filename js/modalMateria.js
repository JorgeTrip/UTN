/**
 * Módulo de Edición Interactiva de Materias, Evaluaciones, SIU y Selector de Electivas
 * Permite gestionar notas, parciales, TPs, historial SIU y la incorporación de electivas institucionales.
 */

let materiaIdActualEdicion = null;
let nivelElectivaSeleccionada = 3;

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

  document.getElementById('editNombreMateria').textContent = nombreMat;
  document.getElementById('selectEstadoMateria').value = estado;
  document.getElementById('inputNotaMateria').value = nota;
  document.getElementById('selectModalidadMateria').value = modalidad;
  document.getElementById('inputFechaAprobacion').value = fechaAprob;

  renderizarHistorialSIUEnModal(materiaId);
  if (typeof renderizarSeccionEvaluacionesModal === 'function') renderizarSeccionEvaluacionesModal(matObj);
  modal.classList.add('open');
}

function renderizarHistorialSIUEnModal(materiaId) {
  const contenedor = document.getElementById('listaHistorialSIU');
  if (!contenedor) return;
  const historial = (window.datosGlobales?.datosAlumno?.historialSIU || []).filter(h => h.materiaId === materiaId);
  if (historial.length === 0) {
    contenedor.innerHTML = '<div style="font-size:11.5px;color:var(--muted);padding:4px 0;">No hay intentos de examen/regularidad registrados en el SIU.</div>'; return;
  }
  contenedor.innerHTML = historial.map((h, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px;background:var(--s1);border:1px solid var(--border);border-radius:5px;margin-bottom:4px;font-size:11.5px;">
      <div><strong style="color:${h.resultado === 'Aprobado' || h.resultado === 'Promocionado' ? 'var(--green)' : (h.resultado === 'Reprobado' ? 'var(--accent)' : 'var(--muted)')}">${h.tipo} ${h.nota !== null ? '(' + h.nota + ')' : ''}</strong> · ${h.resultado} <span style="font-size:10px;color:var(--muted);">(${h.fecha})</span></div>
      <button class="btn-sec" style="padding:1px 5px;font-size:9.5px;color:var(--accent);" onclick="eliminarIntentoSIU('${materiaId}', ${i})">🗑</button>
    </div>
  `).join('');
}

function agregarIntentoSIU() {
  if (!materiaIdActualEdicion) return;
  const fecha = document.getElementById('siuFecha').value.trim();
  const tipo = document.getElementById('siuTipo').value;
  const notaVal = document.getElementById('siuNota').value.trim();
  const nota = notaVal !== '' && !isNaN(notaVal) ? Number(notaVal) : null;
  const resultado = document.getElementById('siuResultado').value;
  if (!fecha) { alert('Ingresá una fecha válida'); return; }
  const datos = window.datosGlobales.datosAlumno;
  if (!datos.historialSIU) datos.historialSIU = [];
  datos.historialSIU.push({ materiaId: materiaIdActualEdicion, fecha, tipo, nota, resultado });
  if (typeof guardarDatosAlumnoEnStorage === 'function') guardarDatosAlumnoEnStorage();
  renderizarHistorialSIUEnModal(materiaIdActualEdicion);
  document.getElementById('siuFecha').value = ''; document.getElementById('siuNota').value = '';
}

function eliminarIntentoSIU(materiaId, indexFiltrado) {
  const datos = window.datosGlobales.datosAlumno;
  if (!datos.historialSIU) return;
  let contador = 0;
  datos.historialSIU = datos.historialSIU.filter(h => {
    if (h.materiaId === materiaId) { const mantener = contador !== indexFiltrado; contador++; return mantener; } return true;
  });
  if (typeof guardarDatosAlumnoEnStorage === 'function') guardarDatosAlumnoEnStorage();
  renderizarHistorialSIUEnModal(materiaId);
}

function cerrarModalEditarMateria() {
  const modal = document.getElementById('modalMateria');
  if (modal) modal.classList.remove('open');
  materiaIdActualEdicion = null;
}

function guardarEdicionMateria() {
  if (!materiaIdActualEdicion || !window.datosGlobales?.datosAlumno) return;
  const datos = window.datosGlobales.datosAlumno;
  let aprobadas = datos.materiasAprobadas || [];
  let enCurso = datos.materiasEnCurso || [];

  const estado = document.getElementById('selectEstadoMateria').value;
  const notaVal = document.getElementById('inputNotaMateria').value.trim();
  const nota = notaVal !== '' && !isNaN(notaVal) ? Number(notaVal) : null;
  const modalidad = document.getElementById('selectModalidadMateria').value;
  const fechaAprobacion = document.getElementById('inputFechaAprobacion').value.trim();
  const evalData = (typeof obtenerEvaluacionesModalData === 'function') ? obtenerEvaluacionesModalData() : {};

  aprobadas = aprobadas.filter(m => m.id !== materiaIdActualEdicion);
  enCurso = enCurso.filter(m => m.id !== materiaIdActualEdicion);

  const matData = { id: materiaIdActualEdicion, nombre: document.getElementById('editNombreMateria').textContent, estado, nota, modalidad, fechaAprobacion, plan: 'K23', ...evalData };

  if (estado === 'aprobada' || estado === 'equivalencia') aprobadas.push(matData);
  else if (estado === 'en_curso' || estado === 'firmada') enCurso.push(matData);

  datos.materiasAprobadas = aprobadas; datos.materiasEnCurso = enCurso;
  if (typeof guardarDatosAlumnoEnStorage === 'function') guardarDatosAlumnoEnStorage();
  cerrarModalEditarMateria();
  if (typeof renderizarUI === 'function') renderizarUI();
}

function abrirModalElectiva(nivel) {
  nivelElectivaSeleccionada = nivel || 3;
  const modal = document.getElementById('modalElectiva');
  if (!modal) return;
  const esBloque34 = nivelElectivaSeleccionada <= 4;
  document.getElementById('txtNivelElectiva').textContent = esBloque34 ? 'Bloque Combinado 3.º / 4.º Nivel' : 'Bloque 5.º Nivel (Especialización)';

  const todas = window.datosGlobales?.planEstudio?.materias_electivas || window.datosGlobales?.planEstudio?.oferta_materias_electivas || [];
  const oferta = todas.filter(e => esBloque34 ? (e.nivel <= 4 || (e.nivel_asignado && e.nivel_asignado.includes('3.er'))) : (e.nivel === 5 || (e.nivel_asignado && e.nivel_asignado.includes('5.º'))));
  const select = document.getElementById('selectMateriaElectiva');

  select.innerHTML = oferta.map(e => `<option value="${e.codigo || e.id}">${e.nombre} (${e.horas_reloj_estimadas || e.horas_reloj || 80}hs reloj · ${e.area_tematica || 'Electiva'})</option>`).join('');
  actualizarInfoElectivaSeleccionada();
  modal.classList.add('open');
}

function cerrarModalElectiva() {
  const modal = document.getElementById('modalElectiva');
  if (modal) modal.classList.remove('open');
}

function actualizarInfoElectivaSeleccionada() {
  const select = document.getElementById('selectMateriaElectiva');
  if (!select) return;
  const todas = window.datosGlobales?.planEstudio?.materias_electivas || window.datosGlobales?.planEstudio?.oferta_materias_electivas || [];
  const elObj = todas.find(e => (e.codigo || e.id) === select.value) || {};

  const hsReloj = elObj.horas_reloj_estimadas || elObj.horas_reloj || 80;
  const hsSem = elObj.horas_catedra_semanales || elObj.horas_semanales || 4;
  const area = elObj.area_tematica ? ` · Área: ${elObj.area_tematica}` : '';
  const correlativas = elObj.correlativas_para_cursar && elObj.correlativas_para_cursar.length > 0 ? ` · Correlativas: ${elObj.correlativas_para_cursar.join(', ')}` : '';

  document.getElementById('infoElectivaNombre').textContent = elObj.nombre || '-';
  document.getElementById('infoElectivaCarga').textContent = `⏱️ ${hsReloj}hs Reloj (${hsSem}hs/semana)${area}${correlativas}`;
  document.getElementById('infoElectivaDesc').textContent = elObj.descripcion || 'Sin descripción disponible.';
}

function guardarMateriaElectivaModal() {
  const select = document.getElementById('selectMateriaElectiva');
  if (!select || !window.datosGlobales?.datosAlumno) return;
  const idSel = select.value;
  const todas = window.datosGlobales?.planEstudio?.materias_electivas || window.datosGlobales?.planEstudio?.oferta_materias_electivas || [];
  const elObj = todas.find(e => (e.codigo || e.id) === idSel) || {};

  const estado = document.getElementById('selectEstadoElectiva').value;
  const notaVal = document.getElementById('inputNotaElectiva').value.trim();
  const nota = notaVal !== '' && !isNaN(notaVal) ? Number(notaVal) : null;
  const fecha = document.getElementById('inputFechaElectiva').value.trim() || '2026-03-01';

  const datos = window.datosGlobales.datosAlumno;
  let aprobadas = (datos.materiasAprobadas || []).filter(m => m.id !== idSel);
  let enCurso = (datos.materiasEnCurso || []).filter(m => m.id !== idSel);

  if (estado === 'aprobada') aprobadas.push({ id: idSel, nombre: elObj.nombre, nota, modalidad: 'promocion', fechaAprobacion: fecha, plan: 'K23' });
  else if (estado === 'en_curso' || estado === 'firmada') enCurso.push({ id: idSel, nombre: elObj.nombre, estado, plan: 'K23' });

  datos.materiasAprobadas = aprobadas; datos.materiasEnCurso = enCurso;
  if (typeof guardarDatosAlumnoEnStorage === 'function') guardarDatosAlumnoEnStorage();
  cerrarModalElectiva();
  if (typeof renderizarUI === 'function') renderizarUI();
}
