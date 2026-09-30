/**
 * Módulo Motor de Generación y Optimización de Alternativas de Cursada
 * Cruza la oferta académica con las materias habilitadas y genera 3 combinaciones sin solapamiento.
 * Valida umbral de turno preferido y notifica si se requieren combinaciones mixtas.
 */

function haySolapamientoHorario(comisionA, comisionB) {
  if (!comisionA?.horarios || !comisionB?.horarios) return false;
  for (const hA of comisionA.horarios) {
    for (const hB of comisionB.horarios) {
      if (hA.dia && hB.dia && hA.dia.toLowerCase() === hB.dia.toLowerCase()) {
        const modulosA = Array.isArray(hA.modulos) ? hA.modulos : [];
        const modulosB = Array.isArray(hB.modulos) ? hB.modulos : [];
        const compartenModulo = modulosA.some(m => modulosB.includes(m));
        if (compartenModulo) return true;
      }
    }
  }
  return false;
}

function combinacionEsValida(grupoComisiones) {
  for (let i = 0; i < grupoComisiones.length; i++) {
    for (let j = i + 1; j < grupoComisiones.length; j++) {
      if (grupoComisiones[i].codigo === grupoComisiones[j].codigo) return false;
      if (haySolapamientoHorario(grupoComisiones[i], grupoComisiones[j])) return false;
    }
  }
  return true;
}

function buscarCombinaciones(cursosPorMateria, metaCantidad, maxResultados = 3) {
  const codigos = Object.keys(cursosPorMateria);
  const resultados = [];

  function backtracking(idxMateria, actual) {
    if (resultados.length >= maxResultados) return;
    if (actual.length === metaCantidad || idxMateria >= codigos.length) {
      if (actual.length >= Math.min(metaCantidad, codigos.length) && combinacionEsValida(actual)) {
        resultados.push([...actual]);
      }
      return;
    }

    const cod = codigos[idxMateria];
    const listaCursos = cursosPorMateria[cod] || [];

    for (const curso of listaCursos) {
      if (combinacionEsValida([...actual, curso])) {
        actual.push(curso);
        backtracking(idxMateria + 1, actual);
        actual.pop();
        if (resultados.length >= maxResultados) return;
      }
    }
    backtracking(idxMateria + 1, actual);
  }

  backtracking(0, []);
  return resultados;
}

function generarAlternativasCursada({ oferta = [], materiasHabilitadas = [], turnoPreferido = 'Noche', materiasPorCuatrimestre = 3 }) {
  const normalizarTurno = (t) => {
    if (!t) return 'Noche';
    const l = t.toLowerCase();
    return l.startsWith('mañ') || l.startsWith('m') ? 'Mañana' : (l.startsWith('t') ? 'Tarde' : 'Noche');
  };

  const turnoAlumno = normalizarTurno(turnoPreferido);
  const materiasSet = new Set(materiasHabilitadas.map(String));

  // Filtrar oferta por materias habilitadas
  const ofertaFiltrada = oferta.filter(c => materiasSet.has(String(c.codigo)));

  // Agrupar por materia y turno preferido
  const porMateriaTurno = {};
  const porMateriaTotal = {};

  ofertaFiltrada.forEach(c => {
    const cod = String(c.codigo);
    if (!porMateriaTotal[cod]) porMateriaTotal[cod] = [];
    porMateriaTotal[cod].push(c);

    if (normalizarTurno(c.turno) === turnoAlumno) {
      if (!porMateriaTurno[cod]) porMateriaTurno[cod] = [];
      porMateriaTurno[cod].push(c);
    }
  });

  const combosTurno = buscarCombinaciones(porMateriaTurno, materiasPorCuatrimestre, 3);
  const turnoInsuficiente = combosTurno.length < 2;

  let combosMixtos = [];
  if (turnoInsuficiente) {
    combosMixtos = buscarCombinaciones(porMateriaTotal, materiasPorCuatrimestre, 3);
  }

  const alternativasFinales = combosTurno.length > 0 ? combosTurno : combosMixtos;

  return {
    alternativas: alternativasFinales.map((grupo, idx) => ({
      numero: idx + 1,
      nombre: `Alternativa ${idx + 1} (${grupo.every(c => normalizarTurno(c.turno) === turnoAlumno) ? turnoAlumno : 'Mixta'})`,
      comisiones: grupo
    })),
    turnoInsuficiente,
    mensajeTurno: turnoInsuficiente
      ? `Tu turno por defecto (${turnoAlumno}) solo permite ${combosTurno.length} combinación(es) viable(s). Puedes probar con combinaciones de turnos alternativos o mixtos.`
      : null,
    alternativasMixtas: combosMixtos
  };
}

window.generarAlternativasCursada = generarAlternativasCursada;
window.haySolapamientoHorario = haySolapamientoHorario;
