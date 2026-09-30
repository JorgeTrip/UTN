/**
 * Módulo Renderizador del Mapa Curricular (Super Panel 1 Sub Panel 1)
 * Renderiza dinámicamente la grilla curricular del Plan K23 evaluando en tiempo real
 * las materias aprobadas, en curso o pendientes del estudiante (cero notas hardcodeadas).
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

function renderizarMapaCurricular() {
  const contenedor = document.getElementById('sp1p1');
  if (!contenedor) return;

  const datos = window.datosGlobales?.datosAlumno || {};
  const aprobadas = datos.materiasAprobadas || [];
  const enCurso = datos.materiasEnCurso || [];

  const buscarMateria = (id) => aprobadas.find(m => m.id === id) || enCurso.find(m => m.id === id);

  const renderizarTarjetaMateria = (matPlan) => {
    const mat = buscarMateria(matPlan.id);
    let claseEstado = 's-pe';
    let insigniaNota = '<span class="acc-grade ag-muted">–</span>';
    let badgeEstado = '<span class="acc-badge ab-pend">Pendiente</span>';
    let detalle = 'Sin cursar';

    if (mat) {
      if (mat.estado === 'equivalencia' || mat.modalidad?.startsWith('equivalencia')) {
        claseEstado = 's-ap';
        insigniaNota = '<span class="acc-grade" style="font-size:12px;font-weight:700;color:var(--purple,#a855f7)">EQ</span>';
        badgeEstado = `<span class="acc-badge ab-promo">${mat.modalidad === 'equivalencia_carrera' ? 'Equivalencia Carrera' : 'Homologación K08→K23'}</span>`;
        detalle = mat.materiaOrigenK08 ? `Equivalencia K08: ${mat.materiaOrigenK08}` : (mat.fechaAprobacion || 'Aprobada por Equivalencia');
      } else if (mat.estado === 'firmada') {
        claseEstado = 's-pl';
        insigniaNota = '<span class="acc-grade ag-blue">✍️</span>';
        badgeEstado = '<span class="acc-badge ab-plan">Firmada / Rinde Final</span>';
        detalle = 'Cursada regular aprobada · Rinde final';
      } else if (mat.estado === 'recursa') {
        claseEstado = 's-pe';
        insigniaNota = '<span class="acc-grade" style="color:var(--accent)">❌</span>';
        badgeEstado = '<span class="acc-badge" style="color:var(--accent);border-color:rgba(244,63,94,.3)">A Recursar</span>';
        detalle = 'Desaprobada por cursada regular';
      } else if (mat.estado === 'en_curso') {
        claseEstado = 's-pl';
        insigniaNota = '<span class="acc-grade ag-blue">⏳</span>';
        badgeEstado = '<span class="acc-badge ab-plan">En Curso</span>';
        detalle = mat.cuatrimestre || 'Cursando ciclo actual';
      } else {
        claseEstado = 's-ap';
        const modTexto = mat.modalidad === 'promocion' ? 'Promoción Directa' : (mat.modalidad === 'final' ? 'Examen Final' : 'Aprobada');
        insigniaNota = `<span class="acc-grade ag-green">${mat.nota !== undefined && mat.nota !== null ? mat.nota : '✓'}</span>`;
        badgeEstado = `<span class="acc-badge ab-promo">${modTexto}</span>`;
        detalle = mat.fechaAprobacion ? `Aprobada (${mat.fechaAprobacion})` : 'Aprobada';
      }
    }

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
          <div class="acc-row"><span class="acc-row-lbl">Detalle:</span><span class="acc-row-val">${detalle}</span></div>
          <div class="acc-row" style="border:none;justify-content:flex-end;margin-top:6px;">
            <button class="btn-sec" style="padding:3px 8px;font-size:11px;" onclick="abrirModalEditarMateria('${matPlan.id}', event)">✏️ Editar</button>
          </div>
        </div>
      </div>
    `;
  };

  const niveles = [1, 2, 3, 4, 5];
  const columnasHtml = niveles.map(n => {
    const matsNivel = CAT_MATERIAS_K23.filter(m => m.nivel === n);
    const cantAprob = matsNivel.filter(m => aprobadas.some(a => a.id === m.id)).length;
    return `
      <div class="map-col">
        <div class="map-lvl">Nivel ${n} · ${cantAprob}/${matsNivel.length} ${cantAprob === matsNivel.length && cantAprob > 0 ? '🎓' : ''}</div>
        ${matsNivel.map(renderizarTarjetaMateria).join('')}
        ${n === 3 || n === 4 ? '<button class="btn-sec" style="width:100%;margin-top:10px;padding:6px;font-size:11.5px;border:1px dashed var(--yellow);color:var(--yellow);" onclick="abrirModalElectiva(3)">➕ Agregar Electiva (Bloque 3.º/4.º)</button>' : ''}
        ${n === 5 ? '<button class="btn-sec" style="width:100%;margin-top:10px;padding:6px;font-size:11.5px;border:1px dashed var(--yellow);color:var(--yellow);" onclick="abrirModalElectiva(5)">➕ Agregar Electiva (Bloque 5.º Nivel)</button>' : ''}
      </div>
    `;
  }).join('');

  contenedor.replaceChildren();
  contenedor.insertAdjacentHTML('beforeend', `
    <div class="infobox" style="margin-bottom:16px;">
      <strong>Mapa Curricular K23:</strong> Hacé clic en cualquier tarjeta para ver su desglose o presioná <strong>✏️ Editar</strong> para registrar o modificar notas y cursadas.
    </div>
    <div class="map-wrap"><div class="map-grid">${columnasHtml}</div></div>
  `);
}
