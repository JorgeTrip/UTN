/**
 * Módulo de Visualización Interactiva de Transición K08 -> K23 y Régimen de Electivas
 * Renderiza la tabla oficial de equivalencias (Ord. 1878), cronograma (Res. 3120/22) y catálogo de electivas.
 */

function renderizarTablaEquivalenciasHtml(equivalencias, filtro = '') {
  if (!equivalencias || equivalencias.length === 0) return '<div class="note">No hay datos de equivalencias.</div>';
  const q = filtro.toLowerCase().trim();
  const filtradas = equivalencias.filter(eq =>
    !q || (eq.plan_2008 && eq.plan_2008.toLowerCase().includes(q)) ||
    (eq.plan_2023 && eq.plan_2023.toLowerCase().includes(q)) ||
    (eq.id && eq.id.toLowerCase().includes(q))
  );

  return `
    <div style="overflow-x:auto;max-height:360px;border:1px solid var(--border);border-radius:8px;background:var(--s1);">
      <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;">
        <thead style="background:var(--s2);position:sticky;top:0;z-index:2;border-bottom:1px solid var(--border);">
          <tr>
            <th style="padding:8px 10px;color:var(--muted);width:70px;">ID K23</th>
            <th style="padding:8px 10px;color:var(--yellow);">📘 Materia Plan 2008 (K08)</th>
            <th style="padding:8px 10px;color:var(--blue);">🎓 Materia Plan 2023 (K23)</th>
          </tr>
        </thead>
        <tbody>
          ${filtradas.map(eq => `
            <tr style="border-bottom:1px solid rgba(255,255,255,.05);">
              <td style="padding:7px 10px;font-family:'JetBrains Mono',monospace;color:var(--muted);">${eq.id}</td>
              <td style="padding:7px 10px;font-weight:600;">${eq.plan_2008}</td>
              <td style="padding:7px 10px;color:var(--text);">${eq.plan_2023}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderizarCronogramaTransicionHtml(cronograma) {
  if (!cronograma) return '';
  const anios = Object.keys(cronograma);
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:10px;">
      ${anios.map(a => `
        <div style="background:var(--s1);border:1px solid var(--border);border-radius:8px;padding:10px;">
          <div style="color:var(--blue);font-weight:800;font-size:13px;margin-bottom:4px;">Año ${a}</div>
          <div style="font-size:11.5px;color:var(--muted);line-height:1.4;">${cronograma[a]}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderizarCatalogoElectivasHtml(electivas, filtro = '') {
  if (!electivas || electivas.length === 0) return '<div class="note">No hay electivas disponibles.</div>';
  const q = filtro.toLowerCase().trim();
  const filtradas = electivas.filter(el =>
    !q || (el.nombre && el.nombre.toLowerCase().includes(q)) ||
    (el.area_tematica && el.area_tematica.toLowerCase().includes(q)) ||
    (el.nivel_asignado && el.nivel_asignado.toLowerCase().includes(q))
  );

  const datos = window.datosGlobales?.datosAlumno || {};
  const cursadasSet = new Set([
    ...(datos.materiasAprobadas || []),
    ...(datos.materiasEnCurso || [])
  ].flatMap(m => [
    String(m.codigo || '').toLowerCase().trim(),
    String(m.id || '').toLowerCase().trim(),
    String(m.materia || '').toLowerCase().trim(),
    String(m.nombre || '').toLowerCase().trim()
  ]).filter(Boolean));

  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-top:10px;">
      ${filtradas.map(el => {
        const codigoEl = String(el.codigo || '').toLowerCase().trim();
        const nombreEl = String(el.nombre || '').toLowerCase().trim();
        const estaCursada = cursadasSet.has(codigoEl) || cursadasSet.has(nombreEl);
        return `
        <div class="guia-card" style="padding:12px;position:relative;">
          ${estaCursada ? '<span class="badge-check-cursada" title="Materia Cursada o Aprobada" style="position:absolute;top:8px;right:8px;background:#10b981;color:#fff;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;box-shadow:0 2px 6px rgba(16,185,129,0.4);z-index:2;">✔</span>' : ''}
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;margin-bottom:4px;padding-right:${estaCursada ? '24px' : '0'};">
            <div style="font-weight:700;font-size:13px;color:var(--text);">${el.nombre}</div>
            <span class="acc-badge ab-final" style="font-size:9px;">${el.codigo}</span>
          </div>
          <div style="font-size:11px;color:var(--blue);margin-bottom:6px;">${el.nivel_asignado || 'Bloque Electivo'} · ${el.horas_reloj || 80} hs reloj (${el.duracion || 'Cuatrimestral'})</div>
          <div style="font-size:11.5px;color:var(--muted);line-height:1.4;margin-bottom:6px;">${el.descripcion || ''}</div>
          ${el.correlativas_para_cursar?.length ? `<div style="font-size:10.5px;color:#a78bfa;"><strong>Correlativas:</strong> ${el.correlativas_para_cursar.join(', ')}</div>` : ''}
        </div>
        `;
      }).join('')}
    </div>
  `;
}

window.renderizarTablaEquivalenciasHtml = renderizarTablaEquivalenciasHtml;
window.renderizarCronogramaTransicionHtml = renderizarCronogramaTransicionHtml;
window.renderizarCatalogoElectivasHtml = renderizarCatalogoElectivasHtml;
