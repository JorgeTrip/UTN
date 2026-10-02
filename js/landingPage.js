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

        <!-- HERO SECTION CON BACKGROUND PARALLAX -->
        <section class="landing-hero">
          <div class="landing-hero-bg-container">
            <div class="landing-hero-bg" id="heroParallaxBg"></div>
            <div class="landing-hero-overlay"></div>
          </div>
          <div class="landing-hero-content">
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
            </div>
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
          <p style="font-weight:600;margin-bottom:6px;color:var(--text);">© 2026 Jorge O. Tripodi. Todos los derechos reservados.</p>
          <p>Dashboard Académico UTN FRBA · Plataforma gratuita para la comunidad universitaria de Sistemas y especialidades UTN.</p>
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
