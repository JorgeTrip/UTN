/**
 * Módulo Gestor de Evaluaciones de Cursada (Parciales con 2 Recuperatorios y TPs)
 * Renderiza los controles de parciales (def: 2) con Nota Original, 1er Recup, 2do Recup y TPs (def: 0),
 * aplicando el algoritmo UTN y esperando la totalidad de parciales requeridos antes de clasificar la cursada.
 */

/** Renderiza el formulario de configuración de parciales y TPs para la materia en edición. */
function renderizarSeccionEvaluacionesModal(materiaObj) {
  const contenedor = document.getElementById('seccionEvaluacionesModal');
  if (!contenedor) return;

  const config = materiaObj.configuracionEvaluacion || { cantidadParciales: 2, cantidadTPs: 0 };
  const evalData = materiaObj.evaluaciones || { parciales: [], tps: [] };
  const cantParciales = config.cantidadParciales !== undefined ? config.cantidadParciales : 2;
  const cantTPs = config.cantidadTPs !== undefined ? config.cantidadTPs : 0;

  contenedor.replaceChildren();
  contenedor.insertAdjacentHTML('beforeend', `
    <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);">
      <div style="font-weight:600;font-size:13px;color:var(--blue);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
        📝 Evaluación de Cursada (Parciales con 2 Recuperatorios y TPs)
      </div>
      <div class="form-grid" style="grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
        <div class="form-group">
          <label class="form-label">Cant. Parciales (por defecto 2)</label>
          <input type="number" min="1" max="6" id="evalCantParciales" class="form-input" value="${cantParciales}" onchange="reconstruirCamposEvaluacionModal()">
        </div>
        <div class="form-group">
          <label class="form-label">Cant. TPs Evaluativos (por defecto 0)</label>
          <input type="number" min="0" max="6" id="evalCantTPs" class="form-input" value="${cantTPs}" onchange="reconstruirCamposEvaluacionModal()">
        </div>
      </div>
      <div id="gridCamposEvaluacion" style="display:flex;flex-direction:column;gap:8px;"></div>
      <div id="boxResultadoCursadaCalculada" style="margin-top:12px;padding:10px;border-radius:6px;font-size:12px;background:var(--s1);border:1px solid var(--border);"></div>
    </div>
  `);
  reconstruirCamposEvaluacionModal(evalData);
}

/** Reconstruye dinámicamente los campos de entrada de notas según la cantidad de instancias. */
function reconstruirCamposEvaluacionModal(evalDataPrevias) {
  const grid = document.getElementById('gridCamposEvaluacion');
  if (!grid) return;
  const nParciales = Math.max(1, parseInt(document.getElementById('evalCantParciales').value, 10) || 2);
  const nTPs = Math.max(0, parseInt(document.getElementById('evalCantTPs').value, 10) || 0);
  const parcialesPrev = evalDataPrevias?.parciales || [];
  const tpsPrev = evalDataPrevias?.tps || [];
  let html = '';

  for (let i = 0; i < nParciales; i++) {
    const pObj = parcialesPrev[i] || {};
    const vOrig = pObj.original !== undefined && pObj.original !== null ? pObj.original : (pObj.nota !== undefined && pObj.nota !== null ? pObj.nota : '');
    const vRec1 = pObj.recup1 !== undefined && pObj.recup1 !== null ? pObj.recup1 : '';
    const vRec2 = pObj.recup2 !== undefined && pObj.recup2 !== null ? pObj.recup2 : '';

    html += `
      <div style="background:var(--s2);padding:10px;border-radius:8px;border:1px solid var(--border);margin-bottom:6px;">
        <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--blue);">📌 Parcial ${i + 1}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
          <div class="form-group"><label class="form-label" style="font-size:10px;">Original</label><input type="number" min="1" max="10" class="form-input input-p-orig" data-pidx="${i}" value="${vOrig}" placeholder="Nota" oninput="actualizarEvaluacionesModal()"></div>
          <div class="form-group"><label class="form-label" style="font-size:10px;">1er Recup</label><input type="number" min="1" max="10" class="form-input input-p-rec1" data-pidx="${i}" value="${vRec1}" placeholder="Recup 1" oninput="actualizarEvaluacionesModal()"></div>
          <div class="form-group"><label class="form-label" style="font-size:10px;">2do Recup</label><input type="number" min="1" max="10" class="form-input input-p-rec2" data-pidx="${i}" value="${vRec2}" placeholder="Recup 2" oninput="actualizarEvaluacionesModal()"></div>
        </div>
      </div>
    `;
  }

  if (nTPs > 0) {
    html += '<div style="margin-top:4px;font-size:12px;font-weight:600;color:var(--blue);margin-bottom:6px;">💻 Trabajos Prácticos Evaluativos</div>';
    for (let j = 0; j < nTPs; j++) {
      const tpObj = tpsPrev[j] || {};
      const vTp = (tpObj.nota !== undefined && tpObj.nota !== null) ? tpObj.nota : (typeof tpObj === 'number' ? tpObj : '');
      html += `
        <div style="display:flex;align-items:center;justify-content:space-between;background:var(--s2);padding:8px 12px;border-radius:6px;border:1px solid var(--border);margin-bottom:4px;">
          <span style="font-size:11.5px;font-weight:600;">TP ${j + 1}</span>
          <input type="number" min="1" max="10" class="form-input input-tp-nota" data-tpidx="${j}" value="${vTp}" placeholder="Nota TP" style="width:90px;padding:4px 8px;font-size:12px;" oninput="actualizarEvaluacionesModal()">
        </div>
      `;
    }
  }
  grid.replaceChildren();
  grid.insertAdjacentHTML('beforeend', html);
  actualizarEvaluacionesModal();
}

/** Recalcula en vivo la condición académica proyectada y actualiza el cuadro de resultado. */
function actualizarEvaluacionesModal() {
  const box = document.getElementById('boxResultadoCursadaCalculada');
  if (!box) return;
  const nParciales = Math.max(1, parseInt(document.getElementById('evalCantParciales')?.value, 10) || 2);
  const parcialesEstructurados = [];

  for (let i = 0; i < nParciales; i++) {
    const origInp = document.querySelector(`.input-p-orig[data-pidx="${i}"]`);
    const rec1Inp = document.querySelector(`.input-p-rec1[data-pidx="${i}"]`);
    const rec2Inp = document.querySelector(`.input-p-rec2[data-pidx="${i}"]`);
    const orig = origInp && origInp.value.trim() !== '' ? Number(origInp.value) : null;
    const recup1 = rec1Inp && rec1Inp.value.trim() !== '' ? Number(rec1Inp.value) : null;
    const recup2 = rec2Inp && rec2Inp.value.trim() !== '' ? Number(rec2Inp.value) : null;
    parcialesEstructurados.push({ original: orig, recup1, recup2 });
  }

  const tpsInputs = document.querySelectorAll('.input-tp-nota');
  const tpsNotas = Array.from(tpsInputs).map(inp => inp.value.trim() !== '' ? Number(inp.value) : null);
  const res = (typeof calcularCondicionCursadaCompleta === 'function')
    ? calcularCondicionCursadaCompleta(parcialesEstructurados, tpsNotas, nParciales)
    : { condicionTexto: 'En evaluación' };

  let color = 'var(--blue)', bg = 'rgba(56,189,248,.08)';
  if (res.promociona) { color = 'var(--green)'; bg = 'rgba(34,211,164,.1)'; }
  else if (res.estado === 'firmada') { color = 'var(--yellow)'; bg = 'rgba(250,204,21,.1)'; }
  else if (res.recursa) { color = 'var(--accent)'; bg = 'rgba(244,63,94,.1)'; }

  box.style.borderColor = color;
  box.style.background = bg;
  box.replaceChildren();
  box.insertAdjacentHTML('beforeend', `<strong style="color:${color}">Resultado Algoritmo:</strong> ${res.condicionTexto}`);

  const selectEst = document.getElementById('selectEstadoMateria');
  const selectMod = document.getElementById('selectModalidadMateria');
  const inputNota = document.getElementById('inputNotaMateria');

  if (res.promociona && res.promedioParciales !== null) {
    if (selectEst && selectEst.value !== 'aprobada' && selectEst.value !== 'equivalencia') selectEst.value = 'aprobada';
    if (selectMod && selectMod.value !== 'promocion') selectMod.value = 'promocion';
    if (inputNota && inputNota.value === '') inputNota.value = Math.round(res.promedioParciales);
  } else if (res.estado === 'firmada') {
    if (selectEst) selectEst.value = 'firmada';
    if (selectMod) selectMod.value = 'final';
  } else if (res.estado === 'en_curso') {
    if (selectEst && selectEst.value !== 'aprobada' && selectEst.value !== 'equivalencia' && selectEst.value !== 'firmada') {
      selectEst.value = 'en_curso';
    }
  } else if (res.recursa) {
    if (selectEst) selectEst.value = 'pendiente';
  }
}

/** Recolecta el estado final de las evaluaciones cargadas para su almacenamiento. */
function obtenerEvaluacionesModalData() {
  const nParciales = Math.max(1, parseInt(document.getElementById('evalCantParciales')?.value, 10) || 2);
  const nTPs = Math.max(0, parseInt(document.getElementById('evalCantTPs')?.value, 10) || 0);
  const parciales = [];

  for (let i = 0; i < nParciales; i++) {
    const origInp = document.querySelector(`.input-p-orig[data-pidx="${i}"]`);
    const rec1Inp = document.querySelector(`.input-p-rec1[data-pidx="${i}"]`);
    const rec2Inp = document.querySelector(`.input-p-rec2[data-pidx="${i}"]`);
    const orig = origInp && origInp.value.trim() !== '' ? Number(origInp.value) : null;
    const recup1 = rec1Inp && rec1Inp.value.trim() !== '' ? Number(rec1Inp.value) : null;
    const recup2 = rec2Inp && rec2Inp.value.trim() !== '' ? Number(rec2Inp.value) : null;
    let notaFinalCalculada = recup2 !== null ? recup2 : (recup1 !== null ? recup1 : orig);

    parciales.push({
      instancia: `${i + 1}er Parcial`,
      original: orig, recup1, recup2, nota: notaFinalCalculada
    });
  }

  const tpsInputs = document.querySelectorAll('.input-tp-nota');
  const tps = Array.from(tpsInputs).map((inp, j) => ({
    instancia: `TP ${j + 1}`,
    nota: inp.value.trim() !== '' ? Number(inp.value) : null
  }));

  return {
    configuracionEvaluacion: { cantidadParciales: nParciales, cantidadTPs: nTPs },
    evaluaciones: { parciales, tps }
  };
}
