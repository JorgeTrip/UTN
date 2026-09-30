/**
 * Módulo Parser de Exámenes Finales desde SIU Guaraní
 * Permite copiar y pegar filas tabulares de la sección 'Exámenes' del SIU
 * extrayendo de forma automática fecha, nota, resultado, acta, turno, libro y folio.
 */

/**
 * Parsea una o más filas copiadas de la tabla de Exámenes del SIU Guaraní.
 * @param {string} texto - Texto copiado desde el portapapeles del SIU.
 * @returns {Object|null} Objeto estructurado del examen final.
 */
function parsearFilaExamenSIU(texto) {
  if (!texto || typeof texto !== 'string') return null;
  const lineas = texto.trim().split('\n');
  const lineaDatos = lineas.find(l => {
    const s = l.toLowerCase();
    return !s.includes('propuesta') && !s.includes('actividad') && !s.includes('turno examen') && l.trim().length > 0;
  }) || lineas[0];

  if (!lineaDatos) return null;
  const cols = lineaDatos.split(/\t+/).length >= 5
    ? lineaDatos.split(/\t+/)
    : lineaDatos.split(/\s{2,}/);

  if (cols.length < 5) return null;

  // Columnas: Propuesta(0) | Actividad(1) | Fecha(2) | Nota(3) | Resultado(4) | Nro. Acta(5) | Año(6) | Turno(7) | Libro(8) | Folio(9)
  const fechaRaw = cols[2]?.trim() || '';
  let fecha = '';
  if (fechaRaw.includes('/')) {
    const p = fechaRaw.split('/');
    if (p.length === 3) fecha = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
  } else {
    fecha = fechaRaw;
  }

  const notaVal = cols[3]?.trim() || '';
  const nota = notaVal !== '' && !isNaN(notaVal) ? parseInt(notaVal, 10) : null;
  const resRaw = (cols[4] || '').toLowerCase().trim();
  const resultado = resRaw.includes('ausente')
    ? 'ausente'
    : (resRaw.includes('reprob') || (nota !== null && nota < 6) ? 'desaprobado' : 'aprobado');

  const acta = cols[5]?.trim() || null;
  const anio = cols[6]?.trim() || null;
  const turno = cols[7]?.trim() || null;
  const libro = cols[8]?.trim() || null;
  const folio = cols[9]?.trim() || null;

  return { fecha, nota, resultado, acta, anio, turno, libro, folio };
}

/**
 * Alterna el despliegue del área de pegado rápido de exámenes del SIU en el modal.
 */
function alternarAreaPegarExamenSIU() {
  const cont = document.getElementById('contenedorPegarExamenSIU');
  if (cont) cont.style.display = cont.style.display === 'none' ? 'block' : 'none';
}

/**
 * Procesa el texto pegado en el textarea y agrega el examen final al modal.
 */
function procesarFilaExamenSIUModal() {
  const input = document.getElementById('inputPegarExamenSIU');
  if (!input || !window.materiaObjEnEdicion) return;
  const exam = parsearFilaExamenSIU(input.value);
  if (!exam) {
    alert('No se pudo reconocer el formato de la fila de exámenes del SIU.');
    return;
  }

  if (!window.materiaObjEnEdicion.finales) window.materiaObjEnEdicion.finales = [];
  window.materiaObjEnEdicion.finales.push(exam);

  if (exam.resultado === 'aprobado') {
    if (exam.libro) window.materiaObjEnEdicion.libro = exam.libro;
    if (exam.folio) window.materiaObjEnEdicion.folio = exam.folio;
    if (exam.acta) window.materiaObjEnEdicion.acta = exam.acta;
    if (exam.turno) window.materiaObjEnEdicion.turno = exam.turno;
  }

  input.value = '';
  alternarAreaPegarExamenSIU();

  if (typeof renderizarSeccionFinalesModal === 'function') {
    renderizarSeccionFinalesModal(window.materiaObjEnEdicion);
  }
  if (typeof actualizarEvaluacionesModal === 'function') {
    actualizarEvaluacionesModal();
  }
}

window.parsearFilaExamenSIU = parsearFilaExamenSIU;
window.alternarAreaPegarExamenSIU = alternarAreaPegarExamenSIU;
window.procesarFilaExamenSIUModal = procesarFilaExamenSIUModal;
