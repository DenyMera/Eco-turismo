/**
 * router.ts - Sistema de enrutamiento simple para SPA
 * Con Vercel, simplemente redirigimos usando location.href
 * Vercel servirá siempre index.html gracias a vercel.json
 */

/**
 * Navega a una nueva ruta
 */
export function navegarA(ruta: string) {
  // Normalizar rutas
  let url = ruta;
  
  if (ruta === '/') {
    url = '/index.html';
  } else if (!ruta.endsWith('.html')) {
    // Convertir /login a /pages/login.html
    url = `/pages/${ruta.replace(/^\//, '')}.html`;
  }

  // Usar location.href para navegar
  // Gracias a vercel.json, esto NO causará error 404
  window.location.href = url;
}

/**
 * Intercepta clics en enlaces para usar navegarA
 */
export function inicializarInterceptoresEnlaces() {
  document.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest('a');
    
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Si es un enlace a una página interna
    if (href.startsWith('/pages/') || (href.startsWith('/') && !href.includes('://'))) {
      event.preventDefault();
      navegarA(href);
    }
  });
}

/**
 * Inicializa el router
 */
export function inicializarRouter() {
  inicializarInterceptoresEnlaces();
}
