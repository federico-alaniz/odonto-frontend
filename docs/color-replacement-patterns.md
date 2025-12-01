# Patrones de Reemplazo de Colores

## Gradientes

### Purple/Pink/Indigo → Blue
- `from-purple-500 to-pink-600` → `from-blue-600 to-blue-700`
- `from-purple-600 to-pink-600` → `from-blue-600 to-blue-700`
- `from-blue-600 to-indigo-600` → `from-blue-600 to-blue-800`
- `from-indigo-500 to-purple-600` → `from-blue-600 to-blue-700`

### Green/Emerald → Blue (excepto estados de éxito)
- `from-green-500 to-emerald-600` → `from-blue-600 to-blue-700`
- `from-emerald-500 to-teal-600` → `from-blue-600 to-blue-700`

### Teal → Blue
- `from-teal-500 to-cyan-600` → `from-blue-600 to-blue-700`

### Headers de secciones
- `from-purple-50 to-pink-50` → `from-gray-50 to-blue-50`
- `from-green-50 to-emerald-50` → `from-gray-50 to-blue-50`
- `from-teal-50 to-cyan-50` → `from-gray-50 to-blue-50`
- `from-indigo-50 to-purple-50` → `from-gray-50 to-blue-50`
- `from-blue-50 to-indigo-50` → `from-gray-50 to-blue-50`

## Colores Sólidos

### Purple → Blue
- `bg-purple-600` → `bg-blue-600`
- `bg-purple-500` → `bg-blue-600`
- `bg-purple-50` → `bg-blue-50`
- `bg-purple-100` → `bg-blue-100`
- `text-purple-600` → `text-blue-600`
- `text-purple-700` → `text-blue-700`
- `border-purple-200` → `border-blue-200`

### Pink → Blue
- `bg-pink-600` → `bg-blue-600`
- `bg-pink-50` → `bg-blue-50`
- `text-pink-600` → `text-blue-600`

### Teal → Blue
- `bg-teal-600` → `bg-blue-600`
- `bg-teal-50` → `bg-blue-50`
- `text-teal-600` → `text-blue-600`

### Indigo → Blue
- `bg-indigo-600` → `bg-blue-700`
- `bg-indigo-50` → `bg-blue-50`
- `text-indigo-600` → `text-blue-700`

## Mantener Sin Cambios

### Estados de Éxito (Green)
- `bg-green-600` → MANTENER
- `bg-green-50` → MANTENER
- `text-green-600` → MANTENER
- Usar solo para: mensajes de éxito, confirmaciones, estados positivos

### Estados de Error (Red)
- `bg-red-600` → MANTENER
- `bg-red-50` → MANTENER
- `text-red-600` → MANTENER
- Usar solo para: errores, alertas, estados negativos

### Estados de Advertencia (Yellow)
- `bg-yellow-600` → MANTENER
- `bg-yellow-50` → MANTENER
- `text-yellow-600` → MANTENER
- Usar solo para: advertencias, precauciones

### Colores Neutros (Gray)
- Todos los grays → MANTENER
- Son la base de la paleta profesional
