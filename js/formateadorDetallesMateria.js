/**
 * Módulo Formateador de Metadatos y Detalles Académicos de Materias K23
 * Genera el desglose enriquecido de actas, comisiones, cuatrimestres, parciales y origen K08.
 */

function formatearOrigenMateriaHtml(mat) {
  if (mat.origenPlan === 'K08_homologada' || mat.modalidad === 'equivalencia_k08' || mat.materiaOrigenK08) {
    const nomOrig = mat.materiaOrigenK08 || 'Materia Plan K08';
    const fHom = mat.fechaHomologacion ? ` · Res. ${mat.fechaHomologacion}` : '';
    return `<div class="acc-row"><span class="acc-row-lbl">Origen:</span><span class="acc-row-val" style="color:#c084fc;">🔄 Plan K08 (${nomOrig})${fHom}</span></div>`;
  }
  if (mat.origenPlan === 'equivalencia_externa' || mat.modalidad === 'equivalencia_carrera') {
    return '<div class="acc-row"><span class="acc-row-lbl">Origen:</span><span class="acc-row-val" style="color:#c084fc;">🏛️ Equivalencia Externa (Carrera Anterior)</span></div>';
  }
  return '<div class="acc-row"><span class="acc-row-lbl">Origen:</span><span class="acc-row-val" style="color:var(--text-sec);">📘 Cursada Directa Plan K23</span></div>';
}

function formatearParcialesHtml(parciales) {
  if (!parciales || parciales.length === 0) return '';
  const chips = parciales.map(p => {
    const notaTxt = p.nota !== null ? `${p.nota}` : (p.resultado || 'Reg');
    return `${p.descripcion || p.instancia || p.tipo}: <strong>${notaTxt}</strong>`;
  }).join(' · ');
  return `<div class="acc-row"><span class="acc-row-lbl">Evaluaciones:</span><span class="acc-row-val">${chips}</span></div>`;
}

function formatearFinalesHistorialHtml(finales) {
  if (!finales || finales.length === 0) return '';
  if (finales.length === 1 && finales[0].resultado === 'aprobado') return '';
  const resumen = finales.map(f => {
    const resTxt = f.resultado === 'ausente' ? 'Aus' : (f.nota ? `${f.nota}` : f.resultado);
    return `${f.fecha ? f.fecha.substring(0, 7) : ''} (${resTxt})`;
  }).join(' ➔ ');
  return `<div class="acc-row"><span class="acc-row-lbl">Intentos Final:</span><span class="acc-row-val">${finales.length} llamados: ${resumen}</span></div>`;
}

function formatearCuerpoTarjetaMateria(mat) {
  if (!mat) {
    return '<div class="acc-row"><span class="acc-row-lbl">Estado:</span><span class="acc-row-val">Sin cursar · Materia pendiente</span></div>';
  }

  let html = formatearOrigenMateriaHtml(mat);

  if (mat.estado === 'firmada') {
    html += '<div class="acc-row"><span class="acc-row-lbl">Cursada:</span><span class="acc-row-val">Firmada · Habilita rendir examen final</span></div>';
  } else if (mat.estado === 'recursa') {
    html += '<div class="acc-row"><span class="acc-row-lbl">Cursada:</span><span class="acc-row-val" style="color:var(--accent)">Desaprobada · Requiere recursar</span></div>';
  } else if (mat.estado === 'en_curso') {
    const per = mat.periodoLectivo || mat.cuatrimestre || 'Cursando ciclo actual';
    html += `<div class="acc-row"><span class="acc-row-lbl">Cursada:</span><span class="acc-row-val">⏳ ${per}</span></div>`;
  } else {
    const esPromo = mat.modalidad === 'promocion';
    const tipoAprob = esPromo ? '🏆 Promoción Directa' : (mat.modalidad === 'final' ? '🎯 Examen Final' : '🔄 Homologación K08');
    const notaTxt = mat.nota !== null && mat.nota !== undefined ? `Nota ${mat.nota}` : 'Aprobada';
    const anio = mat.fechaAprobacion ? ` (${mat.fechaAprobacion.split('-')[0]})` : '';
    html += `<div class="acc-row"><span class="acc-row-lbl">Aprobación:</span><span class="acc-row-val">${tipoAprob} · ${notaTxt}${anio} · ${mat.fechaAprobacion || ''}</span></div>`;
  }

  if (mat.periodoLectivo || mat.comision) {
    const perTxt = mat.periodoLectivo ? mat.periodoLectivo : '';
    const comTxt = mat.comision ? `Comisión: ${mat.comision}` : '';
    const txt = [perTxt, comTxt].filter(Boolean).join(' · ');
    html += `<div class="acc-row"><span class="acc-row-lbl">Período / Com.:</span><span class="acc-row-val">${txt}</span></div>`;
  }

  if (mat.libro && mat.folio) {
    const turnoTxt = mat.turno ? ` · Turno: ${mat.turno}` : '';
    html += `<div class="acc-row"><span class="acc-row-lbl">Acta Oficial:</span><span class="acc-row-val">Libro ${mat.libro} · Folio ${mat.folio}${turnoTxt}</span></div>`;
  }

  html += formatearParcialesHtml(mat.parciales);
  html += formatearFinalesHistorialHtml(mat.finales);

  return html;
}

window.formatearCuerpoTarjetaMateria = formatearCuerpoTarjetaMateria;
