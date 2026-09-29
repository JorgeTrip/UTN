/**
 * Servicio de Persistencia en Cloud Firestore para Alumnos
 * Gestiona la sincronización en la nube de la colección 'alumnos/{uid}'
 * integrando respaldo local en caché y soporte offline.
 */

/**
 * Genera el esquema de datos inicial limpio para un estudiante recién registrado.
 * @param {Object} usuarioAuth - Objeto usuario con uid y email.
 * @returns {Object} Estructura inicial sin información hardcodeada.
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
      turno: '',
      planActual: '',
      planOriginal: '',
      fechaIngreso: '',
      fechaTransicion: ''
    },
    materiasAprobadas: [],
    materiasEnCurso: [],
    historialSIU: [],
    planificacionCuatrimestral: {}
  };
}

/**
 * Obtiene los datos del estudiante desde Cloud Firestore o caché local.
 * @param {string} uid - Identificador único del usuario.
 * @returns {Promise<Object>} Datos del alumno cargados.
 */
async function obtenerDatosAlumnoFirestore(uid) {
  if (!uid) return null;
  const { db, configurado } = window.gestorFirebase.inicializar();

  if (configurado && db) {
    try {
      const docRef = db.collection('alumnos').doc(uid);
      const snapshot = await docRef.get();
      if (snapshot.exists) {
        const datos = snapshot.data();
        localStorage.setItem(`pulso_datos_alumno_${uid}`, JSON.stringify(datos));
        return datos;
      }
      // Si el documento no existe en Firestore, lo crea vacío
      const nuevoAlumno = crearEsquemaAlumnoInicial(window.servicioAuth.obtenerUsuarioActual());
      await docRef.set(nuevoAlumno);
      return nuevoAlumno;
    } catch (error) {
      console.warn('Error leyendo de Firestore, recurriendo a caché local:', error.message);
    }
  }

  // Fallback a almacenamiento local asociado al uid
  const local = localStorage.getItem(`pulso_datos_alumno_${uid}`) || localStorage.getItem('pulso_datos_alumno');
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }
  return crearEsquemaAlumnoInicial(window.servicioAuth.obtenerUsuarioActual());
}

/**
 * Guarda los datos del alumno en Firestore y actualiza el caché local.
 * @param {string} uid - Identificador del usuario.
 * @param {Object} datos - Objeto completo de datos del alumno.
 */
async function guardarDatosAlumnoFirestore(uid, datos) {
  if (!uid || !datos) return;
  // Guardado optimista inmediato en caché local
  localStorage.setItem(`pulso_datos_alumno_${uid}`, JSON.stringify(datos));
  localStorage.setItem('pulso_datos_alumno', JSON.stringify(datos));

  const { db, configurado } = window.gestorFirebase.inicializar();
  if (configurado && db) {
    try {
      await db.collection('alumnos').doc(uid).set(datos, { merge: true });
      console.log('☁️ Datos sincronizados con Firestore exitosamente');
    } catch (error) {
      console.error('Error sincronizando con Firestore:', error.message);
    }
  }
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

window.servicioFirestore = {
  crearEsquemaInicial: crearEsquemaAlumnoInicial,
  obtenerDatosAlumno: obtenerDatosAlumnoFirestore,
  guardarDatosAlumno: guardarDatosAlumnoFirestore,
  restaurarBackup: restaurarBackupEnFirestore
};
