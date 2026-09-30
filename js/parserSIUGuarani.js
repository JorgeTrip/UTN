/**
 * Módulo Parser Determinístico de Historia Académica de SIU Guaraní
 * Extrae materias, códigos, comisiones, cuatrimestres, actas, parciales y relaciones K08 -> K23.
 */

function parsearFechaSIU(fechaStr) {
  if (!fechaStr) return '';
  const partes = fechaStr.trim().split('/');
  return partes.length === 3 ? `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}` : fechaStr;
}

function parsearEvaluacionesParciales(lineas, idxInicio) {
  const parciales = [];
  let i = idxInicio;
  while (i < lineas.length) {
    const l = lineas[i];
    if (l.match(/^(Examen|Promoción|Regularidad|Equivalencia|En curso|Nro\.|Turno:|Comisión:)/) || l.match(/^.+?\s*\([0-9a-zA-Z_]+\)\s*$/)) break;
    const matchFecha = l.match(/^(\d{2}\/\d{2}\/\d{4})$/);
    if (matchFecha && i + 2 < lineas.length) {
      const fecha = parsearFechaSIU(matchFecha[1]);
      const desc = lineas[i + 1];
      const tipo = lineas[i + 2];
      let nota = null, res = '', avance = 3;
      if (i + 3 < lineas.length && lineas[i + 3].match(/^(\d{1,2})\s*\(/)) {
        const nMatch = lineas[i + 3].match(/^(\d{1,2})\s*\(/);
        nota = parseInt(nMatch[1], 10);
        res = i + 4 < lineas.length ? lineas[i + 4] : '';
        avance = 5;
      } else if (i + 3 < lineas.length && (lineas[i + 3].startsWith('Suficiente') || lineas[i + 3].startsWith('Aprobada'))) {
        res = 'Aprobado';
        avance = i + 4 < lineas.length && lineas[i + 4] === 'Aprobado' ? 5 : 4;
      }
      parciales.push({ fecha, descripcion: desc, tipo, nota, resultado: res });
      i += avance;
      continue;
    }
    i++;
  }
  return { parciales, siguienteIdx: i };
}

function parsearHistoriaAcademicaSIU(textoPlano) {
  if (!textoPlano || typeof textoPlano !== 'string') return { materiasAprobadas: [], materiasEnCurso: [] };
  const lineas = textoPlano.split('\n').map(l => l.trim()).filter(Boolean);
  const materias = [];
  let matActual = null, evActual = null;

  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];
    const headerMatch = l.match(/^(.+?)\s*\(([0-9a-zA-Z_]+)\)\s*$/);
    if (headerMatch && !l.includes('Libro') && !l.includes('Aprobada') && !l.includes('Reprobado')) {
      matActual = { nombre: headerMatch[1].trim(), codigoSIU: headerMatch[2].trim(), eventos: [] };
      materias.push(matActual);
      evActual = null;
      continue;
    }
    if (!matActual) continue;

    if (l.match(/^(Promoción|Examen|Equivalencia|Regularidad|En curso)/)) {
      const libM = l.match(/Libro\s+([A-Za-z0-9]+)/i);
      const folM = l.match(/Folio\s+([A-Za-z0-9]+)/i);
      const fecM = l.match(/(\d{2}\/\d{2}\/\d{4})/);
      const notM = l.match(/\b(\d{1,2})\s*\(/);
      let tipo = l.split('-')[0].trim();
      let res = l.includes('Ausente') ? 'Ausente' : (l.includes('Reprobado') || l.includes('No aprobad') ? 'Reprobado' : 'Aprobado');
      evActual = {
        tipo, resultado: res, nota: notM ? parseInt(notM[1], 10) : null,
        fecha: fecM ? parsearFechaSIU(fecM[1]) : '', libro: libM ? libM[1] : null, folio: folM ? folM[1] : null,
        comision: null, periodoLectivo: null, turno: null, parciales: []
      };
      matActual.eventos.push(evActual);
      continue;
    }

    if (evActual) {
      const comM = l.match(/Comisión:\s*([A-Za-z0-9]+)/i);
      if (comM) evActual.comision = comM[1];
      const perM = l.match(/Período lectivo:\s*([^Comisión|Evaluaciones|No\s+hay]+)/i);
      if (perM) evActual.periodoLectivo = perM[1].trim();
      const turM = l.match(/Turno:\s*([^Condición|Año]+)/i);
      if (turM) evActual.turno = turM[1].trim();
      if (l.includes('Evaluaciones parciales:')) {
        const parsed = parsearEvaluacionesParciales(lineas, i + 1);
        evActual.parciales = parsed.parciales;
        i = parsed.siguienteIdx - 1;
      }
    }
  }
  return consolidarMateriasSIU(materias);
}

function consolidarMateriasSIU(materiasDetectadas) {
  const aprobadas = [], enCurso = [];
  const mapaK08 = new Map();

  materiasDetectadas.forEach(m => {
    const meta = window.obtenerMapeoK08AK23 ? window.obtenerMapeoK08AK23(m.codigoSIU) : { idK23: m.codigoSIU, nombreK23: m.nombre, nombreK08: m.nombre };
    const finales = m.eventos.filter(e => e.tipo === 'Examen').map(e => ({
      fecha: e.fecha, resultado: e.resultado === 'Ausente' ? 'ausente' : (e.resultado === 'Reprobado' || (e.nota && e.nota < 6) ? 'desaprobado' : 'aprobado'),
      nota: e.nota, libro: e.libro, folio: e.folio, turno: e.turno
    }));
    const promo = m.eventos.find(e => e.tipo === 'Promoción') || m.eventos.find(e => e.tipo === 'Regularidad' && e.resultado === 'Aprobado' && e.nota && e.nota >= 8);
    const finalAp = finales.slice().reverse().find(f => f.resultado === 'aprobado' || (f.nota && f.nota >= 6));
    const regAp = m.eventos.find(e => e.tipo === 'Regularidad' && e.resultado === 'Aprobado');
    const esCurso = m.eventos.some(e => e.tipo === 'En curso');
    const equiv = m.eventos.find(e => e.tipo.startsWith('Equivalencia'));

    const objeto = {
      materiaRaw: m, meta, finales, promo, finalAp, regAp, esCurso, equiv,
      comision: (regAp || promo || finalAp || m.eventos[0])?.comision || null,
      periodoLectivo: (regAp || promo || finalAp || m.eventos[0])?.periodoLectivo || null,
      parciales: (regAp || promo || m.eventos[0])?.parciales || []
    };
    if (m.codigoSIU.startsWith('08') || m.codigoSIU.startsWith('95')) mapaK08.set(meta.idK23, objeto);
  });

  materiasDetectadas.forEach(m => {
    const meta = window.obtenerMapeoK08AK23 ? window.obtenerMapeoK08AK23(m.codigoSIU) : { idK23: m.codigoSIU, nombreK23: m.nombre, nombreK08: m.nombre };
    const id = meta.idK23 || m.codigoSIU;
    const k08Origen = mapaK08.get(id);
    const finales = m.eventos.filter(e => e.tipo === 'Examen').map(e => ({
      fecha: e.fecha, resultado: e.resultado === 'Ausente' ? 'ausente' : (e.resultado === 'Reprobado' || (e.nota && e.nota < 6) ? 'desaprobado' : 'aprobado'),
      nota: e.nota, libro: e.libro, folio: e.folio, turno: e.turno
    }));
    const promo = m.eventos.find(e => e.tipo === 'Promoción') || m.eventos.find(e => e.tipo === 'Regularidad' && e.resultado === 'Aprobado' && e.nota && e.nota >= 8);
    const finalAp = finales.slice().reverse().find(f => f.resultado === 'aprobado' || (f.nota && f.nota >= 6));
    const equiv = m.eventos.find(e => e.tipo.startsWith('Equivalencia'));
    const regAp = m.eventos.find(e => e.tipo === 'Regularidad' && e.resultado === 'Aprobado');
    const esCurso = m.eventos.some(e => e.tipo === 'En curso');
    const parciales = (regAp || promo || m.eventos[0])?.parciales || [];
    const comision = (regAp || promo || finalAp || m.eventos[0])?.comision || null;
    const periodoLectivo = (regAp || promo || finalAp || m.eventos[0])?.periodoLectivo || null;

    if (equiv && k08Origen && (k08Origen.promo || k08Origen.finalAp)) {
      if (aprobadas.some(a => a.id === id)) return;
      const ref = k08Origen.promo || k08Origen.finalAp;
      aprobadas.push({
        id, nombre: meta.nombreK23 || m.nombre, codigoSIU: m.codigoSIU, estado: 'aprobada',
        modalidad: 'equivalencia_k08', origenPlan: 'K08_homologada', materiaOrigenK08: k08Origen.meta.nombreK08,
        nota: ref.nota, fechaAprobacion: ref.fecha, fechaHomologacion: equiv.fecha,
        libro: ref.libro, folio: ref.folio, turno: ref.turno || null,
        comision: k08Origen.comision, periodoLectivo: k08Origen.periodoLectivo,
        parciales: k08Origen.parciales, finales: k08Origen.finales, plan: 'K23'
      });
    } else if (promo) {
      if (aprobadas.some(a => a.id === id)) return;
      aprobadas.push({
        id, nombre: meta.nombreK23 || m.nombre, codigoSIU: m.codigoSIU, estado: 'aprobada',
        modalidad: 'promocion', origenPlan: m.codigoSIU.startsWith('23') ? 'K23_directa' : 'K08_homologada',
        materiaOrigenK08: m.codigoSIU.startsWith('23') ? null : meta.nombreK08,
        nota: promo.nota, fechaAprobacion: promo.fecha, libro: promo.libro, folio: promo.folio,
        comision, periodoLectivo, parciales, finales, plan: 'K23'
      });
    } else if (finalAp) {
      if (aprobadas.some(a => a.id === id)) return;
      aprobadas.push({
        id, nombre: meta.nombreK23 || m.nombre, codigoSIU: m.codigoSIU, estado: 'aprobada',
        modalidad: 'final', origenPlan: m.codigoSIU.startsWith('23') ? 'K23_directa' : 'K08_homologada',
        materiaOrigenK08: m.codigoSIU.startsWith('23') ? null : meta.nombreK08,
        nota: finalAp.nota, fechaAprobacion: finalAp.fecha, libro: finalAp.libro, folio: finalAp.folio,
        turno: finalAp.turno, comision, periodoLectivo, parciales, finales, plan: 'K23'
      });
    } else if (equiv) {
      if (aprobadas.some(a => a.id === id)) return;
      aprobadas.push({
        id, nombre: meta.nombreK23 || m.nombre, codigoSIU: m.codigoSIU, estado: 'equivalencia',
        modalidad: 'equivalencia_carrera', origenPlan: 'equivalencia_externa',
        materiaOrigenK08: meta.nombreK08, nota: null, fechaAprobacion: equiv.fecha,
        libro: equiv.libro, folio: equiv.folio, comision, periodoLectivo, parciales, finales, plan: 'K23'
      });
    } else if (regAp) {
      if (enCurso.some(e => e.id === id)) return;
      enCurso.push({
        id, nombre: meta.nombreK23 || m.nombre, codigoSIU: m.codigoSIU, estado: 'firmada',
        modalidad: 'final_pendiente', origenPlan: m.codigoSIU.startsWith('23') ? 'K23_directa' : 'K08_homologada',
        comision, periodoLectivo, parciales, finales, plan: 'K23'
      });
    } else if (esCurso) {
      if (enCurso.some(e => e.id === id)) return;
      enCurso.push({
        id, nombre: meta.nombreK23 || m.nombre, codigoSIU: m.codigoSIU, estado: 'en_curso',
        modalidad: null, origenPlan: 'K23_directa', comision, periodoLectivo, parciales, finales, plan: 'K23'
      });
    }
  });

  return { materiasAprobadas: aprobadas, materiasEnCurso: enCurso };
}

window.parsearHistoriaAcademicaSIU = parsearHistoriaAcademicaSIU;
