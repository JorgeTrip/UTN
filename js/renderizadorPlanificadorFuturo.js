/**
 * Módulo de Renderizado de Paneles Futuros del Planificador
 * Genera la estructura HTML dinámica para las planificaciones de años avanzados de la carrera.
 */

function generarHtmlPanelesFuturos(aniosFuturos = [], restantesCount = 0) {
  if (!Array.isArray(aniosFuturos) || aniosFuturos.length === 0) {
    return '';
  }

  const anioGraduacion = aniosFuturos[aniosFuturos.length - 1];

  const htmlPaneles = aniosFuturos.map((anio, idx) => {
    const panelId = `sp2p${idx + 1}`;
    const tabId = `tab${anio}`;
    const q1BodyId = `y${String(anio).slice(-2)}q1body`;
    const q2BodyId = `y${String(anio).slice(-2)}q2body`;

    return `
      <!-- AÑO ${anio} -->
      <div class="sub-panel" id="${panelId}">
        <div class="sec">Planificación Futura · Ciclo Lectivo ${anio}</div>
        <div class="main-tabs" id="${tabId}">
          <div class="main-tabs-inner">
            <button class="main-tab mq1 active" onclick="mainTabIn('${tabId}', 0)">1er Cuatrimestre ${anio}</button>
            <button class="main-tab mq2" onclick="mainTabIn('${tabId}', 1)">2do Cuatrimestre ${anio}</button>
          </div>
          <div class="main-panel active">
            <div style="display:flex;justify-content:flex-start;margin:10px 0 8px;">
              <button class="btn-ubicar-materia" onclick="abrirModalUbicarMateria('${anio}', '1c', 0)">📌 + Ubicar Materia</button>
            </div>
            <div class="cal-outer">
              <div class="cal-head" style="grid-template-columns:48px repeat(5,1fr)"><div class="cal-head-cell"></div><div class="cal-head-cell lit">LUN</div><div class="cal-head-cell lit">MAR</div><div class="cal-head-cell lit">MIÉ</div><div class="cal-head-cell lit">JUE</div><div class="cal-head-cell lit">VIE</div></div>
              <div class="cal-body" id="${q1BodyId}" style="grid-template-columns:48px repeat(5,1fr)"></div>
            </div>
          </div>
          <div class="main-panel">
            <div style="display:flex;justify-content:flex-start;margin:10px 0 8px;">
              <button class="btn-ubicar-materia" onclick="abrirModalUbicarMateria('${anio}', '2c', 0)">📌 + Ubicar Materia</button>
            </div>
            <div class="cal-outer">
              <div class="cal-head" style="grid-template-columns:48px repeat(5,1fr)"><div class="cal-head-cell"></div><div class="cal-head-cell lit">LUN</div><div class="cal-head-cell lit">MAR</div><div class="cal-head-cell lit">MIÉ</div><div class="cal-head-cell lit">JUE</div><div class="cal-head-cell lit">VIE</div></div>
              <div class="cal-body" id="${q2BodyId}" style="grid-template-columns:48px repeat(5,1fr)"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const panelGraduacion = `
    <!-- PANEL ESTIMACIÓN DE GRADUACIÓN -->
    <div class="sub-panel" id="sp2p${aniosFuturos.length + 1}">
      <div class="sec">Estimación de Cierre de Carrera (${anioGraduacion})</div>
      <div class="infobox">
        <strong>Estimación de Graduación:</strong> ${restantesCount > 0 ? `Restan ${restantesCount} materias en el plan. Manteniendo la proyección óptima actual, la titulación de Grado se completará hacia ${anioGraduacion}.` : '¡Plan de estudio 100% completado!'}
      </div>
    </div>
  `;

  return htmlPaneles + panelGraduacion;
}

window.generarHtmlPanelesFuturos = generarHtmlPanelesFuturos;
