// comunes.ts - Funciones compartidas entre páginas
// -----------------------------------------------

// IMPORTANTE: Mantenemos las rutas relativas originales
import { supabase } from "../services/supabase.js";
// La ruta correcta hacia idiomas.js (está en la misma carpeta que comunes.ts)
import { obtenerTraduccion } from "./idiomas.js"; 

/**
 * Inicializa el estado de sesión en la cabecera (login/registro vs perfil/cerrar sesión)
 */
export async function inicializarSesionUI() {
	const contenedorDer = document.querySelector('.cabecera__der') as HTMLElement | null;
	if (!contenedorDer) return;

	const linkLogin = contenedorDer.querySelector('a[href="/pages/login.html"]') as HTMLAnchorElement | null;
	const linkRegistro = contenedorDer.querySelector('a[href="/pages/registro.html"]') as HTMLAnchorElement | null;
	const botonAccesibilidad = contenedorDer.querySelector('#boton-accesibilidad') as HTMLButtonElement | null;

	try {
		const { data: { user }, error } = await supabase.auth.getUser();

		if (error || !user) {
			// Sin sesión: mostrar botones de acceso y quitar perfil/cerrar sesión
			if (linkLogin) linkLogin.style.display = '';
			if (linkRegistro) linkRegistro.style.display = '';

			const linkPerfilExistente = contenedorDer.querySelector('#link-perfil') as HTMLAnchorElement | null;
			const btnLogoutExistente = contenedorDer.querySelector('#btn-logout') as HTMLButtonElement | null;
			if (linkPerfilExistente) linkPerfilExistente.remove();
			if (btnLogoutExistente) btnLogoutExistente.remove();
			return;
		}

		// Hay sesión activa: ocultar login/registro
		if (linkLogin) linkLogin.style.display = 'none';
		if (linkRegistro) linkRegistro.style.display = 'none';

		// Asegurar enlace a perfil
		let linkPerfil = contenedorDer.querySelector('#link-perfil') as HTMLAnchorElement | null;
		if (!linkPerfil) {
			linkPerfil = document.createElement('a');
			linkPerfil.id = 'link-perfil';
			linkPerfil.href = '/pages/perfil.html';
			linkPerfil.className = 'boton';
			linkPerfil.textContent = 'Mi Perfil';

			if (botonAccesibilidad) {
				contenedorDer.insertBefore(linkPerfil, botonAccesibilidad);
			} else {
				contenedorDer.appendChild(linkPerfil);
			}
		}

		// Asegurar botón de cierre de sesión
		let btnLogout = contenedorDer.querySelector('#btn-logout') as HTMLButtonElement | null;
		if (!btnLogout) {
			btnLogout = document.createElement('button');
			btnLogout.id = 'btn-logout';
			btnLogout.className = 'boton';
			btnLogout.textContent = 'Cerrar sesión';

			if (botonAccesibilidad) {
				contenedorDer.insertBefore(btnLogout, botonAccesibilidad);
			} else {
				contenedorDer.appendChild(btnLogout);
			}

			btnLogout.addEventListener('click', async () => {
				try {
					await supabase.auth.signOut();
				} finally {
					window.location.href = '/';
				}
			});
		}
	} catch (e) {
		console.error('Error al inicializar la sesión en la UI:', e);
	}
}

/**
 * Inicializa el modo oscuro/claro con persistencia local
 */
export function inicializarTema() {
	const botonAccesibilidad = document.getElementById('boton-accesibilidad') as HTMLButtonElement | null;
	
	// Cargar preferencia guardada y aplicar inmediatamente
	const guardado = localStorage.getItem('contrasteAlto');
	const contrasteAlto = guardado === 'true';
	
	if (contrasteAlto) {
		document.documentElement.setAttribute('data-contraste', 'alto');
		if (botonAccesibilidad) {
			botonAccesibilidad.textContent = obtenerTraduccion('btn.modo-claro');
		}
	} else {
		document.documentElement.removeAttribute('data-contraste');
		if (botonAccesibilidad) {
			botonAccesibilidad.textContent = obtenerTraduccion('btn.modo-oscuro');
		}
	}

	botonAccesibilidad?.addEventListener('click', () => {
		const contrasteActual = document.documentElement.hasAttribute('data-contraste');
		const nuevoContraste = !contrasteActual;
		
		if (nuevoContraste) {
			document.documentElement.setAttribute('data-contraste', 'alto');
			localStorage.setItem('contrasteAlto', 'true');
			botonAccesibilidad.textContent = obtenerTraduccion('btn.modo-claro');
		} else {
			document.documentElement.removeAttribute('data-contraste');
			localStorage.removeItem('contrasteAlto');
			botonAccesibilidad.textContent = obtenerTraduccion('btn.modo-oscuro');
		}
	});
}

/**
 * Actualiza automáticamente el año del pie de página
 */
export function actualizarAnio() {
	const ano = document.getElementById('ano');
	if (ano) ano.textContent = String(new Date().getFullYear());
}

/**
 * Inicializa el menú hamburguesa desplegable para móviles
 */
export function inicializarMenu() {
	const menuToggle = document.getElementById('menuToggle') as HTMLButtonElement | null;
	// Apuntamos al nuevo contenedor colapsable
	const menuContainer = document.getElementById('menu-colapsable') as HTMLElement | null;

	if (!menuToggle || !menuContainer) {
		console.warn('Elementos del menú (toggle o contenedor) no encontrados.');
		return;
	}
	
	// Escuchar clics para alternar el menú
	menuToggle.addEventListener('click', () => {
		// Comprobar el estado ARIA
		const menuAbierto = menuToggle.getAttribute('aria-expanded') === 'true';
		const nuevoEstado = !menuAbierto;

		if (nuevoEstado) {
			// Abrir menú
			menuContainer.classList.add('is-open');
			menuToggle.setAttribute('aria-expanded', 'true');
			menuToggle.setAttribute('aria-label', 'Cerrar menú');
		} else {
			// Cerrar menú
			menuContainer.classList.remove('is-open');
			menuToggle.setAttribute('aria-expanded', 'false');
			menuToggle.setAttribute('aria-label', 'Abrir menú');
		}
	});

	// Opcional: auto-resetear al cambiar tamaño a desktop
	window.addEventListener('resize', () => {
		if (window.innerWidth > 980) {
			// Si estamos en desktop, resetear el estado
			menuContainer.classList.remove('is-open');
			menuToggle.setAttribute('aria-expanded', 'false');
			menuToggle.setAttribute('aria-label', 'Abrir menú');
		}
	});
}

let atajosInicializados = false; // Evitar múltiples listeners

/**
 * Inicializa los atajos de teclado globales
 * Usa Alt + número/letra para navegar rápidamente
 */
export function inicializarAtajosTeclado() {
	// Evitar múltiples listeners
	if (atajosInicializados) {
		console.log('Atajos de teclado ya inicializados');
		return;
	}
	
	atajosInicializados = true;
	console.log('✅ Atajos de teclado inicializados (Alt + número/letra)');
	
	window.addEventListener('keydown', (e) => {
		// Solo activar si se presiona Alt (y no Ctrl o Shift)
		if (!e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
			return;
		}
		
		// Ignorar si se está escribiendo en un input, textarea o contenteditable
		const target = e.target as HTMLElement;
		if (target && (
			target.tagName === 'INPUT' || 
			target.tagName === 'TEXTAREA' || 
			target.isContentEditable ||
			(target as HTMLElement).closest('input, textarea, [contenteditable="true"]')
		)) {
			return; // No activar atajos mientras se escribe
		}
		
		// Procesar atajos con Alt + número/letra
		const key = e.key.toLowerCase();
		
		switch (key) {
			case '1': // Alt + 1 (Inicio)
				e.preventDefault();
				console.log('⌨️ Atajo: Alt + 1 → Ir a Inicio');
				window.location.href = '/';
				break;

			case '2': // Alt + 2 (Rutas)
				e.preventDefault();
				console.log('⌨️ Atajo: Alt + 2 → Ir a Rutas');
				window.location.href = '/pages/rutas.html';
				break;
				
			case '3': // Alt + 3 (Novedades)
				e.preventDefault();
				console.log('⌨️ Atajo: Alt + 3 → Ir a Novedades');
				window.location.href = '/pages/novedades.html';
				break;
				
			case '4': // Alt + 4 (Ayuda)
				e.preventDefault();
				console.log('⌨️ Atajo: Alt + 4 → Ir a Ayuda');
				window.location.href = '/pages/ayuda.html';
				break;
			
			case 'p': // Alt + P (Perfil)
				e.preventDefault();
				console.log('⌨️ Atajo: Alt + P → Ir a Perfil');
				window.location.href = '/pages/perfil.html';
				break;
				
			case 'l': // Alt + L (Login)
				e.preventDefault();
				console.log('⌨️ Atajo: Alt + L → Ir a Iniciar Sesión');
				window.location.href = '/pages/login.html';
				break;

			case 'g': // Alt + G (Buscar/Enfoque)
				e.preventDefault();
				console.log('⌨️ Atajo: Alt + G → Buscar Rutas');
				if (window.location.pathname.includes('/pages/rutas.html')) {
					const searchInput = document.getElementById('busqueda-rutas') as HTMLInputElement;
					if (searchInput) {
						searchInput.focus();
					}
				} else {
					window.location.href = '/pages/rutas.html';
				}
				break;
				
			case 'a': // Alt + A (Accesibilidad)
				e.preventDefault();
				console.log('⌨️ Atajo: Alt + A → Abrir Accesibilidad');
				const botonAccesibilidad = document.getElementById('boton-accesibilidad') as HTMLButtonElement;
				if (botonAccesibilidad) {
					botonAccesibilidad.click();
				}
				break;
		}
	});
}