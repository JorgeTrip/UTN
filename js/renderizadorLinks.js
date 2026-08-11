/**
 * Módulo Renderizador de Links Útiles (Super Panel 0)
 * Pobla dinámicamente el panel de accesos directos e institucionales de la UTN FRBA directamente en sp0.
 */

function renderizarLinksUtiles() {
  const contenedor = document.getElementById('sp0');
  if (!contenedor) return;

  const listaEnlaces = [
    {
      titulo: 'SIU Guaraní',
      icono: '🎓',
      bgIcono: 'rgba(34,211,164,.15)',
      colorIcono: 'var(--green)',
      url: 'https://guarani.frba.utn.edu.ar/autogestion/grado/',
      descripcion: 'Sistema de autogestión para estudiantes. Consulta de materias, inscripciones a cursadas y exámenes finales, historia académica y trámites.'
    },
    {
      titulo: 'Ventanilla DISI',
      icono: '📋',
      bgIcono: 'rgba(244,114,182,.15)',
      colorIcono: 'var(--pink)',
      url: 'https://ventanilladisi.cpci.org.ar/',
      descripcion: 'Trámites del Departamento de Ingeniería en Sistemas de Información. Constancias, certificados, régimen de correlatividades y atención al alumno.'
    },
    {
      titulo: 'Aulas Virtuales',
      icono: '💻',
      bgIcono: 'rgba(232,121,249,.15)',
      colorIcono: '#e879f9',
      url: 'https://aulasvirtuales.frba.utn.edu.ar/',
      descripcion: 'Campus virtual Moodle institucional. Entrega de trabajos prácticos, foros de discusión, material de estudio y seguimiento docente.'
    },
    {
      titulo: 'CEIT-FMyT',
      icono: '📊',
      bgIcono: 'rgba(56,189,248,.15)',
      colorIcono: 'var(--blue)',
      url: 'https://ceitfmt.ar/dashboard',
      descripcion: 'Dashboard del Centro de Estudiantes. Noticias, apuntes, eventos estudiantiles y recursos académicos para Ingeniería en Sistemas.'
    },
    {
      titulo: 'Biblioteca UTN',
      icono: '📚',
      bgIcono: 'rgba(250,204,21,.15)',
      colorIcono: 'var(--yellow)',
      url: 'https://biblioteca.frba.utn.edu.ar/opac_login.php',
      descripcion: 'Catálogo online OPAC de la biblioteca. Búsqueda de libros técnicos, consulta de catálogo, reservas y papers en formato digital.'
    },
    {
      titulo: 'Web Oficial UTN FRBA',
      icono: '🏛️',
      bgIcono: 'rgba(129,140,248,.15)',
      colorIcono: '#818cf8',
      url: 'https://frba.utn.edu.ar/',
      descripcion: 'Portal institucional de la Facultad Regional Buenos Aires. Novedades, calendario académico, resolución de autoridades y trámites generales.'
    }
  ];

  let html = `
    <div class="infobox" style="margin-bottom:18px;">
      <strong>Plataformas y Accesos Directos UTN FRBA:</strong> Seleccioná cualquiera de las tarjetas a continuación para acceder directamente a las plataformas oficiales del Departamento DISI y la Facultad Regional Buenos Aires.
    </div>

    <div class="sec">Accesos directos · Plataformas Institucionales</div>
    <div class="links-grid">
  `;

  listaEnlaces.forEach(link => {
    html += `
      <a href="${link.url}" target="_blank" rel="noopener" class="link-card">
        <div class="link-icon" style="background:${link.bgIcono};color:${link.colorIcono};">${link.icono}</div>
        <div class="link-content">
          <div class="link-title">${link.titulo}</div>
          <div class="link-desc">${link.descripcion}</div>
        </div>
        <div class="link-arrow">→</div>
      </a>
    `;
  });

  html += `
    </div>
    <div class="infobox" style="margin-top:20px;">
      <strong>ℹ Consejo:</strong> Guarda estos enlaces en tus favoritos o marcadores para acceder rápidamente. Algunas plataformas requieren autenticación con las credenciales institucionales (legajo y contraseña del SIU Guaraní).
    </div>
  `;

  contenedor.innerHTML = html;
}
