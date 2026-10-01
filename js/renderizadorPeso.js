/**
 * Módulo Renderizador de Peso Académico UTN FRBA (Super Panel 1 Sub Panel 2)
 * 100% Dinámico: Ubica arriba el modelo oficialmente activo según la fecha y abajo el otro atenuado (se invierten el 01/01/2027).
 */

function renderizarPesoAcademico() {
  const contenedor = document.getElementById('sp1p2');
  if (!contenedor) return;

  const datos = window.datosGlobales?.datosAlumno || {};
  const aprobadas = datos.materiasAprobadas || [];
  const enCurso = datos.materiasEnCurso || [];
  const historial = datos.historialSIU || [];
  const perfil = datos.perfil || {};

  const fechaHoy = new Date();
  const anioActual = fechaHoy.getFullYear();
  const esNuevoModeloVigente = anioActual >= 2027;

  const anioIngreso = parseInt(perfil.fechaIngreso) || anioActual;
  const aa = perfil.fechaIngreso ? Math.max(0, anioActual - anioIngreso) : 0;
  const cma = aprobadas.length;
  const cmd = historial.filter(h => typeof h.nota === 'number' && h.nota > 0 && (h.nota < 6 || h.resultado === 'Reprobado')).length;

  const pesoHistorico = (11 * cma) - (5 * aa) - (3 * cmd);

  const mAp_total = cma;
  const fAd_total = historial.filter(h => h.tipo === 'Examen' && (h.resultado === 'Reprobado' || (typeof h.nota === 'number' && h.nota > 0 && h.nota < 6))).length;
  const fAu_ciclo = historial.filter(h => h.tipo === 'Examen' && h.resultado === 'Ausente').length;
  const mAb_ciclo = historial.filter(h => h.resultado === 'Baja' || h.resultado === 'Abandonada').length;
  const mR_ciclo = enCurso.length;

  const ppaNuevo = (11 * mAp_total) - (7 * fAd_total) - (19 * fAu_ciclo) - (17 * mAb_ciclo) + (5 * mR_ciclo);

  const det = (typeof window.obtenerDetallesComputoPeso === 'function') ? window.obtenerDetallesComputoPeso(datos) : null;
  const tD = (tit, l, v) => (typeof window.renderizarTooltipDesgloseHtml === 'function') ? window.renderizarTooltipDesgloseHtml(tit, l, v) : '';
  const tT = (tit, txt) => (typeof window.renderizarTooltipTextoHtml === 'function') ? window.renderizarTooltipTextoHtml(tit, txt) : '';

  const htmlHistorico = `
    <div class="peso-formula" style="${esNuevoModeloVigente ? 'opacity:0.65;filter:grayscale(30%);border-left:4px solid var(--muted);' : 'border-left:4px solid var(--green);'}margin-bottom:20px;padding:16px;background:var(--s1);border-radius:8px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <h3 style="margin:0;">📜 Polinomio Histórico (Modelo Anterior SIU)</h3>
        <span class="badge-plan-k08" style="font-size:11px;">${esNuevoModeloVigente ? 'Derogado desde 2027' : '✅ Modelo Oficial Activo'}</span>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:4px;text-transform:uppercase;">Ecuación General (3 Variables):</div>
      <div class="formula-eq" style="color:var(--green);font-size:12px;font-family:'JetBrains Mono',monospace;margin-top:2px;">
        PESO = 11 × CMA - 5 × AA - 3 × CMD
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:8px;text-transform:uppercase;">Sustitución en Vivo con tus Datos:</div>
      <div class="formula-eq" style="color:var(--text);font-size:11.5px;font-family:'JetBrains Mono',monospace;background:var(--s2);padding:8px 12px;border-radius:6px;margin-top:2px;border:1px solid var(--border);">
        PESO = 11 × (${cma}) - 5 × (${aa}) - 3 × (${cmd}) = ${11 * cma} - ${5 * aa} - ${3 * cmd} = <strong style="color:var(--green);font-size:13.5px;">${pesoHistorico} Puntos</strong>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:12px;margin-bottom:6px;text-transform:uppercase;">Desglose Individual de las 3 Variables (Hover para detalle):</div>
      <div class="calc-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;">
        <div class="calc-item"><div class="calc-var">1. CMA (Aprobadas)</div><div class="calc-val">${cma}</div><div class="calc-sub">+${11 * cma} ptos (×11)</div>${det ? tD(det.cma.titulo, det.cma.lista, 'Sin materias aprobadas') : ''}</div>
        <div class="calc-item"><div class="calc-var">2. AA (Antigüedad)</div><div class="calc-val">${aa}</div><div class="calc-sub">-${5 * aa} ptos (-5×)</div>${det ? tT('Cálculo de Antigüedad', det.aa.calculo) : ''}</div>
        <div class="calc-item"><div class="calc-var">3. CMD (Aplazos)</div><div class="calc-val">${cmd}</div><div class="calc-sub">-${3 * cmd} ptos (-3×)</div>${det ? tD(det.cmd.titulo, det.cmd.lista, 'Sin aplazos registrados (0)') : ''}</div>
        <div class="calc-item" style="border-color:var(--green);"><div class="calc-var">Puntaje Histórico</div><div class="calc-val pos">${pesoHistorico}</div><div class="calc-sub">Cálculo SIU Actual</div>${det ? tT('Total Polinomio Histórico', `11×(${cma}) - 5×(${aa}) - 3×(${cmd}) = ${pesoHistorico} ptos`) : ''}</div>
      </div>
    </div>
  `;

  const htmlNuevoPPA = `
    <div class="peso-formula" style="${!esNuevoModeloVigente ? 'opacity:0.65;filter:grayscale(30%);border-left:4px solid var(--muted);' : 'border-left:4px solid var(--blue);'}margin-bottom:20px;padding:16px;background:var(--s1);border-radius:8px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <h3 style="margin:0;">🚀 Nuevo Polinomio de Peso Académico (PPA) · Res. CD N° 2902/25</h3>
        <span class="badge-plan-k23" style="font-size:11px;">${esNuevoModeloVigente ? '✅ Modelo Oficial Activo' : '⏳ Entra en vigencia el 01/01/2027'}</span>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:4px;text-transform:uppercase;">Ecuación General (5 Variables):</div>
      <div class="formula-eq" style="color:var(--blue);font-size:12px;font-family:'JetBrains Mono',monospace;margin-top:2px;">
        P = 11 × MAp_total - 7 × FAd_total - 19 × FAu_ciclo - 17 × MAb_ciclo + 5 × MR_ciclo
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:8px;text-transform:uppercase;">Sustitución en Vivo con tus Datos:</div>
      <div class="formula-eq" style="color:var(--text);font-size:11.5px;font-family:'JetBrains Mono',monospace;background:var(--s2);padding:8px 12px;border-radius:6px;margin-top:2px;border:1px solid var(--border);">
        P = 11 × (${mAp_total}) - 7 × (${fAd_total}) - 19 × (${fAu_ciclo}) - 17 × (${mAb_ciclo}) + 5 × (${mR_ciclo}) = <strong style="color:var(--blue);font-size:13.5px;">${ppaNuevo} Puntos</strong>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:12px;margin-bottom:6px;text-transform:uppercase;">Desglose Individual de las 5 Variables (Hover para detalle):</div>
      <div class="calc-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;">
        <div class="calc-item"><div class="calc-var">1. MAp_total (Aprobadas)</div><div class="calc-val">${mAp_total}</div><div class="calc-sub">+${11 * mAp_total} ptos (×11)</div>${det ? tD(det.mAp_total.titulo, det.mAp_total.lista, 'Sin materias aprobadas') : ''}</div>
        <div class="calc-item"><div class="calc-var">2. FAd_total (Adeudados)</div><div class="calc-val">${fAd_total}</div><div class="calc-sub">-${7 * fAd_total} ptos (-7×)</div>${det ? tD(det.fAd_total.titulo, det.fAd_total.lista, 'Sin finales adeudados (0)') : ''}</div>
        <div class="calc-item"><div class="calc-var">3. FAu_ciclo (Ausente)</div><div class="calc-val">${fAu_ciclo}</div><div class="calc-sub">-${19 * fAu_ciclo} ptos (-19×)</div>${det ? tD(det.fAu_ciclo.titulo, det.fAu_ciclo.lista, 'Sin ausentes registrados (0)') : ''}</div>
        <div class="calc-item"><div class="calc-var">4. MAb_ciclo (Abandonos)</div><div class="calc-val">${mAb_ciclo}</div><div class="calc-sub">-${17 * mAb_ciclo} ptos (-17×)</div>${det ? tD(det.mAb_ciclo.titulo, det.mAb_ciclo.lista, 'Sin cursadas abandonadas (0)') : ''}</div>
        <div class="calc-item"><div class="calc-var">5. MR_ciclo (Regularizadas)</div><div class="calc-val">${mR_ciclo}</div><div class="calc-sub">+${5 * mR_ciclo} ptos (+5×)</div>${det ? tD(det.mR_ciclo.titulo, det.mR_ciclo.lista, 'Sin materias regularizadas en ciclo (0)') : ''}</div>
        <div class="calc-item" style="border-color:var(--blue);"><div class="calc-var">Puntaje PPA Resultado</div><div class="calc-val pos" style="color:var(--blue);">${ppaNuevo}</div><div class="calc-sub">Polinomio Res. 2902/25</div>${det ? tT('Total Polinomio PPA', `11×(${mAp_total}) - 7×(${fAd_total}) - 19×(${fAu_ciclo}) - 17×(${mAb_ciclo}) + 5×(${mR_ciclo}) = ${ppaNuevo} ptos`) : ''}</div>
      </div>
    </div>
  `;

  contenedor.replaceChildren();
  contenedor.insertAdjacentHTML('beforeend', `
    ${esNuevoModeloVigente ? htmlNuevoPPA + htmlHistorico : htmlHistorico + htmlNuevoPPA}

    <!-- Glosario Completo de Referencias y Variables -->
    <div class="sec">📖 Glosario Completo de Referencias y Variables</div>
    <div style="background:var(--s1);border:1px solid var(--border);border-radius:8px;padding:14px;font-size:12px;line-height:1.6;margin-bottom:20px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;">
        <div>
          <strong style="color:var(--green)">🔹 Variables Polinomio Histórico (Modelo Activo 2026):</strong><br>
          • <strong>CMA</strong> (<i>Cantidad de Materias Aprobadas</i>): Total de materias con final o promoción (Tu valor: <strong style="color:var(--text);">${cma}</strong>).<br>
          • <strong>AA</strong> (<i>Años de Antigüedad</i>): Años desde tu ingreso (${anioIngreso ? `${anioIngreso} → ${anioActual} = <strong style="color:var(--text);">${aa} años</strong>` : 'Sin fecha de ingreso cargada'}).<br>
          • <strong>CMD</strong> (<i>Cantidad de Materias Desaprobadas</i>): Aplazos (< 6) en finales SIU (Tu valor: <strong style="color:var(--text);">${cmd}</strong>).
        </div>
        <div>
          <strong style="color:var(--blue)">🔹 Variables Nuevo Polinomio (PPA Res. 2902/25 - Desde 2027):</strong><br>
          • <strong>MAp_total</strong>: Aprobadas totales (Tu valor: <strong style="color:var(--text);">${mAp_total}</strong>) | • <strong>FAd_total</strong>: Adeudados (<strong style="color:var(--text);">${fAd_total}</strong>).<br>
          • <strong>FAu_ciclo</strong>: Ausentes en final (Tu valor: <strong style="color:var(--text);">${fAu_ciclo}</strong>) | • <strong>MAb_ciclo</strong>: Abandonadas (<strong style="color:var(--text);">${mAb_ciclo}</strong>).<br>
          • <strong>MR_ciclo</strong>: Materias regularizadas/en curso en el ciclo actual (Tu valor: <strong style="color:var(--text);">${mR_ciclo}</strong>).
        </div>
      </div>
    </div>
  `);
}

window.renderizarPesoAcademico = renderizarPesoAcademico;
