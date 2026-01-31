/**
 * 🔗 Servicio de Supabase para Rutas Eco-Comunitarias
 * * Este archivo contiene todas las funciones para interactuar con la base de datos
 * de Supabase. Incluye funciones para clientes (ver rutas) y administradores (gestionar rutas).
 * * @author Sistema Rutas Eco-Comunitarias
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseKey) {
  throw new Error(`
    ❌ Error de configuración de Supabase
    
    Las siguientes variables de entorno son requeridas:
    - VITE_SUPABASE_URL
    - VITE_SUPABASE_ANON_KEY
    
    Por favor, configura tu archivo .env.local con las credenciales de Supabase.
    Consulta la documentación en docs/supabase-setup.md para más información.
  `)
}

// Crear cliente de Supabase (sin opciones de persistencia explícitas)
export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * 🗺️ SERVICIOS PARA CLIENTES (Vista de Rutas)
 */

/**
 * Obtiene todas las rutas activas con filtros opcionales
 * @param {Object} filtros - Objeto con filtros de búsqueda
 * @param {string} filtros.busqueda - Texto de búsqueda
 * @param {string} filtros.dificultad - Filtro por dificultad
 * @param {string} filtros.tipo - Filtro por tipo de ruta
 * @param {string} filtros.duracion - Filtro por duración
 * @param {string} filtros.distancia - Filtro por distancia
 * @returns {Promise<Object>} - Objeto con data y error
 */
/**
 * Obtiene el plan del usuario actual
 * @returns {Promise<string>} - 'basico' o 'pro'
 */
export async function obtenerPlanUsuario() {
  try {
    const user = await obtenerUsuarioActual()
    if (!user) {
      return 'basico' // Por defecto, usuarios no autenticados tienen plan básico
    }

    const { data, error } = await supabase
      .from('usuarios_perfiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (error || !data) {
      return 'basico' // Por defecto si hay error
    }

    return data.plan || 'basico'
  } catch (error) {
    console.error('Error al obtener plan del usuario:', error)
    return 'basico'
  }
}

/**
 * Actualiza el plan del usuario
 * @param {string} nuevoPlan - 'basico' o 'pro'
 * @returns {Promise<Object>} - Objeto con data y error
 */
export async function actualizarPlanUsuario(nuevoPlan) {
  try {
    const user = await obtenerUsuarioActual()
    if (!user) {
      return { data: null, error: new Error('No estás autenticado') }
    }

    if (nuevoPlan !== 'basico' && nuevoPlan !== 'pro') {
      return { data: null, error: new Error('Plan inválido. Debe ser "basico" o "pro"') }
    }

    const { data, error } = await supabase
      .from('usuarios_perfiles')
      .update({ plan: nuevoPlan })
      .eq('id', user.id)
      .select()

    if (error) {
      console.error('Error al actualizar plan:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error inesperado al actualizar plan:', error)
    return { data: null, error }
  }
}

export async function obtenerRutasFiltradas(filtros = {}) {
  try {
    // Obtener plan del usuario actual
    const planUsuario = await obtenerPlanUsuario()
    
    let query = supabase
      .from('rutas')
      .select(`
        id,
        nombre,
        descripcion,
        imagen_url,
        dificultad,
        duracion_horas,
        distancia_km,
        ubicacion,
        tipo,
        puntuacion,
        plan,
        latitud_inicio,
        longitud_inicio,
        latitud_fin,
        longitud_fin
      `)
      .eq('activa', true)
      
    // NOTA: No filtramos por plan aquí porque queremos mostrar todas las rutas
    // (incluidas las Pro) para que los usuarios básicos las vean con candado
    // El filtro real se hace en el frontend

    // Aplicar filtros de búsqueda
    if (filtros.busqueda) {
      query = query.or(`nombre.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%,ubicacion.ilike.%${filtros.busqueda}%`)
    }

    // Aplicar filtro de dificultad
    if (filtros.dificultad) {
      query = query.eq('dificultad', filtros.dificultad)
    }

    // Aplicar filtro de tipo
    if (filtros.tipo) {
      query = query.eq('tipo', filtros.tipo)
    }

    // Aplicar filtros de duración
    if (filtros.duracion === 'corta') {
      query = query.lt('duracion_horas', 1)
    } else if (filtros.duracion === 'media') {
      query = query.gte('duracion_horas', 1).lte('duracion_horas', 3)
    } else if (filtros.duracion === 'larga') {
      query = query.gt('duracion_horas', 3)
    }

    // Aplicar filtros de distancia
    if (filtros.distancia === 'corta') {
      query = query.lt('distancia_km', 2)
    } else if (filtros.distancia === 'media') {
      query = query.gte('distancia_km', 2).lte('distancia_km', 5)
    } else if (filtros.distancia === 'larga') {
      query = query.gt('distancia_km', 5)
    }

    // Ordenar por puntuación y fecha
    query = query.order('puntuacion', { ascending: false })
                  .order('fecha_creacion', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error al obtener rutas:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error inesperado al obtener rutas:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene una ruta específica por ID con sus puntos ecológicos
 * @param {number} rutaId - ID de la ruta
 * @returns {Promise<Object>} - Objeto con data y error
 */
export async function obtenerRutaCompleta(rutaId) {
  try {
    // Obtener datos de la ruta
    const { data: ruta, error: errorRuta } = await supabase
      .from('rutas')
      .select('*, plan')
      .eq('id', rutaId)
      .eq('activa', true)
      .single()

    if (errorRuta) {
      console.error('Error al obtener ruta:', errorRuta)
      return { data: null, error: errorRuta }
    }

    // Obtener puntos ecológicos de la ruta
    const { data: puntos, error: errorPuntos } = await supabase
      .from('puntos_ecologicos')
      .select('*')
      .eq('ruta_id', rutaId)
      .order('orden')

    if (errorPuntos) {
      console.error('Error al obtener puntos ecológicos:', errorPuntos)
      return { data: null, error: errorPuntos }
    }

    // Combinar datos
    const rutaCompleta = {
      ...ruta,
      puntosEco: puntos || []
    }

    return { data: rutaCompleta, error: null }
  } catch (error) {
    console.error('Error inesperado al obtener ruta completa:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene los puntos ecológicos de una ruta específica
 * @param {number} rutaId - ID de la ruta
 * @returns {Promise<Object>} - Objeto con data y error
 */
export async function obtenerPuntosEcologicos(rutaId) {
  try {
    const { data, error } = await supabase
      .from('puntos_ecologicos')
      .select('*')
      .eq('ruta_id', rutaId)
      .order('orden')

    if (error) {
      console.error('Error al obtener puntos ecológicos:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error inesperado al obtener puntos ecológicos:', error)
    return { data: null, error }
  }
}

/**
 * Obtiene sugerencias de búsqueda para autocompletado
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Object>} - Objeto con data y error
 */
export async function obtenerSugerencias(termino) {
  try {
    const { data, error } = await supabase
      .from('rutas')
      .select(`
        id,
        nombre,
        ubicacion,
        dificultad,
        duracion_horas,
        distancia_km,
        plan
      `)
      .eq('activa', true)
      .or(`nombre.ilike.%${termino}%,ubicacion.ilike.%${termino}%`)
      .order('puntuacion', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error al obtener sugerencias:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error inesperado al obtener sugerencias:', error)
    return { data: null, error }
  }
}

/**
 * 💾 Guarda una ruta como favorita para el usuario actual
 * Tabla sugerida en Supabase: rutas_favoritas (id, usuario_id, ruta_id, creada_en)
 * @param {number} rutaId - ID de la ruta a guardar
 */
export async function guardarRutaFavorita(rutaId) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { data: null, error: new Error('Debes iniciar sesión para guardar rutas') }
    }

    const { data, error } = await supabase
      .from('rutas_favoritas')
      .upsert(
        { usuario_id: user.id, ruta_id: rutaId },
        { onConflict: 'usuario_id,ruta_id' }
      )
      .select()

    if (error) {
      console.error('Error al guardar ruta favorita:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error inesperado al guardar ruta favorita:', error)
    return { data: null, error }
  }
}

/**
 * 📥 Obtiene las rutas favoritas del usuario actual
 * Requiere una vista o relación en Supabase que una rutas_favoritas con rutas.
 */
export async function obtenerRutasFavoritasUsuario() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { data: [], error: new Error('No autenticado') }
    }

    const { data, error } = await supabase
      .from('rutas_favoritas')
      .select(`
        ruta:ruta_id (
          id,
          nombre,
          descripcion,
          imagen_url,
          dificultad,
          duracion_horas,
          distancia_km,
          ubicacion,
          tipo,
          puntuacion,
          plan
        )
      `)
      .eq('usuario_id', user.id)

    if (error) {
      console.error('Error al obtener rutas favoritas:', error)
      return { data: null, error }
    }

    const rutas = (data || []).map(fav => convertirRutaFormato({
      ...fav.ruta
    }))

    return { data: rutas, error: null }
  } catch (error) {
    console.error('Error inesperado al obtener rutas favoritas:', error)
    return { data: null, error }
  }
}

/**
 * 🔐 SERVICIOS DE AUTENTICACIÓN
 */

/**
 * Obtiene el usuario actual autenticado
 * @returns {Promise<Object>} - Usuario actual o null
 */
export async function obtenerUsuarioActual() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error al obtener usuario:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Error inesperado al obtener usuario:', error)
    return null
  }
}

/**
 * Verifica si el usuario actual es administrador
 * @returns {Promise<boolean>} - true si es administrador
 */
export async function esAdministrador() {
  try {
    const user = await obtenerUsuarioActual()
    if (!user) {
      console.log('❌ No hay usuario autenticado')
      return false
    }

    console.log('🔍 Verificando rol para usuario:', user.id)

    const { data, error } = await supabase
      .from('usuarios_perfiles')
      .select('rol, nombre, apellido')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('❌ Error al verificar rol:', error)
      console.error('Detalles del error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return false
    }

    console.log('📋 Perfil encontrado:', data)
    const esAdmin = data?.rol === 'administrador'
    console.log('🎭 Rol:', data?.rol, '| Es administrador:', esAdmin)
    
    return esAdmin
  } catch (error) {
    console.error('❌ Error inesperado al verificar rol:', error)
    return false
  }
}

/**
 * 👨‍💼 SERVICIOS PARA ADMINISTRADORES
 */

/**
 * Obtiene todas las rutas (incluyendo inactivas) para administradores
 * @returns {Promise<Object>} - Objeto con data y error
 */
export async function obtenerTodasLasRutas() {
  try {
    const { data, error } = await supabase
      .from('rutas')
      .select('*, plan')
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('Error al obtener todas las rutas:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error inesperado al obtener todas las rutas:', error)
    return { data: null, error }
  }
}

/**
 * Crea una nueva ruta (solo administradores)
 * @param {Object} rutaData - Datos de la nueva ruta
 * @returns {Promise<Object>} - Objeto con data y error
 */
export async function crearRuta(rutaData) {
  try {
    const { data, error } = await supabase
      .from('rutas')
      .insert([rutaData])
      .select()

    if (error) {
      console.error('Error al crear ruta:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error inesperado al crear ruta:', error)
    return { data: null, error }
  }
}

/**
 * Actualiza una ruta existente (solo administradores)
 * @param {number} rutaId - ID de la ruta
 * @param {Object} rutaData - Nuevos datos de la ruta
 * @returns {Promise<Object>} - Objeto con data y error
 */
export async function actualizarRuta(rutaId, rutaData) {
  try {
    const { data, error } = await supabase
      .from('rutas')
      .update(rutaData)
      .eq('id', rutaId)
      .select()

    if (error) {
      console.error('Error al actualizar ruta:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error inesperado al actualizar ruta:', error)
    return { data: null, error }
  }
}

/**
 * Cambia el estado activo/inactivo de una ruta
 * @param {number} rutaId - ID de la ruta
 * @param {boolean} activa - Nuevo estado
 * @returns {Promise<Object>} - Objeto con data y error
 */
export async function cambiarEstadoRuta(rutaId, activa) {
  try {
    const { data, error } = await supabase
      .from('rutas')
      .update({ activa })
      .eq('id', rutaId)
      .select()

    if (error) {
      console.error('Error al cambiar estado de ruta:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error inesperado al cambiar estado de ruta:', error)
    return { data: null, error }
  }
}

/**
 * Elimina una ruta (solo administradores)
 * @param {number} rutaId - ID de la ruta
 * @returns {Promise<Object>} - Objeto con data y error
 */
export async function eliminarRuta(rutaId) {
  try {
    const { data, error } = await supabase
      .from('rutas')
      .delete()
      .eq('id', rutaId)

    if (error) {
      console.error('Error al eliminar ruta:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error inesperado al eliminar ruta:', error)
    return { data: null, error }
  }
}

/**
 * 📊 SERVICIOS DE ESTADÍSTICAS
 */

/**
 * Obtiene estadísticas generales del sistema
 * @returns {Promise<Object>} - Objeto con estadísticas
 */
export async function obtenerEstadisticas() {
  try {
    // Obtener total de rutas
    const { count: totalRutas } = await supabase
      .from('rutas')
      .select('*', { count: 'exact', head: true })

    // Obtener rutas activas
    const { count: rutasActivas } = await supabase
      .from('rutas')
      .select('*', { count: 'exact', head: true })
      .eq('activa', true)

    // Obtener total de usuarios
    const { count: totalUsuarios } = await supabase
      .from('usuarios_perfiles')
      .select('*', { count: 'exact', head: true })

    return {
      totalRutas: totalRutas || 0,
      rutasActivas: rutasActivas || 0,
      totalUsuarios: totalUsuarios || 0
    }
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    return {
      totalRutas: 0,
      rutasActivas: 0,
      totalUsuarios: 0
    }
  }
}

/**
 * 🔄 FUNCIONES DE UTILIDAD
 */

/**
 * Convierte los datos de la base de datos al formato esperado por el frontend
 * @param {Object} rutaDB - Ruta desde la base de datos
 * @returns {Object} - Ruta en formato del frontend
 */
export function convertirRutaFormato(rutaDB) {
  return {
    id: rutaDB.id,
    nombre: rutaDB.nombre,
    descripcion: rutaDB.descripcion,
    imagen: rutaDB.imagen_url,
    dificultad: rutaDB.dificultad,
    duracion: `${rutaDB.duracion_horas}h`,
    distancia: `${rutaDB.distancia_km} km`,
    ubicacion: rutaDB.ubicacion,
    tipo: rutaDB.tipo,
    puntuacion: rutaDB.puntuacion,
    plan: rutaDB.plan || 'basico',
    puntosEco: rutaDB.puntosEco || [],
    coordenadasInicio: rutaDB.latitud_inicio && rutaDB.longitud_inicio ? {
      lat: rutaDB.latitud_inicio,
      lng: rutaDB.longitud_inicio
    } : null,
    coordenadasFin: rutaDB.latitud_fin && rutaDB.longitud_fin ? {
      lat: rutaDB.latitud_fin,
      lng: rutaDB.longitud_fin
    } : null
  }
}

/**
 * Maneja errores de Supabase de forma consistente
 * @param {Object} error - Error de Supabase
 * @returns {string} - Mensaje de error amigable
 */
export function manejarErrorSupabase(error) {
  if (error?.message) {
    return error.message
  }
  
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        return 'No se encontraron datos'
      case '23505':
        return 'Ya existe un registro con estos datos'
      case '23503':
        return 'No se puede eliminar porque tiene datos relacionados'
      default:
        return 'Error desconocido en la base de datos'
    }
  }
  
  return 'Error de conexión con la base de datos'
}

/**
 * 📤 Sube una imagen a Supabase Storage
 * @param {File} archivo - Archivo de imagen a subir
 * @param {number} rutaId - ID de la ruta (opcional)
 * @returns {Promise<Object>} - Objeto con url y error
 */
export async function subirImagenRuta(archivo, rutaId = null) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { url: null, error: new Error('Debes iniciar sesión para subir imágenes') }
    }

    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!tiposPermitidos.includes(archivo.type)) {
      return { url: null, error: new Error('Tipo de archivo no permitido. Use JPG, PNG o WEBP') }
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024
    if (archivo.size > maxSize) {
      return { url: null, error: new Error('La imagen es demasiado grande. Máximo 5MB') }
    }

    // Generar nombre único
    const timestamp = Date.now()
    const nombreArchivo = rutaId 
      ? `rutas/${rutaId}/${timestamp}-${archivo.name}`
      : `rutas/temporal/${user.id}-${timestamp}-${archivo.name}`

    // Subir archivo
    const { data, error } = await supabase.storage
      .from('rutas-imagenes')
      .upload(nombreArchivo, archivo, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error al subir imagen:', error)
      return { url: null, error }
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('rutas-imagenes')
      .getPublicUrl(data.path)

    return { url: urlData?.publicUrl || null, error: null }
  } catch (error) {
    console.error('Error inesperado al subir imagen:', error)
    return { url: null, error }
  }
}