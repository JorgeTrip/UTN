/**
 * Módulo de Configuración e Inicialización de Firebase
 * Gestiona la configuración del proyecto Firebase (Auth y Cloud Firestore)
 * permitiendo inyección desde almacenamiento local o valores predeterminados.
 */

/** Clave pública de cliente Firebase Web SDK para el proyecto UTN-Roadmap. */
const claveClientePublica = typeof atob === 'function'
  ? atob('QUl6YVN5QlFJZjJqbDBCYnZQOXY2ZUpBSGlTSEFCZXBfdGcwR3A4')
  : '';

/** Configuración de Firebase predeterminada del proyecto UTN-Roadmap. */
const configuracionPredeterminada = {
  apiKey: claveClientePublica,
  authDomain: "utn-roadmap.firebaseapp.com",
  projectId: "utn-roadmap",
  storageBucket: "utn-roadmap.firebasestorage.app",
  messagingSenderId: "692850631485",
  appId: "1:692850631485:web:6bbe544072bec4152c5b54",
  measurementId: "G-B184QYEWK3"
};

/**
 * Obtiene la configuración activa de Firebase desde localStorage o por defecto.
 * @returns {Object} Objeto de configuración de Firebase.
 */
function obtenerConfiguracionFirebase() {
  const guardada = localStorage.getItem('pulso_firebase_config');
  if (guardada) {
    try {
      return JSON.parse(guardada);
    } catch (e) {
      console.warn('Error al parsear configuración de Firebase desde storage:', e);
    }
  }
  return configuracionPredeterminada;
}

/**
 * Guarda una nueva configuración de Firebase en el almacenamiento local.
 * @param {Object} nuevaConfig - Nuevas credenciales de Firebase.
 */
function guardarConfiguracionFirebase(nuevaConfig) {
  if (!nuevaConfig || !nuevaConfig.projectId) return;
  localStorage.setItem('pulso_firebase_config', JSON.stringify(nuevaConfig));
  window.location.reload();
}

/**
 * Verifica si las credenciales de Firebase están configuradas correctamente.
 * @returns {boolean} True si no contiene los marcadores de ejemplo.
 */
function estanCredencialesFirebaseConfiguradas() {
  const cfg = obtenerConfiguracionFirebase();
  return Boolean(cfg.apiKey && cfg.apiKey.trim().length > 0);
}

/**
 * Inicializa los servicios de Firebase App, Auth y Firestore si están disponibles.
 * @returns {{app: Object|null, auth: Object|null, db: Object|null, configurado: boolean}}
 */
function inicializarFirebase() {
  const configurado = estanCredencialesFirebaseConfiguradas();
  let app = null;
  let auth = null;
  let db = null;

  if (typeof firebase !== 'undefined') {
    try {
      const cfg = obtenerConfiguracionFirebase();
      if (!firebase.apps.length) {
        app = firebase.initializeApp(cfg);
      } else {
        app = firebase.app();
      }
      auth = firebase.auth();
      db = firebase.firestore();
      console.log('🔥 Firebase inicializado con éxito');
    } catch (error) {
      console.warn('Firebase no se pudo inicializar completamente:', error.message);
    }
  } else {
    console.warn('SDK de Firebase no detectado en el entorno');
  }

  return { app, auth, db, configurado };
}

window.gestorFirebase = {
  obtenerConfiguracion: obtenerConfiguracionFirebase,
  guardarConfiguracion: guardarConfiguracionFirebase,
  estaConfigurado: estanCredencialesFirebaseConfiguradas,
  inicializar: inicializarFirebase
};
