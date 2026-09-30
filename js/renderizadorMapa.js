/**
 * Módulo Renderizador del Mapa Curricular (Super Panel 1 Sub Panel 1)
 * Renderiza la grilla del Plan K23 con barra de herramientas, badges estandarizados y desglose académico.
 */

const CAT_MATERIAS_K23 = [
  { nivel: 1, id: '232001', nombre: 'Análisis Matemático I', adusi: true },
  { nivel: 1, id: '232002', nombre: 'Álgebra y Geometría Analítica', adusi: true },
  { nivel: 1, id: '232003', nombre: 'Física I', adusi: true },
  { nivel: 1, id: '232004', nombre: 'Inglés I', adusi: true },
  { nivel: 1, id: '232010', nombre: 'Lógica y Estructuras Discretas', adusi: true },
  { nivel: 1, id: '082021', nombre: 'Algoritmos y Estructuras de Datos', adusi: true },
  { nivel: 1, id: '082022', nombre: 'Arquitectura de Computadoras', adusi: true },
  { nivel: 1, id: '232011', nombre: 'Sistemas y Procesos de Negocio', adusi: true },

  { nivel: 2, id: '232009', nombre: 'Análisis Matemático II', adusi: true },
  { nivel: 2, id: '232010_f2', nombre: 'Física II', adusi: true },
  { nivel: 2, id: '232011_is', nombre: 'Ingeniería y Sociedad', adusi: true },
  { nivel: 2, id: '232012', nombre: 'Inglés II', adusi: true },
  { nivel: 2, id: '082025', nombre: 'Sintaxis y Semántica de Lenguajes', adusi: true },
  { nivel: 2, id: '082026', nombre: 'Paradigmas de Programación', adusi: true },
  { nivel: 2, id: '082027', nombre: 'Sistemas Operativos', adusi: true },
  { nivel: 2, id: '082024', nombre: 'Análisis de Sistemas de Info.', adusi: true },

  { nivel: 3, id: '232017', nombre: 'Probabilidad y Estadística', adusi: true },
  { nivel: 3, id: '232018', nombre: 'Economía', adusi: true },
  { nivel: 3, id: '232030', nombre: 'Bases de Datos', adusi: true },
  { nivel: 3, id: '232020', nombre: 'Desarrollo de Software', adusi: true },
  { nivel: 3, id: '232032', nombre: 'Comunicación de Datos', adusi: true },
  { nivel: 3, id: '232033', nombre: 'Análisis Numérico', adusi: true },
  { nivel: 3, id: '232034', nombre: 'Diseño de Sistemas de Info.', adusi: true },
  { nivel: 3, id: '082099', nombre: 'Seminario de Integración', adusi: true },

  { nivel: 4, id: '232045', nombre: 'Adm. Sistemas de Información', adusi: false },
  { nivel: 4, id: '232042', nombre: 'Legislación', adusi: false },
  { nivel: 4, id: '232043', nombre: 'Ingeniería y Calidad de Software', adusi: false },
  { nivel: 4, id: '232044', nombre: 'Tecnologías Automatización', adusi: false },
  { nivel: 4, id: '232041', nombre: 'Redes de Datos', adusi: false },
  { nivel: 4, id: '232040', nombre: 'Simulación', adusi: false },

  { nivel: 5, id: '232051', nombre: 'Inteligencia Artificial', adusi: false },
  { nivel: 5, id: '232052', nombre: 'Ciencia de Datos', adusi: false },
  { nivel: 5, id: '232053', nombre: 'Sistemas de Gestión', adusi: false },
  { nivel: 5, id: '232054', nombre: 'Gestión Gerencial', adusi: false },
  { nivel: 5, id: '232055', nombre: 'Seguridad en los Sistemas', adusi: false },
  { nivel: 5, id: '082037', nombre: 'Proyecto Final', adusi: false }
];

function obtenerInsigniasMateria(mat) {
  if (!mat) return { claseEstado: 's-pe', insigniaNota: '<span class="acc-grade ag-muted">–</span>', badgeEstado: '<span class="acc-badge ab-pend">Pendiente</span>' };
  if (mat.estado === 'equivalencia' || (mat.modalidad && mat.modalidad.startsWith('equivalencia') && mat.nota === null)) {
    return {
      claseEstado: 's-ap', insigniaNota: '<span class="acc-grade" style="font-size:11.5px;font-weight:700;color:#c084fc;border-color:rgba(168,85,247,.4);">EQ</span>',
      badgeEstado: '<span class="acc-badge" style="background:rgba(168,85,247,.15);color:#c084fc;border:1px solid rgba(168,85,247,.3);">🔄 Equivalencia Carrera</span>'
    };
  }
  if (mat.estado === 'firmada') {
    return { claseEstado: 's-pl', insigniaNota: '<span class="acc-grade ag-blue">✍️</span>', badgeEstado: '<span class="acc-badge ab-plan">✍️ Cursada Firmada</span>' };
  }
  if (mat.estado === 'recursa') {
    return { claseEstado: 's-pe', insigniaNota: '<span class="acc-grade" style="color:var(--accent);border-color:rgba(244,63,94,.4);">❌</span>', badgeEstado: '<span class="acc-badge ab-pend" style="color:var(--accent);border-color:rgba(244,63,94,.4);">❌ A Recursar</span>' };
  }
  if (mat.estado === 'en_curso') {
    return { claseEstado: 's-pl', insigniaNota: '<span class="acc-grade ag-blue">⏳</span>', badgeEstado: '<span class="acc-badge ab-plan">⏳ En Curso</span>' };
  }

  const esK08 = mat.origenPlan === 'K08_homologada' || Boolean(mat.materiaOrigenK08);
  const esPromo = mat.modalidad === 'promocion';
  const txtBadge = esK08 ? '🔄 Homologación K08' : (esPromo ? '🏆 Promoción Directa' : '🎯 Examen Final');
  return {
    claseEstado: 's-ap', insigniaNota: `<span class="acc-grade ag-green">${mat.nota !== undefined && mat.nota !== null ? mat.nota : '✓'}</span>`,
    badgeEstado: `<span class="acc-badge ab-promo">${txtBadge}</span>`
  };
}

function renderizarTarjetaMateria(matPlan, aprobadas, enCurso) {
  const mat = aprobadas.find(m => m.id === matPlan.id) || enCurso.find(m => m.id === matPlan.id);
  const { claseEstado, insigniaNota, badgeEstado } = obtenerInsigniasMateria(mat);
  const filasInfoHtml = window.formatearCuerpoTarjetaMateria ? window.formatearCuerpoTarjetaMateria(mat) : '';

  return `
    <div class="acc-card ${claseEstado}" onclick="toggleAcc(this)">
      <div class="acc-header">
        <span class="acc-chevron">▶</span>
        <div style="flex:1">
          <div class="acc-name">${matPlan.nombre} <span class="badge-plan-k23">K23</span> ${matPlan.adusi ? '🎓' : ''}</div>
          <div class="acc-badges">${badgeEstado}</div>
        </div>
        ${insigniaNota}
      </div>
      <div class="acc-body">
        ${filasInfoHtml}
        <div class="acc-row" style="border:none;justify-content:flex-end;margin-top:6px;">
          <button class="btn-sec" style="padding:3px 8px;font-size:11px;" onclick="abrirModalEditarMateria('${matPlan.id}', event)">✏️ Editar</button>
        </div>
      </div>
    </div>
  `;
}

function renderizarMapaCurricular() {
  const contenedor = document.getElementById('sp1p1');
  if (!contenedor) return;
  const datos = window.datosGlobales?.datosAlumno || {};
  const aprobadas = datos.materiasAprobadas || [];
  const enCurso = datos.materiasEnCurso || [];

  const niveles = [1, 2, 3, 4, 5];
  const columnasHtml = niveles.map(n => {
    const matsNivel = CAT_MATERIAS_K23.filter(m => m.nivel === n);
    const cantAprob = matsNivel.filter(m => aprobadas.some(a => a.id === m.id)).length;
    return `
      <div class="map-col">
        <div class="map-lvl">Nivel ${n} · ${cantAprob}/${matsNivel.length} ${cantAprob === matsNivel.length && cantAprob > 0 ? '🎓' : ''}</div>
        ${matsNivel.map(m => renderizarTarjetaMateria(m, aprobadas, enCurso)).join('')}
        ${n === 3 || n === 4 ? '<button class="btn-sec" style="width:100%;margin-top:10px;padding:6px;font-size:11.5px;border:1px dashed var(--yellow);color:var(--yellow);" onclick="abrirModalElectiva(3)">➕ Agregar Electiva (Bloque 3.º/4.º)</button>' : ''}
        ${n === 5 ? '<button class="btn-sec" style="width:100%;margin-top:10px;padding:6px;font-size:11.5px;border:1px dashed var(--yellow);color:var(--yellow);" onclick="abrirModalElectiva(5)">➕ Agregar Electiva (Bloque 5.º Nivel)</button>' : ''}
      </div>
    `;
  }).join('');

  contenedor.replaceChildren();
  contenedor.insertAdjacentHTML('beforeend', `
    <div class="map-toolbar" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;background:var(--s2);border:1px solid var(--border);border-radius:10px;padding:12px 16px;">
      <div style="display:flex;flex-direction:column;gap:3px;">
        <div style="font-weight:800;font-size:14px;color:var(--text);display:flex;align-items:center;gap:8px;">
          <span>🗺️ Mapa Curricular K23:</span>
          <span class="acc-badge ab-promo" style="font-size:10px;">${aprobadas.length} Aprobadas</span>
          <span class="acc-badge ab-plan" style="font-size:10px;">${enCurso.length} En Curso / Firmadas</span>
        </div>
        <div style="font-size:12px;color:var(--muted);">
          Hacé clic en cualquier tarjeta para ver actas, parciales y origen K08 o presioná <strong>✏️ Editar</strong>.
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <button type="button" class="btn-prim" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;padding:8px 14px;background:var(--blue);color:#0f172a;border-radius:6px;cursor:pointer;border:none;box-shadow:0 2px 8px rgba(56,189,248,.25);" onclick="abrirModalImportadorSIU()">
          <span>📥</span> Importar SIU
        </button>
        <button type="button" class="btn-sec" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:8px 12px;color:var(--accent);border:1px solid rgba(244,63,94,.4);background:rgba(244,63,94,.08);border-radius:6px;cursor:pointer;" onclick="abrirModalConfirmacionReinicio()">
          <span>🗑️</span> Vaciar Mapa
        </button>
      </div>
    </div>
    <div class="map-wrap"><div class="map-grid">${columnasHtml}</div></div>
  `);
}

window.renderizarMapaCurricular = renderizarMapaCurricular;
