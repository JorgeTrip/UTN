/**
 * Controlador de la Interfaz de Autenticación y Configuración de Firebase
 * Gestiona la apertura, cierre y validaciones de los formularios de login y registro.
 */

let pestanaAuthActiva = 'login'; // 'login' | 'registro'

/**
 * Abre el modal de autenticación.
 * @param {boolean} [esObligatorio=false] - Si es obligatorio, oculta el botón de cierre.
 */
function abrirModalAuth(esObligatorio = false) {
  const modal = document.getElementById('modalAuth');
  if (modal) {
    const btnCerrar = modal.querySelector('.modal-close');
    if (btnCerrar) {
      btnCerrar.style.display = esObligatorio ? 'none' : 'block';
    }
    modal.classList.add('open');
    cambiarPestanaAuth('login');
  }
}

/**
 * Cierra el modal de autenticación.
 * @param {boolean} [forzar=false] - Forzar cierre cuando se completa el login.
 */
function cerrarModalAuth(forzar = false) {
  const modal = document.getElementById('modalAuth');
  if (modal) modal.classList.remove('open');
}

/**
 * Conmuta entre la pestaña de Iniciar Sesión y Registrarse.
 * @param {'login'|'registro'} tipo - Modo a activar.
 */
function cambiarPestanaAuth(tipo) {
  pestanaAuthActiva = tipo;
  const btnLogin = document.getElementById('btnAuthTabLogin');
  const btnReg = document.getElementById('btnAuthTabRegistro');
  const btnSubmit = document.getElementById('btnAuthSubmit');
  const msgError = document.getElementById('authErrorMsg');

  if (msgError) msgError.style.display = 'none';

  if (tipo === 'login') {
    btnLogin?.classList.add('active');
    btnReg?.classList.remove('active');
    if (btnSubmit) btnSubmit.textContent = 'Iniciar Sesión';
  } else {
    btnLogin?.classList.remove('active');
    btnReg?.classList.add('active');
    if (btnSubmit) btnSubmit.textContent = 'Crear Cuenta de Alumno';
  }
}

/** Procesa el envío del formulario de autenticación por email/pass. */
async function procesarEnvioAuth(evento) {
  evento?.preventDefault();
  const inputEmail = document.getElementById('authInputEmail');
  const inputPass = document.getElementById('authInputPassword');
  const msgError = document.getElementById('authErrorMsg');
  const btnSubmit = document.getElementById('btnAuthSubmit');

  const email = inputEmail?.value?.trim() || '';
  const pass = inputPass?.value || '';

  if (!email || !pass) {
    if (msgError) {
      msgError.textContent = 'Por favor completa todos los campos.';
      msgError.style.display = 'block';
    }
    return;
  }

  try {
    if (btnSubmit) btnSubmit.disabled = true;
    if (pestanaAuthActiva === 'login') {
      await window.servicioAuth.iniciarSesionConEmail(email, pass);
    } else {
      await window.servicioAuth.registrarConEmail(email, pass);
    }
    cerrarModalAuth();
  } catch (error) {
    if (msgError) {
      msgError.textContent = 'Error: ' + (error.message || 'No se pudo autenticar');
      msgError.style.display = 'block';
    }
  } finally {
    if (btnSubmit) btnSubmit.disabled = false;
  }
}

/** Ejecuta el inicio de sesión con Google. */
async function ejecutarAuthGoogle() {
  const msgError = document.getElementById('authErrorMsg');
  try {
    await window.servicioAuth.iniciarSesionConGoogle();
    cerrarModalAuth();
  } catch (error) {
    if (msgError) {
      msgError.textContent = 'Error Google: ' + error.message;
      msgError.style.display = 'block';
    }
  }
}

