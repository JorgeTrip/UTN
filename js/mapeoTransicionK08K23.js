/**
 * Módulo de Mapeo y Transición Curricular Plan K08 a Plan K23 (Ordenanzas 1877/1878 y Res. 3120/22)
 * Provee la correspondencia unívoca de materias, códigos y acreditación de optativas.
 */

const TABLA_TRANSICION_K08_A_K23 = {
  // Nivel 1
  '950702': { idK23: '232001', nombreK23: 'Análisis Matemático I', nombreK08: 'Análisis Matemático I (950702)', nivel: 1 },
  '950701': { idK23: '232002', nombreK23: 'Álgebra y Geometría Analítica', nombreK08: 'Álgebra y Geometría Analítica (950701)', nivel: 1 },
  '950605': { idK23: '232003', nombreK23: 'Física I', nombreK08: 'Física I (950605)', nivel: 1, esEquivalenciaExterna: true },
  '951602': { idK23: '232004', nombreK23: 'Inglés I', nombreK08: 'Inglés Técnico Nivel I (951602)', nivel: 1 },
  '231602': { idK23: '232004', nombreK23: 'Inglés I', nombreK08: 'Inglés I (231602)', nivel: 1 },
  '082020': { idK23: '232010', nombreK23: 'Lógica y Estructuras Discretas', nombreK08: 'Matemática Discreta (082020)', nivel: 1 },
  '232010': { idK23: '232010', nombreK23: 'Lógica y Estructuras Discretas', nombreK08: 'Lógica y Estructuras Discretas (232010)', nivel: 1 },
  '082021': { idK23: '082021', nombreK23: 'Algoritmos y Estructuras de Datos', nombreK08: 'Algoritmos y Estructura de Datos (082021)', nivel: 1 },
  '082022': { idK23: '082022', nombreK23: 'Arquitectura de Computadoras', nombreK08: 'Arquitectura de Computadores (082022)', nivel: 1 },
  '082023': { idK23: '232011', nombreK23: 'Sistemas y Procesos de Negocio', nombreK08: 'Sistemas y Organizaciones (082023)', nivel: 1 },
  '232011': { idK23: '232011', nombreK23: 'Sistemas y Procesos de Negocio', nombreK08: 'Sistemas y Procesos de Negocio (232011)', nivel: 1 },

  // Nivel 2
  '950703': { idK23: '232009', nombreK23: 'Análisis Matemático II', nombreK08: 'Análisis Matemático II (950703)', nivel: 2 },
  '950606': { idK23: '232010_f2', nombreK23: 'Física II', nombreK08: 'Física II (950606)', nivel: 2 },
  '951604': { idK23: '232011_is', nombreK23: 'Ingeniería y Sociedad', nombreK08: 'Ingeniería y Sociedad (951604)', nivel: 2, esEquivalenciaExterna: true },
  '951603': { idK23: '232012', nombreK23: 'Inglés II', nombreK08: 'Inglés Técnico Nivel II (951603)', nivel: 2 },
  '082025': { idK23: '082025', nombreK23: 'Sintaxis y Semántica de los Lenguajes', nombreK08: 'Sintaxis y Semántica de los Lenguajes (082025)', nivel: 2 },
  '082026': { idK23: '082026', nombreK23: 'Paradigmas de Programación', nombreK08: 'Paradigmas de Programación (082026)', nivel: 2 },
  '082027': { idK23: '082027', nombreK23: 'Sistemas Operativos', nombreK08: 'Sistemas Operativos (082027)', nivel: 2 },
  '082024': { idK23: '082024', nombreK23: 'Análisis de Sistemas de Información', nombreK08: 'Análisis de Sistemas (082024)', nivel: 2 },
  '232020': { idK23: '082024', nombreK23: 'Análisis de Sistemas de Información', nombreK08: 'Análisis de Sistemas de Información (232020)', nivel: 2 },

  // Nivel 3
  '950704': { idK23: '232017', nombreK23: 'Probabilidad y Estadística', nombreK08: 'Probabilidad y Estadística (950704)', nivel: 3 },
  '950309': { idK23: '232018', nombreK23: 'Economía', nombreK08: 'Economía (950309)', nivel: 3 },
  '082030': { idK23: '232030', nombreK23: 'Bases de Datos', nombreK08: 'Gestión de Datos (082030)', nivel: 3 },
  '232030': { idK23: '232030', nombreK23: 'Bases de Datos', nombreK08: 'Bases de Datos (232030)', nivel: 3 },
  '232031': { idK23: '232020', nombreK23: 'Desarrollo de Software', nombreK08: 'Desarrollo de Software (232031)', nivel: 3 },
  '232032': { idK23: '232032', nombreK23: 'Comunicación de Datos', nombreK08: 'Comunicaciones / Comunicación de Datos (232032)', nivel: 3 },
  '082032': { idK23: '232033', nombreK23: 'Análisis Numérico', nombreK08: 'Matemática Superior (082032)', nivel: 3 },
  '232033': { idK23: '232033', nombreK23: 'Análisis Numérico', nombreK08: 'Análisis Numérico (232033)', nivel: 3 },
  '082028': { idK23: '232034', nombreK23: 'Diseño de Sistemas de Información', nombreK08: 'Diseño de Sistemas (082028)', nivel: 3 },
  '232034': { idK23: '232034', nombreK23: 'Diseño de Sistemas de Información', nombreK08: 'Diseño de Sistemas de Información (232034)', nivel: 3 },
  '232035': { idK23: '082099', nombreK23: 'Seminario de Integración', nombreK08: 'Seminario Integrador (232035)', nivel: 3 },
  '082099': { idK23: '082099', nombreK23: 'Seminario de Integración', nombreK08: 'Seminario de Integración (082099)', nivel: 3 },

  // Nivel 4 y 5
  '232045': { idK23: '232045', nombreK23: 'Adm. Sistemas de Información', nombreK08: 'Administración de Recursos (232045)', nivel: 4 },
  '950310': { idK23: '232042', nombreK23: 'Legislación', nombreK08: 'Legislación (950310)', nivel: 4 },
  '232042': { idK23: '232042', nombreK23: 'Legislación', nombreK08: 'Legislación (232042)', nivel: 4 },
  '232040': { idK23: '232043', nombreK23: 'Ingeniería y Calidad de Software', nombreK08: 'Ingeniería y Calidad de Software (232040)', nivel: 4 },
  '232043': { idK23: '232043', nombreK23: 'Ingeniería y Calidad de Software', nombreK08: 'Ingeniería y Calidad de Software (232043)', nivel: 4 },
  '232044': { idK23: '232044', nombreK23: 'Tecnologías Automatización', nombreK08: 'Tecnologías para la Automatización (232044)', nivel: 4 },
  '232041': { idK23: '232041', nombreK23: 'Redes de Datos', nombreK08: 'Redes de Datos (232041)', nivel: 4 },

  // Electivas e imputación de créditos K08
  '082117': { idK23: '082117', nombreK23: 'Gestión del Talento Humano', nombreK08: 'Gestión del Talento Humano (082117)', nivel: 3, esElectiva: true },
  '082102': { idK23: '082102', nombreK23: 'Transformación Digital', nombreK08: 'Transformación Digital (082102)', nivel: 4, esElectiva: true },
  '081420': { idK23: '082091', nombreK23: 'Química Ambiental (← Química K08)', nombreK08: 'Química (081420)', nivel: 3, esAcreditacionElectiva: true },
  '232061': { idK23: '082091', nombreK23: 'Química Ambiental (← Química K08)', nombreK08: 'Química Ambiental (232061)', nivel: 3, esAcreditacionElectiva: true },
  '951601': { idK23: '082092', nombreK23: 'Comunicación Gráfica y Visual (← Sistemas de Representación K08)', nombreK08: 'Sistemas de Representación (951601)', nivel: 3, esAcreditacionElectiva: true },
  '232071': { idK23: '082092', nombreK23: 'Comunicación Gráfica y Visual (← Sistemas de Representación K08)', nombreK08: 'Comunicación Gráfica y Visual (232071)', nivel: 3, esAcreditacionElectiva: true }
};

/**
 * Obtiene la correspondencia curricular K08 a K23 según el código SIU de la asignatura.
 * @param {string} codigoSIU Código SIU de la asignatura.
 * @returns {object} Metadatos de la asignatura en el Plan K23.
 */
function obtenerMapeoK08AK23(codigoSIU) {
  if (TABLA_TRANSICION_K08_A_K23[codigoSIU]) {
    return TABLA_TRANSICION_K08_A_K23[codigoSIU];
  }
  return { idK23: codigoSIU, nombreK23: '', nombreK08: '', nivel: 0 };
}

window.TABLA_TRANSICION_K08_A_K23 = TABLA_TRANSICION_K08_A_K23;
window.obtenerMapeoK08AK23 = obtenerMapeoK08AK23;
