/**
 * Módulo de Normalización de Períodos Lectivos Universitarios
 * Transforma cadenas crudas del SIU Guaraní a formato estándar:
 * '1er Cuatrimestre [Año]', '2do Cuatrimestre [Año]' o 'Anual [Año]'.
 * Descarta menciones de 'Grado' o artefactos residuales 'Gr'.
 */

function normalizarPeriodoLectivo(texto) {
  if (!texto || typeof texto !== 'string') return null;
  const limpio = texto.trim();
  if (!limpio) return null;

  // Si solo contiene 'Gr' o 'Grado' aislados, descartar
  if (/^gr(?:ado)?\.?$/i.test(limpio)) {
    return null;
  }

  // Extraer año si existe (ej. 2024, 2025, 2026, 2019)
  const matchAnio = limpio.match(/\b(20\d{2})\b/);
  const anio = matchAnio ? matchAnio[1] : '';

  // Detección robusta de cuatrimestre y ciclo anual
  const es1er = /primer\s+cuatrimestre|1[º°er]?\s+cuatrimestre|cuat\s*1(?:\/2)?\b/i.test(limpio);
  const es2do = /segundo\s+cuatrimestre|2[º°do]?\s+cuatrimestre|cuat\s*2(?:\/2)?\b/i.test(limpio);
  const esAnual = /\banual\b/i.test(limpio);

  if (es1er) {
    return anio ? `1er Cuatrimestre ${anio}` : '1er Cuatrimestre';
  }
  if (es2do) {
    return anio ? `2do Cuatrimestre ${anio}` : '2do Cuatrimestre';
  }
  if (esAnual) {
    return anio ? `Anual ${anio}` : 'Anual';
  }

  // Si no coincide con cuatrimestre ni anual, eliminar la palabra 'Grado' y devolver texto limpio
  const sinGrado = limpio.replace(/\bgrado\b\s*/gi, '').trim();
  return sinGrado || null;
}

window.normalizarPeriodoLectivo = normalizarPeriodoLectivo;
