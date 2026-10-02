/**
 * Módulo de Cálculo de Ritmo de Cursada y Proyecciones de Graduación
 * Permite determinar el ritmo histórico real del estudiante (materias por año)
 * y simular escenarios a diferentes tasas de avance respetando la cadena crítica troncal.
 */

const RAMA_INTEGRADORA_SISTEMAS = [
  { id: '082021', nombre: 'Algoritmos y Estructuras de Datos' },
  { id: '082024', nombre: 'Análisis de Sistemas de Información' },
  { id: '232034', nombre: 'Diseño de Sistemas de Información' },
  { id: '232045', nombre: 'Adm. de Sistemas de Información' },
  { id: '082037', nombre: 'Proyecto Final' }
];

/**
 * Calcula el ritmo histórico de aprobación (materias aprobadas por año transcurrido).
 * @param {number} anioIngreso - Año en que el estudiante ingresó a la carrera.
 * @param {number} totalAprobadas - Cantidad de materias aprobadas a la fecha.
 * @param {number} [anioActual=2026] - Ciclo lectivo actual.
 * @returns {number} Promedio de materias por año redondeado a 1 decimal.
 */
function calcularRitmoHistorico(anioIngreso, totalAprobadas, anioActual = 2026) {
  if (!totalAprobadas || totalAprobadas <= 0) return 0;
  const ingresoValido = Number(anioIngreso) || anioActual;
  const aniosCursados = Math.max(1, (anioActual - ingresoValido) + 1);
  const promedio = totalAprobadas / aniosCursados;
  return Math.round(promedio * 10) / 10;
}

/**
 * Calcula la estimación temporal de graduación según el ritmo configurado y las correlativas.
 * @param {Object} opciones
 * @param {Array} opciones.materiasAprobadas - Lista de materias aprobadas.
 * @param {Array} opciones.materiasEnCurso - Lista de materias en curso.
 * @param {number} opciones.ritmoPorAnio - Materias que proyecta aprobar por año.
 * @param {number} [opciones.anioActual=2026] - Año lectivo base.
 * @param {number} [opciones.totalMateriasPlan=38] - Total de materias requeridas.
 * @param {Array} [opciones.cadenaTroncal] - Asignaturas anuales consecutivas de la cadena crítica.
 * @returns {Object} Estimación detallada con años restantes y año de graduación.
 */
function calcularEstimacionGraduacion({
  materiasAprobadas = [],
  materiasEnCurso = [],
  ritmoPorAnio = 6,
  anioActual = 2026,
  totalMateriasPlan = 38,
  cadenaTroncal = RAMA_INTEGRADORA_SISTEMAS
} = {}) {
  const idsAprobadas = new Set(materiasAprobadas.map(m => String(m.id || m)));
  const idsEnCurso = new Set(materiasEnCurso.map(m => String(m.id || m)));

  const materiasComputadas = idsAprobadas.size + idsEnCurso.size;
  const materiasPendientes = Math.max(0, totalMateriasPlan - materiasComputadas);

  if (materiasPendientes === 0) {
    return {
      materiasPendientes: 0,
      eslabonesTroncalesMinimos: 0,
      aniosPorVolumen: 0,
      aniosRestantes: 0,
      anioEstimadoGraduacion: anioActual,
      ritmoUtilizado: ritmoPorAnio,
      factorCuelloDeBotella: 'ninguno'
    };
  }

  // 1. Cadena Crítica: cuántos eslabones anuales aún no se están cursando ni están aprobados
  let eslabonesTroncalesMinimos = 0;
  cadenaTroncal.forEach(materia => {
    if (!idsAprobadas.has(materia.id) && !idsEnCurso.has(materia.id)) {
      eslabonesTroncalesMinimos++;
    }
  });

  // 2. Volumen de materias según ritmo elegido
  const ritmoEfectivo = Math.max(1, Number(ritmoPorAnio) || 6);
  const aniosPorVolumen = Math.ceil(materiasPendientes / ritmoEfectivo);

  // El cuello de botella es el máximo entre la correlatividad anual y la carga global
  const aniosRestantes = Math.max(eslabonesTroncalesMinimos, aniosPorVolumen, 1);
  const factorCuelloDeBotella = eslabonesTroncalesMinimos > aniosPorVolumen ? 'cadena_troncal' : 'volumen_global';

  return {
    materiasPendientes,
    eslabonesTroncalesMinimos,
    aniosPorVolumen,
    aniosRestantes,
    anioEstimadoGraduacion: anioActual + aniosRestantes,
    ritmoUtilizado: ritmoEfectivo,
    factorCuelloDeBotella
  };
}

/**
 * Genera un texto explicativo para el estudiante sobre las restricciones de su estimación.
 * @param {number} ritmoPorAnio - Tasa de materias anuales.
 * @param {number} eslabonesPendientes - Eslabones anuales mínimos faltantes.
 * @param {number} aniosPorVolumen - Años necesarios por cantidad de asignaturas.
 * @returns {string} Mensaje orientativo en español.
 */
function generarDiagnosticoRitmo(ritmoPorAnio, eslabonesPendientes, aniosPorVolumen) {
  if (eslabonesPendientes > aniosPorVolumen) {
    return `Aunque a un ritmo de ${ritmoPorAnio} materias por año finalizarías el volumen en ${aniosPorVolumen} año(s), la cadena correlativa troncal anual exige un mínimo de ${eslabonesPendientes} años para cursar sus correlativas consecutivas.`;
  }
  return `Tu tiempo de cursada está determinado por el volumen global de asignaturas pendientes (${aniosPorVolumen} años a ${ritmoPorAnio} materias por ciclo lectivo).`;
}

const exportacionRitmo = {
  calcularRitmoHistorico,
  calcularEstimacionGraduacion,
  generarDiagnosticoRitmo,
  RAMA_INTEGRADORA_SISTEMAS
};

if (typeof window !== 'undefined') {
  window.calculadorRitmoCursada = exportacionRitmo;
}
if (typeof globalThis !== 'undefined') {
  globalThis.calculadorRitmoCursada = exportacionRitmo;
}
