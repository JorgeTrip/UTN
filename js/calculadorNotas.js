/**
 * Módulo Calculador de Calificaciones, Estado Académico y Homologación K08→K23
 * Procesa promedios, parciales con 2 recuperatorios y esperas a la totalidad de parciales requeridos.
 */

function calcularCondicionCursadaCompleta(parcialesEstructurados, tpsEstructurados, cantParcialesReq, cantTPsReq) {
  const parciales = parcialesEstructurados || [];
  const reqParciales = cantParcialesReq !== undefined ? cantParcialesReq : parciales.length;
  const tpsLista = tpsEstructurados || [];
  const reqTPs = cantTPsReq !== undefined ? cantTPsReq : tpsLista.length;

  if (reqParciales === 0 && reqTPs === 0) {
    return { estado: 'en_curso', condicionTexto: 'Sin evaluaciones configuradas', promedioParciales: null, promociona: false, regular: false, recursa: false };
  }

  let recuperatoriosRendidos = 0;
  const ultimasNotasParciales = [];
  let parcialesConNotaCount = 0;

  parciales.forEach(p => {
    let notaEfectiva = null;
    if (typeof p.recup2 === 'number' && !isNaN(p.recup2)) {
      notaEfectiva = p.recup2; recuperatoriosRendidos += 2;
    } else if (typeof p.recup1 === 'number' && !isNaN(p.recup1)) {
      notaEfectiva = p.recup1; recuperatoriosRendidos += 1;
    } else if (typeof p.original === 'number' && !isNaN(p.original)) {
      notaEfectiva = p.original;
    }
    if (notaEfectiva !== null) {
      ultimasNotasParciales.push(notaEfectiva);
      parcialesConNotaCount++;
    }
  });

  const ultimasNotasTPs = [];
  let tpsConNotaCount = 0;
  tpsLista.forEach(tp => {
    let notaTP = null;
    if (typeof tp === 'object' && tp !== null) {
      if (typeof tp.reentrega === 'number' && !isNaN(tp.reentrega)) {
        notaTP = tp.reentrega; recuperatoriosRendidos += 1;
      } else if (typeof tp.original === 'number' && !isNaN(tp.original)) {
        notaTP = tp.original;
      } else if (typeof tp.nota === 'number' && !isNaN(tp.nota)) {
        notaTP = tp.nota;
      }
    } else if (typeof tp === 'number' && !isNaN(tp)) {
      notaTP = tp;
    }
    if (notaTP !== null) {
      ultimasNotasTPs.push(notaTP);
      tpsConNotaCount++;
    }
  });

  const todasLasNotas = [...ultimasNotasParciales, ...ultimasNotasTPs];
  if (todasLasNotas.length === 0) {
    return { estado: 'en_curso', condicionTexto: '⏳ Cursada en Progreso (Sin notas ingresadas)', promedioParciales: null, promociona: false, regular: false, recursa: false };
  }

  const suma = todasLasNotas.reduce((a, b) => a + b, 0);
  const promedioGeneral = Number((suma / todasLasNotas.length).toFixed(2));

  if (parcialesConNotaCount < reqParciales || tpsConNotaCount < reqTPs) {
    return {
      estado: 'en_curso',
      condicionTexto: `⏳ Cursada en Progreso (${parcialesConNotaCount}/${reqParciales} parc., ${tpsConNotaCount}/${reqTPs} TPs · Promedio: ${promedioGeneral})`,
      promedioParciales: promedioGeneral, recuperatoriosRendidos,
      promociona: false, regular: false, recursa: false
    };
  }

  const todasAprobadas = todasLasNotas.every(n => n >= 6);
  const algunaDesaprobada = todasLasNotas.some(n => n < 6);
  const todasMayorIgual8 = todasLasNotas.every(n => n >= 8);

  if (algunaDesaprobada) {
    return {
      estado: 'recursa',
      condicionTexto: '❌ RECURSAR MATERIA (Evaluación o TP con nota final < 6)',
      promedioParciales: promedioGeneral, recuperatoriosRendidos,
      promociona: false, regular: false, recursa: true
    };
  }

  if (todasAprobadas) {
    if (promedioGeneral >= 8 && todasMayorIgual8 && recuperatoriosRendidos <= 1) {
      return {
        estado: 'promocion',
        condicionTexto: `🏆 PROMOCIONA DIRECTO (${recuperatoriosRendidos === 1 ? 'Con 1 Recup/Reentrega · ' : ''}Promedio: ${promedioGeneral})`,
        promedioParciales: promedioGeneral, recuperatoriosRendidos,
        promociona: true, regular: true, recursa: false
      };
    } else {
      let motivo = '';
      if (!todasMayorIgual8) motivo = ' (Nota individual < 8)';
      else if (recuperatoriosRendidos > 1) motivo = ' (Perdió promoción por >1 recuperatorio)';
      return {
        estado: 'firmada',
        condicionTexto: `✍️ CURSADA FIRMADA · Rinde Final${motivo} (Promedio: ${promedioGeneral})`,
        promedioParciales: promedioGeneral, recuperatoriosRendidos,
        promociona: false, regular: true, recursa: false
      };
    }
  }

  return {
    estado: 'en_curso',
    condicionTexto: `⏳ Cursada en Progreso (Promedio actual: ${promedioGeneral})`,
    promedioParciales: promedioGeneral, recuperatoriosRendidos,
    promociona: false, regular: false, recursa: false
  };
}

function calcularCondicionMateria(evaluaciones, configEvaluacion) {
  if (!evaluaciones || !configEvaluacion) return 'en_curso';
  const parciales = evaluaciones.parciales || [];
  const finalObj = evaluaciones.final || {};
  if (finalObj.nota !== null && finalObj.nota >= 4) return 'final_aprobado';
  const notasValidas = parciales.map(p => p.nota).filter(n => n !== null);
  if (notasValidas.length === 0) return 'en_curso';
  const todasAprobadas = notasValidas.every(n => n >= 6);
  const promedio = notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length;
  if (notasValidas.length === configEvaluacion.cantidadParciales) {
    if (promedio >= 8 && todasAprobadas) return 'promocion';
    if (todasAprobadas) return 'firmada';
    return 'recursa';
  }
  return 'parciales_en_progreso';
}

function calcularPromedioGeneral(materiasAprobadas) {
  if (!materiasAprobadas || materiasAprobadas.length === 0) return 0;
  const conNota = materiasAprobadas.filter(m => typeof m.nota === 'number' && m.nota > 0);
  if (conNota.length === 0) return 0;
  return Number((conNota.reduce((acc, m) => acc + m.nota, 0) / conNota.length).toFixed(2));
}

/**
 * Calcula el promedio general histórico con aplazos según normativa UTN FRBA (aplazos nota < 6).
 * @param {Array} materiasAprobadas - Lista de asignaturas aprobadas.
 * @param {Array} historialSIU - Registro legacy de exámenes SIU.
 * @param {Array} [materiasEnCurso] - Lista de asignaturas en curso.
 * @returns {number} Promedio con aplazos ponderado.
 */
function calcularPromedioConAplazos(materiasAprobadas, historialSIU, materiasEnCurso) {
  const notasAprobadas = (materiasAprobadas || []).filter(m => typeof m.nota === 'number' && m.nota > 0).map(m => m.nota);
  const notasAplazos = (historialSIU || []).filter(h => typeof h.nota === 'number' && h.nota > 0 && (h.nota < 6 || h.resultado === 'Reprobado')).map(h => h.nota);

  const todasMaterias = [...(materiasAprobadas || []), ...(materiasEnCurso || [])];
  todasMaterias.forEach(m => {
    (m.finales || []).forEach(f => {
      if (typeof f.nota === 'number' && f.nota > 0 && (f.nota < 6 || f.resultado === 'desaprobado')) {
        notasAplazos.push(f.nota);
      }
    });
  });

  const todas = [...notasAprobadas, ...notasAplazos];
  if (todas.length === 0) return 0;
  return Number((todas.reduce((a, b) => a + b, 0) / todas.length).toFixed(2));
}

function obtenerInfoTransicionMateria(materia, fechaTransicionPerfil) {
  const fechaTransicion = fechaTransicionPerfil || '2026-02-24';
  const esPreTransicion = materia.fechaAprobacion && materia.fechaAprobacion <= fechaTransicion;
  if (materia.materiaOrigenK08 && esPreTransicion) {
    return {
      esEquivalenciaK08: true,
      materiaOrigen: materia.materiaOrigenK08,
      modalidadK08: materia.modalidadOriginalK08 || 'Aprobada en Plan K08',
      modalidadK23: 'Equivalencia por Cambio de Plan K08 → K23',
      badgePlanHtml: '<span class="badge-plan-k08">K08</span> → <span class="badge-plan-k23">K23</span>'
    };
  }
  return {
    esEquivalenciaK08: false, materiaOrigen: null, modalidadK08: null,
    modalidadK23: materia.modalidad === 'promocion' ? 'Promoción Directa' : (materia.modalidad === 'final' ? 'Examen Final' : 'Aprobada'),
    badgePlanHtml: '<span class="badge-plan-k23">K23</span>'
  };
}
