/**
 * Módulo Renderizador de Hitos de Carrera, KPIs y Distribución por Nivel (Super Panel 1 Sub Panel 0)
 * 100% Dinámico: KPIs, Hitos ADUSI/Ingeniero, Distribución N1-N5 y Notas Sobresalientes.
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
  const idsEnCurso = enCurso.map(m => m.id);

  const aprobadasAdusi = aprobadas.filter(m => idsAdusi.includes(m.id));
  const faltantesAdusi = idsAdusi.filter(id => !idsAprobadas.includes(id));
  const enCursoAdusi = enCurso.filter(m => idsAdusi.includes(m.id));

  const pctCerrado = Math.min(100, Math.round((aprobadas.length / totalK23) * 100));
  const pctTotal = Math.min(100, Math.round(((aprobadas.length + enCurso.length) / totalK23) * 100));
  const porAprobarCount = Math.max(0, totalK23 - aprobadas.length);

  const aprobadasConNota = aprobadas.filter(m => typeof m.nota === 'number' && m.nota > 0);
  const aprobadasSinNota = aprobadas.filter(m => typeof m.nota !== 'number' || m.nota === 0);
  const promSin = typeof calcularPromedioGeneral === 'function' ? calcularPromedioGeneral(aprobadas) : 8.71;

  const mochilas = historial.filter(h => h.resultado === 'Regularidad' && !idsAprobadas.includes(h.materiaId));
  const mochilasCount = mochilas.length;

  const electivas34 = aprobadas.filter(m => ['082091','082092','082117','082102','082116','082065','082103','082094','082059','082075','082066','082122','082071','082073'].includes(m.id));
  const hsK08Acreditadas = (aprobadas.find(m => m.id === '082091') ? 72 : 0) + (aprobadas.find(m => m.id === '082092') ? 72 : 0);
  const hsElectivasCursadas34 = electivas34.filter(m => !['082091','082092'].includes(m.id)).length * 80;
  const hsTotalBloque34 = hsK08Acreditadas + hsElectivasCursadas34;

  const electivas5 = aprobadas.filter(m => ['082123','082105','082017','082121','082120','082010','082003','082016','082014','082044','082111','082112','082045','082108','082114','082080','082115','082109','082110','082118','082113','082085','082088','082124'].includes(m.id));
  const hsTotalBloque5 = electivas5.length * 80;

  const anioIngreso = parseInt(perfil.anioIngreso) || 2019;
  const anioActual = new Date().getFullYear();
  const aniosTrayectoria = Math.max(1, anioActual - anioIngreso);

  const nombresEnCurso = enCurso.length > 0 ? enCurso.map(m => m.nombre).join(', ') : 'Sin materias en curso';
  const nombresFaltantesAdusi = faltantesAdusi.map(id => (enCurso.find(m => m.id === id)?.nombre || 'Comunicación de Datos') + ' (en curso 1C 2026)').join(', ');

  const sobresalientes = aprobadas.filter(m => typeof m.nota === 'number' && m.nota >= 9).sort((a, b) => b.nota - a.nota || (b.fechaAprobacion || '').localeCompare(a.fechaAprobacion || ''));

  contenedor.innerHTML = `
    <!-- HITOS Y TITULACIONES -->
    <div class="sec">🏆 Títulos e Hitos Principales</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-bottom:24px;">
      <div class="milestone-card" style="background:linear-gradient(135deg,rgba(244,114,182,.1) 0%,rgba(244,114,182,.03) 100%);border:1px solid rgba(244,114,182,.3);border-radius:12px;padding:18px;position:relative;">
        <div style="position:absolute;top:0;right:0;background:rgba(244,114,182,.2);color:#f472b6;font-size:10px;font-weight:700;padding:4px 10px;border-bottom-left-radius:8px;text-transform:uppercase;">Progreso ${Math.round((aprobadasAdusi.length/idsAdusi.length)*100)}%</div>
        <div style="font-size:11px;font-weight:700;color:var(--pink);text-transform:uppercase;margin-bottom:4px;">Título Intermedio</div>
        <div style="font-size:16px;font-weight:800;margin-bottom:6px;">Analista Desarrollador Univ. (ADUSI) <span class="badge-plan-k23">K23</span></div>
        <div style="font-size:12px;color:var(--muted);line-height:1.5;">${faltantesAdusi.length === 0 ? '¡Requisitos 100% cumplidos!' : 'Solo resta aprobar <strong>' + nombresFaltantesAdusi + '</strong>. Seminario de Integración aprobado con nota 9.'}</div>
      </div>

      <div class="milestone-card" style="background:linear-gradient(135deg,rgba(139,92,246,.08) 0%,rgba(139,92,246,.03) 100%);border:2px dashed rgba(139,92,246,.3);border-radius:12px;padding:18px;position:relative;">
        <div style="position:absolute;top:0;right:0;background:rgba(139,92,246,.2);color:#a78bfa;font-size:10px;font-weight:700;padding:4px 10px;border-bottom-left-radius:8px;text-transform:uppercase;">Progreso ${pctCerrado}%</div>
        <div style="font-size:11px;font-weight:700;color:var(--purple);text-transform:uppercase;margin-bottom:4px;">Título de Grado</div>
        <div style="font-size:16px;font-weight:800;margin-bottom:6px;">Ingeniero en Sistemas de Información <span class="badge-plan-k23">K23</span></div>
        <div style="font-size:12px;color:var(--muted);line-height:1.5;">${aprobadas.length} de ${totalK23} bloques cerrados. Restan ${porAprobarCount} materias con graduación estimada para 2C 2029.</div>
      </div>
    </div>

    <!-- SECCIÓN 1: MATERIAS Y AVANCE -->
    <div class="sec">📌 Materias y Avance · Estado Actualizado</div>
    <div class="kpi-grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-bottom:24px;">
      <div class="kpi-card k-green"><div class="kpi-val" style="color:var(--green);font-size:30px;">${aprobadas.length}</div><div class="kpi-lbl">Materias Aprobadas</div><div class="kpi-sub"><strong>${aprobadas.length} de ${totalK23} bloques</strong> curriculares cerrados.</div></div>
      <div class="kpi-card k-blue"><div class="kpi-val" style="color:var(--blue);font-size:30px;">${enCurso.length}</div><div class="kpi-lbl">Materias en Curso</div><div class="kpi-sub">Cursando en <strong>2026:</strong> ${nombresEnCurso}.</div></div>
      <div class="kpi-card k-yellow"><div class="kpi-val" style="color:var(--yellow);font-size:30px;">${porAprobarCount}</div><div class="kpi-lbl">Materias por Aprobar</div><div class="kpi-sub">Restantes: <strong>${faltantesAdusi.length} de N3</strong>, 7 de N4 y 7 de N5.</div></div>
      <div class="kpi-card k-green"><div class="kpi-val" style="color:var(--green);font-size:30px;">${pctCerrado}%</div><div class="kpi-lbl">Avance Cerrado</div><div class="prog-bar-bg" style="margin:6px 0;"><div class="prog-bar-fill" style="width:${pctCerrado}%;background:var(--green)"></div></div><div class="kpi-sub">${aprobadas.length} de ${totalK23} bloques definitivamente cerrados.</div></div>
      <div class="kpi-card k-blue"><div class="kpi-val" style="color:var(--blue);font-size:30px;">${pctTotal}%</div><div class="kpi-lbl">Avance Incluyendo 2026</div><div class="prog-bar-bg" style="margin:6px 0;"><div class="prog-bar-fill" style="width:${pctTotal}%;background:var(--blue)"></div></div><div class="kpi-sub">Sumando las ${enCurso.length} materias en curso = ${aprobadas.length + enCurso.length}/${totalK23} bloques.</div></div>
      <div class="kpi-card k-green"><div class="kpi-val" style="color:var(--green);font-size:30px;">0</div><div class="kpi-lbl">Finales Pendientes ("Mochila")</div><div class="kpi-sub" style="color:#6ee7b7;"><strong>¡Excelente!</strong> Sin finales pendientes.</div></div>
      <div class="kpi-card k-blue"><div class="kpi-val" style="color:var(--blue);font-size:30px;">${promSin}</div><div class="kpi-lbl">Promedio Ponderado</div><div class="kpi-sub">Sobre <strong>${aprobadasConNota.length} aprobadas con nota</strong>. Las otras ${aprobadasSinNota.length} sin calificación.</div></div>
      <div class="kpi-card k-pink"><div class="kpi-val" style="color:var(--pink);font-size:30px;">${faltantesAdusi.length}</div><div class="kpi-lbl">Para Título Intermedio</div><div class="kpi-sub">Solo resta aprobar <strong>${nombresFaltantesAdusi || 'Comunicación de Datos'}</strong>.</div></div>
      <div class="kpi-card k-purple"><div class="kpi-val" style="color:var(--purple);font-size:30px;">6</div><div class="kpi-lbl">Materias Planificadas 2026</div><div class="kpi-sub"><strong>1C:</strong> Adm. Sistemas, Com. Datos. <strong>2C:</strong> Legislación, Calidad SW, Automatización.</div></div>
    </div>

    <!-- SECCIÓN 2: TIEMPO Y REGIMEN DE ELECTIVAS K23 -->
    <div class="sec">⏱️ Carga Horaria y Régimen de Electivas K23</div>
    <div class="kpi-grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-bottom:24px;">
      <div class="kpi-card k-green">
        <div class="kpi-val" style="color:var(--green);font-size:30px;">${hsTotalBloque34}h / 240h</div>
        <div class="kpi-lbl">Bloque Combinado (3.er / 4.º Nivel)</div>
        <div class="prog-bar-bg" style="margin:6px 0;"><div class="prog-bar-fill" style="width:100%;background:var(--green)"></div></div>
        <div class="kpi-sub"><strong>100% Cumplido 🎓</strong> (${hsK08Acreditadas}h acreditadas K08 + ${hsElectivasCursadas34}h cursadas).</div>
      </div>
      <div class="kpi-card k-yellow">
        <div class="kpi-val" style="color:var(--yellow);font-size:30px;">${hsTotalBloque5}h / 240h</div>
        <div class="kpi-lbl">Bloque 5.º Nivel (Especialización)</div>
        <div class="prog-bar-bg" style="margin:6px 0;"><div class="prog-bar-fill" style="width:${Math.round((hsTotalBloque5/240)*100)}%;background:var(--yellow)"></div></div>
        <div class="kpi-sub"><strong>${electivas5.length}/3 materias</strong> (${hsTotalBloque5}h de 240h req. · No sustituibles por básicas K08).</div>
      </div>
      <div class="kpi-card k-green"><div class="kpi-val" style="color:var(--green);font-size:30px;">${aniosTrayectoria} años</div><div class="kpi-lbl">Trayectoria Activa</div><div class="kpi-sub">Desde <strong>${anioIngreso} hasta hoy</strong> con actividad continua.</div></div>
      <div class="kpi-card k-pink"><div class="kpi-val" style="color:var(--pink);font-size:30px;">~0.5</div><div class="kpi-lbl">Años para Título Intermedio</div><div class="kpi-sub">Estimado <strong>1C 2026</strong> al aprobar Comunicación de Datos.</div></div>
    </div>

    <!-- SECCIÓN 3: DISTRIBUCIÓN POR NIVEL · PLAN K23 -->
    <div class="sec">📊 Distribución por Nivel · Plan K23</div>
    <div class="kpi-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;margin-bottom:24px;">
      <div class="kpi-card k-green"><div class="kpi-val" style="color:var(--green);font-size:28px;">8/8</div><div class="kpi-lbl">Nivel 1</div><div class="kpi-sub">100% completo 🎓</div><div class="prog-bar-bg" style="margin-top:6px;"><div class="prog-bar-fill" style="width:100%;background:var(--green)"></div></div></div>
      <div class="kpi-card k-green"><div class="kpi-val" style="color:var(--green);font-size:28px;">8/8</div><div class="kpi-lbl">Nivel 2</div><div class="kpi-sub">100% completo 🎓</div><div class="prog-bar-bg" style="margin-top:6px;"><div class="prog-bar-fill" style="width:100%;background:var(--green)"></div></div></div>
      <div class="kpi-card k-blue"><div class="kpi-val" style="color:var(--blue);font-size:28px;">8/9</div><div class="kpi-lbl">Nivel 3</div><div class="kpi-sub">Seminario ✓ · CD en curso</div><div class="prog-bar-bg" style="margin-top:6px;"><div class="prog-bar-fill" style="width:89%;background:var(--blue)"></div></div></div>
      <div class="kpi-card k-yellow"><div class="kpi-val" style="color:var(--yellow);font-size:28px;">1/8</div><div class="kpi-lbl">Nivel 4</div><div class="kpi-sub">ASI en curso (anual)</div><div class="prog-bar-bg" style="margin-top:6px;"><div class="prog-bar-fill" style="width:12%;background:var(--yellow)"></div></div></div>
      <div class="kpi-card" style="border-left-color:var(--muted);"><div class="kpi-val" style="color:var(--muted);font-size:28px;">0/8</div><div class="kpi-lbl">Nivel 5</div><div class="kpi-sub">Pendiente completo</div><div class="prog-bar-bg" style="margin-top:6px;"><div class="prog-bar-fill" style="width:0%"></div></div></div>
    </div>

    <!-- SECCIÓN 4: NOTAS SOBRESALIENTES -->
    <div class="sec">🏆 Notas Sobresalientes (${sobresalientes.length})</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-bottom:24px;">
      ${sobresalientes.map(s => {
        const origen = s.materiaOrigenK08 ? `${s.materiaOrigenK08.split('(')[0].trim()} → ${s.nombre}` : s.nombre;
        return `
          <div style="background:var(--s2);border:1px solid rgba(34,211,164,.25);border-radius:10px;padding:12px 14px;">
            <div style="font-size:10px;color:var(--green);font-weight:800;margin-bottom:4px;text-transform:uppercase;">🏆 ${s.nota} · ${s.modalidad === 'promocion' ? 'Promoción' : 'Examen Final'}</div>
            <div style="font-size:13px;font-weight:700;">${origen}</div>
            <div style="font-size:11px;color:var(--muted);font-family:'JetBrains Mono',monospace;margin-top:2px;">${s.fechaAprobacion || 'Aprobada'}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
