/**
 * Módulo Renderizador de Estrategia Académica y Correlatividades (Super Panel 1 Sub Panel 3)
 * Integra el Asesor Inteligente de Estrategia con Gemini API, checkboxes de selección y Cadenas Troncales.
 */

function renderizarEstrategia() {
  const contenedor = document.getElementById('sp1p3');
  if (!contenedor) return;

  const datos = window.datosGlobales?.datosAlumno || {};
  const aprobadas = datos.materiasAprobadas || [];
  const enCurso = datos.materiasEnCurso || [];
  const estrategia = window.obtenerEstrategiaRecomendada ? window.obtenerEstrategiaRecomendada() : null;
  const seleccionadas = window.obtenerMateriasSeleccionadasEstrategia ? window.obtenerMateriasSeleccionadasEstrategia() : [];

  const getEstadoMat = (id) => {
    if (aprobadas.some(m => m.id === id)) return '<span style="color:var(--green);font-weight:700;">✓ Aprobada</span>';
    if (enCurso.some(m => m.id === id)) return '<span style="color:var(--blue);font-weight:700;">⏳ En curso</span>';
    return '<span style="color:var(--muted);">❌ Pendiente</span>';
  };

  let bloqueIaHtml = '';
  if (estrategia) {
    const matsHtml = (estrategia.materiasPrioritarias || []).map(m => {
      const estaTildada = seleccionadas.includes(m.id);
      return `
        <div style="background:var(--s2);border:1px solid var(--border);border-radius:6px;padding:8px 12px;margin-bottom:6px;display:flex;align-items:flex-start;gap:10px;">
          <input type="checkbox" class="chk-materia-estrategia" data-materia-id="${m.id}" ${estaTildada ? 'checked' : ''} onchange="window.toggleSeleccionMateriaEstrategia('${m.id}', this.checked)" style="margin-top:3px;cursor:pointer;width:16px;height:16px;accent-color:var(--blue);" />
          <div style="flex:1;">
            <div style="font-weight:600;color:var(--text);font-size:12.5px;">🎯 ${m.nombre} <span style="font-size:11px;color:var(--cyan);margin-left:6px;">(${m.tipo || 'Cursada'})</span></div>
            <div style="font-size:11.5px;color:var(--text-sec);margin-top:2px;">${m.motivo || ''}</div>
          </div>
        </div>
      `;
    }).join('');

    const finalesHtml = (estrategia.finalesUrgentes || []).map(f => `
      <div style="background:var(--s2);border:1px solid var(--border);border-radius:6px;padding:8px 12px;margin-bottom:6px;">
        <div style="font-weight:600;color:var(--accent);font-size:12.5px;">⚠️ ${f.nombre}</div>
        <div style="font-size:11.5px;color:var(--text-sec);margin-top:2px;">${f.motivo || ''}</div>
      </div>
    `).join('');

    bloqueIaHtml = `
      <div style="background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.3);border-radius:8px;padding:14px;margin-bottom:18px;">
        <div style="font-size:12.5px;line-height:1.5;margin-bottom:12px;color:var(--text);">${estrategia.diagnosticoRuta || ''}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--cyan);">📌 Materias Sugeridas para Próximo Período</span>
              <span style="font-size:10.5px;color:var(--muted);">(Tilda las que vas a cursar)</span>
            </div>
            ${matsHtml || '<div style="font-size:12px;color:var(--muted);">Sin materias pendientes inmediatas.</div>'}
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--accent);margin-bottom:6px;">🎯 Finales Prioritarios a Rendir</div>
            ${finalesHtml || '<div style="font-size:12px;color:var(--muted);">No hay finales pendientes críticos.</div>'}
          </div>
        </div>
      </div>
    `;
  } else {
    bloqueIaHtml = `
      <div style="background:var(--s1);border:1px dashed var(--border);border-radius:8px;padding:14px;text-align:center;margin-bottom:18px;font-size:12.5px;color:var(--text-sec);">
        Presiona el botón para que la IA de Gemini analice tus correlativas, materias anuales y finales pendientes.
      </div>
    `;
  }

  contenedor.replaceChildren();
  contenedor.insertAdjacentHTML('beforeend', `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
      <div class="sec" style="margin:0;">💡 Estrategia Académica con IA (Gemini Flash / 3.x)</div>
      <button class="btn-prim btn-estrategia-gemini" style="font-size:12px;padding:6px 12px;" onclick="ejecutarAnalisisEstrategiaIa()">
        ${estrategia ? '🔄 Actualizar Estrategia con IA' : '✨ Generar Estrategia con IA'}
      </button>
    </div>

    ${bloqueIaHtml}

    <div class="sec">Cadenas de Correlatividades y Ramas Troncales</div>
    <div class="strat-grid">
      <div class="strat-card">
        <h4><span style="color:var(--asi)">●</span> Rama Integradora Sistemas</h4>
        <p><strong>AyED → ASI → DSI → AdSI → Proyecto Final</strong></p>
        <ul style="font-size:12px;line-height:1.6;list-style:none;padding:0;">
          <li>• Algoritmos y Estructuras de Datos: ${getEstadoMat('082021')}</li>
          <li>• Análisis de Sistemas de Información: ${getEstadoMat('082024')}</li>
          <li>• Diseño de Sistemas de Información: ${getEstadoMat('232034')}</li>
          <li>• Adm. de Sistemas de Información: ${getEstadoMat('232045')}</li>
          <li>• Proyecto Final: ${getEstadoMat('082037')}</li>
        </ul>
      </div>
      <div class="strat-card">
        <h4><span style="color:var(--cd)">●</span> Rama Redes y Comunicaciones</h4>
        <p><strong>Arq → Comu → Redes → Seguridad</strong></p>
        <ul style="font-size:12px;line-height:1.6;list-style:none;padding:0;">
          <li>• Arquitectura de Computadoras: ${getEstadoMat('082022')}</li>
          <li>• Comunicación de Datos: ${getEstadoMat('232032')}</li>
          <li>• Redes de Datos: ${getEstadoMat('232041')}</li>
          <li>• Seguridad en los Sistemas: ${getEstadoMat('232055')}</li>
        </ul>
      </div>
    </div>
  `);
}

async function ejecutarAnalisisEstrategiaIa() {
  if (typeof window.consultarEstrategiaGemini !== 'function') return;
  const btn = document.querySelector('.btn-estrategia-gemini');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Analizando ruta...';
  }
  try {
    await window.consultarEstrategiaGemini();
    renderizarEstrategia();
  } catch (e) {
    alert(`Error al generar estrategia: ${e.message}`);
  } finally {
    if (btn) btn.disabled = false;
  }
}

window.renderizarEstrategia = renderizarEstrategia;
window.ejecutarAnalisisEstrategiaIa = ejecutarAnalisisEstrategiaIa;
