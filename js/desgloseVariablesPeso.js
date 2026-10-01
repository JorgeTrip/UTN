/**
 * Módulo de Desglose Detallado y Tooltips de Variables de Peso Académico
 * Genera el detalle específico de asignaturas y cómputos para tooltips en hover y glosario.
 */

function obtenerDetallesComputoPeso(datosAlumno = {}) {
  const aprobadas = datosAlumno.materiasAprobadas || [];
  const enCurso = datosAlumno.materiasEnCurso || [];
  const historial = datosAlumno.historialSIU || [];
  const perfil = datosAlumno.perfil || {};

  const anioActual = new Date().getFullYear();
  const anioIngreso = parseInt(perfil.fechaIngreso) || null;
  const aa = anioIngreso ? Math.max(0, anioActual - anioIngreso) : 0;

  // CMA: Materias aprobadas
  const listaCma = aprobadas.map(m => {
    const notaTxt = m.nota ? ` (Nota: ${m.nota})` : (m.modalidad === 'equivalencia_k08' ? ' (Equivalencia)' : '');
    return `<li>• ${m.nombre || m.id}${notaTxt}</li>`;
  });

  // CMD: Aplazos en finales (< 6)
  const aplazosSIU = historial.filter(h => typeof h.nota === 'number' && h.nota > 0 && (h.nota < 6 || h.resultado === 'Reprobado'));
  const listaCmd = aplazosSIU.map(a => `<li>• ${a.materia || a.nombre || 'Examen'}: Nota ${a.nota || 'Aplazo'} (${a.fecha || 'SIU'})</li>`);

  // FAd_total: Finales adeudados / reprobados
  const adeudados = historial.filter(h => h.tipo === 'Examen' && (h.resultado === 'Reprobado' || (typeof h.nota === 'number' && h.nota > 0 && h.nota < 6)));
  const listaFad = adeudados.map(a => `<li>• ${a.materia || a.nombre || 'Final'} (Nota: ${a.nota})</li>`);

  // FAu_ciclo: Ausentes
  const ausentes = historial.filter(h => h.tipo === 'Examen' && h.resultado === 'Ausente');
  const listaFau = ausentes.map(a => `<li>• ${a.materia || a.nombre || 'Final'} (Ausente ${a.fecha || ''})</li>`);

  // MAb_ciclo: Abandonos o bajas
  const bajas = historial.filter(h => h.resultado === 'Baja' || h.resultado === 'Abandonada');
  const listaMab = bajas.map(b => `<li>• ${b.materia || b.nombre || 'Cursada'} (${b.resultado})</li>`);

  // MR_ciclo: Regularizadas / en curso
  const listaMr = enCurso.map(c => `<li>• ${c.nombre || c.id} (En curso / Regularizada)</li>`);

  return {
    cma: { count: aprobadas.length, lista: listaCma, titulo: `Materias Aprobadas (${aprobadas.length})` },
    aa: {
      valor: aa,
      calculo: anioIngreso
        ? `Año actual (${anioActual}) - Año ingreso (${anioIngreso}) = ${aa} años de antigüedad`
        : 'Sin fecha de ingreso cargada en el perfil (0 años)'
    },
    cmd: { count: aplazosSIU.length, lista: listaCmd, titulo: `Aplazos en Finales (${aplazosSIU.length})` },
    mAp_total: { count: aprobadas.length, lista: listaCma, titulo: `Total Aprobadas (${aprobadas.length})` },
    fAd_total: { count: adeudados.length, lista: listaFad, titulo: `Finales Adeudados (${adeudados.length})` },
    fAu_ciclo: { count: ausentes.length, lista: listaFau, titulo: `Ausentes en Final (${ausentes.length})` },
    mAb_ciclo: { count: bajas.length, lista: listaMab, titulo: `Cursadas Bajas/Abandonadas (${bajas.length})` },
    mR_ciclo: { count: enCurso.length, lista: listaMr, titulo: `Regularizadas en Ciclo (${enCurso.length})` }
  };
}

function renderizarTooltipDesgloseHtml(titulo, itemsHtml, textoVacio = 'Sin registros') {
  const tieneContenido = Array.isArray(itemsHtml) && itemsHtml.length > 0;
  return `
    <div class="tooltip-desglose">
      <div class="tooltip-header">${titulo}</div>
      <div class="tooltip-body">
        ${tieneContenido ? `<ul class="tooltip-lista">${itemsHtml.join('')}</ul>` : `<div class="tooltip-vacio">${textoVacio}</div>`}
      </div>
    </div>
  `;
}

function renderizarTooltipTextoHtml(titulo, detalleTexto) {
  return `
    <div class="tooltip-desglose">
      <div class="tooltip-header">${titulo}</div>
      <div class="tooltip-body">
        <div style="font-size:11.5px;color:var(--text);">${detalleTexto}</div>
      </div>
    </div>
  `;
}

window.obtenerDetallesComputoPeso = obtenerDetallesComputoPeso;
window.renderizarTooltipDesgloseHtml = renderizarTooltipDesgloseHtml;
window.renderizarTooltipTextoHtml = renderizarTooltipTextoHtml;
