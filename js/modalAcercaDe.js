/**
 * Modal "Acerca de" de la Aplicación
 * Muestra información institucional, autoría de Jorge, copyright © 2026 y versión dinámica.
 */

function asegurarModalAcercaDeEnDOM() {
  if (document.getElementById('modalAcercaDe')) return;

  const html = `
    <div class="modal-overlay" id="modalAcercaDe" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); z-index:9999; align-items:center; justify-content:center;">
      <div class="modal-card" style="background:#1C1C1E; border:1px solid #3A3A3C; border-radius:18px; width:92%; max-width:460px; padding:24px; box-shadow:0 24px 48px rgba(0,0,0,0.6); color:#F5F5F7; text-align:center;">
        
        <div style="display:flex; justify-content:flex-end; margin-bottom:-10px;">
          <button class="modal-close" onclick="cerrarModalAcercaDe()" style="background:transparent; border:none; color:#8E8E93; font-size:22px; cursor:pointer; padding:4px 8px;">&times;</button>
        </div>

        <div style="width:64px; height:64px; margin:0 auto 14px auto; border-radius:50%; background:linear-gradient(135deg, #0A84FF, #5E5CE6); display:flex; align-items:center; justify-content:center; font-size:30px; box-shadow:0 8px 20px rgba(10,132,255,0.35);">
          🎓
        </div>

        <h2 style="font-size:1.25rem; font-weight:700; margin:0 0 6px 0; color:#FFFFFF;">Planificador Curricular UTN</h2>
        <div style="display:inline-block; background:rgba(10,132,255,0.15); border:1px solid rgba(10,132,255,0.3); border-radius:12px; padding:2px 10px; font-size:0.75rem; color:#0A84FF; font-weight:600; font-family:'JetBrains Mono',monospace; margin-bottom:14px;" id="badgeVersionApp">
          v1.27.0
        </div>

        <p style="font-size:0.85rem; color:#8E8E93; margin:0 0 16px 0; line-height:1.5;">
          Ingeniería en Sistemas de Información · Plan K23<br>
          Universidad Tecnológica Nacional (FRBA)
        </p>

        <div style="background:#252528; border:1px solid #323236; border-radius:12px; padding:12px 16px; margin-bottom:18px; text-align:left; font-size:0.8rem; line-height:1.6;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:#8E8E93;">Desarrollado por:</span>
            <span style="font-weight:600; color:#F5F5F7;">Jorge</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:#8E8E93;">Copyright:</span>
            <span style="color:#A1A1A6;">© 2026 Jorge</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#8E8E93;">Tecnologías:</span>
            <span style="color:#0A84FF;">Vanilla JS · Gemini IA · Firestore</span>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="btn-prim btn-abrir-historial" onclick="cerrarModalAcercaDe(); abrirModalHistorialCambios();" style="width:100%; padding:10px; font-size:0.85rem; border-radius:10px; background:linear-gradient(135deg, #0A84FF, #0071E3); color:#FFFFFF; border:none; font-weight:600; cursor:pointer;">
            📜 Ver Historial de Cambios
          </button>
          <button class="btn-sec" onclick="cerrarModalAcercaDe()" style="width:100%; padding:8px; font-size:0.8rem; border-radius:10px; background:#2C2C2E; color:#8E8E93; border:1px solid #3A3A3C; cursor:pointer;">
            Cerrar
          </button>
        </div>

      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

async function cargarVersionDinamica() {
  try {
    const res = await fetch('data/version.json');
    if (res.ok) {
      const data = await res.json();
      const badge = document.getElementById('badgeVersionApp');
      if (badge && data.version) {
        badge.textContent = data.version;
      }
    }
  } catch (e) {
    // Mantener fallback predeterminado
  }
}

function abrirModalAcercaDe() {
  asegurarModalAcercaDeEnDOM();
  const modal = document.getElementById('modalAcercaDe');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('active');
  }
  cargarVersionDinamica();
}

function cerrarModalAcercaDe() {
  const modal = document.getElementById('modalAcercaDe');
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
  }
}

window.abrirModalAcercaDe = abrirModalAcercaDe;
window.cerrarModalAcercaDe = cerrarModalAcercaDe;
