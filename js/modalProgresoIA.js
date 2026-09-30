/**
 * Modal de Progreso Interactivo para Operaciones de IA
 * Proporciona feedback visual en tiempo real de etapas, porcentaje y modelos.
 */

function asegurarModalProgresoEnDOM() {
  if (document.getElementById('modalProgresoIa')) return;

  const modalHtml = `
    <div id="modalProgresoIa" class="modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); z-index:9999; align-items:center; justify-content:center;">
      <div class="modal-card" style="background:#1C1C1E; border:1px solid #3A3A3C; border-radius:16px; width:92%; max-width:480px; padding:24px; box-shadow:0 20px 40px rgba(0,0,0,0.5); color:#F5F5F7;">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <div style="width:36px; height:36px; border-radius:50%; background:rgba(10,132,255,0.15); display:flex; align-items:center; justify-content:center; color:#0A84FF; font-size:18px;">
            🤖
          </div>
          <div>
            <h3 id="tituloProgresoIa" style="margin:0; font-size:1.15rem; font-weight:600; color:#FFFFFF;">Procesando con IA</h3>
            <p id="textoPasoIa" style="margin:4px 0 0 0; font-size:0.85rem; color:#8E8E93;">Iniciando consulta...</p>
          </div>
        </div>

        <div style="background:#2C2C2E; border-radius:8px; height:10px; width:100%; overflow:hidden; margin:18px 0 8px 0; border:1px solid #3A3A3C;">
          <div id="barraProgresoIa" style="background:linear-gradient(90deg, #0A84FF, #5E5CE6); height:100%; width:0%; transition:width 0.3s cubic-bezier(0.4, 0, 0.2, 1);"></div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:#A1A1A6; margin-bottom:14px;">
          <span id="detalleProgresoIa">Conectando con Google Gemini...</span>
          <span id="porcentajeProgresoIa" style="font-weight:600; color:#0A84FF;">0%</span>
        </div>

        <div id="contenedorEtapasIa" style="background:#252528; border-radius:10px; padding:12px; font-size:0.8rem; border:1px solid #323236; display:flex; flex-direction:column; gap:6px;">
          <div id="etapa1Ia" style="color:#636366;">⚪ Lectura de información académica</div>
          <div id="etapa2Ia" style="color:#636366;">⚪ Consulta con modelos Gemini (3.8 / 3.7 / 3.6)</div>
          <div id="etapa3Ia" style="color:#636366;">⚪ Validación de restricciones y correlatividades</div>
          <div id="etapa4Ia" style="color:#636366;">⚪ Construcción de estrategia y materias sugeridas</div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function abrirModalProgresoIA(titulo = 'Procesando con IA...') {
  asegurarModalProgresoEnDOM();
  const modal = document.getElementById('modalProgresoIa');
  const tit = document.getElementById('tituloProgresoIa');
  if (tit) tit.textContent = titulo;
  actualizarProgresoIA(5, 'Iniciando conexión...', 'Preparando datos para la IA');
  if (modal) modal.style.display = 'flex';
}

function actualizarProgresoIA(porcentaje, textoPaso = '', detalle = '') {
  asegurarModalProgresoEnDOM();
  const barra = document.getElementById('barraProgresoIa');
  const txtPaso = document.getElementById('textoPasoIa');
  const txtDetalle = document.getElementById('detalleProgresoIa');
  const txtPorc = document.getElementById('porcentajeProgresoIa');

  const pClamped = Math.min(100, Math.max(0, Math.round(porcentaje)));

  if (barra) barra.style.width = `${pClamped}%`;
  if (txtPorc) txtPorc.textContent = `${pClamped}%`;
  if (textoPaso && txtPaso) txtPaso.textContent = textoPaso;
  if (detalle && txtDetalle) txtDetalle.textContent = detalle;

  actualizarIndicadoresEtapa(pClamped);
}

function actualizarIndicadoresEtapa(porcentaje) {
  const etapas = [
    { id: 'etapa1Ia', umbral: 20, txt: 'Lectura de información académica' },
    { id: 'etapa2Ia', umbral: 55, txt: 'Consulta con modelos Gemini (3.8 / 3.7 / 3.6)' },
    { id: 'etapa3Ia', umbral: 80, txt: 'Validación de restricciones y correlatividades' },
    { id: 'etapa4Ia', umbral: 100, txt: 'Construcción de resultados finales' }
  ];

  etapas.forEach((e) => {
    const el = document.getElementById(e.id);
    if (!el) return;
    el.replaceChildren();

    const spanIcono = document.createElement('span');
    const spanTexto = document.createElement('span');

    if (porcentaje >= e.umbral) {
      spanIcono.textContent = '🟢 ';
      spanTexto.textContent = e.txt;
      spanTexto.style.color = '#34C759';
      spanTexto.style.fontWeight = '500';
    } else if (porcentaje >= e.umbral - 20) {
      spanIcono.textContent = '🟡 ';
      spanTexto.textContent = `${e.txt}...`;
      spanTexto.style.color = '#FFD60A';
      spanTexto.style.fontWeight = '500';
    } else {
      spanIcono.textContent = '⚪ ';
      spanTexto.textContent = e.txt;
      spanTexto.style.color = '#636366';
    }

    el.appendChild(spanIcono);
    el.appendChild(spanTexto);
  });
}

function cerrarModalProgresoIA() {
  const modal = document.getElementById('modalProgresoIa');
  if (modal) {
    modal.style.display = 'none';
  }
}

window.abrirModalProgresoIA = abrirModalProgresoIA;
window.actualizarProgresoIA = actualizarProgresoIA;
window.cerrarModalProgresoIA = cerrarModalProgresoIA;
