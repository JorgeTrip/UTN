/**
 * Módulo de Cálculo de Proyección Óptima de Años de Cursada
 * Determina dinámicamente cuántos años restan en condiciones óptimas
 * evaluando la cadena crítica de correlatividades anuales y la carga de materias.
 */

// IDs oficiales de la Rama Integradora K23/K08 (troncales anuales consecutivas)
const RAMA_INTEGRADORA_SISTEMAS = [
  { id: '082021', nombre: 'Algoritmos y Estructuras de Datos' },
  { id: '082024', nombre: 'Análisis de Sistemas de Información' },
  { id: '232034', nombre: 'Diseño de Sistemas de Información' },
  { id: '232045', nombre: 'Adm. de Sistemas de Información' },
  { id: '082037', nombre: 'Proyecto Final' }
];

const TOTAL_MATERIAS_PLAN_K23 = 38;
const MATERIAS_OPTIMAS_POR_ANIO = 8;

/**
 * Calcula la lista de años futuros a proyectar según el avance real del alumno.
 * @param {Array} materiasAprobadas - Lista de asignaturas aprobadas.
 * @param {Array} materiasEnCurso - Lista de asignaturas actualmente en curso.
 * @param {number} anioBase - Año lectivo en curso (por defecto 2026).
 * @returns {Array<number>} Lista de años futuros proyectados (ej. [2027, 2028]).
 */
function calcularProyeccionAniosFuturos(materiasAprobadas = [], materiasEnCurso = [], anioBase = 2026) {
  const idsAprobadas = new Set(materiasAprobadas.map(m => String(m.id || m)));
  const idsEnCurso = new Set(materiasEnCurso.map(m => String(m.id || m)));

  // Cantidad de materias no aprobadas ni en curso
  const materiasComputadas = idsAprobadas.size + idsEnCurso.size;
  const materiasRestantes = Math.max(0, TOTAL_MATERIAS_PLAN_K23 - materiasComputadas);

  if (materiasRestantes === 0) {
    return [];
  }

  // 1. Cadena Crítica: cuántos eslabones anuales aún no se están cursando ni están aprobados
  let eslabonesPendientes = 0;
  RAMA_INTEGRADORA_SISTEMAS.forEach(materia => {
    if (!idsAprobadas.has(materia.id) && !idsEnCurso.has(materia.id)) {
      eslabonesPendientes++;
    }
  });

  // 2. Volumen de materias: según el ritmo dinámico configurado o 8 por defecto
  const ritmoConfigurado = (typeof window !== 'undefined' && window.localStorage)
    ? Number(localStorage.getItem('ritmo_cursada_simulado'))
    : null;
  const ritmoEfectivo = (ritmoConfigurado && ritmoConfigurado > 0) ? ritmoConfigurado : MATERIAS_OPTIMAS_POR_ANIO;
  const aniosPorVolumen = Math.ceil(materiasRestantes / ritmoEfectivo);

  // El tiempo óptimo mínimo es el máximo entre ambos factores
  const aniosOptimos = Math.max(eslabonesPendientes, aniosPorVolumen, 1);

  const aniosFuturos = [];
  for (let i = 1; i <= aniosOptimos; i++) {
    aniosFuturos.push(anioBase + i);
  }

  return aniosFuturos;
}

window.calcularProyeccionAniosFuturos = calcularProyeccionAniosFuturos;
