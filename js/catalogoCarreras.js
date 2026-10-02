/**
 * Módulo de Catálogo y Extensibilidad Multi-Carrera UTN
 * Centraliza la definición de carreras, planes de estudio y cadenas críticas troncales,
 * permitiendo incorporar futuras especialidades de forma desacoplada y escalable.
 */

const REGISTRO_CARRERAS = new Map();

// Definición inicial: Ingeniería en Sistemas de Información (ISI)
const CARRERA_SISTEMAS = {
  id: 'sistemas',
  codigoSIU: 'ISI',
  nombre: 'Ingeniería en Sistemas de Información',
  facultad: 'UTN FRBA',
  planes: ['K23', 'K08'],
  planPredeterminado: 'K23',
  totalMateriasK23: 38,
  totalMateriasK08: 41,
  cadenaTroncal: [
    { id: '082021', nombre: 'Algoritmos y Estructuras de Datos' },
    { id: '082024', nombre: 'Análisis de Sistemas de Información' },
    { id: '232034', nombre: 'Diseño de Sistemas de Información' },
    { id: '232045', nombre: 'Adm. de Sistemas de Información' },
    { id: '082037', nombre: 'Proyecto Final' }
  ],
  tituloIntermedio: {
    nombre: 'Analista Desarrollador Universitario de Sistemas de Información (ADUSI)',
    totalMaterias: 24
  }
};

REGISTRO_CARRERAS.set(CARRERA_SISTEMAS.id, CARRERA_SISTEMAS);

/**
 * Registra o actualiza una carrera en el catálogo institucional.
 * @param {Object} carrera - Objeto de configuración de carrera.
 */
function registrarCarrera(carrera) {
  if (!carrera || !carrera.id) return;
  REGISTRO_CARRERAS.set(carrera.id, {
    ...carrera,
    planes: carrera.planes || ['2023'],
    cadenaTroncal: carrera.cadenaTroncal || []
  });
}

/**
 * Obtiene la carrera solicitada o retorna Sistemas por defecto.
 * @param {string} idCarrera - Identificador de la carrera.
 * @returns {Object} Configuración completa de la carrera.
 */
function obtenerCarrera(idCarrera) {
  if (idCarrera && REGISTRO_CARRERAS.has(idCarrera)) {
    return REGISTRO_CARRERAS.get(idCarrera);
  }
  return REGISTRO_CARRERAS.get('sistemas');
}

/**
 * Devuelve la lista de carreras activas disponibles para el estudiante.
 * @returns {Array<Object>} Lista de carreras registradas.
 */
function listarCarreras() {
  return Array.from(REGISTRO_CARRERAS.values());
}

const exportacionCarreras = {
  registrarCarrera,
  obtenerCarrera,
  listarCarreras
};

if (typeof window !== 'undefined') {
  window.catalogoCarreras = exportacionCarreras;
}
if (typeof globalThis !== 'undefined') {
  globalThis.catalogoCarreras = exportacionCarreras;
}
