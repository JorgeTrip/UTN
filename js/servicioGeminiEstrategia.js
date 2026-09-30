/**
 * Módulo de Servicio de Estrategia Académica con Gemini API
 * Gestiona el análisis curricular, resiliencia y selección de materias para cursar.
 */

const CLAVE_STORAGE_ESTRATEGIA = 'estrategiaRecomendadaAlumno_v1';
const CLAVE_STORAGE_SELECCION_ESTRATEGIA = 'materiasSeleccionadasEstrategia_v1';

function obtenerEstrategiaRecomendada() {
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE_ESTRATEGIA);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

async function persistirEstrategiaFirestore(estrategia) {
  if (!estrategia) return false;
  const uid = window.servicioAuth?.obtenerUsuarioActual()?.uid;
  if (uid && typeof window.servicioFirestore?.guardarEstrategia === 'function') {
    return await window.servicioFirestore.guardarEstrategia(uid, estrategia);
  }
  return false;
}

function guardarEstrategiaRecomendada(estrategia) {
  if (!estrategia) return;
  if (!estrategia.fechaGeneracion) estrategia.fechaGeneracion = new Date().toISOString();
  if (!estrategia.fechaFormateada) {
    try {
      estrategia.fechaFormateada = new Date(estrategia.fechaGeneracion).toLocaleString('es-AR', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    } catch (e) {
      estrategia.fechaFormateada = new Date().toLocaleDateString();
    }
  }

  try {
    localStorage.setItem(CLAVE_STORAGE_ESTRATEGIA, JSON.stringify(estrategia));
    persistirEstrategiaFirestore(estrategia);
  } catch (e) {
    console.error('Error al guardar estrategia en localStorage', e);
  }
}

function obtenerMateriasSeleccionadasEstrategia() {
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE_SELECCION_ESTRATEGIA);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function guardarMateriasSeleccionadasEstrategia(ids) {
  try {
    const limpios = Array.isArray(ids) ? Array.from(new Set(ids)) : [];
    localStorage.setItem(CLAVE_STORAGE_SELECCION_ESTRATEGIA, JSON.stringify(limpios));
  } catch (e) {
    console.error('Error al guardar selección de estrategia', e);
  }
}

function toggleSeleccionMateriaEstrategia(id, checked) {
  const actuales = obtenerMateriasSeleccionadasEstrategia();
  const set = new Set(actuales);
  if (checked) {
    set.add(id);
  } else {
    set.delete(id);
  }
  guardarMateriasSeleccionadasEstrategia(Array.from(set));
}

async function consultarEstrategiaGemini() {
  if (typeof window.abrirModalProgresoIA === 'function') {
    window.abrirModalProgresoIA('Generando Estrategia Académica con IA...');
    window.actualizarProgresoIA(15, 'Recopilando historia académica...', 'Leyendo aprobadas y correlativas K23');
  }

  const datosAlumno = window.datosGlobales?.datosAlumno || {};
  const planK23 = window.datosGlobales?.planEstudio?.materias || [];
  const aprobadas = (datosAlumno.materiasAprobadas || []).map(m => `${m.id} - ${m.nombre}`);
  const enCurso = (datosAlumno.materiasEnCurso || []).map(m => `${m.id} - ${m.nombre} (${m.estado || 'en curso'})`);

  const prompt = `Eres un asesor académico experto de la carrera Ingeniería en Sistemas de Información (Plan K23) de la UTN FRBA.
El alumno tiene el siguiente estado:
- Materias aprobadas: ${JSON.stringify(aprobadas)}
- Materias en curso / firmadas: ${JSON.stringify(enCurso)}
- Catálogo K23: ${JSON.stringify(planK23.map(m => ({ id: m.id, nombre: m.nombre, nivel: m.nivel, tipo: m.tipo, correlativas: m.correlativas })))}

Reglas de Negocio UTN:
1. Las materias ANUALES (ej. Análisis de Sistemas, Diseño de Sistemas, Proyecto Final) son cuellos de botella críticos.
2. La Rama Integradora (AyED -> ASI -> DSI -> AdSI -> Proyecto Final) no debe demorarse.
3. Distingue materias firmadas pendientes de final que traban cursadas posteriores ("mochila de finales").

Genera una recomendación estratégica en formato JSON con la siguiente estructura exacta:
{
  "materiasPrioritarias": [
    { "id": "codigo", "nombre": "Nombre Materia", "tipo": "Anual/Cuatrimestral", "motivo": "Por qué cursar esta materia" }
  ],
  "finalesUrgentes": [
    { "id": "codigo", "nombre": "Nombre Materia", "motivo": "Qué materias destraba rendir este final" }
  ],
  "diagnosticoRuta": "Resumen ejecutivo del estado de la carrera y plan de acción recomendado."
}`;

  try {
    if (typeof window.actualizarProgresoIA === 'function') {
      window.actualizarProgresoIA(40, 'Consultando modelos Gemini oficiales...', 'Conectando con 3.8 / 3.7 / 3.6 Flash');
    }

    const json = await window.ejecutarConsultaGeminiResiliente({
      prompt,
      onProgreso: (info) => {
        if (typeof window.actualizarProgresoIA === 'function') {
          window.actualizarProgresoIA(60, `Procesando con ${info.modelo}...`, info.mensaje);
        }
      }
    });

    if (typeof window.actualizarProgresoIA === 'function') {
      window.actualizarProgresoIA(85, 'Validando restricciones y correlatividades...', 'Filtrando opciones académicas viables');
    }

    json.fechaGeneracion = new Date().toISOString();
    guardarEstrategiaRecomendada(json);

    // Inicializamos selección con las materias sugeridas si no había selección previa
    const prevSeleccion = obtenerMateriasSeleccionadasEstrategia();
    if (prevSeleccion.length === 0 && Array.isArray(json.materiasPrioritarias)) {
      guardarMateriasSeleccionadasEstrategia(json.materiasPrioritarias.map(m => m.id));
    }

    if (typeof window.actualizarProgresoIA === 'function') {
      window.actualizarProgresoIA(100, '¡Estrategia generada con éxito!', 'Mostrando resultados...');
      setTimeout(() => window.cerrarModalProgresoIA(), 600);
    }

    return json;
  } catch (err) {
    if (typeof window.cerrarModalProgresoIA === 'function') {
      window.cerrarModalProgresoIA();
    }
    throw err;
  }
}

window.obtenerEstrategiaRecomendada = obtenerEstrategiaRecomendada;
window.guardarEstrategiaRecomendada = guardarEstrategiaRecomendada;
window.obtenerMateriasSeleccionadasEstrategia = obtenerMateriasSeleccionadasEstrategia;
window.guardarMateriasSeleccionadasEstrategia = guardarMateriasSeleccionadasEstrategia;
window.toggleSeleccionMateriaEstrategia = toggleSeleccionMateriaEstrategia;
window.consultarEstrategiaGemini = consultarEstrategiaGemini;
window.persistirEstrategiaFirestore = persistirEstrategiaFirestore;
