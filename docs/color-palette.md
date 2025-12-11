# Paleta de Colores Profesional - Sistema Médico

## Colores Principales

### Azul (Primary)
- **Azul Principal**: `blue-600` (#2563eb) - Acciones principales, botones primarios
- **Azul Hover**: `blue-700` (#1d4ed8) - Estados hover
- **Azul Claro**: `blue-50` (#eff6ff) - Fondos suaves
- **Azul Medio**: `blue-100` (#dbeafe) - Fondos de tarjetas destacadas
- **Azul Oscuro**: `blue-900` (#1e3a8a) - Textos importantes

### Grises (Neutral)
- **Gris Muy Claro**: `gray-50` (#f9fafb) - Fondo de página
- **Gris Claro**: `gray-100` (#f3f4f6) - Fondos de secciones
- **Gris Medio**: `gray-200` (#e5e7eb) - Bordes
- **Gris**: `gray-600` (#4b5563) - Texto secundario
- **Gris Oscuro**: `gray-900` (#111827) - Texto principal

### Blanco y Negro
- **Blanco**: `white` (#ffffff) - Fondos de tarjetas
- **Negro**: `black` (#000000) - Textos críticos (usar con moderación)

## Colores de Estado (Mantener para feedback)

### Éxito
- **Verde**: `green-600` (#16a34a) - Mensajes de éxito
- **Verde Claro**: `green-50` (#f0fdf4) - Fondos de éxito

### Error
- **Rojo**: `red-600` (#dc2626) - Errores y alertas
- **Rojo Claro**: `red-50` (#fef2f2) - Fondos de error

### Advertencia
- **Amarillo**: `yellow-600` (#ca8a04) - Advertencias
- **Amarillo Claro**: `yellow-50` (#fefce8) - Fondos de advertencia

### Información
- **Azul Info**: `blue-500` (#3b82f6) - Mensajes informativos
- **Azul Info Claro**: `blue-50` (#eff6ff) - Fondos informativos

## Gradientes Profesionales

### Gradiente Principal (Azul)
```
bg-gradient-to-br from-blue-600 to-blue-700
```

### Gradiente Suave (Gris)
```
bg-gradient-to-r from-gray-50 to-gray-100
```

### Gradiente Header
```
bg-gradient-to-r from-blue-600 to-blue-800
```

## Reemplazo de Colores Antiguos

| Color Antiguo | Color Nuevo | Uso |
|--------------|-------------|-----|
| `purple-*` | `blue-*` | Elementos principales |
| `pink-*` | `blue-*` | Acentos |
| `teal-*` | `blue-*` | Elementos secundarios |
| `indigo-*` | `blue-*` | Variaciones |
| `emerald-*` | `green-*` | Solo estados de éxito |

## Ejemplos de Uso

### Botón Principal
```tsx
className="bg-blue-600 hover:bg-blue-700 text-white"
```

### Tarjeta con Header
```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200">
  <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
    {/* Header content */}
  </div>
</div>
```

### Icono Destacado
```tsx
<div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
  <Icon className="w-7 h-7 text-white" />
</div>
```

### Badge/Etiqueta
```tsx
<span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
  Estado
</span>
```
