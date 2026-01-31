# 🗺️ Rutas Eco-Comunitarias

Sistema web para la gestión y exploración de rutas eco-turísticas comunitarias, desarrollado con tecnologías modernas y enfoque en la sostenibilidad.

## 🚀 Características Principales

### Para Usuarios (Clientes)
- ✅ **Exploración de rutas**: Catálogo completo de rutas eco-turísticas
- ✅ **Filtros avanzados**: Búsqueda por dificultad, duración, tipo y distancia
- ✅ **Vista previa detallada**: Modal con información completa y puntos ecológicos
- ✅ **Mapa interactivo**: Visualización de rutas y puntos de interés
- ✅ **Sistema de favoritos**: Guardar rutas preferidas
- ✅ **Compartir rutas**: Funcionalidad nativa de compartir
- ✅ **Diseño responsive**: Optimizado para móviles, tablets y desktop
- ✅ **Accesibilidad**: Cumple estándares WCAG 2.1

### Para Administradores
- 🔧 **Gestión completa de rutas**: CRUD completo
- 🔧 **Gestión de puntos ecológicos**: Administración de puntos de interés
- 🔧 **Panel de estadísticas**: Métricas de uso y popularidad
- 🔧 **Gestión de usuarios**: Control de roles y permisos
- 🔧 **Sistema de moderación**: Activar/desactivar contenido

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Estilos**: CSS Grid, Flexbox, Variables CSS
- **Iconos**: SVG inline
- **Build Tool**: Vite

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Navegador moderno (Chrome, Firefox, Safari, Edge)

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/eturismo318-code/Eco-turismo.git

```

### 2. Instalar Dependencias
```bash
npm install
# o
yarn install
```

### 3. Configurar Supabase

#### 3.1 Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota la URL y la clave anónima

#### 3.2 Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp env.example .env.local

# Editar variables
nano .env.local
```

Configurar las siguientes variables:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

#### 3.3 Configurar Base de Datos
1. Ve a la consola de Supabase
2. Navega a SQL Editor
3. Ejecuta el script de `docs/supabase-setup.md`
4. Verifica que las tablas se crearon correctamente

### 4. Ejecutar en Desarrollo
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
mi-inicio/
├── docs/                          # 📖 Documentación
│   ├── supabase-setup.md          # Configuración de BD
│   ├── sistema-administracion.md  # Sistema de admin
│   └── documentacion-codigo.md    # Documentación técnica
├── pages/                         # 📄 Páginas HTML
│   ├── rutas.html                 # Página principal
│   ├── novedades.html             # Novedades
│   └── ayuda.html                 # Ayuda
├── src/                           # 💻 Código fuente
│   ├── services/
│   │   └── supabase.js           # Servicios de BD
│   ├── scripts/
│   │   └── comunes.ts            # Funciones comunes
│   └── styles.css                # Estilos globales
├── env.example                    # Variables de entorno
└── README.md                      # Este archivo
```


## 👥 Roles y Permisos

### Cliente
- ✅ Ver rutas activas
- ✅ Filtrar y buscar rutas
- ✅ Ver detalles de rutas
- ✅ Guardar rutas favoritas
- ❌ No puede modificar contenido

### Administrador
- ✅ Todas las funciones de cliente
- ✅ Crear nuevas rutas
- ✅ Editar rutas existentes
- ✅ Activar/desactivar rutas
- ✅ Eliminar rutas
- ✅ Gestionar puntos ecológicos
- ✅ Ver estadísticas
- ✅ Gestionar usuarios

## 🎨 Personalización

### Variables CSS
```css
:root {
  --primary: #2a7a5f;            /* Color principal */
  --accent: #0d6b9a;             /* Color de acento */
  --bg: #f7f8fb;                 /* Fondo general */
  --card: #ffffff;               /* Fondo de tarjetas */
  --text: #17202a;               /* Color de texto */
}
```

### Modo Oscuro
El sistema incluye soporte completo para modo oscuro con variables CSS específicas.

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: hasta 767px

### Características
- Grid responsive para tarjetas de rutas
- Navegación adaptativa
- Modal optimizado para móviles
- Formularios táctiles

## 🔐 Seguridad

### Autenticación
- Sistema de autenticación con Supabase Auth
- Roles y permisos granulares
- Políticas de seguridad a nivel de fila (RLS)

### Validación
- Sanitización de inputs
- Validación de tipos de archivo
- Límites de tamaño de datos

## 🚀 Despliegue

### Opciones de Hosting
- **Vercel**: Recomendado para Vite
- **Netlify**: Fácil integración
- **GitHub Pages**: Gratuito para proyectos públicos
- **Supabase Hosting**: Integración nativa

### Variables de Producción
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_produccion
```

## 🐛 Solución de Problemas

### Error de Conexión a Supabase
1. Verificar variables de entorno
2. Comprobar URL y clave anónima
3. Verificar políticas de seguridad

### Error de Permisos
1. Verificar rol de usuario
2. Comprobar políticas RLS
3. Revisar autenticación

### Problemas de Rendimiento
1. Verificar índices de base de datos
2. Optimizar consultas
3. Implementar paginación

## 📊 Monitoreo y Analytics

### Métricas Disponibles
- Rutas más visitadas
- Búsquedas frecuentes
- Tiempo de carga
- Errores de aplicación

### Herramientas Recomendadas
- Supabase Analytics
- Google Analytics
- Sentry para error tracking

## 🤝 Contribución

### Flujo de Trabajo
1. Fork del repositorio
2. Crear rama de feature
3. Realizar cambios
4. Crear pull request
5. Revisión y merge

### Estándares de Código
- Comentarios en español
- Documentación JSDoc
- Tests unitarios
- Linting automático

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollo Frontend**: [Deny mera, Javier zamora]
- **Desarrollo Backend**: [Deny mera, Javier zamora]
- **Diseño UX/UI**: [Deny mera, Javier zamora]
- **Testing**: [Deny mera, Javier zamora]

## 🔄 Changelog

### v1.0.0 (2025-01-XX)
- ✅ Implementación inicial
- ✅ Sistema de rutas completo
- ✅ Integración con Supabase
- ✅ Sistema de administración
- ✅ Documentación completa

---

**¡Gracias por usar Rutas Eco-Comunitarias! 🌱**
