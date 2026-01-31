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
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Buscar elemento main
    let main = doc.querySelector('main');
    if (main) {
      console.log('✅ main encontrado');
      return main.innerHTML;
    }
    
    // Si no hay main, buscar body
    console.log('⚠️ No encontré main, buscando body');
    const body = doc.querySelector('body');
    if (body) {
      return body.innerHTML;
    }
    
    // Si no hay body, devolver todo el HTML
    console.log('⚠️ No encontré body, devolviendo HTML completo');
    return html;
  } catch (error) {
    console.error('❌ Error extrayendo contenido:', error);
    return '<p>Error al procesar la página</p>';
  }
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
  console.log('📥 Mostrando ruta:', ruta);
  
  if (!contenedorPrincipal) {
    contenedorPrincipal = document.querySelector('main.contenido');
    if (!contenedorPrincipal) {
      console.error('❌ No se encontró el contenedor main.contenido');
      return;
    }
  }

  const archivo = rutasMap[ruta] || '/index.html';
  console.log('📂 Archivo a cargar:', archivo);
  
  // Si es la página de inicio, recargar (tiene scripts especiales)
  if (ruta === '/' || ruta === '/index.html') {
    location.reload();
    return;
  }

  // Mostrar spinner de carga
  contenedorPrincipal.innerHTML = '<div style="text-align: center; padding: 20px;">Cargando...</div>';

  try {
    // Obtener HTML
    const html = await obtenerPagina(archivo);
    console.log('✅ HTML obtenido, longitud:', html.length);
    
    const contenido = extraerContenidoMain(html);
    console.log('📋 Contenido extraído, longitud:', contenido.length);

    // Mostrar contenido
    contenedorPrincipal.innerHTML = contenido;
    console.log('✅ Contenido insertado en el DOM');
    
    // Reinicializar componentes
    await reinicializarPagina();

    // Scroll al inicio
    window.scrollTo(0, 0);
  } catch (error) {
    console.error('❌ Error en mostrarRuta:', error);
    contenedorPrincipal.innerHTML = '<p style="color: red;">Error al cargar la página</p>';
  }
}

/**
 * Navega a una ruta
 */
export function navegarA(ruta: string) {
  console.log('🧭 navegarA() llamado con:', ruta);
  
  // Convertir /pages/login.html a /login
  let rutaNormalizada = ruta;
  if (ruta.startsWith('/pages/')) {
    rutaNormalizada = '/' + ruta.replace('/pages/', '').replace('.html', '');
    console.log('✏️ Ruta normalizada:', rutaNormalizada);
  } else if (ruta === '/index.html') {
    rutaNormalizada = '/';
  }

  // Actualizar URL (aunque sea la misma, recargar el contenido)
  console.log('📍 Actualizando URL a:', rutaNormalizada);
  window.history.pushState({ ruta: rutaNormalizada }, '', rutaNormalizada);

  // Cargar contenido
  mostrarRuta(rutaNormalizada);
}

/**
 * Intercepta clics en enlaces
 */
function inicializarInterceptoresEnlaces() {
  document.addEventListener('click', (event) => {
    console.log('🖱️ Clic detectado');
    
    const link = (event.target as HTMLElement).closest('a');
    if (!link) {
      console.log('❌ No es un enlace');
      return;
    }

    const href = link.getAttribute('href');
    console.log('🔗 href:', href);
    
    if (!href) {
      console.log('❌ Sin href');
      return;
    }

    // Si es un enlace interno
    if (href.startsWith('/') && !href.includes('://')) {
      console.log('✅ Enlace interno detectado:', href);
      event.preventDefault();
      navegarA(href);
    } else {
      console.log('⏭️ Enlace externo, ignorando');
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
  console.log('🔍 Ruta actual detectada:', ruta);
  
  // Si no es la página de inicio, cargar contenido dinámico
  if (ruta !== '/' && ruta !== '/index.html') {
    console.log('📄 Cargando contenido para:', ruta);
    mostrarRuta(ruta);
  } else {
    console.log('🏠 Página de inicio');
  }
}

/**
 * Inicializa el router
 */
export function inicializarRouter() {
  console.log('🚀 Inicializando router...');
  inicializarInterceptoresEnlaces();
  inicializarHistorial();
  cargarRutaActual();
  console.log('✅ Router inicializado');
}

