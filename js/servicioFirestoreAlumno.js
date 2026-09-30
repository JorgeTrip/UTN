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
        const tieneMateriasNube = Boolean(datos && datos.materiasAprobadas && datos.materiasAprobadas.length > 0);
        const localPrevioRaw = localStorage.getItem('pulso_datos_alumno');
        let localPrevio = null;
        if (localPrevioRaw) {
          try { localPrevio = JSON.parse(localPrevioRaw); } catch (e) {}
        }
        const tieneMateriasLocal = Boolean(localPrevio && localPrevio.materiasAprobadas && localPrevio.materiasAprobadas.length > 0);

        if (!tieneMateriasNube && tieneMateriasLocal) {
          await docRef.set(localPrevio, { merge: true });
          localStorage.setItem(`pulso_datos_alumno_${uid}`, JSON.stringify(localPrevio));
          console.log('☁️ Sincronizados datos locales preexistentes hacia Firestore para alumnos/' + uid);
          return localPrevio;
        }

        localStorage.setItem(`pulso_datos_alumno_${uid}`, JSON.stringify(datos));
        return datos;
      }

      // Si el documento no existe en Firestore, sube los datos locales existentes o crea esquema inicial
      const localPrevio = localStorage.getItem('pulso_datos_alumno');
      let datosParaSubir = null;
      if (localPrevio) {
        try {
          const parsed = JSON.parse(localPrevio);
          if (parsed && (parsed.materiasAprobadas?.length > 0 || parsed.perfil?.nombre || parsed.perfil?.legajo)) {
            datosParaSubir = parsed;
          }
        } catch (e) {}
      }

      if (!datosParaSubir) {
        datosParaSubir = crearEsquemaAlumnoInicial(window.servicioAuth.obtenerUsuarioActual());
      }

      await docRef.set(datosParaSubir);
      localStorage.setItem(`pulso_datos_alumno_${uid}`, JSON.stringify(datosParaSubir));
      console.log('☁️ Datos migrados y guardados en Firestore exitosamente en alumnos/' + uid);
      return datosParaSubir;
    } catch (error) {
      console.warn('Error leyendo o escribiendo en Firestore:', error.message);
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

window.servicioFirestore = {
  crearEsquemaInicial: crearEsquemaAlumnoInicial,
  obtenerDatosAlumno: obtenerDatosAlumnoFirestore,
  guardarDatosAlumno: guardarDatosAlumnoFirestore,
  restaurarBackup: restaurarBackupEnFirestore
};
