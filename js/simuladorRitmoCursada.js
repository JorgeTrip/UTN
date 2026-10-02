/**
 * Módulo de Interfaz del Simulador de Ritmo de Cursada y Proyecciones
 * Permite al estudiante ajustar interactivamente su tasa anual de materias y
 * visualizar instantáneamente el impacto en el tiempo restante de graduación.
 */

/**
 * Renderiza el panel del simulador de ritmo dentro del contenedor de Hitos.
 * @param {HTMLElement} contenedor - Elemento del DOM donde se inyectará.
 * @param {Object} datosAlumno - Datos académicos del estudiante actual.
 */
function renderizarBloqueSimuladorRitmo(contenedor, datosAlumno = {}) {
  if (!contenedor) return;

  const aprobadas = datosAlumno.materiasAprobadas || [];
  const enCurso = datosAlumno.materiasEnCurso || [];
  const perfil = datosAlumno.perfil || {};
  const anioIngreso = Number(perfil.fechaIngreso || perfil.anioIngreso) || 2023;
  const anioActual = 2026;

  const calcRitmo = window.calculadorRitmoCursada;
  if (!calcRitmo) return;

  const uid = window.servicioAuth?.obtenerUsuarioActual()?.uid;
  const claveRitmo = uid ? `ritmo_cursada_simulado_${uid}` : 'ritmo_cursada_simulado';
  const ritmoHistorico = calcRitmo.calcularRitmoHistorico(anioIngreso, aprobadas.length, anioActual);
  const ritmoGuardado = Number(localStorage.getItem(claveRitmo));
  const ritmoActivo = ritmoGuardado || (ritmoHistorico > 0 ? Math.round(ritmoHistorico) : 6);

  const estimacion = calcRitmo.calcularEstimacionGraduacion({
    materiasAprobadas: aprobadas,
    materiasEnCurso: enCurso,
    ritmoPorAnio: ritmoActivo,
    anioActual
  });

  const diagnostico = calcRitmo.generarDiagnosticoRitmo(
    ritmoActivo,
    estimacion.eslabonesTroncalesMinimos,
    estimacion.aniosPorVolumen
  );

  const html = `
    <div class="simulador-ritmo-card" style="background:var(--s1);border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
        <div>
          <div style="font-weight:800;font-size:15px;color:var(--text);display:flex;align-items:center;gap:8px;">
            <span>⚡ Simulador de Ritmo de Cursada & Graduación</span>
          </div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px;">
            Ritmo histórico registrado: <strong style="color:var(--blue);">${ritmoHistorico > 0 ? ritmoHistorico + ' materias/año' : 'Sin historial suficiente'}</strong>
          </div>
        </div>
        <div style="background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.3);border-radius:8px;padding:6px 12px;text-align:right;">
          <div style="font-size:10px;text-transform:uppercase;font-weight:700;color:var(--cyan);">Año Estimado</div>
          <div style="font-size:18px;font-weight:800;color:var(--blue);" id="txtAnioGraduacionSimulado">${estimacion.anioEstimadoGraduacion}</div>
        </div>
      </div>

      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <label style="font-size:12px;font-weight:700;color:var(--text);" for="sliderRitmoMaterias">
            Ritmo proyectado: <span id="txtRitmoSeleccionado" style="color:var(--blue);font-weight:800;">${ritmoActivo} materias / año</span>
          </label>
          <span style="font-size:11px;color:var(--muted);">Mín: 2 · Máx: 10</span>
        </div>
        <input
          type="range"
          id="sliderRitmoMaterias"
          min="2"
          max="10"
          step="1"
          value="${ritmoActivo}"
          style="width:100%;accent-color:var(--blue);cursor:pointer;"
          oninput="actualizarSimuladorRitmo(this.value)"
        />
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:12px;">
        <div style="background:var(--s2);padding:10px 14px;border-radius:8px;border:1px solid var(--border);">
          <div style="font-size:11px;color:var(--muted);">Años Restantes Estimados</div>
          <div style="font-size:16px;font-weight:700;color:var(--text);margin-top:2px;" id="txtAniosRestantesSimulado">
            ${estimacion.aniosRestantes} año(s)
          </div>
        </div>
        <div style="background:var(--s2);padding:10px 14px;border-radius:8px;border:1px solid var(--border);">
          <div style="font-size:11px;color:var(--muted);">Materias Pendientes</div>
          <div style="font-size:16px;font-weight:700;color:var(--text);margin-top:2px;">
            ${estimacion.materiasPendientes} materias
          </div>
        </div>
        <div style="background:var(--s2);padding:10px 14px;border-radius:8px;border:1px solid var(--border);">
          <div style="font-size:11px;color:var(--muted);">Eslabones Anuales Mínimos</div>
          <div style="font-size:16px;font-weight:700;color:var(--yellow);margin-top:2px;">
            ${estimacion.eslabonesTroncalesMinimos} años (Troncal)
          </div>
        </div>
      </div>

      <div id="txtDiagnosticoSimulador" style="font-size:12px;color:var(--text-sec);line-height:1.5;background:var(--s2);padding:10px 12px;border-radius:8px;border-left:3px solid var(--blue);">
        ${diagnostico}
      </div>
    </div>
  `;

  contenedor.insertAdjacentHTML('beforeend', html);
}

/**
 * Actualiza en tiempo real los valores calculados al mover el control deslizante.
 * @param {string|number} nuevoRitmo - Nuevo valor de materias anuales.
 */
function actualizarSimuladorRitmo(nuevoRitmo) {
  const ritmo = Number(nuevoRitmo) || 6;
  const uid = window.servicioAuth?.obtenerUsuarioActual()?.uid;
  const claveRitmo = uid ? `ritmo_cursada_simulado_${uid}` : 'ritmo_cursada_simulado';
  localStorage.setItem(claveRitmo, String(ritmo));

  const txtRitmo = document.getElementById('txtRitmoSeleccionado');
  if (txtRitmo) txtRitmo.textContent = `${ritmo} materias / año`;

  const datos = window.datosGlobales?.datosAlumno || {};
  const calcRitmo = window.calculadorRitmoCursada;
  if (!calcRitmo) return;

  const estimacion = calcRitmo.calcularEstimacionGraduacion({
    materiasAprobadas: datos.materiasAprobadas || [],
    materiasEnCurso: datos.materiasEnCurso || [],
    ritmoPorAnio: ritmo,
    anioActual: 2026
  });

  const txtAnio = document.getElementById('txtAnioGraduacionSimulado');
  if (txtAnio) txtAnio.textContent = estimacion.anioEstimadoGraduacion;

  const txtAniosRestantes = document.getElementById('txtAniosRestantesSimulado');
  if (txtAniosRestantes) txtAniosRestantes.textContent = `${estimacion.aniosRestantes} año(s)`;

  const txtDiagnostico = document.getElementById('txtDiagnosticoSimulador');
  if (txtDiagnostico) {
    txtDiagnostico.textContent = calcRitmo.generarDiagnosticoRitmo(
      ritmo,
      estimacion.eslabonesTroncalesMinimos,
      estimacion.aniosPorVolumen
    );
  }

  // Notifica al planificador para re-proyectar años si está montado
  if (typeof window.renderizarPlanificador === 'function') {
    window.renderizarPlanificador();
  }
}

if (typeof window !== 'undefined') {
  window.simuladorRitmoCursada = {
    renderizarBloqueSimuladorRitmo,
    actualizarSimuladorRitmo
  };
  window.actualizarSimuladorRitmo = actualizarSimuladorRitmo;
}
