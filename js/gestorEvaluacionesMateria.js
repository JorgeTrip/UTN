/**
 * Módulo Gestor de Evaluaciones de Cursada (Parciales y Trabajos Prácticos)
 * Gestiona configuraciones de cátedra con N parciales y M TPs, calculando en vivo la condición.
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
          <label class="form-label" style="font-size:11px;">Cant. Parciales (def: 2)</label>
          <input type="number" min="0" max="6" id="evalCantParciales" class="form-input" value="${cantParciales}" onchange="reconstruirCamposEvaluacionModal()">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label" style="font-size:11px;">Cant. TPs / Proyectos (def: 0)</label>
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
    const orig = document.querySelector(`.input-p-orig[data-pidx="${i}"]`)?.value.trim();
    const rec1 = document.querySelector(`.input-p-rec1[data-pidx="${i}"]`)?.value.trim();
    const rec2 = document.querySelector(`.input-p-rec2[data-pidx="${i}"]`)?.value.trim();
    parcialesEstructurados.push({
      original: orig !== '' && !isNaN(orig) ? Number(orig) : null,
      recup1: rec1 !== '' && !isNaN(rec1) ? Number(rec1) : null,
      recup2: rec2 !== '' && !isNaN(rec2) ? Number(rec2) : null
    });
  }

  const tpsEstructurados = [];
  for (let j = 0; j < nTPs; j++) {
    const orig = document.querySelector(`.input-tp-orig[data-tpidx="${j}"]`)?.value.trim();
    const reent = document.querySelector(`.input-tp-reent[data-tpidx="${j}"]`)?.value.trim();
    tpsEstructurados.push({
      original: orig !== '' && !isNaN(orig) ? Number(orig) : null,
      reentrega: reent !== '' && !isNaN(reent) ? Number(reent) : null
    });
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

  actualizarVisibilidadBloqueFinales(res);
}

function actualizarVisibilidadBloqueFinales(resCursada) {
  const aviso = document.getElementById('avisoFinalesModal');
  const formFinal = document.getElementById('formAgregarFinal');
  if (!aviso || !formFinal) return;

  const finalesCargados = window.materiaObjEnEdicion?.finales || [];
  const tieneFinalAprobado = finalesCargados.some(f => f.resultado === 'aprobado' || (f.nota && f.nota >= 6));
  if (tieneFinalAprobado) {
    const finAp = finalesCargados.slice().reverse().find(f => f.resultado === 'aprobado' || (f.nota && f.nota >= 6));
    aviso.style.display = 'block';
    aviso.textContent = `🎯 Examen final aprobado con nota ${finAp?.nota || '6+'}. Materia Aprobada en forma definitiva.`;
    formFinal.style.display = 'none';
  } else if (resCursada.promociona) {
    aviso.style.display = 'block';
    aviso.textContent = '🏆 Materia promocionada por cursada. No requiere rendir examen final.';
    formFinal.style.display = 'none';
  } else if (resCursada.estado === 'firmada' || finalesCargados.length > 0) {
    aviso.style.display = 'block';
    aviso.textContent = '✍️ Cursada firmada. Podés cargar todos los llamados rendidos hasta el examen final definitivo.';
    formFinal.style.display = 'grid';
  } else if (resCursada.recursa) {
    aviso.style.display = 'block';
    aviso.textContent = '❌ Materia desaprobada por cursada. Para rendir final se debe firmar la cursada.';
    formFinal.style.display = 'none';
  } else {
    aviso.style.display = 'block';
    aviso.textContent = '⏳ Cursada en progreso. Al firmar la cursada se habilitará el registro de exámenes finales.';
    formFinal.style.display = 'none';
  }
}

function obtenerEvaluacionesModalData() {
  const nParciales = Math.max(0, parseInt(document.getElementById('evalCantParciales')?.value, 10) || 0);
  const nTPs = Math.max(0, parseInt(document.getElementById('evalCantTPs')?.value, 10) || 0);
  const parciales = [];

  for (let i = 0; i < nParciales; i++) {
    const origVal = document.querySelector(`.input-p-orig[data-pidx="${i}"]`)?.value.trim();
    const rec1Val = document.querySelector(`.input-p-rec1[data-pidx="${i}"]`)?.value.trim();
    const rec2Val = document.querySelector(`.input-p-rec2[data-pidx="${i}"]`)?.value.trim();
    const orig = origVal !== '' && !isNaN(origVal) ? Number(origVal) : null;
    const recup1 = rec1Val !== '' && !isNaN(rec1Val) ? Number(rec1Val) : null;
    const recup2 = rec2Val !== '' && !isNaN(rec2Val) ? Number(rec2Val) : null;
    let notaFinal = recup2 !== null ? recup2 : (recup1 !== null ? recup1 : orig);
    parciales.push({ instancia: `${i + 1}° Parcial`, original: orig, recup1, recup2, nota: notaFinal });
  }

  const tps = [];
  for (let j = 0; j < nTPs; j++) {
    const origVal = document.querySelector(`.input-tp-orig[data-tpidx="${j}"]`)?.value.trim();
    const reentVal = document.querySelector(`.input-tp-reent[data-tpidx="${j}"]`)?.value.trim();
    const orig = origVal !== '' && !isNaN(origVal) ? Number(origVal) : null;
    const reentrega = reentVal !== '' && !isNaN(reentVal) ? Number(reentVal) : null;
    let notaFinal = reentrega !== null ? reentrega : orig;
    tps.push({ instancia: `TP ${j + 1}`, original: orig, reentrega, nota: notaFinal });
  }

  return {
    configuracionEvaluacion: { cantidadParciales: nParciales, cantidadTPs: nTPs },
    evaluaciones: { parciales, tps }
  };
}
