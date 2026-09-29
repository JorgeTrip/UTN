/**
 * Módulo Renderizador de Estrategia Académica y Correlatividades (Super Panel 1 Sub Panel 3)
 * 100% Dinámico: Evalúa dinámicamente el estado real de correlatividades y la matriz de equivalencias K08 vs K23.
 */

function renderizarEstrategia() {
  const contenedor = document.getElementById('sp1p3');
  if (!contenedor) return;

  const datos = window.datosGlobales?.datosAlumno || {};
  const aprobadas = datos.materiasAprobadas || [];
  const enCurso = datos.materiasEnCurso || [];
  const equivalencias = window.datosGlobales?.planEstudio?.tabla_equivalencias_oficial_ord_1878 || [];

  /** Evalúa el estado de avance (Aprobada, En curso o Pendiente) de una materia por ID. */
  const obtenerEstadoMateria = (id) => {
    if (aprobadas.some(m => m.id === id)) return '<span style="color:var(--green);font-weight:700;">✓ Aprobada</span>';
    if (enCurso.some(m => m.id === id)) return '<span style="color:var(--blue);font-weight:700;">⏳ En curso</span>';
    return '<span style="color:var(--muted);">❌ Pendiente</span>';
  };
  const getEstadoMat = obtenerEstadoMateria;

  contenedor.replaceChildren();
  contenedor.insertAdjacentHTML('beforeend', `
    <div class="sec">🔄 Tabla Oficial de Nombres y Equivalencias · Plan K08 (Ord. 1150) → Plan K23 (Ord. 1877)</div>
    <div class="infobox" style="margin-bottom:14px;font-size:12px;">
      Basado en la <strong>Ordenanza N° 1878</strong> y la <strong>Resolución N° 3120/22 FRBA</strong>. Muestra la correspondencia directa entre el Plan K08 y el Plan K23.
    </div>

    <div style="max-height:240px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;margin-bottom:20px;background:var(--s1);">
      <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;">
        <thead>
          <tr style="background:var(--s2);border-bottom:1px solid var(--border);color:var(--muted);text-transform:uppercase;font-size:10px;">
            <th style="padding:6px 10px;">Denominación Plan K08 (Ord. 1150)</th>
            <th style="padding:6px 10px;">Denominación Oficial Plan K23 (Ord. 1877)</th>
          </tr>
        </thead>
        <tbody>
          ${equivalencias.map(eq => `
            <tr style="border-bottom:1px solid var(--border);">
              <td style="padding:6px 10px;"><span class="badge-plan-k08">K08</span> ${eq.plan_2008}</td>
              <td style="padding:6px 10px;"><span class="badge-plan-k23">K23</span> <strong>${eq.plan_2023}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="sec">Cadenas de Correlatividades y Estado de Avance</div>
    <div class="strat-grid">
      <div class="strat-card">
        <h4><span style="color:var(--asi)">●</span> Rama Integradora Sistemas</h4>
        <p><strong>AyED → ASI → DSI → AdSI → Proyecto Final</strong></p>
        <ul style="font-size:12px;line-height:1.6;list-style:none;padding:0;">
          <li>• Algoritmos y Estructuras de Datos: ${getEstadoMat('082021')}</li>
          <li>• Análisis de Sistemas de Información: ${getEstadoMat('082024')}</li>
          <li>• Diseño de Sistemas de Información: ${getEstadoMat('232034')}</li>
          <li>• Adm. de Sistemas de Información: ${getEstadoMat('232045')}</li>
          <li>• Proyecto Final: ${getEstadoMat('082037')}</li>
        </ul>
      </div>
      <div class="strat-card">
        <h4><span style="color:var(--cd)">●</span> Rama Redes y Comunicaciones</h4>
        <p><strong>Arq → Comu → Redes → Seguridad</strong></p>
        <ul style="font-size:12px;line-height:1.6;list-style:none;padding:0;">
          <li>• Arquitectura de Computadoras: ${getEstadoMat('082022')}</li>
          <li>• Comunicación de Datos: ${getEstadoMat('232032')}</li>
          <li>• Redes de Datos: ${getEstadoMat('232041')}</li>
          <li>• Seguridad en los Sistemas: ${getEstadoMat('232055')}</li>
        </ul>
      </div>
    </div>
  `);
}
