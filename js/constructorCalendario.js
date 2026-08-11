/**
 * Módulo Constructor de Calendario Académico Visual
 * Renderiza la grilla de horarios de cursada a partir de los datos JSON del alumno.
 */

const INICIO_HORA = 18 * 60;
const FIN_HORA = 23 * 60 + 30;
const PIXELES_POR_MINUTO = 1.75;
const ALTO_TOTAL_PX = (FIN_HORA - INICIO_HORA) * PIXELES_POR_MINUTO;

function rellenarCero(n) { return String(n).padStart(2, '0'); }
function posicionTopPx(h, m) { return (h * 60 + m - INICIO_HORA) * PIXELES_POR_MINUTO; }
function altoPx(h1, m1, h2, m2) { return (h2 * 60 + m2 - h1 * 60 - m1) * PIXELES_POR_MINUTO; }

/**
 * Construye la grilla horaria del calendario y dibuja las materias.
 * @param {string} idCuerpo - ID del elemento contenedor
 * @param {number} cantidadDias - Cantidad de días (5 o 6)
 * @param {Array} eventos - Lista de materias/eventos a renderizar
 * @param {boolean} tieneSabado - Si incluye columna del sábado
 * @param {Object} [contexto] - { anio, cuatrimestre, alternativa }
 */
function construirCalendario(idCuerpo, cantidadDias, eventos, tieneSabado, contexto = null) {
  const cuerpo = document.getElementById(idCuerpo);
  if (!cuerpo) return;
  cuerpo.innerHTML = '';
  cuerpo.style.height = ALTO_TOTAL_PX + 'px';

  const colTiempo = document.createElement('div');
  colTiempo.className = 'time-col';
  colTiempo.style.height = ALTO_TOTAL_PX + 'px';
  for (let h = 18; h <= 23; h++) {
    const etiqueta = document.createElement('div');
    etiqueta.className = 'tlabel';
    etiqueta.style.top = ((h - 18) * 60 * PIXELES_POR_MINUTO) + 'px';
    etiqueta.textContent = h + ':00';
    colTiempo.appendChild(etiqueta);
  }
  cuerpo.appendChild(colTiempo);

  for (let d = 0; d < cantidadDias; d++) {
    const esSabado = tieneSabado && (d === cantidadDias - 1);
    const colDia = document.createElement('div');
    colDia.className = 'day-col' + (esSabado ? ' sat' : '');
    colDia.style.height = ALTO_TOTAL_PX + 'px';

    if (contexto) {
      colDia.title = 'Hacé clic para ubicar una materia este día';
      colDia.onclick = (e) => {
        if (e.target === colDia || e.target.classList.contains('hline') || e.target.classList.contains('hline-half')) {
          if (typeof abrirModalUbicarMateria === 'function') {
            abrirModalUbicarMateria(contexto.anio, contexto.cuatrimestre, contexto.alternativa, d);
          }
        }
      };
    }

    if (!esSabado) {
      for (let hh = 18; hh <= 23; hh++) {
        const lineaHora = document.createElement('div');
        lineaHora.className = 'hline';
        lineaHora.style.top = ((hh - 18) * 60 * PIXELES_POR_MINUTO) + 'px';
        colDia.appendChild(lineaHora);
        if (hh < 23) {
          const lineaMedia = document.createElement('div');
          lineaMedia.className = 'hline-half';
          lineaMedia.style.top = ((hh - 18) * 60 * PIXELES_POR_MINUTO + 30 * PIXELES_POR_MINUTO) + 'px';
          colDia.appendChild(lineaMedia);
        }
      }
    }

    eventos.filter(ev => ev.day === d).forEach(ev => {
      const bloque = document.createElement('div');
      bloque.className = 'ev ev-' + ev.cls;
      bloque.style.top = posicionTopPx(ev.h1, ev.m1) + 'px';
      bloque.style.height = altoPx(ev.h1, ev.m1, ev.h2, ev.m2) + 'px';

      const htmlNombre = ev.url
        ? `<a href="#" onclick="abrirMateria('${ev.url}', '${ev.name}'); return false;" style="color:inherit;text-decoration:none;border-bottom:1px dashed rgba(255,255,255,.3);">${ev.name}</a>`
        : ev.name;

      const jsonEv = JSON.stringify(ev).replace(/"/g, '&quot;');
      const jsonCtx = contexto ? JSON.stringify(contexto).replace(/"/g, '&quot;') : 'null';
      const btnGcal = `<button class="ev-action-btn ev-gcal-btn" title="Agregar a Google Calendar" onclick="event.stopPropagation(); abrirModalGoogleCalendar(${jsonEv}, ${jsonCtx})">📅</button>`;

      let btnBorrar = '';
      if (contexto && ev.id) {
        btnBorrar = `<button class="ev-action-btn ev-delete-btn" title="Eliminar materia del planificador" onclick="event.stopPropagation(); eliminarEventoPlanificador('${contexto.anio}', '${contexto.cuatrimestre}', ${contexto.alternativa}, '${ev.id}')">🗑️</button>`;
      }

      bloque.innerHTML = `
        <div class="ev-actions">
          ${btnGcal}
          ${btnBorrar}
        </div>
        <div class="ev-name">${htmlNombre}</div>
        <div class="ev-time">${rellenarCero(ev.h1)}:${rellenarCero(ev.m1)} – ${rellenarCero(ev.h2)}:${rellenarCero(ev.m2)}</div>
        <div class="ev-k">${ev.k}</div>
        ${ev.anual ? '<div class="ev-anual">ANUAL</div>' : ''}
        ${ev.campus ? '<div class="ev-campus">CAMPUS</div>' : ''}
      `;
      colDia.appendChild(bloque);
    });
    cuerpo.appendChild(colDia);
  }
}

function resaltarDiaActual() {
  document.querySelectorAll('.ev.today, .ds-card.today').forEach(el => el.classList.remove('today'));
  const diaSemana = new Date().getDay();
  const mapaDias = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: -1 };
  const indiceDia = mapaDias[diaSemana];
  if (indiceDia === -1) return;

  const cuerposVisibles = document.querySelectorAll('.main-panel.active .cal-body, .plan-sub-panel.active .cal-body');
  cuerposVisibles.forEach(cuerpo => {
    const columnas = cuerpo.querySelectorAll('.day-col');
    if (indiceDia < columnas.length) {
      columnas[indiceDia].querySelectorAll('.ev').forEach(ev => ev.classList.add('today'));
    }
  });
}
