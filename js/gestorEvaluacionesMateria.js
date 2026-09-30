/**
 * Módulo Gestor de Evaluaciones de Cursada (Parciales y Trabajos Prácticos)
 * Maneja esquemas de cátedra con N parciales (hasta 2 recups) y M TPs (con reentrega).
 */

function renderizarSeccionEvaluacionesModal(materiaObj) {
  const contenedor = document.getElementById('seccionEvaluacionesModal');
  if (!contenedor) return;

  const config = materiaObj.configuracionEvaluacion || { cantidadParciales: 2, cantidadTPs: 0 };
  const evalData = materiaObj.evaluaciones || { parciales: [], tps: [] };
  const cantParciales = config.cantidadParciales !== undefined ? config.cantidadParciales : 2;
  const cantTPs = config.cantidadTPs !== undefined ? config.cantidadTPs : 0;

  contenedor.replaceChildren();
  contenedor.insertAdjacentHTML('beforeend', `
    <div>
      <div class="form-grid" style="grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label" style="font-size:11px;">Cant. Parciales Cátedra</label>
          <input type="number" min="0" max="6" id="evalCantParciales" class="form-input" value="${cantParciales}" onchange="reconstruirCamposEvaluacionModal()">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label" style="font-size:11px;">Cant. TPs / Proyectos</label>
          <input type="number" min="0" max="6" id="evalCantTPs" class="form-input" value="${cantTPs}" onchange="reconstruirCamposEvaluacionModal()">
        </div>
      </div>
      <div id="gridCamposEvaluacion" style="display:flex;flex-direction:column;gap:8px;"></div>
      <div id="boxResultadoCursadaCalculada" style="margin-top:10px;padding:8px 10px;border-radius:6px;font-size:11.5px;background:var(--s2);border:1px solid var(--border);"></div>
    </div>
  `);
  reconstruirCamposEvaluacionModal(evalData);
}

function reconstruirCamposEvaluacionModal(evalDataPrevias) {
  const grid = document.getElementById('gridCamposEvaluacion');
  if (!grid) return;
  const nParciales = Math.max(0, parseInt(document.getElementById('evalCantParciales')?.value, 10) || 0);
  const nTPs = Math.max(0, parseInt(document.getElementById('evalCantTPs')?.value, 10) || 0);
  const parcialesPrev = evalDataPrevias?.parciales || [];
  const tpsPrev = evalDataPrevias?.tps || [];
  let html = '';

  for (let i = 0; i < nParciales; i++) {
    const pObj = parcialesPrev[i] || {};
    const vOrig = pObj.original !== undefined && pObj.original !== null ? pObj.original : (pObj.nota !== undefined && pObj.nota !== null ? pObj.nota : '');
    const vRec1 = pObj.recup1 !== undefined && pObj.recup1 !== null ? pObj.recup1 : '';
    const vRec2 = pObj.recup2 !== undefined && pObj.recup2 !== null ? pObj.recup2 : '';

    html += `
      <div style="background:var(--s2);padding:8px 10px;border-radius:6px;border:1px solid var(--border);">
        <div style="font-size:11.5px;font-weight:600;margin-bottom:6px;color:var(--blue);">📌 Parcial ${i + 1}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
          <div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:9.5px;">Original</label><input type="number" min="1" max="10" class="form-input input-p-orig" data-pidx="${i}" value="${vOrig}" placeholder="Nota" oninput="actualizarEvaluacionesModal()"></div>
          <div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:9.5px;">1° Recup</label><input type="number" min="1" max="10" class="form-input input-p-rec1" data-pidx="${i}" value="${vRec1}" placeholder="Recup 1" oninput="actualizarEvaluacionesModal()"></div>
          <div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:9.5px;">2° Recup</label><input type="number" min="1" max="10" class="form-input input-p-rec2" data-pidx="${i}" value="${vRec2}" placeholder="Recup 2" oninput="actualizarEvaluacionesModal()"></div>
        </div>
      </div>
    `;
  }

  for (let j = 0; j < nTPs; j++) {
    const tpObj = tpsPrev[j] || {};
    const vOrig = tpObj.original !== undefined && tpObj.original !== null ? tpObj.original : (tpObj.nota !== undefined && tpObj.nota !== null ? tpObj.nota : (typeof tpObj === 'number' ? tpObj : ''));
    const vReent = tpObj.reentrega !== undefined && tpObj.reentrega !== null ? tpObj.reentrega : '';

    html += `
      <div style="background:var(--s2);padding:8px 10px;border-radius:6px;border:1px solid var(--border);">
        <div style="font-size:11.5px;font-weight:600;margin-bottom:6px;color:var(--purple, #a855f7);">💻 Trabajo Práctico ${j + 1}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:9.5px;">Original</label><input type="number" min="1" max="10" class="form-input input-tp-orig" data-tpidx="${j}" value="${vOrig}" placeholder="Nota TP" oninput="actualizarEvaluacionesModal()"></div>
          <div class="form-group" style="margin-bottom:0;"><label class="form-label" style="font-size:9.5px;">Reentrega</label><input type="number" min="1" max="10" class="form-input input-tp-reent" data-tpidx="${j}" value="${vReent}" placeholder="Reentrega" oninput="actualizarEvaluacionesModal()"></div>
        </div>
      </div>
    `;
  }

  grid.replaceChildren();
  grid.insertAdjacentHTML('beforeend', html);
  actualizarEvaluacionesModal();
}

function actualizarEvaluacionesModal() {
  const box = document.getElementById('boxResultadoCursadaCalculada');
  if (!box) return;
  const nParciales = Math.max(0, parseInt(document.getElementById('evalCantParciales')?.value, 10) || 0);
  const nTPs = Math.max(0, parseInt(document.getElementById('evalCantTPs')?.value, 10) || 0);
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

  const tpsEstructurados = [];
  for (let j = 0; j < nTPs; j++) {
    const origInp = document.querySelector(`.input-tp-orig[data-tpidx="${j}"]`);
    const reentInp = document.querySelector(`.input-tp-reent[data-tpidx="${j}"]`);
    const orig = origInp && origInp.value.trim() !== '' ? Number(origInp.value) : null;
    const reentrega = reentInp && reentInp.value.trim() !== '' ? Number(reentInp.value) : null;
    tpsEstructurados.push({ original: orig, reentrega });
  }

  const res = (typeof calcularCondicionCursadaCompleta === 'function')
    ? calcularCondicionCursadaCompleta(parcialesEstructurados, tpsEstructurados, nParciales, nTPs)
    : { condicionTexto: 'En evaluación' };

  let color = 'var(--blue)', bg = 'rgba(56,189,248,.08)';
  if (res.promociona) { color = 'var(--green)'; bg = 'rgba(34,211,164,.1)'; }
  else if (res.estado === 'firmada') { color = 'var(--yellow)'; bg = 'rgba(250,204,21,.1)'; }
  else if (res.recursa) { color = 'var(--accent)'; bg = 'rgba(244,63,94,.1)'; }

  box.style.borderColor = color;
  box.style.background = bg;
  box.replaceChildren();
  box.insertAdjacentHTML('beforeend', `<strong style="color:${color}">Resultado Cursada:</strong> ${res.condicionTexto}`);

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
  } else if (res.recursa) {
    if (selectEst) selectEst.value = 'pendiente';
  }
}

function obtenerEvaluacionesModalData() {
  const nParciales = Math.max(0, parseInt(document.getElementById('evalCantParciales')?.value, 10) || 0);
  const nTPs = Math.max(0, parseInt(document.getElementById('evalCantTPs')?.value, 10) || 0);
  const parciales = [];

  for (let i = 0; i < nParciales; i++) {
    const origInp = document.querySelector(`.input-p-orig[data-pidx="${i}"]`);
    const rec1Inp = document.querySelector(`.input-p-rec1[data-pidx="${i}"]`);
    const rec2Inp = document.querySelector(`.input-p-rec2[data-pidx="${i}"]`);
    const orig = origInp && origInp.value.trim() !== '' ? Number(origInp.value) : null;
    const recup1 = rec1Inp && rec1Inp.value.trim() !== '' ? Number(rec1Inp.value) : null;
    const recup2 = rec2Inp && rec2Inp.value.trim() !== '' ? Number(rec2Inp.value) : null;
    let notaFinal = recup2 !== null ? recup2 : (recup1 !== null ? recup1 : orig);
    parciales.push({ instancia: `${i + 1}° Parcial`, original: orig, recup1, recup2, nota: notaFinal });
  }

  const tps = [];
  for (let j = 0; j < nTPs; j++) {
    const origInp = document.querySelector(`.input-tp-orig[data-tpidx="${j}"]`);
    const reentInp = document.querySelector(`.input-tp-reent[data-tpidx="${j}"]`);
    const orig = origInp && origInp.value.trim() !== '' ? Number(origInp.value) : null;
    const reentrega = reentInp && reentInp.value.trim() !== '' ? Number(reentInp.value) : null;
    let notaFinal = reentrega !== null ? reentrega : orig;
    tps.push({ instancia: `TP ${j + 1}`, original: orig, reentrega, nota: notaFinal });
  }

  return {
    configuracionEvaluacion: { cantidadParciales: nParciales, cantidadTPs: nTPs },
    evaluaciones: { parciales, tps }
  };
}
