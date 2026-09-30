/**
 * Módulo de Cliente Despachador Resiliente para Google Gemini API
 * Gestiona la conmutación entre función serverless segura (Netlify) y fallback directo,
 * rotando entre la terna oficial de modelos con tolerancia a fallos y reintentos ante saturación.
 */

const MODELOS_GEMINI_OFICIALES = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.8-flash'
];

function extraerTextoLimpioJson(data, modelo) {
  const textPart = data.candidates?.[0]?.content?.parts?.find(p => typeof p.text === 'string' && p.text.trim().length > 0);
  const rawText = textPart ? textPart.text : (data.candidates?.[0]?.content?.parts?.[0]?.text || '');
  if (!rawText) {
    throw new Error(`La respuesta de ${modelo} no contiene texto válido.`);
  }
  const cleanJson = rawText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleanJson);
}

async function despacharConsultaModelo({ prompt, inlineData, modelo, apiKey }) {
  // Si no hay apiKey local, intentamos llamar al proxy serverless seguro de Netlify
  if (!apiKey) {
    const respServerless = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, inlineData, modelo })
    });

    if (respServerless.status === 503 || respServerless.status === 429) {
      return { saturado: true, status: respServerless.status };
    }
    if (!respServerless.ok) {
      const errTxt = await respServerless.text();
      throw new Error(`Error en proxy serverless (${respServerless.status}): ${errTxt}`);
    }
    const data = await respServerless.json();
    return { exito: true, data: extraerTextoLimpioJson(data, modelo) };
  }

  // Fallback directo con API Key local
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: inlineData ? [{ text: prompt }, { inlineData }] : [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
  };

  const respDirecta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (respDirecta.status === 503 || respDirecta.status === 429) {
    return { saturado: true, status: respDirecta.status };
  }
  if (!respDirecta.ok) {
    const errTxt = await respDirecta.text();
    throw new Error(`Error en llamada directa a ${modelo} (${respDirecta.status}): ${errTxt}`);
  }
  const data = await respDirecta.json();
  return { exito: true, data: extraerTextoLimpioJson(data, modelo) };
}

async function ejecutarConsultaGeminiResiliente({ prompt, inlineData = null, onProgreso = null }) {
  const apiKeyLocal = window.obtenerApiKeyGemini ? window.obtenerApiKeyGemini() : '';
  let ultimoError = null;

  for (let i = 0; i < MODELOS_GEMINI_OFICIALES.length; i++) {
    const modelo = MODELOS_GEMINI_OFICIALES[i];

    if (onProgreso) {
      onProgreso({
        intento: i + 1,
        modelo,
        mensaje: i === 0 ? `Consultando modelo ${modelo}...` : `Nodo saturado. Conmutando a ${modelo}...`
      });
    }

    try {
      const resultado = await despacharConsultaModelo({
        prompt,
        inlineData,
        modelo,
        apiKey: apiKeyLocal
      });

      if (resultado.saturado) {
        ultimoError = new Error(`El modelo ${modelo} experimenta alta demanda (${resultado.status}).`);
        await new Promise(res => setTimeout(res, 600));
        continue;
      }

      if (resultado.exito) {
        return resultado.data;
      }
    } catch (err) {
      console.warn(`[Gemini Resiliente] Fallo con ${modelo}:`, err.message);
      ultimoError = err;
    }
  }

  throw new Error(`No fue posible procesar la consulta con los modelos oficiales (${MODELOS_GEMINI_OFICIALES.join(', ')}). ${ultimoError?.message || ''}`);
}

window.MODELOS_GEMINI_OFICIALES = MODELOS_GEMINI_OFICIALES;
window.ejecutarConsultaGeminiResiliente = ejecutarConsultaGeminiResiliente;
