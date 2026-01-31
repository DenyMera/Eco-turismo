# 🗄️ Configuración de Supabase - Rutas Eco-Comunitarias

## 📋 Esquema de Base de Datos

### Tabla: `rutas`
```sql
-- Crear tabla de rutas
CREATE TABLE rutas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  imagen_url VARCHAR(500),
  dificultad VARCHAR(20) CHECK (dificultad IN ('facil', 'media', 'dificil')),
  duracion_horas DECIMAL(3,1) NOT NULL,
  distancia_km DECIMAL(5,2) NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) CHECK (tipo IN ('senderismo', 'ciclismo', 'observacion', 'fotografia')),
  puntuacion DECIMAL(2,1) DEFAULT 0.0 CHECK (puntuacion >= 0 AND puntuacion <= 5),
  activa BOOLEAN DEFAULT true,
  creado_por UUID REFERENCES auth.users(id),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_rutas_activa ON rutas(activa);
CREATE INDEX idx_rutas_dificultad ON rutas(dificultad);
CREATE INDEX idx_rutas_tipo ON rutas(tipo);
CREATE INDEX idx_rutas_puntuacion ON rutas(puntuacion);
```

### Tabla: `puntos_ecologicos`
```sql
-- Crear tabla de puntos ecológicos
CREATE TABLE puntos_ecologicos (
  id SERIAL PRIMARY KEY,
  ruta_id INTEGER REFERENCES rutas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  orden INTEGER DEFAULT 0,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para optimizar consultas por ruta
CREATE INDEX idx_puntos_ruta_id ON puntos_ecologicos(ruta_id);
```

### Tabla: `usuarios_perfiles`
```sql
-- Crear tabla de perfiles de usuario
CREATE TABLE usuarios_perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nombre VARCHAR(255),
  apellido VARCHAR(255),
  rol VARCHAR(20) DEFAULT 'cliente' CHECK (rol IN ('cliente', 'administrador')),
  telefono VARCHAR(20),
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activo BOOLEAN DEFAULT true
);

-- Índice para búsquedas por rol
CREATE INDEX idx_usuarios_rol ON usuarios_perfiles(rol);
```

### Tabla: `rutas_favoritas`
```sql
-- Crear tabla de rutas favoritas (guardadas por usuarios)
CREATE TABLE rutas_favoritas (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ruta_id INTEGER NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
  fecha_guardado TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, ruta_id) -- Evitar duplicados: un usuario no puede guardar la misma ruta dos veces
);

-- Índices para optimizar consultas
CREATE INDEX idx_favoritas_usuario_id ON rutas_favoritas(usuario_id);
CREATE INDEX idx_favoritas_ruta_id ON rutas_favoritas(ruta_id);
```

## 🔐 Políticas de Seguridad (RLS)

### Políticas para tabla `rutas`
```sql
-- Habilitar RLS
ALTER TABLE rutas ENABLE ROW LEVEL SECURITY;

-- Clientes pueden ver solo rutas activas
CREATE POLICY "Clientes pueden ver rutas activas" ON rutas
  FOR SELECT USING (activa = true);

-- Administradores pueden ver todas las rutas
CREATE POLICY "Administradores pueden ver todas las rutas" ON rutas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfiles 
      WHERE id = auth.uid() AND rol = 'administrador'
    )
  );

-- Administradores pueden crear rutas
CREATE POLICY "Administradores pueden crear rutas" ON rutas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios_perfiles 
      WHERE id = auth.uid() AND rol = 'administrador'
    )
  );

-- Administradores pueden actualizar rutas
CREATE POLICY "Administradores pueden actualizar rutas" ON rutas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfiles 
      WHERE id = auth.uid() AND rol = 'administrador'
    )
  );

-- Administradores pueden eliminar rutas
CREATE POLICY "Administradores pueden eliminar rutas" ON rutas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfiles 
      WHERE id = auth.uid() AND rol = 'administrador'
    )
  );
```

### Políticas para tabla `puntos_ecologicos`
```sql
-- Habilitar RLS
ALTER TABLE puntos_ecologicos ENABLE ROW LEVEL SECURITY;

-- Clientes pueden ver puntos de rutas activas
CREATE POLICY "Clientes pueden ver puntos de rutas activas" ON puntos_ecologicos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rutas 
      WHERE id = puntos_ecologicos.ruta_id AND activa = true
    )
  );

-- Administradores pueden gestionar todos los puntos
CREATE POLICY "Administradores pueden gestionar puntos" ON puntos_ecologicos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfiles 
      WHERE id = auth.uid() AND rol = 'administrador'
    )
  );
```

### Políticas para tabla `usuarios_perfiles`
```sql
-- Habilitar RLS
ALTER TABLE usuarios_perfiles ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios pueden ver su perfil" ON usuarios_perfiles
  FOR SELECT USING (id = auth.uid());

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Usuarios pueden actualizar su perfil" ON usuarios_perfiles
  FOR UPDATE USING (id = auth.uid());

-- Usuarios pueden insertar su perfil
CREATE POLICY "Usuarios pueden crear su perfil" ON usuarios_perfiles
  FOR INSERT WITH CHECK (id = auth.uid());
```

### Políticas para tabla `rutas_favoritas`
```sql
-- Habilitar RLS
ALTER TABLE rutas_favoritas ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver solo sus propias rutas favoritas
CREATE POLICY "Usuarios pueden ver sus rutas favoritas" ON rutas_favoritas
  FOR SELECT USING (usuario_id = auth.uid());

-- Usuarios pueden guardar rutas en sus favoritos
CREATE POLICY "Usuarios pueden guardar rutas favoritas" ON rutas_favoritas
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- Usuarios pueden eliminar sus propias rutas favoritas
CREATE POLICY "Usuarios pueden eliminar sus rutas favoritas" ON rutas_favoritas
  FOR DELETE USING (usuario_id = auth.uid());
```

## 🚀 Configuración Inicial

### 1. Variables de Entorno
Crear archivo `.env.local`:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### 2. Trigger para Crear Perfiles Automáticamente
**IMPORTANTE:** Ejecuta este SQL completo en el SQL Editor de Supabase para que los perfiles se creen automáticamente cuando un usuario se registra:

```sql
-- PASO 1: Eliminar políticas existentes que puedan estar bloqueando
DROP POLICY IF EXISTS "Usuarios pueden crear su perfil" ON public.usuarios_perfiles;
DROP POLICY IF EXISTS "Trigger puede crear perfiles automáticamente" ON public.usuarios_perfiles;

-- PASO 2: Crear la función del trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios_perfiles (
    id,
    nombre,
    apellido,
    telefono,
    rol
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'apellido',
    NEW.raw_user_meta_data->>'telefono',
    COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- PASO 3: Crear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PASO 4: Política RLS para usuarios normales
CREATE POLICY "Usuarios pueden crear su perfil" ON public.usuarios_perfiles
  FOR INSERT 
  WITH CHECK (id = auth.uid());

-- PASO 5: Política RLS para el trigger (permite inserción automática)
CREATE POLICY "Trigger puede crear perfiles automáticamente" ON public.usuarios_perfiles
  FOR INSERT
  WITH CHECK (true);
```

**Si ya tienes usuarios registrados antes de crear este trigger**, ejecuta este SQL para crear sus perfiles:

```sql
INSERT INTO public.usuarios_perfiles (id, nombre, apellido, telefono, rol)
SELECT 
  id,
  raw_user_meta_data->>'nombre',
  raw_user_meta_data->>'apellido',
  raw_user_meta_data->>'telefono',
  COALESCE(raw_user_meta_data->>'rol', 'cliente')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.usuarios_perfiles)
ON CONFLICT (id) DO NOTHING;
```

**NOTA:** Si sigues teniendo el error "Database error saving new user", ejecuta el archivo completo `docs/sql-fix-trigger-perfil.sql` que contiene todos los pasos necesarios.

### 2. Datos de Ejemplo
```sql
-- Insertar rutas de ejemplo
INSERT INTO rutas (nombre, descripcion, imagen_url, dificultad, duracion_horas, distancia_km, ubicacion, tipo, puntuacion) VALUES
('Sendero del Río Verde', 'Una caminata tranquila junto al río que atraviesa el bosque. Perfecta para observar aves y disfrutar del sonido del agua.', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', 'facil', 1.5, 2.3, 'Reserva Natural Los Pinos', 'senderismo', 4.8),
('Ruta Ciclística del Bosque', 'Circuito en bicicleta por senderos forestales. Incluye subidas moderadas y descensos emocionantes.', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop', 'media', 2.5, 8.7, 'Parque Nacional El Roble', 'ciclismo', 4.6),
('Observación de Aves Nocturnas', 'Ruta especializada para observar aves nocturnas. Incluye guía especializado y equipos de observación.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', 'facil', 3.0, 1.8, 'Santuario de Aves Mariposa', 'observacion', 4.9),
('Fotografía de Paisajes', 'Ruta diseñada para fotógrafos. Incluye los mejores puntos de vista y horarios óptimos para capturar la naturaleza.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', 'media', 4.0, 5.2, 'Reserva Fotográfica El Amanecer', 'fotografia', 4.7),
('Sendero de las Cascadas', 'Ruta que conecta tres cascadas diferentes. Incluye áreas de baño natural y zonas de descanso.', 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop', 'dificil', 5.0, 7.1, 'Parque Nacional Las Cascadas', 'senderismo', 4.5);

-- Insertar puntos ecológicos de ejemplo
INSERT INTO puntos_ecologicos (ruta_id, nombre, descripcion, orden) VALUES
(1, 'Mirador del Río', 'Vista panorámica del valle', 1),
(1, 'Área de Descanso', 'Lugar ideal para picnic', 2),
(1, 'Observatorio de Aves', 'Punto de avistamiento de especies locales', 3),
(2, 'Cascada Escondida', 'Cascada de 15 metros de altura', 1),
(2, 'Área de Reparación', 'Taller básico para bicicletas', 2),
(2, 'Mirador del Valle', 'Vista de 360° del parque', 3);
```

## 📊 Funciones de Base de Datos

### Función para obtener rutas con filtros
```sql
CREATE OR REPLACE FUNCTION obtener_rutas_filtradas(
  p_busqueda TEXT DEFAULT '',
  p_dificultad TEXT DEFAULT '',
  p_tipo TEXT DEFAULT '',
  p_duracion_min DECIMAL DEFAULT NULL,
  p_duracion_max DECIMAL DEFAULT NULL,
  p_distancia_min DECIMAL DEFAULT NULL,
  p_distancia_max DECIMAL DEFAULT NULL
)
RETURNS TABLE (
  id INTEGER,
  nombre VARCHAR,
  descripcion TEXT,
  imagen_url VARCHAR,
  dificultad VARCHAR,
  duracion_horas DECIMAL,
  distancia_km DECIMAL,
  ubicacion VARCHAR,
  tipo VARCHAR,
  puntuacion DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.nombre,
    r.descripcion,
    r.imagen_url,
    r.dificultad,
    r.duracion_horas,
    r.distancia_km,
    r.ubicacion,
    r.tipo,
    r.puntuacion
  FROM rutas r
  WHERE r.activa = true
    AND (p_busqueda = '' OR 
         r.nombre ILIKE '%' || p_busqueda || '%' OR
         r.descripcion ILIKE '%' || p_busqueda || '%' OR
         r.ubicacion ILIKE '%' || p_busqueda || '%')
    AND (p_dificultad = '' OR r.dificultad = p_dificultad)
    AND (p_tipo = '' OR r.tipo = p_tipo)
    AND (p_duracion_min IS NULL OR r.duracion_horas >= p_duracion_min)
    AND (p_duracion_max IS NULL OR r.duracion_horas <= p_duracion_max)
    AND (p_distancia_min IS NULL OR r.distancia_km >= p_distancia_min)
    AND (p_distancia_max IS NULL OR r.distancia_km <= p_distancia_max)
  ORDER BY r.puntuacion DESC, r.fecha_creacion DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Función para obtener puntos ecológicos de una ruta
```sql
CREATE OR REPLACE FUNCTION obtener_puntos_ecologicos(p_ruta_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  nombre VARCHAR,
  descripcion TEXT,
  latitud DECIMAL,
  longitud DECIMAL,
  orden INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pe.id,
    pe.nombre,
    pe.descripcion,
    pe.latitud,
    pe.longitud,
    pe.orden
  FROM puntos_ecologicos pe
  WHERE pe.ruta_id = p_ruta_id
  ORDER BY pe.orden ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
