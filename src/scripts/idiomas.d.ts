// Declaraciones de tipos para idiomas.js
export function inicializarIdiomas(): void;
export function obtenerTraduccion(clave: string): string;
export function traducirTextoDinamico(clave: string, texto?: string): string;
export function actualizarTraduccionDinamica(elemento: HTMLElement | null, clave: string): void;
export function inicializarAccesibilidad(): void;

