/**
 * Módulo Controlador del Modal de Importación de SIU Guaraní
 * Permite pegar texto plano copiado de Historia Académica y aplicarlo al dashboard.
 */

let datosParseadosPendientesSIU = null;

function abrirModalImportadorSIU() {
  const modal = document.getElementById('modalImportadorSIU');
  if (!modal) return;
  const txtArea = document.getElementById('textoHistoriaSIU');
  const preview = document.getElementById('previewImportacionSIU');
  const btnAplicar = document.getElementById('btnAplicarImportacionSIU');
  if (txtArea) txtArea.value = '';
  if (preview) { preview.replaceChildren(); preview.style.display = 'none'; }
  if (btnAplicar) btnAplicar.style.display = 'none';
  datosParseadosPendientesSIU = null;
  modal.classList.add('open');
}

function cerrarModalImportadorSIU() {
  const modal = document.getElementById('modalImportadorSIU');
  if (modal) modal.classList.remove('open');
  datosParseadosPendientesSIU = null;
}

function procesarTextoSIUModal() {
  const txtArea = document.getElementById('textoHistoriaSIU');
  const preview = document.getElementById('previewImportacionSIU');
  const btnAplicar = document.getElementById('btnAplicarImportacionSIU');
  if (!txtArea || !preview) return;

  const texto = txtArea.value.trim();
  if (!texto) { alert('Por favor pegá el texto copiado de la Historia Académica del SIU.'); return; }

  const res = (typeof parsearHistoriaAcademicaSIU === 'function')
    ? parsearHistoriaAcademicaSIU(texto)
    : { materiasAprobadas: [], materiasEnCurso: [] };

  datosParseadosPendientesSIU = res;
  const cantAprob = res.materiasAprobadas.length;
  const cantEnCurso = res.materiasEnCurso.length;
  let cantFinales = 0;
  [...res.materiasAprobadas, ...res.materiasEnCurso].forEach(m => { cantFinales += (m.finales || []).length; });

  if (cantAprob === 0 && cantEnCurso === 0) {
    preview.style.display = 'block';
    preview.replaceChildren();
    preview.insertAdjacentHTML('beforeend', `
      <div style="color:var(--accent);font-size:12px;padding:8px;background:rgba(244,63,94,.1);border-radius:6px;border:1px solid rgba(244,63,94,.3);">
        ⚠️ No se pudieron detectar materias válidas en el texto ingresado. Verificá que el formato incluya nombres de materia seguidos del código entre paréntesis, ej: <em>Álgebra y Geometría Analítica (950701)</em>.
      </div>
    `);
    if (btnAplicar) btnAplicar.style.display = 'none';
    return;
  }

  preview.style.display = 'block';
  preview.replaceChildren();
  preview.insertAdjacentHTML('beforeend', `
    <div style="background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-top:10px;font-size:12px;">
      <div style="font-weight:700;color:var(--blue);margin-bottom:6px;">📊 Resumen de Datos Detectados:</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
        <span class="acc-badge ab-promo" style="font-size:11px;">${cantAprob} Aprobadas / Homologadas</span>
        <span class="acc-badge ab-plan" style="font-size:11px;">${cantEnCurso} En Curso / Firmadas</span>
        <span class="acc-badge ab-pend" style="font-size:11px;color:var(--blue);border-color:var(--border);">${cantFinales} Llamados a Final</span>
      </div>
      <div style="max-height:160px;overflow-y:auto;border:1px solid var(--border);border-radius:6px;background:var(--s1);padding:6px;">
        ${res.materiasAprobadas.map(m => `
          <div style="font-size:11px;padding:3px 4px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;">
            <span>🟢 <strong>${m.nombre}</strong> (${m.codigoSIU})</span>
            <span style="color:var(--green);font-weight:600;">${m.nota ? 'Nota: ' + m.nota : 'EQ'} · ${m.modalidad || m.estado}</span>
          </div>
        `).join('')}
        ${res.materiasEnCurso.map(m => `
          <div style="font-size:11px;padding:3px 4px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;">
            <span>🔵 <strong>${m.nombre}</strong> (${m.codigoSIU})</span>
            <span style="color:var(--blue);font-weight:600;">${m.estado === 'firmada' ? '✍️ Firmada' : '⏳ En curso'}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `);

  if (btnAplicar) btnAplicar.style.display = 'inline-block';
}

function aplicarImportacionSIU() {
  if (!datosParseadosPendientesSIU || !window.datosGlobales?.datosAlumno) return;
  const alumno = window.datosGlobales.datosAlumno;

  // Actualiza o fusiona las materias del alumno
  alumno.materiasAprobadas = datosParseadosPendientesSIU.materiasAprobadas;
  alumno.materiasEnCurso = datosParseadosPendientesSIU.materiasEnCurso;

  if (typeof guardarDatosAlumnoEnStorage === 'function') guardarDatosAlumnoEnStorage();
  cerrarModalImportadorSIU();
  if (typeof renderizarTodoElDashboard === 'function') renderizarTodoElDashboard();
  alert('🎉 ¡Historia académica del SIU Guaraní importada exitosamente!');
}
