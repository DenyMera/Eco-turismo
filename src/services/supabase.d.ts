// Declaraciones de tipos para supabase.js
export function obtenerUsuarioActual(): Promise<any>;
export function esAdministrador(): Promise<boolean>;
export function obtenerRutasFiltradas(filtros?: any): Promise<any>;
export function obtenerRutaCompleta(rutaId: number): Promise<any>;
export function obtenerPuntosEcologicos(rutaId: number): Promise<any>;
export function obtenerSugerencias(termino: string): Promise<any>;
export function guardarRutaFavorita(rutaId: number): Promise<any>;
export function obtenerRutasFavoritasUsuario(): Promise<any>;
export function obtenerTodasLasRutas(): Promise<any>;
export function crearRuta(rutaData: any): Promise<any>;
export function actualizarRuta(rutaId: number, rutaData: any): Promise<any>;
export function cambiarEstadoRuta(rutaId: number, activa: boolean): Promise<any>;
export function eliminarRuta(rutaId: number): Promise<any>;
export function obtenerEstadisticas(): Promise<any>;
export function convertirRutaFormato(rutaDB: any): any;
export function manejarErrorSupabase(error: any): string;
export const supabase: any;

