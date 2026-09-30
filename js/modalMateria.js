/**
 * Módulo de Edición Interactiva de Materias y Exámenes Finales
 * Calcula estado y calificaciones en forma automática mediante el algoritmo UTN.
 */
let materiaIdActualEdicion = null;
window.materiaObjEnEdicion = null;

function conmutarModoModalMateria() {
  const mod = document.getElementById('selectModalidadMateria')?.value || 'cursada';
  const pEq = document.getElementById('panelEquivalencia');
  const pCur = document.getElementById('panelCursadaRegular');
  if (!pEq || !pCur) return;
  if (mod === 'equivalencia_k08' || mod === 'equivalencia_carrera') {
    pEq.style.display = 'block'; pCur.style.display = 'none';
  } else if (mod === 'cursada') {
    pEq.style.display = 'none'; pCur.style.display = 'flex';
  } else {
    pEq.style.display = 'none'; pCur.style.display = 'none';
  }
}

function abrirModalEditarMateria(materiaId, evento) {
  if (evento) evento.stopPropagation();
  materiaIdActualEdicion = materiaId;
  const modal = document.getElementById('modalMateria');
  if (!modal) return;

  const datos = window.datosGlobales?.datosAlumno || {};
  const matAprobada = (datos.materiasAprobadas || []).find(m => m.id === materiaId);
  const matEnCurso = (datos.materiasEnCurso || []).find(m => m.id === materiaId);
  const matExistente = matAprobada || matEnCurso;
  window.materiaObjEnEdicion = JSON.parse(JSON.stringify(matExistente || { id: materiaId }));

  let modalidad = 'cursada', fechaEq = '';
  const nombreMat = matExistente?.nombre || materiaId;

  if (matAprobada) {
    if (matAprobada.modalidad === 'equivalencia_k08' || matAprobada.modalidad === 'equivalencia_carrera' || matAprobada.estado === 'equivalencia') {
      modalidad = matAprobada.modalidad || 'equivalencia_k08';
      fechaEq = matAprobada.fechaAprobacion || '';
    } else {
      modalidad = 'cursada';
    }
  }

  const setTexto = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

  setTexto('editNombreMateria', nombreMat);
  setVal('selectModalidadMateria', modalidad);
  setVal('inputFechaEquivalencia', fechaEq);

  conmutarModoModalMateria();
  if (typeof renderizarSeccionEvaluacionesModal === 'function') renderizarSeccionEvaluacionesModal(window.materiaObjEnEdicion);
  renderizarSeccionFinalesModal(window.materiaObjEnEdicion);
  modal.classList.add('open');
}

function renderizarSeccionFinalesModal(matObj) {
  const contenedor = document.getElementById('listaLlamadosFinales');
  if (!contenedor) return;
  const finales = matObj?.finales || [];

  if (finales.length === 0) {
    contenedor.replaceChildren();
    contenedor.insertAdjacentHTML('beforeend', '<div style="font-size:11px;color:var(--muted);padding:3px 0;">No hay llamados de examen final registrados aún.</div>');
    return;
  }

  contenedor.replaceChildren();
  contenedor.insertAdjacentHTML('beforeend', finales.map((f, i) => {
    let color = 'var(--muted)', badge = 'Ausente';
    if (f.resultado === 'aprobado' || (f.nota && f.nota >= 6)) { color = 'var(--green)'; badge = `Aprobado (${f.nota})`; }
    else if (f.resultado === 'desaprobado' || (f.nota && f.nota < 6)) { color = 'var(--accent)'; badge = `Aplazo (${f.nota})`; }

    const extra = (f.libro ? ` · Libro ${f.libro}` : '') + (f.folio ? ` Folio ${f.folio}` : '') + (f.acta ? ` · Acta ${f.acta}` : '');
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px;background:var(--s2);border:1px solid var(--border);border-radius:6px;margin-bottom:4px;font-size:11.5px;">
        <div><strong style="color:${color}">${badge}</strong> <span style="color:var(--muted);font-size:10px;margin-left:6px;">📅 ${f.fecha || 'Sin fecha'}${extra}</span></div>
        <button type="button" class="btn-sec" style="padding:1px 5px;font-size:9.5px;color:var(--accent);" onclick="eliminarLlamadoFinal(${i})">🗑</button>
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
  if (!window.materiaObjEnEdicion) return;
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

  if (!window.materiaObjEnEdicion.finales) window.materiaObjEnEdicion.finales = [];
  window.materiaObjEnEdicion.finales.push({ fecha, resultado, nota });

  renderizarSeccionFinalesModal(window.materiaObjEnEdicion);
  if (typeof actualizarEvaluacionesModal === 'function') actualizarEvaluacionesModal();
  if (elFecha) elFecha.value = '';
  if (elNota) elNota.value = '';
}

function eliminarLlamadoFinal(index) {
  if (!window.materiaObjEnEdicion || !window.materiaObjEnEdicion.finales) return;
  window.materiaObjEnEdicion.finales.splice(index, 1);
  renderizarSeccionFinalesModal(window.materiaObjEnEdicion);
  if (typeof actualizarEvaluacionesModal === 'function') actualizarEvaluacionesModal();
}

function cerrarModalEditarMateria() {
  const modal = document.getElementById('modalMateria');
  if (modal) modal.classList.remove('open');
  materiaIdActualEdicion = null;
  window.materiaObjEnEdicion = null;
}

function guardarEdicionMateria() {
  if (!materiaIdActualEdicion || !window.datosGlobales?.datosAlumno) return;
  const datos = window.datosGlobales.datosAlumno;
  let aprobadas = datos.materiasAprobadas || [];
  let enCurso = datos.materiasEnCurso || [];
  const modalidadSel = document.getElementById('selectModalidadMateria')?.value || 'cursada';
  const nombreMat = document.getElementById('editNombreMateria')?.textContent || materiaIdActualEdicion;

  aprobadas = aprobadas.filter(m => m.id !== materiaIdActualEdicion);
  enCurso = enCurso.filter(m => m.id !== materiaIdActualEdicion);

  if (modalidadSel === 'equivalencia_k08' || modalidadSel === 'equivalencia_carrera') {
    const fechaEq = document.getElementById('inputFechaEquivalencia')?.value.trim() || '';
    aprobadas.push({
      id: materiaIdActualEdicion, nombre: nombreMat, estado: 'equivalencia',
      modalidad: modalidadSel, nota: null, fechaAprobacion: fechaEq, plan: 'K23'
    });
  } else if (modalidadSel === 'cursada') {
    const evalData = (typeof obtenerEvaluacionesModalData === 'function') ? obtenerEvaluacionesModalData() : {};
    const nParciales = evalData.configuracionEvaluacion?.cantidadParciales ?? 2;
    const nTPs = evalData.configuracionEvaluacion?.cantidadTPs ?? 0;
    const res = (typeof calcularCondicionCursadaCompleta === 'function')
      ? calcularCondicionCursadaCompleta(evalData.evaluaciones?.parciales, evalData.evaluaciones?.tps, nParciales, nTPs)
      : { estado: 'en_curso' };

    const finales = window.materiaObjEnEdicion?.finales || [];
    const finalAprobado = finales.slice().reverse().find(f => f.resultado === 'aprobado' || (f.nota && f.nota >= 6));

    let estado = 'en_curso', modalidad = null, nota = null, fechaAprobacion = '';
    if (finalAprobado) {
      estado = 'aprobada'; modalidad = 'final'; nota = finalAprobado.nota; fechaAprobacion = finalAprobado.fecha;
    } else if (res.promociona && res.promedioParciales !== null) {
      estado = 'aprobada'; modalidad = 'promocion'; nota = Math.round(res.promedioParciales); fechaAprobacion = new Date().toISOString().split('T')[0];
    } else if (res.estado === 'firmada') {
      estado = 'firmada'; modalidad = 'final_pendiente';
    } else if (res.recursa) {
      estado = 'recursa';
    } else {
      estado = 'en_curso';
    }

    const matData = { id: materiaIdActualEdicion, nombre: nombreMat, estado, modalidad, nota, fechaAprobacion, plan: 'K23', finales, ...evalData };
    if (estado === 'aprobada') aprobadas.push(matData);
    else enCurso.push(matData);
  }

  datos.materiasAprobadas = aprobadas;
  datos.materiasEnCurso = enCurso;

  if (typeof guardarDatosAlumnoEnStorage === 'function') guardarDatosAlumnoEnStorage();
  cerrarModalEditarMateria();
  if (typeof renderizarTodoElDashboard === 'function') renderizarTodoElDashboard();
}
