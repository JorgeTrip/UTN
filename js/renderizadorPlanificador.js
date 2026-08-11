/**
 * Módulo Renderizador del Planificador Académico (Super Panel 2)
 * Renderiza calendarios cuatrimestrales de 2026, 2027 y 2028 con soporte para ubicar y borrar materias.
 */

function planYearTab(indice) {
  document.querySelectorAll('#sp2 .sub-tab-bar .sub-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === indice);
  });
  document.querySelectorAll('#sp2 > .sub-panel').forEach((panel, i) => {
    panel.classList.toggle('active', i === indice);
  });
  localStorage.setItem('dashboardPlanYearTab', indice);
}

function renderizarPlanificadorCompleto() {
  const contenedor = document.getElementById('sp2');
  if (!contenedor) return;

  const datos = window.datosGlobales?.datosAlumno || {};
  const aprobadas = datos.materiasAprobadas || [];
  const enCurso = datos.materiasEnCurso || [];
  const restantesCount = Math.max(0, 38 - aprobadas.length);

  const mesActual = new Date().getMonth() + 1;
  const esSegundoCuatrimestre = mesActual >= 7;
  const altElegida2026q2 = (typeof obtenerAlternativaElegida === 'function') ? obtenerAlternativaElegida('2026', '2c') : 0;

  contenedor.innerHTML = `
    <div class="sub-tab-bar">
      <div class="sub-tab-inner">
        <button class="sub-tab active" onclick="planYearTab(0)">📅 2026 · Cursada Actual (${enCurso.length})</button>
        <button class="sub-tab" onclick="planYearTab(1)">📅 2027 · Nivel 4 y 5</button>
        <button class="sub-tab" onclick="planYearTab(2)">📅 2028 · Proyecto Final</button>
        <button class="sub-tab" onclick="planYearTab(3)">🎓 2029 · Cierre & Graduación</button>
      </div>
    </div>

    <!-- AÑO 2026 -->
    <div class="sub-panel active" id="sp2p0">
      <div class="sec">Planificación Cuatrimestral · Ciclo Lectivo 2026 (Turno Noche)</div>
      <div class="main-tabs" id="tab2026">
        <div class="main-tabs-inner">
          <button class="main-tab mq1 ${!esSegundoCuatrimestre ? 'active' : ''}" onclick="mainTabIn('tab2026', 0)">1er Cuatrimestre 2026</button>
          <button class="main-tab mq2 ${esSegundoCuatrimestre ? 'active' : ''}" onclick="mainTabIn('tab2026', 1)">2do Cuatrimestre 2026 (Vigente)</button>
        </div>

        <!-- 1er CUATRIMESTRE 2026 -->
        <div class="main-panel ${!esSegundoCuatrimestre ? 'active' : ''}">
          <div style="display:flex;justify-content:flex-start;margin:10px 0 8px;">
            <button class="btn-ubicar-materia" onclick="abrirModalUbicarMateria('2026', '1c', 0)">📌 + Ubicar Materia</button>
          </div>
          <div class="cal-outer">
            <div class="cal-head" style="grid-template-columns:48px repeat(5,1fr)"><div class="cal-head-cell"></div><div class="cal-head-cell lit">LUN</div><div class="cal-head-cell lit">MAR</div><div class="cal-head-cell lit">MIÉ</div><div class="cal-head-cell lit">JUE</div><div class="cal-head-cell lit">VIE</div></div>
            <div class="cal-body" id="q1body" style="grid-template-columns:48px repeat(5,1fr)"></div>
          </div>
        </div>

        <!-- 2do CUATRIMESTRE 2026 -->
        <div class="main-panel ${esSegundoCuatrimestre ? 'active' : ''}">
          <div class="plan-sub-tab-bar" id="mp2026q2">
            <div class="plan-sub-tab-inner">
              <button class="plan-sub-tab rec ${altElegida2026q2 === 0 ? 'active' : ''}" onclick="planSubTabIn('mp2026q2',0)">Alt 1 (Recomendada · N4)${altElegida2026q2 === 0 ? ' 🏆' : ''}</button>
              <button class="plan-sub-tab ${altElegida2026q2 === 1 ? 'active' : ''}" onclick="planSubTabIn('mp2026q2',1)">Alt 2 (Balanceada · N4)${altElegida2026q2 === 1 ? ' 🏆' : ''}</button>
              <button class="plan-sub-tab ${altElegida2026q2 === 2 ? 'active' : ''}" onclick="planSubTabIn('mp2026q2',2)">Alt 3 (Intensiva N4/N5)${altElegida2026q2 === 2 ? ' 🏆' : ''}</button>
            </div>
            <!-- Alt 1 -->
            <div class="plan-sub-panel ${altElegida2026q2 === 0 ? 'active' : ''}">
              <div style="display:flex;justify-content:space-between;align-items:center;margin:10px 0 8px;">
                <button class="btn-ubicar-materia" onclick="abrirModalUbicarMateria('2026', '2c', 0)">📌 + Ubicar Materia</button>
                ${altElegida2026q2 === 0 ? '<span class="badge-alt-elegida">🏆 Alternativa Asignada (Definitiva)</span>' : '<button class="btn-seleccionar-alt" onclick="seleccionarAlternativaDefinitiva(\'2026\', \'2c\', 0)">⭐ Definir como Asignada</button>'}
              </div>
              <div class="cal-outer"><div class="cal-head" style="grid-template-columns:48px repeat(6,1fr)"><div class="cal-head-cell"></div><div class="cal-head-cell lit">LUN</div><div class="cal-head-cell lit">MAR</div><div class="cal-head-cell lit">MIÉ</div><div class="cal-head-cell lit">JUE</div><div class="cal-head-cell lit">VIE</div><div class="cal-head-cell lit">SÁB</div></div><div class="cal-body" id="q2a1body" style="grid-template-columns:48px repeat(6,1fr)"></div></div>
            </div>
            <!-- Alt 2 -->
            <div class="plan-sub-panel ${altElegida2026q2 === 1 ? 'active' : ''}">
              <div style="display:flex;justify-content:space-between;align-items:center;margin:10px 0 8px;">
                <button class="btn-ubicar-materia" onclick="abrirModalUbicarMateria('2026', '2c', 1)">📌 + Ubicar Materia</button>
                ${altElegida2026q2 === 1 ? '<span class="badge-alt-elegida">🏆 Alternativa Asignada (Definitiva)</span>' : '<button class="btn-seleccionar-alt" onclick="seleccionarAlternativaDefinitiva(\'2026\', \'2c\', 1)">⭐ Definir como Asignada</button>'}
              </div>
              <div class="cal-outer"><div class="cal-head" style="grid-template-columns:48px repeat(6,1fr)"><div class="cal-head-cell"></div><div class="cal-head-cell lit">LUN</div><div class="cal-head-cell lit">MAR</div><div class="cal-head-cell lit">MIÉ</div><div class="cal-head-cell lit">JUE</div><div class="cal-head-cell lit">VIE</div><div class="cal-head-cell lit">SÁB</div></div><div class="cal-body" id="q2a2body" style="grid-template-columns:48px repeat(6,1fr)"></div></div>
            </div>
            <!-- Alt 3 -->
            <div class="plan-sub-panel ${altElegida2026q2 === 2 ? 'active' : ''}">
              <div style="display:flex;justify-content:space-between;align-items:center;margin:10px 0 8px;">
                <button class="btn-ubicar-materia" onclick="abrirModalUbicarMateria('2026', '2c', 2)">📌 + Ubicar Materia</button>
                ${altElegida2026q2 === 2 ? '<span class="badge-alt-elegida">🏆 Alternativa Asignada (Definitiva)</span>' : '<button class="btn-seleccionar-alt" onclick="seleccionarAlternativaDefinitiva(\'2026\', \'2c\', 2)">⭐ Definir como Asignada</button>'}
              </div>
              <div class="cal-outer"><div class="cal-head" style="grid-template-columns:48px repeat(6,1fr)"><div class="cal-head-cell"></div><div class="cal-head-cell lit">LUN</div><div class="cal-head-cell lit">MAR</div><div class="cal-head-cell lit">MIÉ</div><div class="cal-head-cell lit">JUE</div><div class="cal-head-cell lit">VIE</div><div class="cal-head-cell lit">SÁB</div></div><div class="cal-body" id="q2a3body" style="grid-template-columns:48px repeat(6,1fr)"></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>

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

  renderizarGrillasPlanificador();
  if (typeof resaltarDiaActual === 'function') resaltarDiaActual();
}

/**
 * Renderiza dinámicamente cada grilla del planificador utilizando los eventos guardados.
 */
function renderizarGrillasPlanificador() {
  const f = (typeof obtenerEventosPlanificacion === 'function') ? obtenerEventosPlanificacion : () => [];

  // 2026 1C y 2C
  construirCalendario('q1body', 5, f('2026', '1c', 0), false, { anio: '2026', cuatrimestre: '1c', alternativa: 0 });
  construirCalendario('q2a1body', 6, f('2026', '2c', 0), true, { anio: '2026', cuatrimestre: '2c', alternativa: 0 });
  construirCalendario('q2a2body', 6, f('2026', '2c', 1), true, { anio: '2026', cuatrimestre: '2c', alternativa: 1 });
  construirCalendario('q2a3body', 6, f('2026', '2c', 2), true, { anio: '2026', cuatrimestre: '2c', alternativa: 2 });

  // 2027 1C y 2C
  construirCalendario('y27q1body', 5, f('2027', '1c', 0), false, { anio: '2027', cuatrimestre: '1c', alternativa: 0 });
  construirCalendario('y27q2body', 5, f('2027', '2c', 0), false, { anio: '2027', cuatrimestre: '2c', alternativa: 0 });

  // 2028 1C y 2C
  construirCalendario('y28q1body', 5, f('2028', '1c', 0), false, { anio: '2028', cuatrimestre: '1c', alternativa: 0 });
  construirCalendario('y28q2body', 5, f('2028', '2c', 0), false, { anio: '2028', cuatrimestre: '2c', alternativa: 0 });
}
