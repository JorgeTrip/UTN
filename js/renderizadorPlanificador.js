/**
 * Módulo Renderizador del Planificador Académico (Super Panel 2)
 * Renderiza calendarios cuatrimestrales de 2026 y proyecciones futuras.
 * Incluye botón global 'Cargar horarios' persistente en todas las solapas anuales.
 */

function seleccionarAnioPlanificador(indice) {
  document.querySelectorAll('#sp2 .sub-tab-bar .sub-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === indice);
  });
  document.querySelectorAll('#sp2 > .sub-panel').forEach((panel, i) => {
    panel.classList.toggle('active', i === indice);
  });
  localStorage.setItem('dashboardPlanYearTab', indice);
}
const planYearTab = seleccionarAnioPlanificador;

function renderizarPlanificadorCompleto() {
  const contenedor = document.getElementById('sp2');
  if (!contenedor) return;

  const datos = window.datosGlobales?.datosAlumno || {};
  const aprobadas = datos.materiasAprobadas || [];
  const enCurso = datos.materiasEnCurso || [];
  const tieneDatos = aprobadas.length > 0 || enCurso.length > 0;
  const restantesCount = Math.max(0, 38 - aprobadas.length);

  const mesActual = new Date().getMonth() + 1;
  const esSegundoCuatrimestre = mesActual >= 7;
  const altElegida2026q2 = (typeof obtenerAlternativaElegida === 'function') ? obtenerAlternativaElegida('2026', '2c') : 0;
  const turnoAlumno = datos.turno || 'Noche';

  let pestañasAnualesHtml = '<button class="sub-tab active" onclick="planYearTab(0)">📅 2026 · Cursada Actual (' + enCurso.length + ')</button>';
  if (tieneDatos) {
    pestañasAnualesHtml += `
      <button class="sub-tab" onclick="planYearTab(1)">📅 2027 · Nivel 4 y 5</button>
      <button class="sub-tab" onclick="planYearTab(2)">📅 2028 · Proyecto Final</button>
      <button class="sub-tab" onclick="planYearTab(3)">🎓 2029 · Cierre & Graduación</button>
    `;
  }

  contenedor.replaceChildren();
  contenedor.insertAdjacentHTML('beforeend', `
    <!-- Barra Superior Global con Pestañas y Botón Permanente -->
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
      <div class="sub-tab-bar" style="margin:0;">
        <div class="sub-tab-inner">${pestañasAnualesHtml}</div>
      </div>
      <button class="btn-prim btn-oferta-horarios" style="font-size:12px;padding:6px 14px;" onclick="abrirModalCargaHorarios()">Cargar horarios</button>
    </div>

    <!-- AÑO 2026 -->
    <div class="sub-panel active" id="sp2p0">
      <div class="sec" style="margin-bottom:10px;">Planificación Cuatrimestral · Ciclo Lectivo 2026 (Turno ${turnoAlumno})</div>

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

    ${tieneDatos && typeof window.generarHtmlPanelesFuturos === 'function' ? window.generarHtmlPanelesFuturos(restantesCount) : ''}
  `);

  renderizarGrillasPlanificador();
  if (typeof resaltarDiaActual === 'function') resaltarDiaActual();
}

function renderizarGrillasPlanificador() {
  const f = (typeof obtenerEventosPlanificacion === 'function') ? obtenerEventosPlanificacion : () => [];

  if (document.getElementById('q1body')) construirCalendario('q1body', 5, f('2026', '1c', 0), false, { anio: '2026', cuatrimestre: '1c', alternativa: 0 });
  if (document.getElementById('q2a1body')) construirCalendario('q2a1body', 6, f('2026', '2c', 0), true, { anio: '2026', cuatrimestre: '2c', alternativa: 0 });
  if (document.getElementById('q2a2body')) construirCalendario('q2a2body', 6, f('2026', '2c', 1), true, { anio: '2026', cuatrimestre: '2c', alternativa: 1 });
  if (document.getElementById('q2a3body')) construirCalendario('q2a3body', 6, f('2026', '2c', 2), true, { anio: '2026', cuatrimestre: '2c', alternativa: 2 });

  if (document.getElementById('y27q1body')) construirCalendario('y27q1body', 5, f('2027', '1c', 0), false, { anio: '2027', cuatrimestre: '1c', alternativa: 0 });
  if (document.getElementById('y27q2body')) construirCalendario('y27q2body', 5, f('2027', '2c', 0), false, { anio: '2027', cuatrimestre: '2c', alternativa: 0 });
  if (document.getElementById('y28q1body')) construirCalendario('y28q1body', 5, f('2028', '1c', 0), false, { anio: '2028', cuatrimestre: '1c', alternativa: 0 });
  if (document.getElementById('y28q2body')) construirCalendario('y28q2body', 5, f('2028', '2c', 0), false, { anio: '2028', cuatrimestre: '2c', alternativa: 0 });
}

function actualizarPlanificadorConOferta(comisiones) {
  const datos = window.datosGlobales?.datosAlumno || {};
  const turno = datos.turno || 'Noche';
  const aprobadas = new Set((datos.materiasAprobadas || []).map(m => String(m.id)));
  const materiasK23 = window.datosGlobales?.planEstudio?.materias || [];
  const habilitadas = materiasK23.filter(m => !aprobadas.has(String(m.id))).map(m => String(m.id));

  const resultado = window.generarAlternativasCursada({
    oferta: comisiones,
    materiasHabilitadas: habilitadas,
    turnoPreferido: turno,
    materiasPorCuatrimestre: 3
  });

  if (resultado.turnoInsuficiente && resultado.mensajeTurno) {
    alert(resultado.mensajeTurno);
  }
  renderizarPlanificadorCompleto();
}

window.renderizarPlanificadorCompleto = renderizarPlanificadorCompleto;
window.renderizarGrillasPlanificador = renderizarGrillasPlanificador;
window.seleccionarAnioPlanificador = seleccionarAnioPlanificador;
window.planYearTab = seleccionarAnioPlanificador;
window.actualizarPlanificadorConOferta = actualizarPlanificadorConOferta;
