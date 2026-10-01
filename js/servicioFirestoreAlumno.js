/**
 * Servicio de Persistencia en Cloud Firestore para Alumnos
 * Gestiona la sincronización en la nube de la colección 'alumnos/{uid}'
 * asegurando aislamiento estricto por usuario y respaldo local en caché por UID.
 */

/**
 * Genera el esquema de datos inicial limpio para un estudiante recién registrado.
 * @param {Object} usuarioAuth - Objeto usuario con uid y email.
 * @returns {Object} Estructura inicial sin información hardcodeada ni materias previas.
 */
function crearEsquemaAlumnoInicial(usuarioAuth) {
  const nombre = usuarioAuth?.displayName || (usuarioAuth?.email ? usuarioAuth.email.split('@')[0] : 'Estudiante');
  return {
    perfil: {
      nombre: nombre,
      apellido: '',
      nombreCompleto: nombre,
      email: usuarioAuth?.email || '',
      legajo: '',
      dni: '',
      telefono: '',
      direccion: '',
      turno: 'Noche',
      planActual: 'K23',
      planOriginal: 'K23',
      fechaIngreso: '',
      fechaTransicion: ''
    },
    materiasAprobadas: [],
    materiasEnCurso: [],
    historialSIU: [],
    planificacion: {
      "2026": {
        "1c": { alternativaElegida: 0, alternativas: [{ nombre: "Única", hasSat: false, eventos: [] }] },
        "2c": { alternativaElegida: 0, alternativas: [{ nombre: "Alt 1 (Recomendada)", hasSat: false, eventos: [] }] }
      },
      "2027": {
        "1c": { alternativaElegida: 0, alternativas: [{ nombre: "Plan 2027 · 1C", hasSat: false, eventos: [] }] },
        "2c": { alternativaElegida: 0, alternativas: [{ nombre: "Plan 2027 · 2C", hasSat: false, eventos: [] }] }
      },
      "2028": {
        "1c": { alternativaElegida: 0, alternativas: [{ nombre: "Plan 2028 · 1C", hasSat: false, eventos: [] }] },
        "2c": { alternativaElegida: 0, alternativas: [{ nombre: "Plan 2028 · 2C", hasSat: false, eventos: [] }] }
      }
    }
  };
}

/**
 * Obtiene los datos del estudiante desde Cloud Firestore o caché local aislada por UID.
 * @param {string} uid - Identificador único del usuario.
 * @returns {Promise<Object>} Datos del alumno cargados de forma independiente.
 */
async function obtenerDatosAlumnoFirestore(uid, usuarioAuth = null) {
  if (!uid) return null;
  const claveCacheUsuario = `pulso_datos_alumno_${uid}`;
  const { db, configurado } = window.gestorFirebase.inicializar();
  const usuarioActivo = usuarioAuth || window.servicioAuth?.obtenerUsuarioActual() || { uid };

  if (configurado && db) {
    try {
      const docRef = db.collection('alumnos').doc(uid);
      const snapshot = await docRef.get();
      if (snapshot.exists) {
        const datos = snapshot.data();
        localStorage.setItem(claveCacheUsuario, JSON.stringify(datos));
        return datos;
      }

      // Usuario nuevo en la nube: inicializar con esquema limpio exclusivo
      const datosIniciales = crearEsquemaAlumnoInicial(usuarioActivo);
      await docRef.set(datosIniciales);
      localStorage.setItem(claveCacheUsuario, JSON.stringify(datosIniciales));
      console.log('☁️ Perfil nuevo inicializado en Firestore exitosamente para alumnos/' + uid);
      return datosIniciales;
    } catch (error) {
      console.warn('Error leyendo o escribiendo en Firestore:', error.message);
    }
  }

  // Fallback a almacenamiento local aislado por UID
  const localUsuario = localStorage.getItem(claveCacheUsuario);
  if (localUsuario) {
    try {
      return JSON.parse(localUsuario);
    } catch (e) {}
  }

  const nuevoEsquema = crearEsquemaAlumnoInicial(usuarioActivo);
  localStorage.setItem(claveCacheUsuario, JSON.stringify(nuevoEsquema));
  return nuevoEsquema;
}

/**
 * Guarda los datos del alumno en Firestore y actualiza el caché local asociado al UID.
 * @param {string} uid - Identificador del usuario.
 * @param {Object} datos - Objeto completo de datos del alumno.
 */
async function guardarDatosAlumnoFirestore(uid, datos) {
  if (!uid || !datos) return;
  const claveCacheUsuario = `pulso_datos_alumno_${uid}`;
  localStorage.setItem(claveCacheUsuario, JSON.stringify(datos));

  const { db, configurado } = window.gestorFirebase.inicializar();
  if (configurado && db) {
    try {
      await db.collection('alumnos').doc(uid).set(datos, { merge: true });
      console.log('☁️ Datos sincronizados con Firestore exitosamente para alumnos/' + uid);
      return true;
    } catch (error) {
      console.error('Error sincronizando con Firestore:', error.message);
      return false;
    }
  }
  return true;
}

/**
 * Restaura el estado del alumno en Firestore a partir de un archivo JSON importado.
 * @param {string} uid - Identificador del alumno.
 * @param {Object} jsonImportado - Datos a restaurar.
 */
async function restaurarBackupEnFirestore(uid, jsonImportado) {
  if (!uid || !jsonImportado || !jsonImportado.perfil) {
    throw new Error('Formato de respaldo no válido para restaurar');
  }
  await guardarDatosAlumnoFirestore(uid, jsonImportado);
}

async function guardarEstrategiaFirestore(uid, estrategia) {
  if (!uid || !estrategia) return false;
  const { db, configurado } = window.gestorFirebase.inicializar();
  if (configurado && db) {
    try {
      await db.collection('alumnos').doc(uid).set({ estrategiaAcademica: estrategia }, { merge: true });
      return true;
    } catch (e) {
      console.warn('Error guardando estrategia en Firestore:', e.message);
    }
  }
  return false;
}

window.servicioFirestore = {
  crearEsquemaInicial: crearEsquemaAlumnoInicial,
  obtenerDatosAlumno: obtenerDatosAlumnoFirestore,
  guardarDatosAlumno: guardarDatosAlumnoFirestore,
  guardarEstrategia: guardarEstrategiaFirestore,
  restaurarBackup: restaurarBackupEnFirestore
};
