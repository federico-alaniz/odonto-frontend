# Plantillas de Prompt para Formularios Médicos Profesionales

## 📋 Resumen de la Implementación Completada

✅ **FORMULARIO DE NUEVA CONSULTA TRANSFORMADO CON ÉXITO**

El formulario de nueva consulta (`src/app/registros/nueva/page.tsx`) ha sido completamente rediseñado siguiendo los lineamientos del formulario de nuevo paciente, implementando:

### ✨ Características Implementadas

1. **🎨 Diseño Profesional con Iconos Lucide**
   - Iconos temáticos por sección (User, Calendar, Stethoscope, etc.)
   - Colores consistentes y profesionales
   - Layout responsivo y accesible

2. **🔧 Componentes Reutilizables**
   - `MedicalFormContainer` - Contenedor principal
   - `MedicalFormSection` - Secciones con iconos y descripciones
   - `MedicalInputField` - Campos de entrada con validación
   - `MedicalSelectField` - Selectores con manejo de errores
   - `MedicalTextareaField` - Áreas de texto médicas
   - `MedicalFieldGroup` - Agrupación de campos responsiva
   - `MedicalFormActions` - Botones de acción estandarizados
   - `MedicalFormNotice` - Avisos informativos

3. **✅ Validaciones Robustas**
   - Validación en tiempo real
   - Mensajes de error específicos
   - Validaciones de fecha/hora
   - Campos requeridos claramente marcados

4. **🚀 Estado de Carga y UX**
   - Estado de envío con spinner
   - Simulación de API call
   - Feedback visual durante procesamiento
   - Navegación intuitiva

### 🗂️ Estructura del Formulario

1. **👤 Selección de Paciente** (icono User, azul)
   - Toggle entre paciente existente/nuevo
   - Formulario completo para nuevos pacientes
   - Selector de pacientes existentes

2. **📅 Información de la Consulta** (icono Calendar, verde)
   - Fecha y hora de la consulta
   - Selección de doctor y especialidad

3. **🩺 Diagnóstico y Síntomas** (icono Stethoscope, púrpura)
   - Síntomas (requerido)
   - Diagnóstico (requerido)
   - Tratamiento y medicamentos

4. **💓 Signos Vitales** (icono Activity, rojo)
   - Presión arterial, frecuencia cardíaca
   - Temperatura, peso, altura

5. **📷 Imágenes Diagnósticas** (icono Camera, índigo)
   - Upload múltiple de imágenes
   - Categorización por tipo
   - Descripción personalizada

6. **🦷 Odontograma** (icono Stethoscope, amarillo)
   - Solo visible para especialidad odontología
   - Integración completa con estado dental

7. **📝 Notas Adicionales** (icono FileText, gris)
   - Observaciones libres del médico

---

## 📝 Plantillas de Prompt para Futuros Formularios

### 🎯 PROMPT CONCISO (Para peticiones rápidas)

```
Quiero que el formulario [NOMBRE_FORMULARIO] siga exactamente los lineamientos del formulario de nuevo paciente:

- Usar componentes MedicalForm* desde @/components/forms
- Iconos Lucide temáticos por sección con colores específicos
- Validaciones en tiempo real con estado de errores
- Layout responsivo con MedicalFieldGroup
- Estado de carga con Loader2 
- Estructura: MedicalFormContainer > MedicalFormSection > campos
- Nota informativa y botones estandarizados

Implementar validaciones apropiadas para el contexto médico y mantener el patrón de UX establecido.
```

### 📋 PROMPT DETALLADO (Para implementaciones completas)

```
# Transformación de Formulario Médico siguiendo Lineamientos Establecidos

## 🎯 Objetivo
Rediseñar [NOMBRE_FORMULARIO] en [RUTA_ARCHIVO] siguiendo exactamente los patrones del formulario de nuevo paciente (`src/app/pacientes/nuevo/NewPatientForm.tsx`) y nueva consulta (`src/app/registros/nueva/page.tsx`).

## 🏗️ Arquitectura Requerida

### Imports Obligatorios
```typescript
import { useState } from 'react';
import { [IconosLucide] } from 'lucide-react';
import MedicalFormContainer from '@/components/forms/MedicalFormContainer';
import MedicalFormSection from '@/components/forms/MedicalFormSection';
import MedicalInputField from '@/components/forms/MedicalInputField';
import MedicalSelectField from '@/components/forms/MedicalSelectField';
import MedicalTextareaField from '@/components/forms/MedicalTextareaField';
import MedicalFieldGroup from '@/components/forms/MedicalFieldGroup';
import MedicalFormActions from '@/components/forms/MedicalFormActions';
import MedicalFormNotice from '@/components/forms/MedicalFormNotice';
```

### Estados Requeridos
```typescript
const [formData, setFormData] = useState<TipoFormulario>(estadoInicial);
const [errors, setErrors] = useState<{[key: string]: string}>({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

### Funciones Obligatorias
1. `validateForm(): boolean` - Validaciones completas con mensajes específicos
2. `handleInputChange(field: string, value: string | number)` - Con limpieza de errores
3. `handleSubmit(e: React.FormEvent)` - Async con estado de carga

## 🎨 Diseño Visual

### Paleta de Iconos y Colores
- **Información Personal**: User (text-blue-600)
- **Contacto**: Phone (text-green-600)
- **Datos Médicos**: Stethoscope (text-purple-600)
- **Emergencia**: AlertTriangle (text-orange-600)
- **Seguridad**: Shield (text-indigo-600)
- **Archivos**: FileText (text-gray-600)
- **Imágenes**: Camera (text-indigo-600)
- **Actividad**: Activity (text-red-600)
- **Tiempo**: Calendar (text-green-600)

### Estructura de Sección
```tsx
<MedicalFormSection
  title="Título Descriptivo"
  description="Explicación clara del propósito"
  icon={IconoLucide}
  iconColor="text-color-600"
>
  <MedicalFieldGroup>
    {/* Campos agrupados */}
  </MedicalFieldGroup>
</MedicalFormSection>
```

## ✅ Validaciones Específicas

### Campos Obligatorios
- Marcar con `required={true}`
- Mostrar asterisco (*) en label
- Validar en `validateForm()`
- Mensaje específico en `errors[field]`

### Validaciones Médicas
- Fechas no futuras para antecedentes
- Fechas no pasadas para citas
- Formatos de teléfono y email
- Rangos de edad válidos (0-120)
- Campos numéricos positivos

### Manejo de Errores
```typescript
if (!formData.campo.trim()) newErrors.campo = 'Mensaje específico';
if (campo && !validacion) newErrors.campo = 'Formato inválido';
```

## 🚀 UX y Estados

### Estado de Carga
```tsx
{isSubmitting ? (
  <span className="flex items-center">
    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
    Procesando...
  </span>
) : (
  'Texto Normal'
)}
```

### Feedback al Usuario
- Simulación de API: `await new Promise(resolve => setTimeout(resolve, 2000))`
- Mensajes de éxito: `alert('✅ Operación exitosa')`
- Mensajes de error: `alert('❌ Error descripción')`
- Redirección tras éxito

### Elementos Finales Obligatorios
```tsx
<MedicalFormNotice message="Instrucciones específicas del formulario" />

<MedicalFormActions>
  <button type="button" onClick={cancelAction}>Cancelar</button>
  <button type="submit" disabled={isSubmitting}>
    {/* Estado de carga */}
  </button>
</MedicalFormActions>
```

## 🧪 Criterios de Aceptación

### ✅ Funcionalidad
- [ ] Compilación sin errores TypeScript
- [ ] Validaciones funcionando correctamente
- [ ] Estado de carga implementado
- [ ] Navegación de regreso funcionando
- [ ] Responsive en móvil y desktop

### ✅ Diseño
- [ ] Iconos Lucide en todas las secciones
- [ ] Colores consistentes con la paleta
- [ ] Espaciado uniforme (space-y-6, gap-4)
- [ ] Tipografía estandarizada
- [ ] Estados de error visibles

### ✅ Accesibilidad
- [ ] Labels descriptivos
- [ ] Campos required marcados
- [ ] Focus states funcionando
- [ ] Contraste de colores adecuado
- [ ] Navegación por teclado

### ✅ Rendimiento
- [ ] Build exitoso sin warnings
- [ ] Tamaño de bundle optimizado
- [ ] Carga rápida de componentes
- [ ] Sin re-renders innecesarios

## 🔧 Implementación Técnica

### 1. Análisis del Formulario Actual
- Identificar campos existentes
- Mapear validaciones actuales
- Determinar flujo de datos
- Planificar migración

### 2. Transformación de Estado
- Convertir a formato estándar
- Agregar estados de error
- Implementar estado de carga
- Mantener compatibilidad de datos

### 3. Migración de UI
- Reemplazar elementos HTML nativos
- Implementar MedicalForm* components
- Agregar iconos y colores
- Configurar layout responsivo

### 4. Testing y Validación
- Probar todos los campos
- Verificar validaciones
- Confirmar navegación
- Validar accesibilidad

## 📊 Ejemplo de Contrato de Datos

### Input Esperado
```typescript
interface FormularioData {
  campoRequerido: string;
  campoOpcional?: string;
  fecha: string; // ISO format
  numero: number;
  seleccion: 'valor1' | 'valor2';
}
```

### Output Esperado
```typescript
interface FormularioResult {
  data: FormularioData;
  metadata: {
    createdAt: string;
    userId?: string;
    formType: string;
  };
}
```

### Errores Posibles
```typescript
interface FormularioErrors {
  campoRequerido?: string;
  fecha?: string;
  numero?: string;
  general?: string;
}
```

## 🚨 Casos Límite

### Datos Inválidos
- Campos vacíos cuando son requeridos
- Formatos incorrectos (email, teléfono, fecha)
- Valores fuera de rango
- Selecciones no válidas

### Estados de Error
- Fallo de red durante envío
- Timeout de API
- Errores de validación del servidor
- Conflictos de datos

### Escenarios de Uso
- Usuario nuevo vs existente
- Campos opcionales vs requeridos
- Diferentes roles/permisos
- Dispositivos móviles vs desktop

---

## 🎉 Resultado Final

Al implementar estas plantillas, obtendrás formularios médicos que:

- ✨ **Lucen profesionales** con iconos temáticos y colores consistentes
- 🔒 **Son seguros** con validaciones robustas
- 📱 **Funcionan en todos los dispositivos** 
- ♿ **Son accesibles** para todos los usuarios
- 🚀 **Ofrecen excelente UX** con feedback claro
- 🔧 **Son mantenibles** con componentes reutilizables
- 📊 **Escalan fácilmente** para nuevos casos de uso

### Comandos de Verificación

```bash
# Verificar compilación
pnpm run build

# Verificar tipos
pnpm run type-check

# Ejecutar en desarrollo
pnpm dev
```

¡Tu formulario estará listo para producción siguiendo los más altos estándares de calidad médica! 🏥✨
```

---

## 🎯 Próximos Pasos Sugeridos

1. **Aplicar a otros formularios** usando las plantillas de prompt
2. **Crear tests unitarios** para validaciones
3. **Implementar casos de uso específicos** por especialidad médica
4. **Documentar APIs** que consuman estos formularios
5. **Optimizar rendimiento** si es necesario