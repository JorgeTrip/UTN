/**
 * Módulo de Cliente Despachador Resiliente para Google Gemini API
 * Gestiona la terna oficial de modelos (3.8, 3.7 y 3.6) con tolerancia a fallos,
 * reintentos automáticos ante 503 (alta demanda) y limpieza determinística de JSON.
 */

const MODELOS_GEMINI_OFICIALES = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash'];

async function ejecutarConsultaGeminiResiliente({ prompt, inlineData = null, onProgreso = null }) {
  const apiKey = window.obtenerApiKeyGemini ? window.obtenerApiKeyGemini() : '';
  if (!apiKey) {
    throw new Error('Credencial de Gemini no disponible en la aplicación.');
  }

  const parts = [{ text: prompt }];
  if (inlineData) parts.push({ inlineData });

  const payload = {
    contents: [{ parts }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
  };

  let ultimoError = null;

  for (let i = 0; i < MODELOS_GEMINI_OFICIALES.length; i++) {
    const modelo = MODELOS_GEMINI_OFICIALES[i];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;

    if (onProgreso) {
      onProgreso({
        intento: i + 1,
        modelo,
        mensaje: i === 0 ? `Consultando modelo ${modelo}...` : `Nodo con alta demanda. Conmutando a ${modelo}...`
      });
    }

    try {
      const respuesta = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (respuesta.status === 503 || respuesta.status === 429) {
        const detalle = await respuesta.text();
        console.warn(`[Gemini Resiliente] Modelo ${modelo} saturado (${respuesta.status}). Intentando alternativa...`, detalle);
        ultimoError = new Error(`El modelo ${modelo} experimenta alta demanda.`);
        // Pausa breve antes de intentar el siguiente nodo
        await new Promise(res => setTimeout(res, 600));
        continue;
      }

      if (!respuesta.ok) {
        const errTxt = await respuesta.text();
        throw new Error(`Error en ${modelo} (${respuesta.status}): ${errTxt}`);
      }

      const data = await respuesta.json();
      const textPart = data.candidates?.[0]?.content?.parts?.find(p => typeof p.text === 'string' && p.text.trim().length > 0);
      const rawText = textPart ? textPart.text : (data.candidates?.[0]?.content?.parts?.[0]?.text || '');

      if (!rawText) {
        throw new Error(`La respuesta de ${modelo} no contiene texto válido.`);
      }

      const cleanJson = rawText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn(`[Gemini Resiliente] Fallo con ${modelo}:`, err.message);
      ultimoError = err;
    }
  }

  throw new Error(`Todos los modelos oficiales (${MODELOS_GEMINI_OFICIALES.join(', ')}) están saturados temporalmente. ${ultimoError?.message || ''}`);
}

window.MODELOS_GEMINI_OFICIALES = MODELOS_GEMINI_OFICIALES;
window.ejecutarConsultaGeminiResiliente = ejecutarConsultaGeminiResiliente;
