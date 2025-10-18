# Sistema de Componentes para Formularios Médicos

Este sistema de componentes está diseñado para crear formularios médicos consistentes, profesionales y reutilizables basado en el patrón establecido en `NewPatientForm.tsx`.

## 🎯 Objetivo

Proporcionar un conjunto de componentes reutilizables que permitan crear formularios médicos con:
- Diseño consistente y profesional
- Validación estándar
- Iconografía temática
- Estados de carga y error
- Responsive design

## 📦 Componentes Incluidos

### Componentes Principales

1. **MedicalFormContainer** - Contenedor principal del formulario
2. **MedicalFormSection** - Secciones con iconos y títulos
3. **MedicalFieldGroup** - Agrupación de campos en grillas responsivas
4. **MedicalFormActions** - Contenedor para botones de acción
5. **MedicalFormNotice** - Avisos y notificaciones

### Componentes de Campo

1. **MedicalInputField** - Campos de entrada de texto
2. **MedicalSelectField** - Campos de selección
3. **MedicalTextareaField** - Campos de texto multilínea
4. **MedicalButton** - Botones con estados de carga

## 🚀 Instalación

Los componentes ya están listos para usar. Solo necesitas importarlos:

\`\`\`tsx
import {
  MedicalFormContainer,
  MedicalFormSection,
  MedicalFieldGroup,
  MedicalInputField,
  MedicalSelectField,
  MedicalButton,
  MEDICAL_FORM_COLORS
} from '@/components/forms';
\`\`\`

## 📝 Uso Básico

### 1. Estructura Básica de Formulario

\`\`\`tsx
import { useState } from 'react';
import { User } from 'lucide-react';
import {
  MedicalFormContainer,
  MedicalFormSection,
  MedicalFieldGroup,
  MedicalInputField,
  MedicalFormActions,
  MedicalButton,
  MEDICAL_FORM_COLORS
} from '@/components/forms';

export default function MiFormulario() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de envío
  };

  return (
    <MedicalFormContainer onSubmit={handleSubmit}>
      <MedicalFormSection
        title="Datos Personales"
        description="Información básica del paciente"
        icon={User}
        iconColor={MEDICAL_FORM_COLORS.personal}
      >
        <MedicalFieldGroup columns={2}>
          <MedicalInputField
            label="Nombre"
            value={formData.nombre}
            onChange={(value) => handleChange('nombre', value)}
            required
          />
          <MedicalInputField
            label="Apellido"
            value={formData.apellido}
            onChange={(value) => handleChange('apellido', value)}
            required
          />
        </MedicalFieldGroup>
      </MedicalFormSection>

      <MedicalFormActions>
        <MedicalButton variant="secondary">Cancelar</MedicalButton>
        <MedicalButton variant="primary" type="submit">Guardar</MedicalButton>
      </MedicalFormActions>
    </MedicalFormContainer>
  );
}
\`\`\`

## 🎨 Colores por Sección

Usa los colores predefinidos según el tipo de sección:

\`\`\`tsx
import { MEDICAL_FORM_COLORS } from '@/components/forms';

// Colores disponibles:
MEDICAL_FORM_COLORS.personal     // text-blue-600
MEDICAL_FORM_COLORS.contact      // text-green-600  
MEDICAL_FORM_COLORS.medical      // text-purple-600
MEDICAL_FORM_COLORS.emergency    // text-orange-600
MEDICAL_FORM_COLORS.insurance    // text-indigo-600
MEDICAL_FORM_COLORS.diagnosis    // text-red-600
// ... más colores
\`\`\`

## 🔧 Validación

Implementa validación siguiendo este patrón:

\`\`\`tsx
const [errors, setErrors] = useState<{[key: string]: string}>({});

const validateForm = (): boolean => {
  const newErrors: {[key: string]: string} = {};
  
  if (!formData.nombre.trim()) {
    newErrors.nombre = 'El nombre es requerido';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// En el campo:
<MedicalInputField
  label="Nombre"
  value={formData.nombre}
  onChange={(value) => handleChange('nombre', value)}
  error={errors.nombre}
  required
/>
\`\`\`

## 📱 Responsive Design

Los componentes son automáticamente responsivos:

- **MedicalFieldGroup**: Ajusta columnas según pantalla
- **MedicalFormActions**: Cambia de horizontal a vertical en móvil
- **MedicalFormContainer**: Se adapta al ancho disponible

## 🎭 Iconos Recomendados

| Sección | Icono Lucide | Color |
|---------|--------------|-------|
| Personal | User | blue-600 |
| Contacto | Phone | green-600 |
| Médico | Stethoscope | purple-600 |
| Emergencia | AlertTriangle | orange-600 |
| Seguro | Shield | indigo-600 |
| Diagnóstico | Activity | red-600 |

## 📄 Ejemplos Completos

- **ExampleConsultationForm.tsx** - Formulario de consulta médica
- **NewPatientForm.tsx** - Formulario de registro de paciente (referencia original)

## 🔄 Migración de Formularios Existentes

Para migrar un formulario existente:

1. Reemplaza la estructura HTML con componentes
2. Usa MedicalFormSection para cada sección
3. Agrupa campos con MedicalFieldGroup
4. Reemplaza inputs con MedicalInputField/MedicalSelectField
5. Usa MedicalFormActions para botones

## ⚡ Beneficios

- **Consistencia**: Todos los formularios seguirán el mismo patrón
- **Mantenibilidad**: Cambios centralizados en los componentes
- **Productividad**: Desarrollo más rápido de nuevos formularios
- **Calidad**: Validación y UX estandardizados
- **Accesibilidad**: Implementada en los componentes base

## 🤝 Contribuir

Para agregar nuevos componentes o modificar existentes:

1. Sigue los patrones establecidos
2. Mantén la documentación actualizada
3. Agrega ejemplos de uso
4. Prueba la responsividad

¡El sistema está listo para crear formularios médicos profesionales y consistentes! 🚀