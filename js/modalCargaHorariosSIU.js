/**
 * Modal de Carga de Horarios y Procesamiento Inteligente con Gemini & Firestore
 * Permite subir el PDF oficial de cursada y almacenarlo completo en Firestore / local.
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
          <div class="modal-title">🤖 Cargar Horarios de Cursada (PDF a la Nube)</div>
          <button class="modal-close" onclick="cerrarModalCargaHorarios()">&times;</button>
        </div>
        <div class="modal-body" style="font-size:13px;line-height:1.5;">
          <!-- Aviso de oferta compartida en Firestore -->
          <div id="avisoOfertaFirestore" style="display:none;background:rgba(59,130,246,0.12);border:1px solid #3b82f6;padding:10px 14px;border-radius:8px;margin-bottom:14px;">
            <div style="font-weight:600;color:#60a5fa;" id="txtTituloOferta">✨ Oferta Horaria 2026 Ya Disponible en la Nube</div>
            <div style="font-size:12px;margin:4px 0 8px;" id="txtDetalleOferta">Cargada por la comunidad.</div>
            <button class="btn-prim" style="padding:6px 12px;font-size:12px;" onclick="aplicarOfertaFirestore()">☁️ Descargar oferta comunitaria</button>
          </div>

          <!-- Carga de Archivo PDF -->
          <div style="border:2px dashed var(--border-color);border-radius:8px;padding:20px;text-align:center;margin-bottom:12px;">
            <input type="file" id="archivoPdfHorarios" accept="application/pdf" style="display:none;" onchange="manejarArchivoPdfSeleccionado(this)">
            <button type="button" class="btn-sec" onclick="document.getElementById('archivoPdfHorarios').click()">📄 Seleccionar PDF de Horarios (Sistemas)</button>
            <div id="nombreArchivoPdf" style="font-size:12px;color:var(--text-sec);margin-top:6px;">Formatos admitidos: PDF oficial de horarios UTN</div>
          </div>

          <div style="font-size:11.5px;color:var(--text-sec);margin-bottom:8px;">
            ℹ️ <strong>Nota:</strong> Este botón procesa el PDF con la IA y almacena la oferta horaria completa en la nube (Firestore) para que toda la comunidad pueda usarla. Luego podrás cruzarla con tus materias desde el botón <em>"⚡ Analizar horarios de cursada"</em>.
          </div>

          <!-- Alerta de Turno o Estado -->
          <div id="estadoProcesamientoHorarios" style="font-size:12.5px;padding:8px;display:none;border-radius:6px;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn-sec" onclick="cerrarModalCargaHorarios()">Cancelar</button>
          <button class="btn-prim" id="btnAnalizarPdfGemini" onclick="ejecutarAnalisisPdfGemini()" disabled>🚀 Procesar PDF y Guardar en Nube</button>
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
    document.getElementById('txtDetalleOferta').textContent = `Contiene ${res.totalComisiones} comisiones. Subida por ${res.subidoPor}. Ya no necesitas subir el PDF nuevamente.`;
    window.ofertaHorariosFirestoreCargada = res.comisiones;
  } else {
    aviso.style.display = 'none';
  }
}

async function aplicarOfertaFirestore() {
  if (!window.ofertaHorariosFirestoreCargada) return;
  localStorage.setItem('alumnosHorariosOferta_2026', JSON.stringify(window.ofertaHorariosFirestoreCargada));
  alert('✅ Oferta horaria comunitaria cargada en tu sesión. Ahora puedes presionar "⚡ Analizar horarios de cursada" para cruzarla con tus materias.');
  cerrarModalCargaHorarios();
}

async function ejecutarAnalisisPdfGemini() {
  const status = document.getElementById('estadoProcesamientoHorarios');
  status.style.display = 'block';
  status.style.background = 'rgba(59,130,246,0.1)';
  status.style.color = '#60a5fa';
  status.textContent = '⏳ Procesando PDF con Gemini... (Extrayendo oferta de comisiones)';

  try {
    const comisiones = await window.analizarHorariosPdfConGemini(pdfBase64Cargado);
    status.textContent = `✅ ${comisiones.length} comisiones extraídas. Guardando en Firestore...`;

    if (window.guardarOfertaHorariosFirestore) {
      await window.guardarOfertaHorariosFirestore(comisiones, window.datosGlobales?.datosAlumno?.nombre || 'Alumno UTN');
    }

    localStorage.setItem('alumnosHorariosOferta_2026', JSON.stringify(comisiones));
    status.style.background = 'rgba(16,185,129,0.1)';
    status.style.color = '#34d399';
    status.textContent = '🎉 Horarios guardados en la nube exitosamente. Utiliza "⚡ Analizar horarios de cursada" para armar tus alternativas.';
    setTimeout(cerrarModalCargaHorarios, 2000);
  } catch (err) {
    status.style.background = 'rgba(239,68,68,0.1)';
    status.style.color = '#f87171';
    status.textContent = `❌ ${err.message}`;
  }
}

window.abrirModalCargaHorarios = abrirModalCargaHorarios;
window.cerrarModalCargaHorarios = cerrarModalCargaHorarios;
window.manejarArchivoPdfSeleccionado = manejarArchivoPdfSeleccionado;
window.aplicarOfertaFirestore = aplicarOfertaFirestore;
window.ejecutarAnalisisPdfGemini = ejecutarAnalisisPdfGemini;
