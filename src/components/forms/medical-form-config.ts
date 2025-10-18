// Configuración de estilos para formularios médicos

export const MEDICAL_FORM_COLORS = {
  // Colores por tipo de sección
  personal: 'text-blue-600',
  contact: 'text-green-600',
  medical: 'text-purple-600',
  emergency: 'text-orange-600',
  insurance: 'text-indigo-600',
  diagnosis: 'text-red-600',
  treatment: 'text-pink-600',
  appointment: 'text-cyan-600',
  payment: 'text-yellow-600',
  documents: 'text-gray-600',
};

export const MEDICAL_FORM_STYLES = {
  // Contenedores
  container: 'max-w-4xl mx-auto space-y-8',
  section: 'bg-white rounded-lg shadow-sm border border-gray-200',
  sectionHeader: 'border-b border-gray-200 px-6 py-4',
  sectionContent: 'p-6',
  
  // Grillas
  grid: {
    1: 'grid grid-cols-1 gap-4',
    2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    3: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  },
  
  // Campos
  field: 'space-y-2',
  label: 'block text-sm font-medium text-gray-700',
  input: 'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  inputError: 'border-red-300',
  inputNormal: 'border-gray-300',
  errorText: 'text-sm text-red-600',
  
  // Botones
  button: {
    base: 'px-6 py-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md focus:ring-blue-500',
    primaryDisabled: 'bg-gray-400 text-white cursor-not-allowed',
    secondary: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500',
  },
  
  // Acciones
  actions: 'flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200',
  
  // Avisos
  notice: {
    base: 'border rounded-md p-4',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
    success: 'bg-green-50 border-green-200',
  },
};

export const MEDICAL_FORM_ICONS = {
  info: '💡',
  warning: '⚠️',
  error: '❌',
  success: '✅',
};

// Funciones de utilidad para estilos
export function getInputClasses(error?: string): string {
  const baseClasses = MEDICAL_FORM_STYLES.input;
  const errorClass = error ? MEDICAL_FORM_STYLES.inputError : MEDICAL_FORM_STYLES.inputNormal;
  return `${baseClasses} ${errorClass}`;
}

export function getButtonClasses(variant: 'primary' | 'secondary', disabled?: boolean): string {
  const base = MEDICAL_FORM_STYLES.button.base;
  
  if (variant === 'primary') {
    return disabled 
      ? `${base} ${MEDICAL_FORM_STYLES.button.primaryDisabled}`
      : `${base} ${MEDICAL_FORM_STYLES.button.primary}`;
  }
  
  return `${base} ${MEDICAL_FORM_STYLES.button.secondary}`;
}