# Guía de Diseño para Formularios Médicos

Esta guía establece los patrones y componentes estándares para crear formularios médicos consistentes y profesionales en el sistema odontológico.

## Principios de Diseño

### 1. **Estructura Consistente**
- Usar contenedor máximo de `max-w-4xl` para formularios
- Espaciado entre secciones de `space-y-8`
- Fondo blanco con sombra sutil y bordes grises

### 2. **Secciones con Iconos Temáticos**
- Cada sección debe tener un icono representativo de Lucide React
- Colores temáticos por tipo de sección:
  - **Azul** (`text-blue-600`): Información personal
  - **Verde** (`text-green-600`): Contacto y comunicación
  - **Púrpura** (`text-purple-600`): Información médica
  - **Naranja** (`text-orange-600`): Emergencias y alertas
  - **Índigo** (`text-indigo-600`): Seguros y coberturas
  - **Rojo** (`text-red-600`): Diagnósticos y problemas

### 3. **Campos de Formulario**
- Labels claros y descriptivos
- Asterisco (*) para campos obligatorios
- Estados de validación con colores: rojo para errores, azul para focus
- Placeholders informativos
- Espaciado consistente entre campos

## Componentes Disponibles

### MedicalFormContainer
Contenedor principal para formularios médicos.
```tsx
import MedicalFormContainer from '@/components/forms/MedicalFormContainer';

<MedicalFormContainer onSubmit={handleSubmit}>
  {/* Contenido del formulario */}
</MedicalFormContainer>
```

### MedicalFormSection
Sección con título, descripción e icono.
```tsx
import MedicalFormSection from '@/components/forms/MedicalFormSection';
import { User } from 'lucide-react';

<MedicalFormSection
  title="Información Personal"
  description="Datos básicos de identificación del paciente"
  icon={User}
  iconColor="text-blue-600"
>
  {/* Contenido de la sección */}
</MedicalFormSection>
```

### MedicalFieldGroup
Agrupa campos en grillas responsivas.
```tsx
import MedicalFieldGroup from '@/components/forms/MedicalFieldGroup';

<MedicalFieldGroup columns={2}>
  {/* Campos del formulario */}
</MedicalFieldGroup>
```

### MedicalInputField
Campo de entrada de texto estándar.
```tsx
import MedicalInputField from '@/components/forms/MedicalInputField';

<MedicalInputField
  label="Nombres"
  value={formData.nombres}
  onChange={(value) => handleChange('nombres', value)}
  required
  error={errors.nombres}
  placeholder="Ingrese los nombres"
/>
```

### MedicalSelectField
Campo de selección estándar.
```tsx
import MedicalSelectField from '@/components/forms/MedicalSelectField';

<MedicalSelectField
  label="Género"
  value={formData.genero}
  onChange={(value) => handleChange('genero', value)}
  options={generos}
  required
  error={errors.genero}
/>
```

### MedicalTextareaField
Campo de texto multilínea.
```tsx
import MedicalTextareaField from '@/components/forms/MedicalTextareaField';

<MedicalTextareaField
  label="Observaciones"
  value={formData.observaciones}
  onChange={(value) => handleChange('observaciones', value)}
  rows={4}
  placeholder="Ingrese observaciones adicionales"
/>
```

### MedicalButton
Botones con estados de carga.
```tsx
import MedicalButton from '@/components/forms/MedicalButton';

<MedicalButton
  variant="primary"
  loading={isSubmitting}
  loadingText="Guardando..."
  type="submit"
>
  Guardar Paciente
</MedicalButton>
```

### MedicalFormActions
Contenedor para botones de acción.
```tsx
import MedicalFormActions from '@/components/forms/MedicalFormActions';

<MedicalFormActions>
  <MedicalButton variant="secondary">Cancelar</MedicalButton>
  <MedicalButton variant="primary">Guardar</MedicalButton>
</MedicalFormActions>
```

### MedicalFormNotice
Avisos y notificaciones.
```tsx
import MedicalFormNotice from '@/components/forms/MedicalFormNotice';

<MedicalFormNotice
  type="info"
  message="Los campos marcados con asterisco (*) son obligatorios."
/>
```

## Patrones de Uso

### 1. **Estructura Base de Formulario**
```tsx
import MedicalFormContainer from '@/components/forms/MedicalFormContainer';
import MedicalFormSection from '@/components/forms/MedicalFormSection';
import MedicalFormActions from '@/components/forms/MedicalFormActions';
import MedicalButton from '@/components/forms/MedicalButton';
import MedicalFormNotice from '@/components/forms/MedicalFormNotice';

export default function NuevoFormulario() {
  return (
    <MedicalFormContainer onSubmit={handleSubmit}>
      <MedicalFormSection
        title="Título de Sección"
        description="Descripción de la sección"
        icon={IconoApropriado}
        iconColor="text-blue-600"
      >
        {/* Campos del formulario */}
      </MedicalFormSection>
      
      <MedicalFormNotice
        type="info"
        message="Información importante para el usuario"
      />
      
      <MedicalFormActions>
        <MedicalButton variant="secondary">Cancelar</MedicalButton>
        <MedicalButton variant="primary" loading={isSubmitting}>
          Guardar
        </MedicalButton>
      </MedicalFormActions>
    </MedicalFormContainer>
  );
}
```

### 2. **Validación de Formularios**
- Usar estado local para errores: `const [errors, setErrors] = useState<FormErrors>({});`
- Limpiar errores al modificar campos
- Mostrar errores específicos por campo
- Validación en tiempo real opcional

### 3. **Estados de Carga**
- Deshabilitar formulario durante envío
- Mostrar indicador de carga en botón principal
- Manejar estados de error y éxito

## Iconos Recomendados por Sección

| Sección | Icono | Color |
|---------|-------|-------|
| Información Personal | User | text-blue-600 |
| Contacto | Phone | text-green-600 |
| Información Médica | Stethoscope | text-purple-600 |
| Emergencia | AlertTriangle | text-orange-600 |
| Seguro/Cobertura | Shield | text-indigo-600 |
| Diagnóstico | Activity | text-red-600 |
| Tratamiento | Pill | text-pink-600 |
| Citas | Calendar | text-cyan-600 |
| Pagos | CreditCard | text-yellow-600 |
| Documentos | FileText | text-gray-600 |

## Responsive Design

- **Móvil**: Una columna para todos los campos
- **Tablet**: Dos columnas para campos relacionados
- **Desktop**: Hasta tres columnas para campos cortos

## Colores del Sistema

- **Primary**: Blue (600-700)
- **Success**: Green (600-700)
- **Warning**: Yellow/Orange (600-700)
- **Error**: Red (600-700)
- **Gray**: Para textos y bordes (300-700)

## Ejemplo de Implementación

Ver `NewPatientForm.tsx` como referencia de implementación completa siguiendo estos patrones.