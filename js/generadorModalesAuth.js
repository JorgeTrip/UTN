/**
 * Generador Dinámico de Modales de Autenticación y Configuración Firebase
 * Inyecta los componentes modales en el DOM para mantener index.html limpio y modular.
 */

function inicializarModalesAuthEnDOM() {
  if (document.getElementById('modalAuth')) return;

  const htmlModales = `
    <!-- Modal Autenticación Alumno (Login / Registro / Google) -->
    <div class="modal-overlay" id="modalAuth">
      <div class="modal-card auth-modal-card">
        <div class="modal-header">
          <div class="modal-title">🔐 Acceso de Estudiante</div>
          <button class="modal-close" onclick="cerrarModalAuth()">&times;</button>
        </div>
        <div class="auth-tabs">
          <button class="auth-tab-btn active" id="btnAuthTabLogin" onclick="cambiarPestanaAuth('login')">Iniciar Sesión</button>
          <button class="auth-tab-btn" id="btnAuthTabRegistro" onclick="cambiarPestanaAuth('registro')">Registrarse</button>
        </div>
        <div class="modal-body" style="padding:16px 20px;">
          <div style="text-align:center;margin-bottom:12px;">
            <span class="g-badge gb-auth-inst" style="font-size:11px;padding:3px 8px;">UTN · FRBA Sistemas</span>
            <div style="font-size:12px;color:var(--muted);margin-top:6px;line-height:1.4;">Gestión académica y seguimiento en Cloud Firestore</div>
          </div>
          <button class="auth-google-btn" onclick="ejecutarAuthGoogle()">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            <span>Continuar con Google</span>
          </button>
          <div class="auth-separator"><span>o con correo electrónico</span></div>
          <form onsubmit="procesarEnvioAuth(event)">
            <div class="form-group" style="margin-bottom:12px;">
              <label class="form-label">Correo Institucional o Personal</label>
              <input type="email" id="authInputEmail" class="form-input" placeholder="tu.correo@alumnos.utn.ba" required>
            </div>
            <div class="form-group" style="margin-bottom:12px;">
              <label class="form-label">Contraseña</label>
              <input type="password" id="authInputPassword" class="form-input" placeholder="••••••••" required>
            </div>
            <div id="authErrorMsg" class="auth-error-msg"></div>
            <button type="submit" id="btnAuthSubmit" class="btn-prim" style="width:100%;margin-top:10px;">Iniciar Sesión</button>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', htmlModales);
}

document.addEventListener('DOMContentLoaded', inicializarModalesAuthEnDOM);
