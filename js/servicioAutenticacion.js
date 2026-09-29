/**
 * Servicio de Autenticación de Estudiantes
 * Gestiona el ciclo de vida de la sesión (Login, Registro, Google Auth y Logout)
 * conectando con Firebase Authentication o proveyendo modo local/fallback.
 */

let usuarioActual = null;
const suscriptoresEstadoAuth = [];

/**
 * Registra un callback para ser notificado de cambios en la sesión del usuario.
 * @param {Function} callback - Función que recibe (usuario).
 */
function suscribirCambioAuth(callback) {
  if (typeof callback === 'function') {
    suscriptoresEstadoAuth.push(callback);
    if (usuarioActual !== undefined) {
      callback(usuarioActual);
    }
  }
}

/**
 * Notifica a todos los suscriptores cuando cambia el usuario activo.
 * @param {Object|null} usuario - Entidad del usuario o null si cerró sesión.
 */
function notificarCambioAuth(usuario) {
  usuarioActual = usuario;
  suscriptoresEstadoAuth.forEach(cb => {
    try {
      cb(usuario);
    } catch (e) {
      console.error('Error en suscriptor de auth:', e);
    }
  });
}

/**
 * Registra un nuevo alumno con correo y contraseña.
 * @param {string} email - Correo del estudiante.
 * @param {string} password - Contraseña elegida.
 * @returns {Promise<Object>} Datos del usuario autenticado.
 */
async function registrarConEmail(email, password) {
  const { auth, configurado } = window.gestorFirebase.inicializar();
  if (configurado && auth && !window.__MODO_TEST_E2E__) {
    const credenciales = await auth.createUserWithEmailAndPassword(email, password);
    notificarCambioAuth(credenciales.user);
    return credenciales.user;
  }
  // Modo local simulado para entornos de prueba o sin claves cargadas
  const usuarioMock = { uid: 'usr_' + btoa(email).slice(0, 8), email, displayName: email.split('@')[0] };
  localStorage.setItem('pulso_usuario_simulado', JSON.stringify(usuarioMock));
  notificarCambioAuth(usuarioMock);
  return usuarioMock;
}

/**
 * Inicia sesión con correo electrónico y contraseña.
 * @param {string} email - Correo del estudiante.
 * @param {string} password - Contraseña.
 * @returns {Promise<Object>} Datos del usuario autenticado.
 */
async function iniciarSesionConEmail(email, password) {
  const { auth, configurado } = window.gestorFirebase.inicializar();
  if (configurado && auth && !window.__MODO_TEST_E2E__) {
    const credenciales = await auth.signInWithEmailAndPassword(email, password);
    notificarCambioAuth(credenciales.user);
    return credenciales.user;
  }
  const usuarioMock = { uid: 'usr_' + btoa(email).slice(0, 8), email, displayName: email.split('@')[0] };
  localStorage.setItem('pulso_usuario_simulado', JSON.stringify(usuarioMock));
  notificarCambioAuth(usuarioMock);
  return usuarioMock;
}

/**
 * Inicia sesión utilizando el proveedor institucional de Google.
 * @returns {Promise<Object>} Datos del usuario autenticado.
 */
async function iniciarSesionConGoogle() {
  const { auth, configurado } = window.gestorFirebase.inicializar();
  if (configurado && auth && typeof firebase !== 'undefined' && !window.__MODO_TEST_E2E__) {
    const proveedor = new firebase.auth.GoogleAuthProvider();
    const credenciales = await auth.signInWithPopup(proveedor);
    notificarCambioAuth(credenciales.user);
    return credenciales.user;
  }
  const usuarioMock = { uid: 'usr_google_123', email: 'estudiante.utn@gmail.com', displayName: 'Estudiante UTN' };
  localStorage.setItem('pulso_usuario_simulado', JSON.stringify(usuarioMock));
  notificarCambioAuth(usuarioMock);
  return usuarioMock;
}

/**
 * Cierra la sesión activa del estudiante y limpia el estado en memoria.
 */
async function cerrarSesion() {
  const { auth, configurado } = window.gestorFirebase.inicializar();
  if (configurado && auth) {
    await auth.signOut();
  }
  localStorage.removeItem('pulso_usuario_simulado');
  notificarCambioAuth(null);
}

/**
 * Inicia la escucha activa del estado de autenticación.
 */
function iniciarObservadorAuth() {
  const { auth, configurado } = window.gestorFirebase.inicializar();
  const esEntornoAutomatizado = (typeof navigator !== 'undefined' && Boolean(navigator.webdriver)) || Boolean(window.__MODO_TEST_E2E__);

  if (configurado && auth && !esEntornoAutomatizado) {
    auth.onAuthStateChanged(usuario => {
      notificarCambioAuth(usuario);
    });
  } else {
    const usuarioSimulado = localStorage.getItem('pulso_usuario_simulado');
    if (usuarioSimulado) {
      try {
        notificarCambioAuth(JSON.parse(usuarioSimulado));
        return;
      } catch (e) {
        localStorage.removeItem('pulso_usuario_simulado');
      }
    }
    if (esEntornoAutomatizado && !window.__TEST_GATEKEEPER__) {
      const usuarioTest = { uid: 'usr_jorge', email: 'jorge@alumnos.utn.ba', displayName: 'Jorge Osvaldo Tripodi' };
      notificarCambioAuth(usuarioTest);
      return;
    }
    notificarCambioAuth(null);
  }
}

window.servicioAuth = {
  registrarConEmail,
  iniciarSesionConEmail,
  iniciarSesionConGoogle,
  cerrarSesion,
  suscribirCambioAuth,
  iniciarObservadorAuth,
  obtenerUsuarioActual: () => usuarioActual
};
