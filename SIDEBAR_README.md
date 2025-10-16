# Componente Sidebar para Aplicación de Gestión Médica

Este proyecto incluye un componente sidebar completo y responsivo diseñado específicamente para aplicaciones de gestión médica.

## 🏥 Características del Sidebar

### Secciones Principales:
- **Panel Principal**: Dashboard y calendario
- **Pacientes**: Gestión de pacientes, registro y historiales
- **Consultas**: Citas médicas, consultas del día y expedientes
- **Administración**: Personal médico, inventario, reportes y configuración

### Funcionalidades:
- ✅ **Responsive Design**: Se adapta a dispositivos móviles y desktop
- ✅ **Modo Colapsible**: Se puede expandir/contraer para optimizar espacio
- ✅ **Navegación Intuitiva**: Con iconos representativos y descripciones
- ✅ **Estado Activo**: Resalta la página actual
- ✅ **Dark Mode**: Soporte para tema oscuro
- ✅ **Overlay en Móviles**: Experiencia optimizada para dispositivos móviles

## 📁 Estructura de Archivos

```
src/
├── components/
│   ├── Sidebar.tsx           # Componente principal del sidebar
│   └── SidebarLayout.tsx     # Layout wrapper con funcionalidad móvil
├── hooks/
│   └── useSidebar.ts         # Hook para gestionar estado del sidebar
└── app/
    ├── layout.tsx            # Layout principal actualizado
    └── page.tsx              # Dashboard de ejemplo
```

## 🚀 Uso del Componente

### Implementación Básica

El sidebar ya está integrado en el layout principal, pero si quieres usarlo de forma independiente:

```tsx
import Sidebar from '@/components/Sidebar';
import { useSidebar } from '@/hooks/useSidebar';

function MyApp() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  
  return (
    <div className="flex">
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <main className="flex-1">
        {/* Tu contenido aquí */}
      </main>
    </div>
  );
}
```

### Con Layout Completo (Recomendado)

```tsx
import SidebarLayout from '@/components/SidebarLayout';

function MyApp() {
  return (
    <SidebarLayout>
      {/* Tu contenido de página aquí */}
    </SidebarLayout>
  );
}
```

## 🎨 Personalización

### Modificar Secciones del Menú

Edita el array `sidebarSections` en `src/components/Sidebar.tsx`:

```tsx
const sidebarSections: SidebarSection[] = [
  {
    title: 'Mi Sección',
    items: [
      {
        label: 'Mi Página',
        href: '/mi-pagina',
        icon: '🏠',
        description: 'Descripción de mi página'
      }
    ]
  }
];
```

### Personalizar Estilos

El componente usa Tailwind CSS. Puedes modificar las clases directamente en el componente o crear variantes personalizadas.

### Cambiar Información del Usuario

Modifica la sección footer del sidebar en `Sidebar.tsx`:

```tsx
<div className="flex items-center space-x-3">
  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
    <span className="text-white text-sm font-medium">TU</span>
  </div>
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-gray-900 dark:text-white">
      Tu Nombre
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      Tu Rol
    </p>
  </div>
</div>
```

## 📱 Comportamiento Responsivo

- **Desktop (≥768px)**: Sidebar fijo en el lateral, colapsible
- **Móvil (<768px)**: Sidebar deslizante con overlay, oculto por defecto
- **Header móvil**: Botón hamburguesa para abrir el menú

## 🎯 Navegación

El sidebar usa Next.js `Link` y `usePathname` para:
- Navegación sin recarga de página
- Detección automática de página activa
- URLs limpias y SEO-friendly

## 🛠 Tecnologías Utilizadas

- **React 19** con TypeScript
- **Next.js 15** con App Router
- **Tailwind CSS 4** para estilos
- **React Hooks** para gestión de estado
- **Next.js Navigation** para routing

## 📋 Próximos Pasos

Para completar la aplicación médica, considera implementar:

1. **Páginas de destino** para cada enlace del sidebar
2. **Autenticación y roles** de usuario
3. **Base de datos** para gestionar pacientes y citas
4. **Formularios** para CRUD de entidades médicas
5. **Calendario interactivo** para gestión de citas
6. **Reportes y estadísticas** médicas

## 🚀 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:3000
```

El sidebar estará visible inmediatamente con todas las funcionalidades implementadas.