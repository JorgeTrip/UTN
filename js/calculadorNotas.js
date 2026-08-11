/**
 * Módulo Calculador de Calificaciones, Estado Académico y Homologación K08→K23
 * Procesa promedios, parciales con 2 recuperatorios y esperas a la totalidad de parciales requeridos.
 */

function calcularCondicionCursadaCompleta(parcialesEstructurados, tpsNotas, cantParcialesReq) {
  const parciales = parcialesEstructurados || [];
  const tps = (tpsNotas || []).filter(n => typeof n === 'number' && !isNaN(n));
  const reqParciales = cantParcialesReq || parciales.length || 2;

  if (parciales.length === 0) {
    return { estado: 'en_curso', condicionTexto: 'Sin evaluaciones cargadas', promedioParciales: null, promociona: false, regular: false, recursa: false };
  }

  let recuperatoriosRendidos = 0;
  const ultimasNotas = [];
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
      ultimasNotas.push(notaEfectiva);
      parcialesConNotaCount++;
    }
  });

  if (parcialesConNotaCount === 0) {
    return { estado: 'en_curso', condicionTexto: '⏳ Cursada en Progreso (Sin notas ingresadas)', promedioParciales: null, promociona: false, regular: false, recursa: false };
  }

  const suma = ultimasNotas.reduce((a, b) => a + b, 0);
  const promedioParciales = Number((suma / ultimasNotas.length).toFixed(2));

  if (parcialesConNotaCount < reqParciales) {
    return {
      estado: 'en_curso',
      condicionTexto: `⏳ Cursada en Progreso (${parcialesConNotaCount}/${reqParciales} parciales rendidos · Promedio actual: ${promedioParciales})`,
      promedioParciales, recuperatoriosRendidos,
      promociona: false, regular: false, recursa: false
    };
  }

  const todosParcialesAprobados = ultimasNotas.every(n => n >= 6);
  const algunParcialDesaprobado = ultimasNotas.some(n => n < 6);
  const todosTPsAprobados = tps.length === 0 || tps.every(n => n >= 6);
  const algunTPDesaprobado = tps.some(n => n < 6);

  const todasNotasMayorIgual8 = ultimasNotas.every(n => n >= 8);
  const todosTPsMayorIgual8 = tps.length === 0 || tps.every(n => n >= 8);

  if (algunParcialDesaprobado || algunTPDesaprobado) {
    return {
      estado: 'recursa',
      condicionTexto: '❌ RECURSAR MATERIA (Parcial o TP con nota final < 6)',
      promedioParciales, recuperatoriosRendidos,
      promociona: false, regular: false, recursa: true
    };
  }

  if (todosParcialesAprobados && todosTPsAprobados) {
    if (promedioParciales >= 8 && todasNotasMayorIgual8 && todosTPsMayorIgual8 && recuperatoriosRendidos <= 1) {
      return {
        estado: 'promocion',
        condicionTexto: `🏆 PROMOCIONA DIRECTO (${recuperatoriosRendidos === 1 ? 'Con 1er Recup. · ' : ''}Promedio: ${promedioParciales})`,
        promedioParciales, recuperatoriosRendidos,
        promociona: true, regular: true, recursa: false
      };
    } else {
      let motivo = '';
      if (!todasNotasMayorIgual8) motivo = ' (Nota individual < 8)';
      else if (recuperatoriosRendidos > 1) motivo = ' (Perdió promoción por >1 recuperatorio)';
      return {
        estado: 'firmada',
        condicionTexto: `✍️ CURSADA FIRMADA · Rinde Final${motivo} (Promedio: ${promedioParciales})`,
        promedioParciales, recuperatoriosRendidos,
        promociona: false, regular: true, recursa: false
      };
    }
  }

  return {
    estado: 'en_curso',
    condicionTexto: `⏳ Cursada en Progreso (Promedio actual: ${promedioParciales})`,
    promedioParciales, recuperatoriosRendidos,
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

function calcularPromedioConAplazos(materiasAprobadas, historialSIU) {
  const notasAprobadas = (materiasAprobadas || []).filter(m => typeof m.nota === 'number' && m.nota > 0).map(m => m.nota);
  const notasAplazos = (historialSIU || []).filter(h => typeof h.nota === 'number' && h.nota > 0 && h.nota < 4).map(h => h.nota);
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
