/**
 * Módulo Renderizador de la Guía Académica y Normativa Institucional (Super Panel 4)
 * Consume data/info.json y data/planEstudio.json exponiendo pestañas interactivas, equivalencias y buscador.
 */

let datosGuiaCache = null;
let seccionGuiaActiva = 'todas';

async function cargarDatosGuiaCompletos() {
  if (datosGuiaCache) return datosGuiaCache;
  try {
    const [resInfo, resPlan] = await Promise.all([
      fetch('data/info.json').then(r => r.json()),
      fetch('data/planEstudio.json').then(r => r.json())
    ]);
    datosGuiaCache = { info: resInfo, plan: resPlan };
    return datosGuiaCache;
  } catch (e) {
    console.warn('Error cargando datos para la guía académica:', e);
    return null;
  }
}

function conmutarSeccionGuia(seccion) {
  seccionGuiaActiva = seccion;
  document.querySelectorAll('#sp4 .guia-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.seccion === seccion);
  });
  document.querySelectorAll('#sp4 .guia-seccion-bloque').forEach(bloque => {
    bloque.style.display = (seccion === 'todas' || bloque.id === `guiaSec_${seccion}`) ? 'block' : 'none';
  });
}

async function renderizarGuiaAcademica() {
  const contenedor = document.getElementById('sp4');
  if (!contenedor) return;
  const { info, plan } = await cargarDatosGuiaCompletos() || { info: {}, plan: {} };

  const sedes = info?.normativas_y_calculos?.sedes || {};
  const rtf = info?.normativas_y_calculos?.sistema_rtf || {};
  const peso = info?.normativas_y_calculos?.peso_academico || {};
  const transicion = info?.transicion_k08_k23 || {};
  const equivOficial = plan?.tabla_equivalencias_oficial_ord_1878 || [];
  const electivas = plan?.materias_electivas || [];
  const infoPlan = plan?.informacion_general_plan_k23 || {};
  const obsoletas = plan?.acreditacion_materias_k08_obsoletas_en_k23 || {};

  contenedor.replaceChildren();
  contenedor.insertAdjacentHTML('beforeend', `
    <div class="guia-header-box" style="margin-bottom:18px;">
      <div class="sec" style="margin-bottom:6px;">📖 Guía Académica, Normativas & FAQ · Transición K08 ➔ K23 (UTN FRBA)</div>
      <p style="font-size:13px;color:var(--muted);margin:0 0 12px;line-height:1.5;">
        Compendio interactivo oficial de Ingeniería en Sistemas de Información (Planes K23 y K08).
      </p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
        <button class="sub-tab guia-tab-btn active" data-seccion="todas" onclick="conmutarSeccionGuia('todas')">🌐 Ver Todo</button>
        <button class="sub-tab guia-tab-btn" data-seccion="plan" onclick="conmutarSeccionGuia('plan')">🎓 Plan K23 & ADUSI</button>
        <button class="sub-tab guia-tab-btn" data-seccion="transicion" onclick="conmutarSeccionGuia('transicion')">🔄 Transición K08 ➔ K23</button>
        <button class="sub-tab guia-tab-btn" data-seccion="electivas" onclick="conmutarSeccionGuia('electivas')">🧩 Electivas & Bloques</button>
        <button class="sub-tab guia-tab-btn" data-seccion="normativas" onclick="conmutarSeccionGuia('normativas')">📐 RTF, Peso & Sedes</button>
      </div>
      <input type="text" id="guiaBuscadorInput" class="guia-search-input" placeholder="🔍 Buscar materia, código, normativa, equivalencia o tema..." oninput="filtrarContenidoGuia(this.value)">
    </div>

    <!-- SECCIÓN PLAN K23 -->
    <div class="guia-seccion-bloque" id="guiaSec_plan">
      <div class="sec">🎓 Plan K23 · Titulaciones y Carga Horaria</div>
      <div class="guia-cards-grid">
        <div class="guia-card">
          <div class="guia-card-title">📜 Titulación Intermedia (ADUSI)</div>
          <div class="guia-card-desc"><strong>${infoPlan.titulaciones?.intermedio || 'Analista Desarrollador Universitario'}</strong>: Se obtiene al completar los niveles 1 a 3 y acreditar horas requeridas de software.</div>
        </div>
        <div class="guia-card">
          <div class="guia-card-title">⏱️ Duración y Carga Total</div>
          <div class="guia-card-desc">${infoPlan.duracion_anos || 5} Años · <strong>${infoPlan.carga_horaria_total_horas_reloj || 3992} hs reloj</strong> (${infoPlan.creditos_rtf_totales || 300} créditos RTF totales).</div>
        </div>
      </div>
    </div>

    <!-- SECCIÓN TRANSICIÓN K08 -> K23 -->
    <div class="guia-seccion-bloque" id="guiaSec_transicion">
      <div class="sec">🔄 Transición Curricular y Tabla Oficial de Equivalencias (Ord. 1878)</div>
      <div class="infobox" style="margin-bottom:12px;">
        <strong>Ordenanza 1878 y Res. 3120/22 FRBA:</strong> Define la homologación directa de materias aprobadas en Plan 2008 al Plan 2023. Las asignaturas con código histórico K08 se reflejan con su antecedente académico.
      </div>
      <div id="contenedorTablaEquivGuia">${window.renderizarTablaEquivalenciasHtml ? window.renderizarTablaEquivalenciasHtml(equivOficial) : ''}</div>
      <div class="notebox" style="margin-top:12px;">
        <strong>Química y Sistemas de Representación (144 hs Electivas):</strong> ${obsoletas.regla_de_equivalencia_y_transicion || 'Ambas materias acreditan horas en el Bloque Combinado de 3º/4º.'}
      </div>
      <div class="sec" style="margin-top:16px;">📅 Cronograma de Despliegue de Transición</div>
      ${window.renderizarCronogramaTransicionHtml ? window.renderizarCronogramaTransicionHtml(transicion.cronograma_despliegue) : ''}
    </div>

    <!-- SECCIÓN ELECTIVAS -->
    <div class="guia-seccion-bloque" id="guiaSec_electivas">
      <div class="sec">🧩 Régimen de Asignaturas Electivas K23</div>
      <div class="guia-cards-grid">
        <div class="guia-card">
          <div class="guia-card-title">Bloque 3.º y 4.º Nivel (240 hs Reloj)</div>
          <div class="guia-card-desc">Libertad total de cursada en tramo medio sin fiscalización año por año. Con Química y Sist. Representación acreditás 144 hs (60%).</div>
        </div>
        <div class="guia-card">
          <div class="guia-card-title">Bloque 5.º Nivel (240 hs Reloj)</div>
          <div class="guia-card-desc">Especialización tecnológica avanzada (IA Generativa, Ciberseguridad, Big Data, Cloud). No se compensa con básicas.</div>
        </div>
      </div>
      <div class="sec" style="margin-top:14px;">📚 Catálogo Institucional de Asignaturas Electivas</div>
      <div id="contenedorElectivasGuia">${window.renderizarCatalogoElectivasHtml ? window.renderizarCatalogoElectivasHtml(electivas) : ''}</div>
    </div>

    <!-- SECCIÓN NORMATIVAS, PESO Y SEDES -->
    <div class="guia-seccion-bloque" id="guiaSec_normativas">
      <div class="sec">📐 Normativa de RTF, Peso Académico y Sedes</div>
      <div class="guia-cards-grid">
        <div class="guia-card">
          <div class="guia-card-title">🎯 Sistema RTF (${rtf.total_rtf_carrera || 300} Créditos)</div>
          <div class="guia-card-desc">${rtf.descripcion || 'Unidad de medida del esfuerzo académico.'} • 60 RTF requeridos por cada nivel.</div>
        </div>
        <div class="guia-card">
          <div class="guia-card-title">🚀 Optimización de Peso Académico</div>
          <div class="guia-card-desc">${peso.concepto || 'Prioriza el turno de inscripción.'} Fórmulas 2026 y 2027 integradas en la pestaña de Peso.</div>
        </div>
      </div>
      <div class="guia-conversor-box" style="margin-top:14px;">
        <div style="font-weight:700;font-size:13px;margin-bottom:8px;color:var(--text);">⏱️ Conversor Oficial: Horas Cátedra (45m) ↔ Horas Reloj (60m)</div>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
          <input type="number" id="inputHorasCatedra" class="form-input" style="width:140px;" placeholder="Horas Cátedra" value="5" oninput="convertirHorasCatedra(this.value)">
          <span style="font-size:14px;color:var(--muted);">horas cátedra equivalen a</span>
          <strong id="resultadoHorasReloj" style="color:var(--green);font-size:15px;">3.75 hs reloj</strong>
        </div>
      </div>
      <div class="sec" style="margin-top:16px;">🏛️ Sedes de Cursada</div>
      <div class="guia-cards-grid" id="guiaGridSedes">
        <div class="guia-card">
          <span class="guia-sede-badge">Sede Campus</span>
          <div class="guia-card-title">Campus Mozorelos</div>
          <div style="font-size:11.5px;color:var(--blue);margin-bottom:6px;">📍 ${sedes.CAMPUS?.direccion || 'Mozart 2300, CABA'}</div>
          <div class="guia-card-desc">${sedes.CAMPUS?.caracteristicas || 'Ciencias básicas, laboratorios y física.'}</div>
        </div>
        <div class="guia-card">
          <span class="guia-sede-badge">Sede Medrano</span>
          <div class="guia-card-title">Medrano (Sede Central)</div>
          <div style="font-size:11.5px;color:var(--blue);margin-bottom:6px;">📍 ${sedes.MEDRANO?.direccion || 'Av. Medrano 951, CABA'}</div>
          <div class="guia-card-desc">${sedes.MEDRANO?.caracteristicas || 'Niveles superiores y departamento DISI.'}</div>
        </div>
      </div>
    </div>
  `);
}

function convertirHorasCatedra(val) {
  const horas = parseFloat(val) || 0;
  const reloj = horas * 0.75;
  const res = document.getElementById('resultadoHorasReloj');
  if (res) res.textContent = `${reloj.toFixed(2)} hs reloj (${(reloj * 60).toFixed(0)} minutos)`;
}

function actualizarContenedorHtml(elemento, htmlString) {
  elemento.replaceChildren();
  const doc = new DOMParser().parseFromString(htmlString, 'text/html');
  while (doc.body.firstChild) {
    elemento.appendChild(doc.body.firstChild);
  }
}

function filtrarContenidoGuia(termino) {
  const q = (termino || '').toLowerCase().trim();
  document.querySelectorAll('#sp4 .guia-card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(q) ? 'block' : 'none';
  });
  if (datosGuiaCache) {
    const contEquiv = document.getElementById('contenedorTablaEquivGuia');
    if (contEquiv && window.renderizarTablaEquivalenciasHtml) {
      actualizarContenedorHtml(contEquiv, window.renderizarTablaEquivalenciasHtml(datosGuiaCache.plan?.tabla_equivalencias_oficial_ord_1878 || [], q));
    }
    const contElec = document.getElementById('contenedorElectivasGuia');
    if (contElec && window.renderizarCatalogoElectivasHtml) {
      actualizarContenedorHtml(contElec, window.renderizarCatalogoElectivasHtml(datosGuiaCache.plan?.materias_electivas || [], q));
    }
  }
}

window.renderizarGuiaAcademica = renderizarGuiaAcademica;
window.conmutarSeccionGuia = conmutarSeccionGuia;
window.convertirHorasCatedra = convertirHorasCatedra;
window.filtrarContenidoGuia = filtrarContenidoGuia;
