/**
 * router.ts - Router simple para SPA
 * Usa location.href con soporte para vercel.json que redirige todo a index.html
 */

/**
 * Navega a una ruta
 */
export function navegarA(ruta: string) {
  console.log('🧭 navegarA() llamado con:', ruta);
  
  // Convertir /pages/login.html a location.href directo
  if (ruta.startsWith('/pages/')) {
    window.location.href = ruta;
  } else if (ruta === '/') {
    window.location.href = '/';
  } else if (!ruta.startsWith('/pages/') && ruta !== '/') {
    // Si es una ruta simple como /login, convertir a /pages/login.html
    window.location.href = `/pages/${ruta.replace(/^\//, '')}.html`;
  }
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
      // Para enlaces con # (anchors) o términos especiales, permitir navegación normal
      if (href.includes('#') || href.includes('?')) {
        return;
      }
      
      event.preventDefault();
      navegarA(href);
    }
  });
}

/**
 * Inicializa el router
 */
export function inicializarRouter() {
  console.log('🚀 Inicializando router...');
  inicializarInterceptoresEnlaces();
  console.log('✅ Router inicializado');
}

