/**
 * Módulo Controlador para Exportar Materias del Planificador a Google Calendar
 * Permite configurar la fecha de inicio de la repetición semanal y genera la URL con todos los detalles.
 */

let eventoGcalActual = null;
let contextoGcalActual = null;

/**
 * Obtiene la fecha (YYYY-MM-DD) del día de la semana correspondiente a la materia en la semana actual.
 * @param {number} diaMateria - 0: Lunes, 1: Martes, 2: Miércoles, 3: Jueves, 4: Viernes, 5: Sábado.
 * @returns {string} Fecha en formato ISO AAAA-MM-DD.
 */
function obtenerFechaDefectoMateria(diaMateria) {
  const hoy = new Date();
  const diaHoy = hoy.getDay();
  const indiceHoy = (diaHoy === 0) ? 6 : diaHoy - 1;
  const diferenciaDias = diaMateria - indiceHoy;

  const fechaMateria = new Date(hoy);
  fechaMateria.setDate(hoy.getDate() + diferenciaDias);

  const aaaa = fechaMateria.getFullYear();
  const mm = String(fechaMateria.getMonth() + 1).padStart(2, '0');
  const dd = String(fechaMateria.getDate()).padStart(2, '0');
  return `${aaaa}-${mm}-${dd}`;
}

/**
 * Abre el diálogo modal de configuración para agendar la clase en Google Calendar.
 * @param {Object} evento - Datos de la asignatura (nombre, horario, sede, comisión).
 * @param {Object} [contexto] - Contexto académico ({ anio, cuatrimestre, alternativa }).
 */
function abrirModalGoogleCalendar(evento, contexto = null) {
  eventoGcalActual = evento;
  contextoGcalActual = contexto;

  let overlay = document.getElementById('modalGoogleCalendar');
  if (!overlay) {
    crearEstructuraModalGoogleCalendar();
    overlay = document.getElementById('modalGoogleCalendar');
  }

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  const elNombre = document.getElementById('gcalNombreMateria');
  if (elNombre) elNombre.textContent = evento.name;

  setVal('gcalInputFechaInicio', obtenerFechaDefectoMateria(evento.day));
  setVal('gcalSelectSemanas', evento.anual ? '32' : '16');
  setVal('gcalInputComision', evento.k || 'K23');
  setVal('gcalSelectSede', evento.campus ? 'Sede Campus' : 'Sede Medrano');

  actualizarPrevisualizacionGoogleCalendar();
  overlay.classList.add('open');
}

/**
 * Cierra la ventana modal de exportación a Google Calendar.
 */
function cerrarModalGoogleCalendar() {
  const overlay = document.getElementById('modalGoogleCalendar');
  if (overlay) overlay.classList.remove('open');
}

/**
 * Actualiza dinámicamente el cuadro de texto que previsualiza la recurrencia semanal configurada.
 */
function actualizarPrevisualizacionGoogleCalendar() {
  if (!eventoGcalActual) return;
  const fechaInicio = document.getElementById('gcalInputFechaInicio')?.value;
  const semanas = document.getElementById('gcalSelectSemanas')?.value || '16';
  const preview = document.getElementById('gcalPreviewText');

  if (!fechaInicio) {
    if (preview) preview.textContent = 'Seleccioná una fecha de inicio válida.';
    return;
  }

  const partes = fechaInicio.split('-');
  const fechaObj = new Date(partes[0], partes[1] - 1, partes[2]);
  const fechaStr = fechaObj.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const h1 = String(eventoGcalActual.h1).padStart(2, '0'), m1 = String(eventoGcalActual.m1).padStart(2, '0');
  const h2 = String(eventoGcalActual.h2).padStart(2, '0'), m2 = String(eventoGcalActual.m2).padStart(2, '0');

  if (preview) {
    preview.replaceChildren();
    preview.insertAdjacentHTML('beforeend', `📅 <strong>Primer evento:</strong> ${fechaStr.toUpperCase()}<br>` +
                        `🕒 <strong>Horario:</strong> ${h1}:${m1} a ${h2}:${m2} hs<br>` +
                        `🔄 <strong>Repetición:</strong> Todos los ${obtenerNombreDiaSemana(eventoGcalActual.day)} (${semanas} semanas).`);
  }
}

/**
 * Devuelve el nombre castellano del día a partir de su índice semanal (0: Lunes a 5: Sábado).
 * @param {number} dia - Índice del día.
 * @returns {string} Nombre en español.
 */
function obtenerNombreDiaSemana(dia) {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dias[dia] || 'Día';
}

/**
 * Genera la URL codificada con protocolo TEMPLATE de Google Calendar y parámetros RRULE.
 * @returns {string} Enlace directo para abrir en el navegador.
 */
function generarUrlGoogleCalendar() {
  if (!eventoGcalActual) return '';
  const fechaInicioStr = document.getElementById('gcalInputFechaInicio')?.value || '';
  const numSemanas = parseInt(document.getElementById('gcalSelectSemanas')?.value, 10) || 16;
  const comision = document.getElementById('gcalInputComision')?.value.trim() || 'K23';
  const sede = document.getElementById('gcalSelectSede')?.value || 'Sede Medrano';

  const h1 = String(eventoGcalActual.h1).padStart(2, '0'), m1 = String(eventoGcalActual.m1).padStart(2, '0');
  const h2 = String(eventoGcalActual.h2).padStart(2, '0'), m2 = String(eventoGcalActual.m2).padStart(2, '0');
  const fechaLimpia = fechaInicioStr.replace(/-/g, '');
  const startIso = `${fechaLimpia}T${h1}${m1}00`;
  const endIso = `${fechaLimpia}T${h2}${m2}00`;
  const titulo = `${eventoGcalActual.name} (${comision}) · UTN FRBA`;

  let metadata = {};
  if (typeof obtenerMetadataMateria === 'function') {
    metadata = obtenerMetadataMateria(eventoGcalActual.name);
  }

  const detalles = [
    `📚 MATERIA: ${eventoGcalActual.name}`,
    `🏫 COMISIÓN / GRUPO: ${comision}`,
    `📍 SEDE: UTN FRBA - ${sede}`,
    `🕒 HORARIO: Todos los ${obtenerNombreDiaSemana(eventoGcalActual.day)} de ${h1}:${m1} a ${h2}:${m2} hs`,
    `📌 MODALIDAD: ${eventoGcalActual.anual ? 'Anual' : 'Cuatrimestral'}`,
    `🎓 NIVEL: Nivel ${metadata.nivel || 4} · Plan K23`,
    eventoGcalActual.url ? `🔗 WEB: ${eventoGcalActual.url}` : '🌐 CAMPUS: https://frba.cv.utn.edu.ar/',
    '---',
    'Generado desde el Planificador Académico UTN FRBA.'
  ].join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE', text: titulo, dates: `${startIso}/${endIso}`,
    ctz: 'America/Argentina/Buenos_Aires', details: detalles,
    location: `UTN FRBA - ${sede}, Buenos Aires, Argentina`,
    recur: `RRULE:FREQ=WEEKLY;COUNT=${numSemanas}`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Abre Google Calendar en una nueva pestaña del navegador con la cita configurada.
 */
function exportarAGoogleCalendar() {
  const url = generarUrlGoogleCalendar();
  if (!url) return;
  window.open(url, '_blank');
  cerrarModalGoogleCalendar();
  if (typeof mostrarToastPlanificador === 'function') {
    mostrarToastPlanificador(`Se abrió Google Calendar para agendar "${eventoGcalActual.name}".`);
  }
}

/**
 * Inyecta dinámicamente en el DOM la estructura HTML del modal si no fue precargada.
 */
function crearEstructuraModalGoogleCalendar() {
  const modalHTML = `<div class="modal-overlay" id="modalGoogleCalendar"><div class="modal-card" style="max-width:500px;"><div class="modal-header"><div class="modal-title">📅 Agregar a Google Calendar (<span id="gcalNombreMateria" style="color:var(--blue)">-</span>)</div><button class="modal-close" onclick="cerrarModalGoogleCalendar()">&times;</button></div><div class="modal-body"><div class="form-grid" style="grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;"><div class="form-group" style="grid-column:1/-1;"><label class="form-label">Fecha de Primera Clase (Inicio Repetición)</label><input type="date" id="gcalInputFechaInicio" class="form-input" onchange="actualizarPrevisualizacionGoogleCalendar()"><small style="color:var(--muted);font-size:11px;margin-top:3px;display:block;">Por defecto es el día de esta semana.</small></div><div class="form-group"><label class="form-label">Duración / Repetición</label><select id="gcalSelectSemanas" class="form-input" onchange="actualizarPrevisualizacionGoogleCalendar()"><option value="16">16 Semanas (1 Cuatrimestre)</option><option value="32">32 Semanas (Anual)</option><option value="12">12 Semanas</option><option value="8">8 Semanas</option></select></div><div class="form-group"><label class="form-label">Comisión / Sede</label><input type="text" id="gcalInputComision" class="form-input" placeholder="Ej: K4051"></div><div class="form-group" style="grid-column:1/-1;"><label class="form-label">Sede de Cursada</label><select id="gcalSelectSede" class="form-input"><option value="Sede Medrano">UTN Medrano (Medrano 951, CABA)</option><option value="Sede Campus">UTN Campus (Mozart 2300, CABA)</option></select></div></div><div id="gcalPreviewBox" style="background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:12px;line-height:1.6;color:var(--text);"><div id="gcalPreviewText">-</div></div></div><div class="modal-footer"><button class="btn-sec" onclick="cerrarModalGoogleCalendar()">Cancelar</button><button class="btn-prim" onclick="exportarAGoogleCalendar()">🚀 Abrir Google Calendar</button></div></div></div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}
