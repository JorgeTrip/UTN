/**
 * Módulo Renderizador de Hitos de Carrera y Métricas (Super Panel 1 Sub Panel 0)
 * 100% Dinámico: Calculado estrictamente a partir de los datos reales del estudiante.
 */

function renderizarHitosCarrera() {
  const contenedor = document.getElementById('sp1p0');
  if (!contenedor) return;

  const datos = window.datosGlobales?.datosAlumno || {};
  const aprobadas = datos.materiasAprobadas || [];
  const enCurso = datos.materiasEnCurso || [];
  const historial = datos.historialSIU || [];
  const perfil = datos.perfil || {};

  const totalK23 = 41;
  const idsAdusi = ["232001","232002","232003","232004","232010","082021","082022","232011","232009","232010_f2","232011_is","232012","082025","082026","082027","082024","232017","232018","232030","232020","232032","232033","232034","082099"];
  const idsAprobadas = aprobadas.map(m => m.id);

  const aprobadasAdusi = aprobadas.filter(m => idsAdusi.includes(m.id));
  const faltantesAdusi = idsAdusi.filter(id => !idsAprobadas.includes(id));
  const pctAdusi = Math.round((aprobadasAdusi.length / idsAdusi.length) * 100);
  const pctCerrado = Math.round((aprobadas.length / totalK23) * 100);
  const pctTotal = Math.round(((aprobadas.length + enCurso.length) / totalK23) * 100);

  // Cálculo real de promedio ponderado
  const aprobadasConNota = aprobadas.filter(m => typeof m.nota === 'number' && m.nota > 0);
  const sumaNotas = aprobadasConNota.reduce((acc, m) => acc + m.nota, 0);
  const promCalculado = aprobadasConNota.length > 0 ? (sumaNotas / aprobadasConNota.length).toFixed(2) : '–';

  // Finales pendientes reales (Mochila unificada: en curso firmadas, historial SIU y finales registrados)
  const firmadasEnCurso = enCurso.filter(m => (m.estado === 'firmada' || m.condicion === 'firmada' || m.estado === 'regular') && !idsAprobadas.includes(m.id));
  const firmadasSIU = historial.filter(h => (h.resultado === 'Regularidad' || h.condicion === 'Regular' || h.tipo === 'Cursada') && !idsAprobadas.includes(h.materiaId || h.id));
  const conFinalesPendientes = enCurso.filter(m => Array.isArray(m.finales) && m.finales.length > 0 && !idsAprobadas.includes(m.id));
  const setMochilas = new Set([
    ...firmadasEnCurso.map(m => m.id),
    ...firmadasSIU.map(h => h.materiaId || h.id),
    ...conFinalesPendientes.map(m => m.id)
  ]);
  const cantidadMochila = setMochilas.size;

  // Resolución dinámica de nivel de asignaturas (catálogo oficial K23 y electivas)
  const MAPEO_NIVELES_K23 = {
    '232001':1,'232002':1,'232003':1,'232004':1,'232010':1,'082021':1,'082022':1,'232011':1,
    '232009':2,'232010_f2':2,'232011_is':2,'232012':2,'082025':2,'082026':2,'082027':2,'082024':2,
    '232017':3,'232018':3,'232030':3,'232020':3,'232032':3,'232033':3,'232034':3,'082099':3,
    '232045':4,'232042':4,'232043':4,'232044':4,'232041':4,'232040':4,
    '232051':5,'232052':5,'232053':5,'232054':5,'232055':5,'082037':5
  };
  const catalogoK23 = window.CAT_MATERIAS_K23 || [];
  const obtenerNivelMateria = (m) => {
    const cod = (m.id || m.codigoSIU || '').toString();
    if (MAPEO_NIVELES_K23[cod]) return MAPEO_NIVELES_K23[cod];
    const matCat = catalogoK23.find(c => c.id === cod);
    if (matCat) return matCat.nivel;
    if (typeof window.clasificarElectiva === 'function') {
      const elInfo = window.clasificarElectiva(m);
      if (elInfo.esElectiva) return elInfo.bloque === '5' ? 5 : 3;
    }
    return m.nivel ? Number(m.nivel) : null;
  };

  const contarPorNivel = (nivel) => aprobadas.filter(m => obtenerNivelMateria(m) === nivel).length;
  const n1Aprob = contarPorNivel(1);
  const n2Aprob = contarPorNivel(2);
  const n3Aprob = contarPorNivel(3);
  const n4Aprob = contarPorNivel(4);
  const n5Aprob = contarPorNivel(5);

  // Nombres en curso y faltantes
  const textoEnCurso = enCurso.length > 0 ? enCurso.map(m => m.nombre).join(', ') : 'Sin materias en curso';
  let textoFaltantesAdusi = '¡Requisitos 100% cumplidos!';
  if (faltantesAdusi.length > 0) {
    textoFaltantesAdusi = faltantesAdusi.length > 4
      ? `Restan aprobar ${faltantesAdusi.length} materias requeridas de los primeros 3 niveles.`
      : `Restan aprobar: ${faltantesAdusi.map(id => enCurso.find(m => m.id === id)?.nombre || 'Materia req. ' + id).join(', ')}.`;
  }

  const sobresalientes = aprobadas.filter(m => typeof m.nota === 'number' && m.nota >= 9).sort((a, b) => b.nota - a.nota);

  contenedor.replaceChildren();
  contenedor.insertAdjacentHTML('beforeend', `
    <!-- TÍTULOS E HITOS PRINCIPALES -->
    <div class="sec">🏆 Títulos e Hitos Principales</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-bottom:24px;">
      <div class="milestone-card" style="background:linear-gradient(135deg,rgba(244,114,182,.1) 0%,rgba(244,114,182,.03) 100%);border:1px solid rgba(244,114,182,.3);border-radius:12px;padding:18px;position:relative;">
        <div style="position:absolute;top:0;right:0;background:rgba(244,114,182,.2);color:#f472b6;font-size:10px;font-weight:700;padding:4px 10px;border-bottom-left-radius:8px;">Progreso ${pctAdusi}%</div>
        <div style="font-size:11px;font-weight:700;color:var(--pink);text-transform:uppercase;margin-bottom:4px;">Título Intermedio</div>
        <div style="font-size:16px;font-weight:800;margin-bottom:6px;">Analista Desarrollador Univ. (ADUSI)</div>
        <div style="font-size:12px;color:var(--muted);line-height:1.5;">${textoFaltantesAdusi}</div>
      </div>
      <div class="milestone-card" style="background:linear-gradient(135deg,rgba(139,92,246,.08) 0%,rgba(139,92,246,.03) 100%);border:1px solid rgba(139,92,246,.3);border-radius:12px;padding:18px;position:relative;">
        <div style="position:absolute;top:0;right:0;background:rgba(139,92,246,.2);color:#a78bfa;font-size:10px;font-weight:700;padding:4px 10px;border-bottom-left-radius:8px;">Progreso ${pctCerrado}%</div>
        <div style="font-size:11px;font-weight:700;color:var(--purple);text-transform:uppercase;margin-bottom:4px;">Título de Grado</div>
        <div style="font-size:16px;font-weight:800;margin-bottom:6px;">Ingeniero en Sistemas de Información</div>
        <div style="font-size:12px;color:var(--muted);line-height:1.5;">${aprobadas.length} de ${totalK23} materias aprobadas. Restan ${Math.max(0, totalK23 - aprobadas.length)} materias.</div>
      </div>
    </div>

    <!-- SECCIÓN: KPIS Y ESTADO ACTUAL -->
    <div class="sec">📌 Materias y Avance · Estado Actualizado</div>
    <div class="kpi-grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin-bottom:24px;">
      <div class="kpi-card k-green"><div class="kpi-val" style="color:var(--green);font-size:30px;">${aprobadas.length}</div><div class="kpi-lbl">Materias Aprobadas</div><div class="kpi-sub">${aprobadas.length} de ${totalK23} bloques cerrados.</div></div>
      <div class="kpi-card k-blue"><div class="kpi-val" style="color:var(--blue);font-size:30px;">${enCurso.length}</div><div class="kpi-lbl">Materias en Curso</div><div class="kpi-sub">${textoEnCurso}</div></div>
      <div class="kpi-card k-yellow"><div class="kpi-val" style="color:var(--yellow);font-size:30px;">${Math.max(0, totalK23 - aprobadas.length)}</div><div class="kpi-lbl">Materias por Aprobar</div><div class="kpi-sub">Faltan ${faltantesAdusi.length} para título intermedio.</div></div>
      <div class="kpi-card k-green"><div class="kpi-val" style="color:var(--green);font-size:30px;">${pctCerrado}%</div><div class="kpi-lbl">Avance Cerrado</div><div class="prog-bar-bg" style="margin:6px 0;"><div class="prog-bar-fill" style="width:${pctCerrado}%;background:var(--green)"></div></div><div class="kpi-sub">${aprobadas.length} de ${totalK23} materias del plan.</div></div>
      <div class="kpi-card k-blue"><div class="kpi-val" style="color:var(--blue);font-size:30px;">${pctTotal}%</div><div class="kpi-lbl">Avance Total (con en curso)</div><div class="prog-bar-bg" style="margin:6px 0;"><div class="prog-bar-fill" style="width:${pctTotal}%;background:var(--blue)"></div></div><div class="kpi-sub">${aprobadas.length + enCurso.length} de ${totalK23} consideradas.</div></div>
      <div class="kpi-card ${cantidadMochila > 0 ? 'k-yellow' : 'k-green'}"><div class="kpi-val" style="color:${cantidadMochila > 0 ? 'var(--yellow)' : 'var(--green)'};font-size:30px;">${cantidadMochila}</div><div class="kpi-lbl">Finales Pendientes ("Mochila")</div><div class="kpi-sub">${cantidadMochila === 0 ? 'Sin finales pendientes registrados.' : (cantidadMochila === 1 ? '1 final pendiente por rendir.' : cantidadMochila + ' finales pendientes por rendir.')}</div></div>
      <div class="kpi-card k-blue"><div class="kpi-val" style="color:var(--blue);font-size:30px;">${promCalculado}</div><div class="kpi-lbl">Promedio Ponderado</div><div class="kpi-sub">${aprobadasConNota.length} aprobadas con calificación numérica.</div></div>
      <div class="kpi-card k-pink"><div class="kpi-val" style="color:var(--pink);font-size:30px;">${faltantesAdusi.length}</div><div class="kpi-lbl">Para Título Intermedio</div><div class="kpi-sub">${faltantesAdusi.length === 0 ? 'Completado' : 'Materias pendientes de N1-N3.'}</div></div>
    </div>

    <!-- DISTRIBUCIÓN REAL POR NIVEL -->
    <div class="sec">📊 Distribución Real por Nivel</div>
    <div class="kpi-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin-bottom:24px;">
      <div class="kpi-card"><div class="kpi-val" style="color:var(--blue);font-size:26px;">${n1Aprob}/8</div><div class="kpi-lbl">Nivel 1</div><div class="prog-bar-bg" style="margin-top:6px;"><div class="prog-bar-fill" style="width:${Math.round((n1Aprob/8)*100)}%;background:var(--blue)"></div></div></div>
      <div class="kpi-card"><div class="kpi-val" style="color:var(--blue);font-size:26px;">${n2Aprob}/8</div><div class="kpi-lbl">Nivel 2</div><div class="prog-bar-bg" style="margin-top:6px;"><div class="prog-bar-fill" style="width:${Math.round((n2Aprob/8)*100)}%;background:var(--blue)"></div></div></div>
      <div class="kpi-card"><div class="kpi-val" style="color:var(--blue);font-size:26px;">${n3Aprob}/8</div><div class="kpi-lbl">Nivel 3</div><div class="prog-bar-bg" style="margin-top:6px;"><div class="prog-bar-fill" style="width:${Math.round((n3Aprob/8)*100)}%;background:var(--blue)"></div></div></div>
      <div class="kpi-card"><div class="kpi-val" style="color:var(--blue);font-size:26px;">${n4Aprob}/6</div><div class="kpi-lbl">Nivel 4</div><div class="prog-bar-bg" style="margin-top:6px;"><div class="prog-bar-fill" style="width:${Math.round((n4Aprob/6)*100)}%;background:var(--blue)"></div></div></div>
      <div class="kpi-card"><div class="kpi-val" style="color:var(--blue);font-size:26px;">${n5Aprob}/6</div><div class="kpi-lbl">Nivel 5</div><div class="prog-bar-bg" style="margin-top:6px;"><div class="prog-bar-fill" style="width:${Math.round((n5Aprob/6)*100)}%;background:var(--blue)"></div></div></div>
    </div>

    <!-- NOTAS SOBRESALIENTES -->
    <div class="sec">🏆 Notas Sobresalientes (${sobresalientes.length})</div>
    ${sobresalientes.length === 0 ? '<div style="color:var(--muted);font-size:13px;margin-bottom:20px;">Sin materias sobresalientes (nota ≥ 9) registradas aún.</div>' : `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-bottom:24px;">
        ${sobresalientes.map(s => `
          <div style="background:var(--s2);border:1px solid rgba(34,211,164,.25);border-radius:10px;padding:12px 14px;">
            <div style="font-size:10px;color:var(--green);font-weight:800;margin-bottom:4px;text-transform:uppercase;">🏆 ${s.nota} · ${s.modalidad || 'Aprobada'}</div>
            <div style="font-size:13px;font-weight:700;">${s.nombre}</div>
            <div style="font-size:11px;color:var(--muted);font-family:'JetBrains Mono',monospace;margin-top:2px;">${s.fechaAprobacion || 'Aprobada'}</div>
          </div>
        `).join('')}
      </div>
    `}
  `);
}
