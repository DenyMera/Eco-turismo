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
  
  document.addEventListener('click', (event) => {
    console.log('🖱️ Clic detectado en:', event.target);
    const link = (event.target as HTMLElement).closest('a');
    
    if (!link) {
      console.log('❌ No es un enlace');
      return;
    }

    const href = link.getAttribute('href');
    console.log('🔗 href encontrado:', href);
    
    if (!href) {
      console.log('❌ Sin href');
      return;
    }

    // Si es un enlace interno
    if (href.startsWith('/') && !href.includes('://')) {
      // Para enlaces con # (anchors) o términos especiales, permitir navegación normal
      if (href.includes('#') || href.includes('?')) {
        console.log('⏭️ Enlace con # o ?, ignorando');
        return;
      }
      
      console.log('✅ Previniendo navegación por defecto');
      event.preventDefault();
      console.log('✅ Llamando a navegarA()');
      navegarA(href);
    } else {
      console.log('⏭️ Enlace externo, ignorando');
    }
  }, true); // Usar capture phase para asegurar que se ejecute primero
  
  console.log('✅ Event listener agregado correctamente');
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

