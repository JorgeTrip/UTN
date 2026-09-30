/**
 * Módulo de Servicio de Integración con Google Gemini API para Horarios
 * Procesa documentos PDF de oferta horaria utilizando el cliente resiliente (3.8, 3.7 y 3.6).
 */

const CLAVE_STORAGE_GEMINI = 'gemini_api_key_utn';

function obtenerApiKeyGemini() {
  try {
    const custom = localStorage.getItem(CLAVE_STORAGE_GEMINI);
    if (custom && custom.trim()) return custom.trim();
  } catch (e) {
    // ignorar error de acceso a storage
  }
  return '';
}

function guardarApiKeyGemini(clave) {
  if (!clave || typeof clave !== 'string') return;
  try {
    localStorage.setItem(CLAVE_STORAGE_GEMINI, clave.trim());
  } catch (e) {
    console.error('Error al guardar API Key de Gemini en localStorage', e);
  }
}

async function analizarHorariosPdfConGemini(base64Pdf) {
  const promptExtraccion = `Eres un asistente universitario experto en analizar grillas de horarios de la UTN FRBA (Ingeniería en Sistemas de Información).
Analiza el documento PDF adjunto que contiene la oferta de cursos y comisiones.
Para cada fila o comisión de materia:
1. Extrae el código de materia (ej. 232032 o 950452).
2. Nombre de la asignatura.
3. División / Comisión (ej. K1001, K3051, R2001).
4. Turno: 'Mañana' (si dice Mañ o M), 'Tarde' (si dice T), o 'Noche' (si dice N).
5. Tipo: 'Anual' (A) o 'Cuatrimestral' (C).
6. Anexo o Sede (ej. CAMPUS, MEDRANO, Virtual).
7. Profesor a cargo si está especificado.
8. Grilla de horarios ocupados: identifica los días (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado) y los módulos ocupados (0 a 6).
Retorna ÚNICAMENTE un objeto JSON válido con la propiedad "comisiones" conteniendo el arreglo de cursos.`;

  if (typeof window.abrirModalProgresoIA === 'function') {
    window.abrirModalProgresoIA('Analizando PDF de Horarios con IA...');
    window.actualizarProgresoIA(20, 'Leyendo documento PDF...', 'Codificando contenido para modelos oficiales Gemini');
  }

  try {
    const jsonParsed = await window.ejecutarConsultaGeminiResiliente({
      prompt: promptExtraccion,
      inlineData: {
        mimeType: 'application/pdf',
        data: base64Pdf
      },
      onProgreso: (info) => {
        if (typeof window.actualizarProgresoIA === 'function') {
          window.actualizarProgresoIA(60, `Extrayendo comisiones con ${info.modelo}...`, info.mensaje);
        }
      }
    });

    if (typeof window.actualizarProgresoIA === 'function') {
      window.actualizarProgresoIA(90, 'Estructurando comisiones...', 'Normalizando divisiones, turnos y sedes');
      setTimeout(() => window.cerrarModalProgresoIA(), 500);
    }

    return Array.isArray(jsonParsed) ? jsonParsed : (jsonParsed.comisiones || []);
  } catch (err) {
    if (typeof window.cerrarModalProgresoIA === 'function') {
      window.cerrarModalProgresoIA();
    }
    throw err;
  }
}

window.obtenerApiKeyGemini = obtenerApiKeyGemini;
window.guardarApiKeyGemini = guardarApiKeyGemini;
window.analizarHorariosPdfConGemini = analizarHorariosPdfConGemini;
