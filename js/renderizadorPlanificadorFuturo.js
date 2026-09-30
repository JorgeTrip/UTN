/**
 * Módulo de Renderizado de Paneles Futuros del Planificador (2027, 2028, 2029)
 * Genera la estructura HTML para las planificaciones de años avanzados de la carrera.
 */

function generarHtmlPanelesFuturos(restantesCount) {
  return `
    <!-- AÑO 2027 -->
    <div class="sub-panel" id="sp2p1">
      <div class="sec">Planificación Futura · Ciclo Lectivo 2027</div>
      <div class="main-tabs" id="tab2027">
        <div class="main-tabs-inner">
          <button class="main-tab mq1 active" onclick="mainTabIn('tab2027', 0)">1er Cuatrimestre 2027</button>
          <button class="main-tab mq2" onclick="mainTabIn('tab2027', 1)">2do Cuatrimestre 2027</button>
        </div>
        <div class="main-panel active">
          <div style="display:flex;justify-content:flex-start;margin:10px 0 8px;">
            <button class="btn-ubicar-materia" onclick="abrirModalUbicarMateria('2027', '1c', 0)">📌 + Ubicar Materia</button>
          </div>
          <div class="cal-outer"><div class="cal-head" style="grid-template-columns:48px repeat(5,1fr)"><div class="cal-head-cell"></div><div class="cal-head-cell lit">LUN</div><div class="cal-head-cell lit">MAR</div><div class="cal-head-cell lit">MIÉ</div><div class="cal-head-cell lit">JUE</div><div class="cal-head-cell lit">VIE</div></div><div class="cal-body" id="y27q1body" style="grid-template-columns:48px repeat(5,1fr)"></div></div>
        </div>
        <div class="main-panel">
          <div style="display:flex;justify-content:flex-start;margin:10px 0 8px;">
            <button class="btn-ubicar-materia" onclick="abrirModalUbicarMateria('2027', '2c', 0)">📌 + Ubicar Materia</button>
          </div>
          <div class="cal-outer"><div class="cal-head" style="grid-template-columns:48px repeat(5,1fr)"><div class="cal-head-cell"></div><div class="cal-head-cell lit">LUN</div><div class="cal-head-cell lit">MAR</div><div class="cal-head-cell lit">MIÉ</div><div class="cal-head-cell lit">JUE</div><div class="cal-head-cell lit">VIE</div></div><div class="cal-body" id="y27q2body" style="grid-template-columns:48px repeat(5,1fr)"></div></div>
        </div>
      </div>
    </div>

    <!-- AÑO 2028 -->
    <div class="sub-panel" id="sp2p2">
      <div class="sec">Planificación Futura · Ciclo Lectivo 2028</div>
      <div class="main-tabs" id="tab2028">
        <div class="main-tabs-inner">
          <button class="main-tab mq1 active" onclick="mainTabIn('tab2028', 0)">1er Cuatrimestre 2028</button>
          <button class="main-tab mq2" onclick="mainTabIn('tab2028', 1)">2do Cuatrimestre 2028</button>
        </div>
        <div class="main-panel active">
          <div style="display:flex;justify-content:flex-start;margin:10px 0 8px;">
            <button class="btn-ubicar-materia" onclick="abrirModalUbicarMateria('2028', '1c', 0)">📌 + Ubicar Materia</button>
          </div>
          <div class="cal-outer"><div class="cal-head" style="grid-template-columns:48px repeat(5,1fr)"><div class="cal-head-cell"></div><div class="cal-head-cell lit">LUN</div><div class="cal-head-cell lit">MAR</div><div class="cal-head-cell lit">MIÉ</div><div class="cal-head-cell lit">JUE</div><div class="cal-head-cell lit">VIE</div></div><div class="cal-body" id="y28q1body" style="grid-template-columns:48px repeat(5,1fr)"></div></div>
        </div>
        <div class="main-panel">
          <div style="display:flex;justify-content:flex-start;margin:10px 0 8px;">
            <button class="btn-ubicar-materia" onclick="abrirModalUbicarMateria('2028', '2c', 0)">📌 + Ubicar Materia</button>
          </div>
          <div class="cal-outer"><div class="cal-head" style="grid-template-columns:48px repeat(5,1fr)"><div class="cal-head-cell"></div><div class="cal-head-cell lit">LUN</div><div class="cal-head-cell lit">MAR</div><div class="cal-head-cell lit">MIÉ</div><div class="cal-head-cell lit">JUE</div><div class="cal-head-cell lit">VIE</div></div><div class="cal-body" id="y28q2body" style="grid-template-columns:48px repeat(5,1fr)"></div></div>
        </div>
      </div>
    </div>

    <!-- AÑO 2029 -->
    <div class="sub-panel" id="sp2p3">
      <div class="sec">Cierre de Carrera y Graduación (2029)</div>
      <div class="infobox">
        <strong>Estimación de Graduación:</strong> ${restantesCount > 0 ? 'Restan ' + restantesCount + ' materias en el plan. Manteniendo la proyección actual, la titulación de Grado se completará en 2029.' : '¡Plan de estudio 100% completado!'}
      </div>
    </div>
  `;
}

window.generarHtmlPanelesFuturos = generarHtmlPanelesFuturos;
