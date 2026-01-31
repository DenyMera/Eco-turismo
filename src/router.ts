/**
 * router.ts - Sistema de enrutamiento para SPA con Vercel
 * Detecta la ruta actual y carga el contenido dinámicamente
 */

// Mapeo de rutas a archivos
const rutasMap: Record<string, string> = {
  '/': '/index.html',
  '/login': '/pages/login.html',
  '/registro': '/pages/registro.html',
  '/rutas': '/pages/rutas.html',
  '/novedades': '/pages/novedades.html',
  '/ayuda': '/pages/ayuda.html',
  '/perfil': '/pages/perfil.html',
  '/recuperar': '/pages/recuperar.html',
  '/recuperar-email': '/pages/recuperar-email.html',
  '/terminos': '/pages/terminos.html',
};

let contenedorPrincipal: HTMLElement | null = null;

/**
 * Obtiene el HTML de una página
 */
async function obtenerPagina(archivo: string): Promise<string> {
  try {
    const response = await fetch(archivo);
    if (!response.ok) return '<p>Página no encontrada</p>';
    return await response.text();
  } catch (error) {
    console.error('Error cargando página:', error);
    return '<p>Error cargando la página</p>';
  }
}

/**
 * Extrae el contenido main de una página
 */
function extraerContenidoMain(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const main = doc.querySelector('main');
  return main ? main.innerHTML : html;
}

/**
 * Reinicializa scripts después de cargar contenido
 */
async function reinicializarPagina() {
  try {
    const { inicializarSesionUI } = await import('./scripts/comunes.ts');
    await inicializarSesionUI();
  } catch (error) {
    console.error('Error reinicializando:', error);
  }
}

/**
 * Carga y muestra el contenido de una ruta
 */
async function mostrarRuta(ruta: string) {
  if (!contenedorPrincipal) {
    contenedorPrincipal = document.querySelector('main.contenido');
    if (!contenedorPrincipal) return;
  }

  const archivo = rutasMap[ruta] || '/index.html';
  
  // Si es la página de inicio, recargar (tiene scripts especiales)
  if (ruta === '/' || ruta === '/index.html') {
    location.reload();
    return;
  }

  // Mostrar spinner de carga
  contenedorPrincipal.innerHTML = '<div style="text-align: center; padding: 20px;">Cargando...</div>';

  // Obtener HTML
  const html = await obtenerPagina(archivo);
  const contenido = extraerContenidoMain(html);

  // Mostrar contenido
  contenedorPrincipal.innerHTML = contenido;
  
  // Reinicializar componentes
  await reinicializarPagina();

  // Scroll al inicio
  window.scrollTo(0, 0);
}

/**
 * Navega a una ruta
 */
export function navegarA(ruta: string) {
  // Convertir /pages/login.html a /login
  let rutaNormalizada = ruta;
  if (ruta.startsWith('/pages/')) {
    rutaNormalizada = '/' + ruta.replace('/pages/', '').replace('.html', '');
  } else if (ruta === '/index.html') {
    rutaNormalizada = '/';
  }

  // Evitar navegación a la misma ruta
  if (window.location.pathname === rutaNormalizada) return;

  // Actualizar URL
  window.history.pushState({ ruta: rutaNormalizada }, '', rutaNormalizada);

  // Cargar contenido
  mostrarRuta(rutaNormalizada);
}

/**
 * Intercepta clics en enlaces
 */
function inicializarInterceptoresEnlaces() {
  document.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Si es un enlace interno
    if (href.startsWith('/') && !href.includes('://')) {
      event.preventDefault();
      navegarA(href);
    }
  });
}

/**
 * Maneja navegación del historial (botones atrás/adelante)
 */
function inicializarHistorial() {
  window.addEventListener('popstate', () => {
    const ruta = window.location.pathname;
    mostrarRuta(ruta);
  });
}

/**
 * Carga la ruta actual al iniciar
 */
function cargarRutaActual() {
  const ruta = window.location.pathname;
  
  // Si no es la página de inicio, cargar contenido dinámico
  if (ruta !== '/' && ruta !== '/index.html') {
    mostrarRuta(ruta);
  }
}

/**
 * Inicializa el router
 */
export function inicializarRouter() {
  inicializarInterceptoresEnlaces();
  inicializarHistorial();
  cargarRutaActual();
}

