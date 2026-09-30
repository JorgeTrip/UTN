/**
 * Módulo de Cómputo de Materias Electivas y Horas Reloj (K23)
 * Administra el régimen de bloques acumulativos (240 hs para 3º/4º nivel y 240 hs para 5º nivel)
 * e imputa las horas reloj de materias K08 acreditadas oficialmente (Química y Sistemas de Repr.).
 */

const CODIGOS_ACREDITACION_K08_34 = {
  '081420': { nombre: 'Química', horas: 72 },
  '082091': { nombre: 'Química', horas: 72 },
  '951601': { nombre: 'Sistemas de Representación', horas: 72 },
  '082092': { nombre: 'Comunicación Gráfica y Visual', horas: 72 },
  '232071': { nombre: 'Comunicación Gráfica y Visual', horas: 72 }
};

/**
 * Determina si una materia es una electiva o acreditación de horas y a qué bloque pertenece.
 * @param {Object} m - Materia del estudiante.
 * @returns {{ esElectiva: boolean, bloque: '34'|'5'|null, horas: number }}
 */
function clasificarElectiva(m) {
  if (!m) return { esElectiva: false, bloque: null, horas: 0 };
  const cod = (m.codigoSIU || m.id || '').toString().trim();

  // 1. Acreditaciones oficiales K08
  if (CODIGOS_ACREDITACION_K08_34[cod] || m.esAcreditacionElectiva) {
    const info = CODIGOS_ACREDITACION_K08_34[cod] || {};
    return { esElectiva: true, bloque: '34', horas: m.horasRelojAcreditadas || info.horas || 72 };
  }

  // 2. Catálogo de electivas de planEstudio
  const catalogo = window.datosGlobales?.planEstudio?.materias_electivas || [];
  const elCatalogo = catalogo.find(e => (e.codigo || e.id) === cod || (e.nombre && m.nombre && e.nombre.toLowerCase().trim() === m.nombre.toLowerCase().trim()));
  if (elCatalogo) {
    const es5 = elCatalogo.nivel === 5 || (elCatalogo.nivel_asignado && elCatalogo.nivel_asignado.includes('5'));
    return { esElectiva: true, bloque: es5 ? '5' : '34', horas: elCatalogo.horas_reloj || elCatalogo.horas_reloj_estimadas || 80 };
  }

  // 3. Materia explícitamente marcada como electiva en su estado
  if (m.esElectiva) {
    const bloque = m.nivel === 5 ? '5' : '34';
    return { esElectiva: true, bloque, horas: m.horasReloj || 80 };
  }

  return { esElectiva: false, bloque: null, horas: 0 };
}

/**
 * Calcula el resumen de horas reloj y materias para ambos bloques de electivas.
 * @param {Array} aprobadas - Lista de materias aprobadas.
 * @param {Array} enCurso - Lista de materias en curso o firmadas.
 * @returns {Object} Resumen detallado de electivas por bloque.
 */
function calcularBloquesElectivas(aprobadas = [], enCurso = []) {
  const bloque34 = { materiasAprobadas: [], materiasEnCurso: [], horasAprobadas: 0, horasEnCurso: 0, metaHoras: 240 };
  const bloque5 = { materiasAprobadas: [], materiasEnCurso: [], horasAprobadas: 0, horasEnCurso: 0, metaHoras: 240 };

  aprobadas.forEach(m => {
    const c = clasificarElectiva(m);
    if (!c.esElectiva) return;
    const item = { ...m, horasReloj: c.horas };
    if (c.bloque === '34') {
      bloque34.materiasAprobadas.push(item);
      bloque34.horasAprobadas += c.horas;
    } else if (c.bloque === '5') {
      bloque5.materiasAprobadas.push(item);
      bloque5.horasAprobadas += c.horas;
    }
  });

  enCurso.forEach(m => {
    const c = clasificarElectiva(m);
    if (!c.esElectiva) return;
    const item = { ...m, horasReloj: c.horas };
    if (c.bloque === '34') {
      bloque34.materiasEnCurso.push(item);
      bloque34.horasEnCurso += c.horas;
    } else if (c.bloque === '5') {
      bloque5.materiasEnCurso.push(item);
      bloque5.horasEnCurso += c.horas;
    }
  });

  bloque34.porcentaje = Math.min(100, Math.round((bloque34.horasAprobadas / 240) * 100));
  bloque34.cumplido = bloque34.horasAprobadas >= 240;

  bloque5.porcentaje = Math.min(100, Math.round((bloque5.horasAprobadas / 240) * 100));
  bloque5.cumplido = bloque5.horasAprobadas >= 240;

  return { bloque34, bloque5 };
}

window.clasificarElectiva = clasificarElectiva;
window.calcularBloquesElectivas = calcularBloquesElectivas;
