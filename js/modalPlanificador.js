/**
 * Módulo Controlador del Modal para Ubicar Materias en el Planificador
 * Formulario dinámico filtrado excluyendo aprobadas, firmadas e ya ubicadas en la alternativa activa.
 */

let contextUbicarMateria = { anio: '2026', cuatrimestre: '2c', alternativa: 0 };

/**
 * Abre la ventana modal para agendar y ubicar una asignatura en el planificador semanal.
 * @param {string|number} anio - Ciclo lectivo.
 * @param {string} cuatrimestre - '1c' o '2c'.
 * @param {number} alternativa - Índice de alternativa activa.
 * @param {number} [diaPredefinido=0] - Día de la semana (0: Lunes a 5: Sábado).
 */
function abrirModalUbicarMateria(anio, cuatrimestre, alternativa, diaPredefinido = 0) {
  contextUbicarMateria = { anio: String(anio), cuatrimestre: String(cuatrimestre), alternativa: Number(alternativa) };
  let overlay = document.getElementById('modalUbicarMateria');
  if (!overlay) { crearEstructuraModalUbicarMateria(); overlay = document.getElementById('modalUbicarMateria'); }
  poblarSelectMateriasDisponibles();
  document.getElementById('planAnioCuatriTxt').textContent = `${anio} · ${cuatrimestre.toUpperCase()} (Alt ${alternativa + 1})`;
  document.getElementById('planSelectDia').value = diaPredefinido;
  document.getElementById('planInputComision').value = '';
  document.getElementById('planCheckAnual').checked = false;
  document.getElementById('planCheckCampus').checked = false;
  overlay.classList.add('open');
}

/** Cierra la ventana modal de ubicación de materias. */
function cerrarModalUbicarMateria() {
  const overlay = document.getElementById('modalUbicarMateria');
  if (overlay) overlay.classList.remove('open');
}

/** Obtiene metadatos de nivel, anualidad e impacto correlativo a partir del nombre de la materia. */
function obtenerMetadataMateria(nombre) {
  const n = nombre.toLowerCase().trim();
  let nivel = 4, esAnual = false, impacto = 0;
  if (n.includes('análisis matemático i') || n.includes('álgebra') || n.includes('física i') || n.includes('inglés i') || n.includes('lógica') || n.includes('algoritmos') || n.includes('arquitectura de comp') || n.includes('sistemas y procesos')) {
    nivel = 1; if (n.includes('algoritmos') || n.includes('sistemas y procesos')) impacto = 10;
  } else if (n.includes('análisis matemático ii') || n.includes('física ii') || n.includes('ingeniería y sociedad') || n.includes('inglés ii') || n.includes('sintaxis') || n.includes('paradigmas') || n.includes('sistemas operativos') || n.includes('análisis de sistemas')) {
    nivel = 2; if (n.includes('análisis de sistemas') || n.includes('paradigmas') || n.includes('sistemas operativos')) impacto = 10;
  } else if (n.includes('probabilidad') || n.includes('economía') || n.includes('bases de datos') || n.includes('desarrollo de software') || n.includes('comunicación de datos') || n.includes('análisis numérico') || n.includes('diseño de sistemas') || n.includes('seminario')) {
    nivel = 3; if (n.includes('diseño de sistemas') || n.includes('comunicación de datos') || n.includes('bases de datos')) impacto = 9;
  } else if (n.includes('administración de sistemas') || n.includes('investigación operativa') || n.includes('simulación') || n.includes('calidad') || n.includes('automatización') || n.includes('redes') || n.includes('legislación')) {
    nivel = 4;
    if (n.includes('administración de sistemas')) esAnual = true;
    if (n.includes('investigación operativa')) impacto = 8;
    if (n.includes('calidad')) impacto = 7;
    if (n.includes('legislación')) impacto = 6;
    if (n.includes('redes')) impacto = 5;
    if (n.includes('simulación')) impacto = 4;
  } else if (n.includes('proyecto final') || n.includes('inteligencia artificial') || n.includes('ciencia de datos') || n.includes('sistemas de gestión') || n.includes('gestión gerencial') || n.includes('seguridad')) {
    nivel = 5;
    if (n.includes('proyecto final')) esAnual = true;
    if (n.includes('inteligencia artificial')) impacto = 5;
  }
  return { nivel, esAnual, impacto };
}

/** Filtra y carga en el select desplegable solo las materias no aprobadas ni ubicadas previamente. */
function poblarSelectMateriasDisponibles() {
  const select = document.getElementById('planSelectMateria');
  if (!select) return;
  select.replaceChildren();
  const datos = window.datosGlobales?.datosAlumno || {};
  const aprobadas = (datos.materiasAprobadas || []).map(m => (m.nombre || '').toLowerCase().trim());
  const enCurso = datos.materiasEnCurso || [];
  const firmadas = [...(datos.materiasAprobadas || []), ...enCurso]
    .filter(m => m.estado === 'firmada' || m.modalidad === 'final_pendiente')
    .map(m => (m.nombre || '').toLowerCase().trim());

  const plan = window.datosGlobales?.planEstudio || {};
  const eventosActuales = (typeof obtenerEventosPlanificacion === 'function') ? obtenerEventosPlanificacion(contextUbicarMateria.anio, contextUbicarMateria.cuatrimestre, contextUbicarMateria.alternativa) : [];
  const nombresUbicados = eventosActuales.map(e => (e.name || '').toLowerCase().trim());

  const estaDescartada = (n) => {
    const norm = n.toLowerCase().trim();
    return aprobadas.some(ap => ap === norm || ap.includes(norm) || norm.includes(ap)) ||
           firmadas.some(f => f === norm || f.includes(norm) || norm.includes(f)) ||
           nombresUbicados.some(ub => ub === norm || ub.includes(norm) || norm.includes(ub));
  };

  const candidatos = [];
  if (plan.tabla_equivalencias_oficial_ord_1878) {
    plan.tabla_equivalencias_oficial_ord_1878.forEach(m => {
      if (m.plan_2023 && !m.plan_2023.includes('(Nueva en K23)') && !estaDescartada(m.plan_2023) && !candidatos.some(x => x.nombre === m.plan_2023)) {
        candidatos.push({ nombre: m.plan_2023, url: plan.paginas_asociadas_materias?.[m.id]?.url, esElectiva: false });
      }
    });
  }
  if (plan.materias_electivas) {
    plan.materias_electivas.forEach(e => {
      if (e.nombre && !estaDescartada(e.nombre) && !candidatos.some(x => x.nombre === e.nombre)) {
        candidatos.push({ nombre: e.nombre, url: null, esElectiva: true });
      }
    });
  }

  candidatos.sort((a, b) => {
    const dA = obtenerMetadataMateria(a.nombre), dB = obtenerMetadataMateria(b.nombre);
    if (dA.nivel !== dB.nivel) return dA.nivel - dB.nivel;
    if (dA.esAnual !== dB.esAnual) return dA.esAnual ? -1 : 1;
    if (dA.impacto !== dB.impacto) return dB.impacto - dA.impacto;
    if (a.esElectiva !== b.esElectiva) return a.esElectiva ? 1 : -1;
    return a.nombre.localeCompare(b.nombre);
  });

  if (candidatos.length === 0) {
    const opt = document.createElement('option');
    opt.textContent = '🎉 ¡Todas las materias de esta alternativa están ubicadas, firmadas u aprobadas!';
    opt.disabled = true; select.appendChild(opt); return;
  }

  candidatos.forEach(mat => {
    const opt = document.createElement('option');
    opt.value = mat.nombre;
    const meta = obtenerMetadataMateria(mat.nombre);
    let tag = `[NIVEL ${meta.nivel}]`;
    if (meta.esAnual) tag = `⭐ [NIVEL ${meta.nivel} · ANUAL]`;
    else if (meta.impacto > 5) tag = `🔥 [NIVEL ${meta.nivel} · ALTA PRIORIDAD]`;
    else if (mat.esElectiva) tag = `🔹 [NIVEL ${meta.nivel} · ELECTIVA]`;
    opt.textContent = `${tag} ${mat.nombre}`;
    if (mat.url) opt.dataset.url = mat.url;
    select.appendChild(opt);
  });
}

/** Guarda la materia en la alternativa del planificador y refresca la vista semanal. */
function guardarMateriaPlanificador() {
  const selectMat = document.getElementById('planSelectMateria');
  const nombreMateria = selectMat.value;
  if (!nombreMateria || selectMat.options[selectMat.selectedIndex]?.disabled) return;
  const urlMateria = selectMat.options[selectMat.selectedIndex]?.dataset?.url || '';
  const dia = parseInt(document.getElementById('planSelectDia').value, 10);
  const [h1, m1] = (document.getElementById('planInputHoraInicio').value || '18:15').split(':').map(Number);
  const [h2, m2] = (document.getElementById('planInputHoraFin').value || '23:00').split(':').map(Number);

  const nuevoEvento = {
    id: 'ev_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    day: dia, cls: obtenerClaseCssMateria(nombreMateria), name: nombreMateria,
    h1: h1, m1: m1, h2: h2, m2: m2, k: document.getElementById('planInputComision').value.trim() || 'K23',
    url: urlMateria || null, anual: document.getElementById('planCheckAnual').checked,
    campus: document.getElementById('planCheckCampus').checked, plan: 'K23'
  };

  agregarEventoPlanificador(contextUbicarMateria.anio, contextUbicarMateria.cuatrimestre, contextUbicarMateria.alternativa, nuevoEvento);
  cerrarModalUbicarMateria();
}

/** Devuelve la clase semántica CSS asociada al color temático de la materia. */
function obtenerClaseCssMateria(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes('administración de sistemas')) return 'asi';
  if (n.includes('investigación operativa')) return 'io';
  if (n.includes('legislación')) return 'leg';
  if (n.includes('calidad')) return 'ics';
  if (n.includes('automatización')) return 'ta';
  if (n.includes('seminario')) return 'si';
  if (n.includes('comunicación de datos')) return 'cd';
  if (n.includes('redes')) return 'rd';
  if (n.includes('simulación')) return 'sim';
  if (n.includes('inteligencia artificial')) return 'ai';
  if (n.includes('ciencia de datos')) return 'cdat';
  if (n.includes('seguridad')) return 'seg';
  if (n.includes('sistemas de gestión')) return 'sge';
  if (n.includes('gestión gerencial')) return 'gge';
  if (n.includes('proyecto final')) return 'pf';
  if (n.includes('criptografía')) return 'cri';
  if (n.includes('ux') || n.includes('accesibilidad')) return 'iot';
  return 'si';
}

/** Crea dinámicamente la estructura del formulario modal de ubicación de materias si no existe. */
function crearEstructuraModalUbicarMateria() {
  const modalHTML = `<div class="modal-overlay" id="modalUbicarMateria"><div class="modal-card" style="max-width:540px;"><div class="modal-header"><div class="modal-title">📌 Ubicar Materia (<span id="planAnioCuatriTxt" style="color:var(--blue)">2026 · 2C</span>)</div><button class="modal-close" onclick="cerrarModalUbicarMateria()">&times;</button></div><div class="modal-body"><div class="form-group" style="margin-bottom:14px;"><label class="form-label">Asignatura Disponible (Por Nivel, Anuales e Impacto)</label><select id="planSelectMateria" class="form-input"></select></div><div class="form-grid" style="grid-template-columns:1fr 1fr;gap:12px;"><div class="form-group"><label class="form-label">Día de Cursada</label><select id="planSelectDia" class="form-input"><option value="0">Lunes</option><option value="1">Martes</option><option value="2">Miércoles</option><option value="3">Jueves</option><option value="4">Viernes</option><option value="5">Sábado</option></select></div><div class="form-group"><label class="form-label">Comisión / Sede</label><input type="text" id="planInputComision" class="form-input" placeholder="Ej: K4051 · Medrano"></div><div class="form-group"><label class="form-label">Hora Inicio</label><input type="time" id="planInputHoraInicio" class="form-input" value="18:15"></div><div class="form-group"><label class="form-label">Hora Fin</label><input type="time" id="planInputHoraFin" class="form-input" value="23:00"></div></div><div style="display:flex;gap:16px;margin-top:14px;"><label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;"><input type="checkbox" id="planCheckAnual"> Cursada Anual</label><label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;"><input type="checkbox" id="planCheckCampus"> Sede Campus</label></div></div><div class="modal-footer"><button class="btn-sec" onclick="cerrarModalUbicarMateria()">Cancelar</button><button class="btn-prim" onclick="guardarMateriaPlanificador()">📌 Ubicar Materia</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}
