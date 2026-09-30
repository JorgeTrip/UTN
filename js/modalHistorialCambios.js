/**
 * Modal Extendido de Historial de Cambios (Changelog)
 * Consume data/changelog.json, ofrece skeleton loader, búsqueda en tiempo real e insignias.
 */

let datosChangelogGlobal = [];

function asegurarModalHistorialEnDOM() {
  if (document.getElementById('modalHistorialCambios')) return;

  const html = `
    <div class="modal-overlay" id="modalHistorialCambios" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); z-index:9999; align-items:center; justify-content:center;">
      <div class="modal-card" style="background:#1C1C1E; border:1px solid #3A3A3C; border-radius:18px; width:94%; max-width:680px; max-height:85vh; display:flex; flex-direction:column; padding:22px; box-shadow:0 24px 50px rgba(0,0,0,0.6); color:#F5F5F7;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid #2C2C2E; padding-bottom:12px;">
          <div>
            <h3 style="margin:0; font-size:1.15rem; font-weight:600; color:#FFFFFF;">📜 Historial de Cambios</h3>
            <p style="margin:2px 0 0 0; font-size:0.8rem; color:#8E8E93;">Evolución y actualizaciones continuas de la plataforma</p>
          </div>
          <button class="modal-close" onclick="cerrarModalHistorialCambios()" style="background:transparent; border:none; color:#8E8E93; font-size:22px; cursor:pointer; padding:4px 8px;">&times;</button>
        </div>

        <div style="margin-bottom:14px;">
          <input type="text" id="inputBuscadorChangelog" placeholder="🔍 Buscar por funcionalidad, corrección o palabra clave..." oninput="filtrarChangelog(this.value)" style="width:100%; box-sizing:border-box; background:#252528; border:1px solid #3A3A3C; border-radius:10px; padding:10px 14px; font-size:0.85rem; color:#F5F5F7; outline:none;" />
        </div>

        <div id="listaChangelog" style="flex:1; overflow-y:auto; padding-right:6px; display:flex; flex-direction:column; gap:12px;"></div>

        <div style="margin-top:14px; pt:10px; border-top:1px solid #2C2C2E; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; color:#636366;" id="txtTotalCommitsChangelog">Sincronizado con CI/CD</span>
          <button class="btn-sec" onclick="cerrarModalHistorialCambios()" style="padding:6px 14px; font-size:0.8rem; border-radius:8px; background:#2C2C2E; color:#A1A1A6; border:1px solid #3A3A3C; cursor:pointer;">Cerrar</button>
        </div>

      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

function mostrarSkeletonChangelog() {
  const contenedor = document.getElementById('listaChangelog');
  if (!contenedor) return;
  contenedor.replaceChildren();

  for (let i = 0; i < 3; i++) {
    const skeleton = document.createElement('div');
    skeleton.style.cssText = 'background:#252528; border-radius:10px; padding:14px; border:1px solid #323236; opacity:0.6;';
    skeleton.textContent = '⏳ Cargando historial de cambios...';
    contenedor.appendChild(skeleton);
  }
}

async function cargarHistorialChangelog() {
  mostrarSkeletonChangelog();
  try {
    const res = await fetch('data/changelog.json');
    if (res.ok) {
      datosChangelogGlobal = await res.json();
    } else {
      datosChangelogGlobal = generarFallbackChangelog();
    }
  } catch (e) {
    datosChangelogGlobal = generarFallbackChangelog();
  }
  renderizarListaChangelog(datosChangelogGlobal);
}

function generarFallbackChangelog() {
  return [
    {
      version: 'v1.27.0',
      fecha: '2026-09-30',
      cambios: [
        { tipo: 'feat', insignia: '🚀 Nueva Funcionalidad', mensaje: 'Se implementa cliente Gemini resiliente y separación de módulos', hash: 'a2fa840' },
        { tipo: 'fix', insignia: '🔧 Corrección', mensaje: 'Se sanitiza manipulación de DOM para cumplimiento de seguridad SAST', hash: 'b4c102a' }
      ]
    }
  ];
}

function renderizarListaChangelog(versiones) {
  const contenedor = document.getElementById('listaChangelog');
  if (!contenedor) return;
  contenedor.replaceChildren();

  if (!versiones || versiones.length === 0) {
    const vacio = document.createElement('div');
    vacio.style.cssText = 'text-align:center; padding:20px; color:#8E8E93; font-size:0.85rem;';
    vacio.textContent = 'No se encontraron cambios coincidentes.';
    contenedor.appendChild(vacio);
    return;
  }

  versiones.forEach(v => {
    const bloqueVer = document.createElement('div');
    bloqueVer.style.cssText = 'background:#252528; border-radius:12px; padding:14px; border:1px solid #323236; margin-bottom:4px;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #2C2C2E; padding-bottom:6px;';

    const tagVer = document.createElement('span');
    tagVer.style.cssText = 'font-weight:700; font-size:0.9rem; color:#0A84FF; font-family:"JetBrains Mono",monospace;';
    tagVer.textContent = v.version;

    const fecha = document.createElement('span');
    fecha.style.cssText = 'font-size:0.75rem; color:#8E8E93;';
    fecha.textContent = v.fecha || '';

    header.appendChild(tagVer);
    header.appendChild(fecha);
    bloqueVer.appendChild(header);

    const lista = document.createElement('div');
    lista.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

    (v.cambios || []).forEach(c => {
      const fila = document.createElement('div');
      fila.style.cssText = 'display:flex; align-items:flex-start; gap:8px; font-size:0.8rem; line-height:1.4;';

      const badge = document.createElement('span');
      badge.style.cssText = 'font-size:0.7rem; font-weight:600; padding:2px 6px; border-radius:6px; white-space:nowrap;';
      if (c.tipo === 'feat') {
        badge.style.background = 'rgba(10,132,255,0.15)';
        badge.style.color = '#0A84FF';
      } else if (c.tipo === 'fix') {
        badge.style.background = 'rgba(52,199,89,0.15)';
        badge.style.color = '#34C759';
      } else if (c.tipo === 'breaking') {
        badge.style.background = 'rgba(255,69,58,0.15)';
        badge.style.color = '#FF453A';
      } else {
        badge.style.background = 'rgba(142,142,147,0.15)';
        badge.style.color = '#8E8E93';
      }
      badge.textContent = c.insignia || c.tipo;

      const txt = document.createElement('span');
      txt.style.cssText = 'flex:1; color:#E5E5EA;';
      txt.textContent = c.mensaje;

      const hash = document.createElement('span');
      hash.style.cssText = 'font-family:"JetBrains Mono",monospace; font-size:0.7rem; color:#636366;';
      hash.textContent = c.hash || '';

      fila.appendChild(badge);
      fila.appendChild(txt);
      if (c.hash) fila.appendChild(hash);
      lista.appendChild(fila);
    });

    bloqueVer.appendChild(lista);
    contenedor.appendChild(bloqueVer);
  });
}

function filtrarChangelog(termino) {
  const query = (termino || '').toLowerCase().trim();
  if (!query) {
    renderizarListaChangelog(datosChangelogGlobal);
    return;
  }

  const filtrados = datosChangelogGlobal.map(v => {
    const cambiosCoincidentes = (v.cambios || []).filter(c => 
      c.mensaje.toLowerCase().includes(query) ||
      (c.insignia && c.insignia.toLowerCase().includes(query)) ||
      (c.hash && c.hash.toLowerCase().includes(query))
    );
    return { ...v, cambios: cambiosCoincidentes };
  }).filter(v => v.cambios.length > 0);

  renderizarListaChangelog(filtrados);
}

function abrirModalHistorialCambios() {
  asegurarModalHistorialEnDOM();
  const modal = document.getElementById('modalHistorialCambios');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('active');
  }
  cargarHistorialChangelog();
}

function cerrarModalHistorialCambios() {
  const modal = document.getElementById('modalHistorialCambios');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
  }
}

window.abrirModalHistorialCambios = abrirModalHistorialCambios;
window.cerrarModalHistorialCambios = cerrarModalHistorialCambios;
window.filtrarChangelog = filtrarChangelog;
