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
  console.log('🔗 Agregando event listener para clics...');
  
  // Listener global para VER TODOS los clics
  document.addEventListener('click', (event) => {
    console.log('🖱️ CLIC GLOBAL:', {
      target: event.target,
      href: (event.target as any)?.href,
      tagName: (event.target as any)?.tagName,
    });
  }, true);
  
  // Listener específico para enlaces
  document.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest('a');
    
    if (!link) {
      return;
    }

    const href = link.getAttribute('href');
    console.log('🔗 Enlace encontrado, href:', href);
    
    if (!href) {
      return;
    }

    // Si es un enlace interno
    if (href.startsWith('/') && !href.includes('://')) {
      // Para enlaces con # (anchors) o términos especiales, permitir navegación normal
      if (href.includes('#') || href.includes('?')) {
        console.log('⏭️ Enlace con # o ?, ignorando');
        return;
      }
      
      console.log('✅ Previniendo navegación por defecto para:', href);
      event.preventDefault();
      event.stopPropagation();
      console.log('🧭 Llamando a navegarA()');
      navegarA(href);
    }
  }, true); // Usar capture phase
  
  console.log('✅ Event listeners agregados');
}

/**
 * Inicializa el router
 */
export function inicializarRouter() {
  console.log('🚀 Inicializando router...');
  
  // Esperar a que el DOM esté completamente listo
  if (document.readyState === 'loading') {
    console.log('⏳ DOM todavía cargando, esperando...');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📄 DOMContentLoaded disparado');
      inicializarInterceptoresEnlaces();
    });
  } else {
    console.log('📄 DOM ya cargado');
    inicializarInterceptoresEnlaces();
  }
  
  console.log('✅ Router inicializado');
}

