/**
 * Función Serverless de Netlify: Proxy seguro para Google Gemini API
 * Permite realizar consultas a Gemini sin exponer la API Key en el frontend ni en repositorios públicos.
 */

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido. Se requiere POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Obtención segura de la credencial desde las variables de entorno de Netlify
  const apiKey = (typeof Netlify !== 'undefined' && Netlify.env ? Netlify.env.get('GEMINI_API_KEY') : null) || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({
      error: 'La variable de entorno GEMINI_API_KEY no está configurada en el panel de Netlify.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { prompt, inlineData, modelo = 'gemini-flash-lite-latest' } = await req.json();

    const parts = [{ text: prompt }];
    if (inlineData) {
      parts.push({ inlineData });
    }

    const payload = {
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent?key=${apiKey}`;

    const respuestaGoogle = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const textoRespuesta = await respuestaGoogle.text();

    return new Response(textoRespuesta, {
      status: respuestaGoogle.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: `Error interno al procesar la solicitud con Gemini: ${error.message}`
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/gemini'
};
