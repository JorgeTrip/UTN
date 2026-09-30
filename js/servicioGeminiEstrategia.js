/**
 * Módulo de Servicio de Estrategia Académica con Gemini API
 * Analiza el avance del estudiante, correlatividades y cuellos de botella para
 * recomendar las materias prioritarias y los exámenes finales clave.
 */

const CLAVE_STORAGE_ESTRATEGIA = 'estrategiaRecomendadaAlumno_v1';

function obtenerEstrategiaRecomendada() {
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE_ESTRATEGIA);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function guardarEstrategiaRecomendada(estrategia) {
  if (!estrategia) return;
  try {
    localStorage.setItem(CLAVE_STORAGE_ESTRATEGIA, JSON.stringify(estrategia));
  } catch (e) {
    console.error('Error al guardar estrategia en localStorage', e);
  }
}

async function consultarEstrategiaGemini() {
  const apiKey = window.obtenerApiKeyGemini ? window.obtenerApiKeyGemini() : '';
  if (!apiKey) {
    throw new Error('Debes configurar tu API Key de Gemini en el modal de horarios o perfil.');
  }

  const datosAlumno = window.datosGlobales?.datosAlumno || {};
  const planK23 = window.datosGlobales?.planEstudio?.materias || [];
  const aprobadas = (datosAlumno.materiasAprobadas || []).map(m => `${m.id} - ${m.nombre}`);
  const enCurso = (datosAlumno.materiasEnCurso || []).map(m => `${m.id} - ${m.nombre} (${m.estado || 'en curso'})`);

  const prompt = `Eres un asesor académico experto de la carrera Ingeniería en Sistemas de Información (Plan K23) de la UTN FRBA.
El alumno tiene el siguiente estado:
- Materias aprobadas: ${JSON.stringify(aprobadas)}
- Materias en curso / firmadas: ${JSON.stringify(enCurso)}
- Catálogo K23 con correlativas y tipo anual/cuatrimestral: ${JSON.stringify(planK23.map(m => ({ id: m.id, nombre: m.nombre, nivel: m.nivel, tipo: m.tipo, correlativas: m.correlativas })))}

Reglas de Negocio UTN:
1. Las materias ANUALES (ej. Análisis de Sistemas, Diseño de Sistemas, Proyecto Final) solo arrancan a inicio de ciclo lectivo y son cuellos de botella críticos.
2. La Rama Integradora (AyED -> ASI -> DSI -> AdSI -> Proyecto Final) no debe demorarse bajo ningún concepto.
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
    })
  });

  if (!respuesta.ok) {
    const errorText = await respuesta.text();
    throw new Error(`Error en Gemini API (${respuesta.status}): ${errorText}`);
  }

  const data = await respuesta.json();
  const textPart = data.candidates?.[0]?.content?.parts?.find(p => typeof p.text === 'string' && p.text.trim().length > 0);
  const text = textPart ? textPart.text : (data.candidates?.[0]?.content?.parts?.[0]?.text || '');
  const cleanJson = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const json = JSON.parse(cleanJson);
  json.fechaGeneracion = new Date().toISOString();
  guardarEstrategiaRecomendada(json);
  return json;
}

window.obtenerEstrategiaRecomendada = obtenerEstrategiaRecomendada;
window.guardarEstrategiaRecomendada = guardarEstrategiaRecomendada;
window.consultarEstrategiaGemini = consultarEstrategiaGemini;
