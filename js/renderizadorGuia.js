/**
 * Módulo Renderizador de la Guía Académica y Normativa Institucional (Super Panel 4)
 * Consume data/info.json y expone buscador dinámico, sedes, RTF y conversor de horas.
 */

let infoInstitucionalCache = null;

/** Carga los datos de info.json si aún no están en memoria. */
async function obtenerInfoInstitucional() {
  if (infoInstitucionalCache) return infoInstitucionalCache;
  try {
    const respuesta = await fetch('data/info.json');
    infoInstitucionalCache = await respuesta.json();
    return infoInstitucionalCache;
  } catch (e) {
    console.warn('No se pudo cargar data/info.json:', e);
    return null;
  }
}

/** Renderiza la sección completa de la Guía Académica en #sp4. */
async function renderizarGuiaAcademica() {
  const contenedor = document.getElementById('sp4');
  if (!contenedor) return;

  const info = await obtenerInfoInstitucional();
  const sedes = info?.normativas_y_calculos?.sedes || {};
  const rtf = info?.normativas_y_calculos?.sistema_rtf || {};
  const peso = info?.normativas_y_calculos?.peso_academico || {};

  contenedor.replaceChildren();
  contenedor.insertAdjacentHTML('beforeend', `
    <div class="guia-header-box">
      <div class="sec" style="margin-bottom:6px;">📖 Guía Académica, Normativas & FAQ · UTN FRBA</div>
      <p style="font-size:13px;color:var(--muted);margin:0;line-height:1.5;">
        Información institucional oficial de Ingeniería en Sistemas de Información (Planes K23 y K08).
      </p>
      <input type="text" id="guiaBuscadorInput" class="guia-search-input" placeholder="🔍 Buscar normativa, sede, RTF, correlativa o tema de cursada..." oninput="filtrarContenidoGuia(this.value)">
    </div>

    <!-- SEDES INSTITUCIONALES -->
    <div class="sec">🏛️ Sedes de Cursada</div>
    <div class="guia-cards-grid" id="guiaGridSedes">
      <div class="guia-card">
        <span class="guia-sede-badge">Sede Campus</span>
        <div class="guia-card-title">Campus Mozorelos</div>
        <div style="font-size:11.5px;color:var(--blue);margin-bottom:6px;">📍 ${sedes.CAMPUS?.direccion || 'Mozart 2300, CABA'}</div>
        <div class="guia-card-desc">${sedes.CAMPUS?.caracteristicas || 'Cursos de ciencias básicas, laboratorios centrales y física.'}</div>
      </div>
      <div class="guia-card">
        <span class="guia-sede-badge">Sede Medrano</span>
        <div class="guia-card-title">Medrano (Sede Central)</div>
        <div style="font-size:11.5px;color:var(--blue);margin-bottom:6px;">📍 ${sedes.MEDRANO?.direccion || 'Av. Medrano 951, CABA'}</div>
        <div class="guia-card-desc">${sedes.MEDRANO?.caracteristicas || 'Materias de niveles superiores, DISI y administración.'}</div>
      </div>
    </div>

    <!-- SISTEMA RTF Y PESO ACADÉMICO -->
    <div class="sec">📐 Normativa Académica y Cálculos</div>
    <div class="guia-cards-grid">
      <div class="guia-card">
        <div class="guia-card-title">🎯 Sistema RTF (${rtf.total_rtf_carrera || 300} Créditos)</div>
        <div class="guia-card-desc">${rtf.descripcion || 'Unidad de medida del esfuerzo académico centrada en el trabajo total del estudiante.'}</div>
        <div style="font-size:11.5px;color:var(--green);margin-top:8px;font-weight:600;">• 60 RTF requeridos por cada nivel de la carrera.</div>
      </div>
      <div class="guia-card">
        <div class="guia-card-title">🚀 Optimización de Peso Académico</div>
        <div class="guia-card-desc">${peso.concepto || 'Prioriza el turno de inscripción a materias.'}</div>
        <ul style="font-size:11.5px;color:var(--muted);padding-left:16px;margin:8px 0 0;">
          ${(peso.recomendaciones_optimizacion || ['Evitar aplazos en finales', 'Aprobar correlativas críticas']).map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
    </div>

    <!-- CONVERSOR HORAS CÁTEDRA A RELOJ -->
    <div class="guia-conversor-box">
      <div style="font-weight:700;font-size:13px;margin-bottom:8px;color:var(--text);">⏱️ Conversor Oficial: Horas Cátedra (45m) ↔ Horas Reloj (60m)</div>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
        <input type="number" id="inputHorasCatedra" class="form-input" style="width:140px;" placeholder="Horas Cátedra" value="5" oninput="convertirHorasCatedra(this.value)">
        <span style="font-size:14px;color:var(--muted);">horas cátedra equivalen a</span>
        <strong id="resultadoHorasReloj" style="color:var(--green);font-size:15px;">3.75 hs reloj</strong>
      </div>
    </div>
  `);
}

/** Convierte horas cátedra a horas reloj en vivo. */
function convertirHorasCatedra(val) {
  const horas = parseFloat(val) || 0;
  const reloj = horas * 0.75;
  const res = document.getElementById('resultadoHorasReloj');
  if (res) res.textContent = `${reloj.toFixed(2)} hs reloj (${(reloj * 60).toFixed(0)} minutos)`;
}

/** Filtra las tarjetas de la guía académica según el término de búsqueda. */
function filtrarContenidoGuia(termino) {
  const q = (termino || '').toLowerCase().trim();
  document.querySelectorAll('#sp4 .guia-card').forEach(card => {
    const texto = card.textContent.toLowerCase();
    card.style.display = texto.includes(q) ? 'block' : 'none';
  });
}
