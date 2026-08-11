/**
 * Módulo Inicializador de la Aplicación
 * Arranca la app, carga los datos JSON, inicializa componentes UI y restaura el estado.
 */

document.addEventListener('DOMContentLoaded', async () => {
  inicializarTema();
  const cargado = await cargarDatosIniciales();
  if (!cargado) {
    console.warn('Iniciando en modo degradado sin datos dinámicos');
  }

  renderizarTodoElDashboard();

  const vistaActiva = localStorage.getItem('activeViewType');
  if (vistaActiva === 'materia') {
    const url = localStorage.getItem('activeMateriaUrl');
    const titulo = localStorage.getItem('activeMateriaTitulo');
    if (url) abrirMateria(url, titulo || '');
  } else {
    const tabSuperGuardado = localStorage.getItem('dashboardSuperTab');
    const tabInicial = tabSuperGuardado !== null ? parseInt(tabSuperGuardado) : 0;
    superTab(tabInicial);

    if (tabInicial === 1) {
      const subTabGuardado = localStorage.getItem('dashboardSp1Tab');
      if (subTabGuardado !== null) sp1Tab(parseInt(subTabGuardado));
    }
  }

  resaltarDiaActual();
  setInterval(resaltarDiaActual, 60000);
});
