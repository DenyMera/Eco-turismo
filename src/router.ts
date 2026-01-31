/**
 * router.ts - Sistema de enrutamiento del lado del cliente para SPA
 * Maneja la navegación sin recargar la página
 */

// Almacenar el contenido de las páginas en caché
const paginasCache: Record<string, string> = {};

// Elemento donde se carga el contenido dinámico
let contenedorPrincipal: HTMLElement | null = null;

/**
 * Obtiene el HTML de una página
 */
async function obtenerPagina(ruta: string): Promise<string> {
  // Si está en caché, devolverlo
  if (paginasCache[ruta]) {
    return paginasCache[ruta];
  }

  try {
    const response = await fetch(ruta);
    if (!response.ok) throw new Error(`Error fetching ${ruta}`);
    const html = await response.text();
    
    // Guardar en caché
    paginasCache[ruta] = html;
    return html;
  } catch (error) {
    console.error('Error loading page:', error);
    return '<p>Error cargando la página</p>';
  }
}

/**
 * Extrae solo el contenido <main> de una página
 */
function extraerContenidoMain(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const main = doc.querySelector('main');
  return main ? main.innerHTML : html;
}

/**
 * Navega a una nueva ruta
 */
export async function navegarA(ruta: string) {
  // Evitar navegación innecesaria
  if (window.location.pathname === ruta) return;

  // Actualizar URL sin recargar
  window.history.pushState({ ruta }, '', ruta);

  // Cargar y mostrar la página
  await cargarYMostrarPagina(ruta);
}

/**
 * Carga la página y la muestra en el DOM
 */
async function cargarYMostrarPagina(ruta: string) {
  if (!contenedorPrincipal) {
    contenedorPrincipal = document.querySelector('main.contenido');
    if (!contenedorPrincipal) return;
  }

  // Mapear rutas personalizadas a archivos
  let archivo = ruta;
  
  if (ruta === '/login') archivo = '/pages/login.html';
  else if (ruta === '/registro') archivo = '/pages/registro.html';
  else if (ruta === '/rutas') archivo = '/pages/rutas.html';
  else if (ruta === '/novedades') archivo = '/pages/novedades.html';
  else if (ruta === '/ayuda') archivo = '/pages/ayuda.html';
  else if (ruta === '/perfil') archivo = '/pages/perfil.html';
  else if (ruta === '/recuperar') archivo = '/pages/recuperar.html';
  else if (ruta === '/recuperar-email') archivo = '/pages/recuperar-email.html';
  else if (ruta === '/terminos') archivo = '/pages/terminos.html';
  else if (ruta === '/' || ruta === '/index.html') {
    // Restaurar página de inicio
    location.reload();
    return;
  }

  // Obtener el HTML
  const html = await obtenerPagina(archivo);
  const contenido = extraerContenidoMain(html);

  // Mostrar con animación suave
  contenedorPrincipal.style.opacity = '0';
  await new Promise(resolve => setTimeout(resolve, 150));
  
  contenedorPrincipal.innerHTML = contenido;
  
  contenedorPrincipal.style.opacity = '1';
  contenedorPrincipal.style.transition = 'opacity 0.3s ease-in-out';

  // Reejecutar scripts y reinicializar componentes
  await reinicializarPagina();

  // Scroll al inicio
  window.scrollTo(0, 0);
}

/**
 * Reinicializa componentes después de cargar una página
 */
async function reinicializarPagina() {
  // Importar y ejecutar funciones de inicialización
  try {
    const { inicializarSesionUI, inicializarTema } = await import('/src/scripts/comunes.ts');
    const { inicializarIdiomas, inicializarAccesibilidad } = await import('/src/scripts/idiomas.js');
    
    inicializarTema();
    inicializarIdiomas();
    inicializarAccesibilidad();
    await inicializarSesionUI();
  } catch (error) {
    console.error('Error reinicializando página:', error);
  }
}

/**
 * Intercepta clics en enlaces para navegación del cliente
 */
export function inicializarInterceptoresEnlaces() {
  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest('a');
    
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Si es un enlace a una página interna (SPA)
    if (href.startsWith('/pages/') || href.startsWith('/')) {
      e.preventDefault();
      
      // Convertir rutas de /pages/login.html a /login
      let ruta = href;
      if (href.startsWith('/pages/')) {
        ruta = '/' + href.replace('/pages/', '').replace('.html', '');
      } else if (href === '/index.html') {
        ruta = '/';
      }

      navegarA(ruta);
    }
  });
}

/**
 * Maneja el botón atrás/adelante del navegador
 */
export function inicializarNavegacionHistorial() {
  window.addEventListener('popstate', (e) => {
    const ruta = window.location.pathname;
    cargarYMostrarPagina(ruta);
  });
}

/**
 * Inicializa el router
 */
export function inicializarRouter() {
  // Aplicar estilos de transición
  const main = document.querySelector('main.contenido') as HTMLElement;
  if (main) {
    main.style.transition = 'opacity 0.3s ease-in-out';
    main.style.opacity = '1';
  }

  inicializarInterceptoresEnlaces();
  inicializarNavegacionHistorial();
}
