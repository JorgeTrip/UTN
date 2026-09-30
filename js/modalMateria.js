/**
 * Módulo de Edición de Materias, Evaluaciones de Cursada y Exámenes Finales
 * Permite configurar parciales/TPs y registrar llamados de exámenes finales (aprobados, aplazos, ausentes).
 */

let materiaIdActualEdicion = null;
let materiaObjEnEdicion = null;

function abrirModalEditarMateria(materiaId, evento) {
  if (evento) evento.stopPropagation();
  materiaIdActualEdicion = materiaId;
  const modal = document.getElementById('modalMateria');
  if (!modal) return;

  const datos = window.datosGlobales?.datosAlumno || {};
  const matAprobada = (datos.materiasAprobadas || []).find(m => m.id === materiaId);
  const matEnCurso = (datos.materiasEnCurso || []).find(m => m.id === materiaId);
  materiaObjEnEdicion = JSON.parse(JSON.stringify(matAprobada || matEnCurso || { id: materiaId }));

  let estado = 'en_curso', nota = '', modalidad = 'promocion', fechaAprob = '', nombreMat = materiaId;
  if (matAprobada) {
    estado = matAprobada.estado === 'firmada' ? 'firmada' : (matAprobada.modalidad?.startsWith('equivalencia') ? 'equivalencia' : 'aprobada');
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

  if (typeof renderizarSeccionEvaluacionesModal === 'function') renderizarSeccionEvaluacionesModal(materiaObjEnEdicion);
  renderizarSeccionFinalesModal(materiaObjEnEdicion);
  modal.classList.add('open');
}

function renderizarSeccionFinalesModal(matObj) {
  const contenedor = document.getElementById('listaLlamadosFinales');
  if (!contenedor) return;
  const finales = matObj?.finales || [];

  if (finales.length === 0) {
    contenedor.replaceChildren();
    contenedor.insertAdjacentHTML('beforeend', '<div style="font-size:11.5px;color:var(--muted);padding:4px 0;">No hay llamados de examen final registrados.</div>');
    return;
  }

  contenedor.replaceChildren();
  contenedor.insertAdjacentHTML('beforeend', finales.map((f, i) => {
    let color = 'var(--muted)', badge = 'Ausente';
    if (f.resultado === 'aprobado' || (f.nota && f.nota >= 6)) { color = 'var(--green)'; badge = `Aprobado (${f.nota})`; }
    else if (f.resultado === 'desaprobado' || (f.nota && f.nota < 6)) { color = 'var(--accent)'; badge = `Aplazo (${f.nota})`; }

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;background:var(--s2);border:1px solid var(--border);border-radius:6px;margin-bottom:4px;font-size:11.5px;">
        <div><strong style="color:${color}">${badge}</strong> <span style="color:var(--muted);font-size:10.5px;margin-left:6px;">📅 ${f.fecha || 'Sin fecha'}</span></div>
        <button type="button" class="btn-sec" style="padding:1px 6px;font-size:9.5px;color:var(--accent);" onclick="eliminarLlamadoFinal(${i})">🗑</button>
      </div>
    `;
  }).join(''));
}

function actualizarEstadoInputNotaFinal() {
  const select = document.getElementById('selectFinalResultado');
  const inputNota = document.getElementById('inputFinalNota');
  if (!select || !inputNota) return;
  if (select.value === 'ausente') {
    inputNota.value = '';
    inputNota.disabled = true;
    inputNota.placeholder = '-';
  } else {
    inputNota.disabled = false;
    inputNota.placeholder = 'Nota';
  }
}

function agregarLlamadoFinal() {
  if (!materiaObjEnEdicion) return;
  const elFecha = document.getElementById('inputFinalFecha');
  const elRes = document.getElementById('selectFinalResultado');
  const elNota = document.getElementById('inputFinalNota');

  const fecha = elFecha?.value.trim() || new Date().toISOString().split('T')[0];
  const resultado = elRes?.value || 'aprobado';
  const notaVal = elNota?.value.trim() || '';
  let nota = notaVal !== '' && !isNaN(notaVal) ? Number(notaVal) : null;

  if (resultado === 'aprobado') {
    if (nota === null || nota < 6 || nota > 10) { alert('Un examen final aprobado requiere una nota entre 6 y 10.'); return; }
  } else if (resultado === 'desaprobado') {
    if (nota === null || nota < 1 || nota >= 6) { alert('Un aplazo requiere una nota entre 1 y 5.'); return; }
  } else {
    nota = null;
  }

  if (!materiaObjEnEdicion.finales) materiaObjEnEdicion.finales = [];
  materiaObjEnEdicion.finales.push({ fecha, resultado, nota });

  if (resultado === 'aprobado') {
    const selectEst = document.getElementById('selectEstadoMateria');
    const selectMod = document.getElementById('selectModalidadMateria');
    const inpNota = document.getElementById('inputNotaMateria');
    const inpFecha = document.getElementById('inputFechaAprobacion');
    if (selectEst) selectEst.value = 'aprobada';
    if (selectMod) selectMod.value = 'final';
    if (inpNota) inpNota.value = nota;
    if (inpFecha) inpFecha.value = fecha;
  }

  renderizarSeccionFinalesModal(materiaObjEnEdicion);
  if (elFecha) elFecha.value = '';
  if (elNota) elNota.value = '';
}

function eliminarLlamadoFinal(index) {
  if (!materiaObjEnEdicion || !materiaObjEnEdicion.finales) return;
  materiaObjEnEdicion.finales.splice(index, 1);
  renderizarSeccionFinalesModal(materiaObjEnEdicion);
}

function cerrarModalEditarMateria() {
  const modal = document.getElementById('modalMateria');
  if (modal) modal.classList.remove('open');
  materiaIdActualEdicion = null;
  materiaObjEnEdicion = null;
}

function guardarEdicionMateria() {
  if (!materiaIdActualEdicion || !window.datosGlobales?.datosAlumno) return;
  const datos = window.datosGlobales.datosAlumno;
  let aprobadas = datos.materiasAprobadas || [];
  let enCurso = datos.materiasEnCurso || [];

  const estado = document.getElementById('selectEstadoMateria')?.value || 'en_curso';
  const notaVal = document.getElementById('inputNotaMateria')?.value.trim() || '';
  const nota = notaVal !== '' && !isNaN(notaVal) ? Number(notaVal) : null;
  const modalidad = document.getElementById('selectModalidadMateria')?.value || 'promocion';
  const fechaAprobacion = document.getElementById('inputFechaAprobacion')?.value.trim() || '';
  const evalData = (typeof obtenerEvaluacionesModalData === 'function') ? obtenerEvaluacionesModalData() : {};
  const nombreMat = document.getElementById('editNombreMateria')?.textContent || materiaIdActualEdicion;
  const finales = materiaObjEnEdicion?.finales || [];

  aprobadas = aprobadas.filter(m => m.id !== materiaIdActualEdicion);
  enCurso = enCurso.filter(m => m.id !== materiaIdActualEdicion);

  const matData = { id: materiaIdActualEdicion, nombre: nombreMat, estado, nota, modalidad, fechaAprobacion, plan: 'K23', finales, ...evalData };

  if (estado === 'aprobada' || estado === 'equivalencia') aprobadas.push(matData);
  else if (estado === 'en_curso' || estado === 'firmada') enCurso.push(matData);

  datos.materiasAprobadas = aprobadas;
  datos.materiasEnCurso = enCurso;

  if (typeof guardarDatosAlumnoEnStorage === 'function') guardarDatosAlumnoEnStorage();
  cerrarModalEditarMateria();
  if (typeof renderizarTodoElDashboard === 'function') renderizarTodoElDashboard();
}
