/**
 * Módulo de Renderizado e Interacción de la Landing Page
 * Inyecta dinámicamente la interfaz pública de bienvenida, conectando las acciones de acceso.
 */

function generarHtmlLanding() {
  return `
    <div class="landing-container" id="landingPageRoot">
      <div class="parallax-wrap">
        <div class="parallax-shape shape-1"></div>
        <div class="parallax-shape shape-2"></div>
        <div class="parallax-shape shape-3"></div>

        <!-- HERO SECTION -->
        <section class="landing-hero">
          <div class="landing-badge">
            <span>🎓</span> Portal Académico Gratuito · UTN FRBA
          </div>
          <h1 class="landing-title">Tomá el control total de tu carrera en UTN</h1>
          <p class="landing-subtitle">
            Diseñado para estudiantes de Sistemas (y próximamente todas las especialidades UTN).
            Mapeá correlativas, simulá tu fecha de graduación según tu ritmo real y recibí asesoramiento inteligente.
          </p>
          <div class="landing-actions">
            <button class="btn-landing-prim" onclick="abrirModalAuth()">
              <span>🚀</span> Comenzar Gratis / Ingresar
            </button>
            <button class="btn-landing-sec" onclick="ejecutarAuthGoogle()">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
              <span>Acceso con Google</span>
            </button>
          </div>
        </section>

        <!-- SECCIÓN: CAPACIDADES DE LA PLATAFORMA -->
        <section class="landing-section">
          <div class="landing-section-head">
            <div class="landing-section-tag">Todo en una sola plataforma</div>
            <h2 class="landing-section-title">¿Qué podés hacer con esta herramienta?</h2>
          </div>
          <div class="landing-cards-grid">
            <div class="landing-card">
              <span class="landing-card-icon">🗺️</span>
              <h3 class="landing-card-title">Mapa Curricular K23 & K08</h3>
              <p class="landing-card-desc">Visualizá el árbol de correlativas por nivel, homologaciones entre planes, actas, parciales y finales pendientes en un solo vistazo.</p>
            </div>
            <div class="landing-card">
              <span class="landing-card-icon">⚡</span>
              <h3 class="landing-card-title">Estimación por Ritmo de Cursada</h3>
              <p class="landing-card-desc">Calculá tu promedio anual histórico y usá el simulador dinámico para estimar con exactitud cuántos años te faltan y cuándo te graduás.</p>
            </div>
            <div class="landing-card">
              <span class="landing-card-icon">🤖</span>
              <h3 class="landing-card-title">Estrategia Académica con IA</h3>
              <p class="landing-card-desc">Recibí recomendaciones inteligentes impulsadas por Gemini: qué materias priorizar en la próxima inscripción y qué finales destraban el plan.</p>
            </div>
            <div class="landing-card">
              <span class="landing-card-icon">📥</span>
              <h3 class="landing-card-title">Importador Directo SIU Guaraní</h3>
              <p class="landing-card-desc">Sin cargas manuales tediosas: copiá tu Historia Académica del SIU, pegala y sincronizá automáticamente todas tus notas, fechas y materias.</p>
            </div>
            <div class="landing-card">
              <span class="landing-card-icon">🗓️</span>
              <h3 class="landing-card-title">Planificador Cuatrimestral</h3>
              <p class="landing-card-desc">Armá tus grillas de horarios semanales, detectá superposiciones y exportá tu calendario de cursada directamente a Google Calendar.</p>
            </div>
            <div class="landing-card">
              <span class="landing-card-icon">🏛️</span>
              <h3 class="landing-card-title">Hitos ADUSI & Título de Grado</h3>
              <p class="landing-card-desc">Seguimiento automático del título intermedio de Analista (ADUSI) y de Grado, con instrucciones claras para el trámite de expedición en Medrano.</p>
            </div>
          </div>
        </section>

        <!-- BANNER CTA FINAL -->
        <section class="landing-cta-banner">
          <div class="landing-section-tag" style="color:var(--blue);">100% Gratuito y de Código Abierto</div>
          <h2 style="font-size:clamp(22px,3vw,34px);font-weight:800;margin-bottom:12px;">Comenzá a planificar tu futuro profesional hoy</h2>
          <p style="color:var(--muted);max-width:600px;margin:0 auto 24px;font-size:14px;line-height:1.5;">Sin costos, sin anuncios y con tus datos seguros sincronizados en la nube.</p>
          <button class="btn-landing-prim" onclick="abrirModalAuth()">
            <span>✨</span> Crear Cuenta o Iniciar Sesión
          </button>
        </section>

        <footer class="landing-footer">
          <p>Dashboard Académico UTN FRBA · Desarrollado para la comunidad universitaria de Sistemas y especialidades UTN.</p>
        </footer>
      </div>
    </div>
  `;
}

/**
 * Inicializa y monta la Landing Page en el cuerpo del documento.
 */
function inicializarLandingPage() {
  if (document.getElementById('landingPageRoot')) return;
  document.body.insertAdjacentHTML('afterbegin', generarHtmlLanding());

  if (window.landingParallax?.inicializarEfectoParallax) {
    window.landingParallax.inicializarEfectoParallax();
  }
}

document.addEventListener('DOMContentLoaded', inicializarLandingPage);

if (typeof window !== 'undefined') {
  window.inicializarLandingPage = inicializarLandingPage;
}
