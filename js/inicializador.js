/**
 * Módulo Inicializador de la Aplicación
 * Arranca la app, inicializa Firebase Auth/Firestore, componentes UI y restaura el estado.
 */

document.addEventListener('DOMContentLoaded', async () => {
  inicializarTema();
  await cargarDatosIniciales();

  // 1. Inicia escucha de autenticación y sincronización con Firestore
  if (window.servicioAuth) {
    window.servicioAuth.suscribirCambioAuth(async (usuario) => {
      if (usuario) {
        document.body.classList.remove('sin-sesion');
        cerrarModalAuth(true);
        if (typeof window.actualizarOpcionesSesionDropdown === 'function') {
          window.actualizarOpcionesSesionDropdown(usuario);
        }
        await cargarDatosIniciales();
        renderizarTodoElDashboard();
      } else {
        document.body.classList.add('sin-sesion');
        window.datosGlobales.datosAlumno = null;
        if (typeof window.actualizarOpcionesSesionDropdown === 'function') {
          window.actualizarOpcionesSesionDropdown(null);
        }
        renderizarHeaderYPerfil();
        abrirModalAuth(true);
      }
    });
    window.servicioAuth.iniciarObservadorAuth();
  } else {
    await cargarDatosIniciales();
    renderizarTodoElDashboard();
  }

  // 2. Restaura vista activa guardada
  const vistaActiva = localStorage.getItem('activeViewType');
  if (vistaActiva === 'materia') {
    const url = localStorage.getItem('activeMateriaUrl');
    const titulo = localStorage.getItem('activeMateriaTitulo');
    if (url) abrirMateria(url, titulo || '');
  } else {
    const tabSuperGuardado = localStorage.getItem('dashboardSuperTab');
    const tabInicial = tabSuperGuardado !== null ? parseInt(tabSuperGuardado) : 1;
    superTab(tabInicial);

    if (tabInicial === 1) {
      const subTabGuardado = localStorage.getItem('dashboardSp1Tab');
      if (subTabGuardado !== null) sp1Tab(parseInt(subTabGuardado));
    }
  }

  // 3. Resaltado periódico del día actual
  if (typeof resaltarDiaActual === 'function') {
    resaltarDiaActual();
    setInterval(resaltarDiaActual, 60000);
  }
});
