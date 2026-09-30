/**
 * Modal de Carga de Horarios y Procesamiento Inteligente con Gemini & Firestore
 * Permite subir el PDF oficial de cursada, consultar la oferta comunitaria y configurar la API Key.
 */

function abrirModalCargaHorarios() {
  let modal = document.getElementById('modalCargaHorarios');
  if (!modal) {
    crearEstructuraModalHorarios();
    modal = document.getElementById('modalCargaHorarios');
  }
  modal.classList.add('active');
  verificarOfertaComunitaria();
}

function cerrarModalCargaHorarios() {
  const modal = document.getElementById('modalCargaHorarios');
  if (modal) modal.classList.remove('active');
}

function crearEstructuraModalHorarios() {
  const html = `
    <div class="modal-overlay" id="modalCargaHorarios">
      <div class="modal-card" style="max-width:580px;">
        <div class="modal-header">
          <div class="modal-title">🤖 Cargar Horarios de Cursada con IA (Gemini)</div>
          <button class="modal-close" onclick="cerrarModalCargaHorarios()">&times;</button>
        </div>
        <div class="modal-body" style="font-size:13px;line-height:1.5;">
          <!-- Aviso de oferta compartida en Firestore -->
          <div id="avisoOfertaFirestore" style="display:none;background:rgba(59,130,246,0.12);border:1px solid #3b82f6;padding:10px 14px;border-radius:8px;margin-bottom:14px;">
            <div style="font-weight:600;color:#60a5fa;" id="txtTituloOferta">✨ Oferta Horaria 2026 Disponible</div>
            <div style="font-size:12px;margin:4px 0 8px;" id="txtDetalleOferta">Cargada por la comunidad.</div>
            <button class="btn-prim" style="padding:6px 12px;font-size:12px;" onclick="aplicarOfertaFirestore()">⚡ Utilizar oferta disponible</button>
          </div>

          <!-- Configuración de API Key -->
          <div style="margin-bottom:12px;">
            <label style="display:block;font-weight:600;margin-bottom:4px;">Gemini API Key (Google AI Studio):</label>
            <input type="password" id="inputApiKeyGemini" class="modal-input" placeholder="Pega tu API Key de Gemini aquí" style="width:100%;box-sizing:border-box;" value="${window.obtenerApiKeyGemini ? window.obtenerApiKeyGemini() : ''}">
            <div style="font-size:11px;color:var(--text-sec);margin-top:2px;">Se almacena de forma segura en tu navegador (localStorage).</div>
          </div>

          <!-- Carga de Archivo PDF -->
          <div style="border:2px dashed var(--border-color);border-radius:8px;padding:20px;text-align:center;margin-bottom:12px;">
            <input type="file" id="archivoPdfHorarios" accept="application/pdf" style="display:none;" onchange="manejarArchivoPdfSeleccionado(this)">
            <button type="button" class="btn-sec" onclick="document.getElementById('archivoPdfHorarios').click()">📄 Seleccionar PDF de Horarios (Sistemas)</button>
            <div id="nombreArchivoPdf" style="font-size:12px;color:var(--text-sec);margin-top:6px;">Formatos admitidos: PDF oficial de horarios UTN</div>
          </div>

          <!-- Alerta de Turno o Estado -->
          <div id="estadoProcesamientoHorarios" style="font-size:12.5px;padding:8px;display:none;border-radius:6px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn-sec" onclick="cerrarModalCargaHorarios()">Cancelar</button>
          <button class="btn-prim" id="btnAnalizarPdfGemini" onclick="ejecutarAnalisisPdfGemini()" disabled>🚀 Analizar y Guardar en Nube</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

let pdfBase64Cargado = null;

function manejarArchivoPdfSeleccionado(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById('nombreArchivoPdf').textContent = `Archivo seleccionado: ${file.name} (${Math.round(file.size / 1024)} KB)`;
  const reader = new FileReader();
  reader.onload = function(e) {
    const arr = e.target.result.split(',');
    pdfBase64Cargado = arr.length > 1 ? arr[1] : arr[0];
    document.getElementById('btnAnalizarPdfGemini').disabled = false;
  };
  reader.readAsDataURL(file);
}

async function verificarOfertaComunitaria() {
  if (typeof window.consultarOfertaHorariosFirestore !== 'function') return;
  const res = await window.consultarOfertaHorariosFirestore();
  const aviso = document.getElementById('avisoOfertaFirestore');
  if (!aviso) return;
  if (res.existe) {
    aviso.style.display = 'block';
    document.getElementById('txtDetalleOferta').textContent = `Contiene ${res.totalComisiones} comisiones. Subida por ${res.subidoPor}.`;
    window.ofertaHorariosFirestoreCargada = res.comisiones;
  } else {
    aviso.style.display = 'none';
  }
}

async function aplicarOfertaFirestore() {
  if (!window.ofertaHorariosFirestoreCargada) return;
  guardarYProcesarOferta(window.ofertaHorariosFirestoreCargada);
  cerrarModalCargaHorarios();
}

async function ejecutarAnalisisPdfGemini() {
  const clave = document.getElementById('inputApiKeyGemini')?.value?.trim();
  if (clave && window.guardarApiKeyGemini) window.guardarApiKeyGemini(clave);

  const status = document.getElementById('estadoProcesamientoHorarios');
  status.style.display = 'block';
  status.style.background = 'rgba(59,130,246,0.1)';
  status.style.color = '#60a5fa';
  status.textContent = '⏳ Analizando PDF con Gemini 2.0 Flash... (Extrayendo materias y comisiones)';

  try {
    const comisiones = await window.analizarHorariosPdfConGemini(pdfBase64Cargado);
    status.textContent = `✅ ${comisiones.length} comisiones extraídas exitosamente. Guardando en Firestore...`;

    if (window.guardarOfertaHorariosFirestore) {
      await window.guardarOfertaHorariosFirestore(comisiones, window.datosGlobales?.datosAlumno?.nombre || 'Alumno UTN');
    }

    guardarYProcesarOferta(comisiones);
    status.style.background = 'rgba(16,185,129,0.1)';
    status.style.color = '#34d399';
    status.textContent = '🎉 Oferta guardada y alternativas generadas.';
    setTimeout(cerrarModalCargaHorarios, 1500);
  } catch (err) {
    status.style.background = 'rgba(239,68,68,0.1)';
    status.style.color = '#f87171';
    status.textContent = `❌ ${err.message}`;
  }
}

function guardarYProcesarOferta(comisiones) {
  localStorage.setItem('alumnosHorariosOferta_2026', JSON.stringify(comisiones));
  if (typeof window.actualizarPlanificadorConOferta === 'function') {
    window.actualizarPlanificadorConOferta(comisiones);
  }
}

window.abrirModalCargaHorarios = abrirModalCargaHorarios;
window.cerrarModalCargaHorarios = cerrarModalCargaHorarios;
window.manejarArchivoPdfSeleccionado = manejarArchivoPdfSeleccionado;
window.aplicarOfertaFirestore = aplicarOfertaFirestore;
window.ejecutarAnalisisPdfGemini = ejecutarAnalisisPdfGemini;
