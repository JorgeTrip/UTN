/**
 * Módulo de Servicio de Oferta Horaria Compartida en Firestore
 * Gestiona la lectura y persistencia comunitaria de horarios oficiales en la nube.
 */

const COLECCION_OFERTA_HORARIOS = 'oferta_academica';
const DOC_OFERTA_SISTEMAS = 'sistemas_2026';

async function consultarOfertaHorariosFirestore() {
  if (typeof firebase === 'undefined' || !firebase.firestore) {
    return { existe: false, error: 'Firebase Firestore no inicializado' };
  }

  try {
    const db = firebase.firestore();
    const docRef = db.collection(COLECCION_OFERTA_HORARIOS).doc(DOC_OFERTA_SISTEMAS);
    const snap = await docRef.get();

    if (snap.exists) {
      const data = snap.data();
      return {
        existe: true,
        fechaActualizacion: data.fechaActualizacion || '',
        subidoPor: data.subidoPor || 'Comunidad UTN',
        totalComisiones: Array.isArray(data.comisiones) ? data.comisiones.length : 0,
        comisiones: data.comisiones || []
      };
    }
    return { existe: false };
  } catch (err) {
    console.warn('No se pudo consultar oferta horaria en Firestore:', err);
    return { existe: false, error: err.message };
  }
}

async function guardarOfertaHorariosFirestore(comisiones, usuario = 'Alumno UTN') {
  if (typeof firebase === 'undefined' || !firebase.firestore) {
    throw new Error('Firebase Firestore no disponible para persistir oferta.');
  }

  const db = firebase.firestore();
  const docRef = db.collection(COLECCION_OFERTA_HORARIOS).doc(DOC_OFERTA_SISTEMAS);

  const payload = {
    carrera: 'Ingeniería en Sistemas de Información',
    plan: 'K23',
    cicloLectivo: 2026,
    fechaActualizacion: new Date().toISOString(),
    subidoPor: usuario,
    totalComisiones: comisiones.length,
    comisiones
  };

  await docRef.set(payload, { merge: true });
  return payload;
}

window.consultarOfertaHorariosFirestore = consultarOfertaHorariosFirestore;
window.guardarOfertaHorariosFirestore = guardarOfertaHorariosFirestore;
