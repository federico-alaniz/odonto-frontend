'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Phone, 
  Stethoscope, 
  AlertTriangle, 
  Shield,
  Loader2,
  UserPlus,
  MapPin,
  Heart,
  Clock,
  Calendar
} from 'lucide-react';
import { 
  getProvincias, 
  getDepartamentosPorProvincia, 
  getCiudadesPorProvincia
} from '../../../../utils';
import { patientsService, CreatePatientData } from '@/services/api/patients.service';

interface SecretaryPatientFormData {
  // Información Personal
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: string;
  
  // Contacto
  telefono: string;
  email: string;
  domicilio: string;
  ciudad: string;
  departamento?: string;
  provincia: string;
  
  // Información Médica
  tipoSangre: string;
  alergias: string;
  medicamentos: string;
  enfermedades: string;
  
  // Contacto de Emergencia
  contactoEmergenciaNombre: string;
  contactoEmergenciaParentesco: string;
  contactoEmergenciaTelefono: string;
  
  // Información de Seguro
  tieneSeguro: string;
  nombreSeguro: string;
  numeroPoliza: string;
  
  // Campos específicos para secretaria
  motivoRegistro: string;
  prioridad: string;
  observacionesIniciales: string;
  requiereAtencionInmediata: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function SecretaryNewPatientForm() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState<SecretaryPatientFormData>({
    nombres: '',
    apellidos: '',
    tipoDocumento: '',
    numeroDocumento: '',
    fechaNacimiento: '',
    genero: '',
    telefono: '',
    email: '',
    domicilio: '',
    ciudad: '',
    departamento: '',
    provincia: '',
    tipoSangre: '',
    alergias: '',
    medicamentos: '',
    enfermedades: '',
    contactoEmergenciaNombre: '',
    contactoEmergenciaParentesco: '',
    contactoEmergenciaTelefono: '',
    tieneSeguro: 'no',
    nombreSeguro: '',
    numeroPoliza: '',
    motivoRegistro: '',
    prioridad: 'normal',
    observacionesIniciales: '',
    requiereAtencionInmediata: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const tiposDocumento = [
    { value: 'dni', label: 'DNI (Documento Nacional de Identidad)' },
    { value: 'le', label: 'LE (Libreta de Enrolamiento)' },
    { value: 'lc', label: 'LC (Libreta Cívica)' },
    { value: 'ci', label: 'CI (Cédula de Identidad)' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'extranjero', label: 'Documento de Extranjero' }
  ];

  const generos = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' }
  ];

  const tiposSangre = [
    { value: '', label: 'No especificado' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  const parentescos = [
    { value: 'padre', label: 'Padre' },
    { value: 'madre', label: 'Madre' },
    { value: 'conyuge', label: 'Cónyuge' },
    { value: 'hermano', label: 'Hermano/a' },
    { value: 'hijo', label: 'Hijo/a' },
    { value: 'abuelo', label: 'Abuelo/a' },
    { value: 'tio', label: 'Tío/a' },
    { value: 'primo', label: 'Primo/a' },
    { value: 'amigo', label: 'Amigo/a' },
    { value: 'otro', label: 'Otro' }
  ];

  const motivosRegistro = [
    { value: 'primera-vez', label: 'Primera consulta' },
    { value: 'derivacion', label: 'Derivación médica' },
    { value: 'urgencia', label: 'Atención urgente' },
    { value: 'control', label: 'Control de rutina' },
    { value: 'seguimiento', label: 'Seguimiento de tratamiento' },
    { value: 'especialidad', label: 'Consulta especializada' },
    { value: 'otro', label: 'Otro motivo' }
  ];

  const prioridades = [
    { value: 'baja', label: 'Baja - Consulta de rutina' },
    { value: 'normal', label: 'Normal - Atención estándar' },
    { value: 'alta', label: 'Alta - Requiere pronta atención' },
    { value: 'urgente', label: 'Urgente - Atención inmediata' }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1: // Información Personal
        if (!formData.nombres.trim()) newErrors.nombres = 'Los nombres son requeridos';
        if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son requeridos';
        if (!formData.tipoDocumento) newErrors.tipoDocumento = 'El tipo de documento es requerido';
        if (!formData.numeroDocumento.trim()) newErrors.numeroDocumento = 'El número de documento es requerido';
        if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
        if (!formData.genero) newErrors.genero = 'El género es requerido';
        
        // Validación de fecha de nacimiento
        if (formData.fechaNacimiento) {
          const birthDate = new Date(formData.fechaNacimiento);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          
          if (birthDate > today) {
            newErrors.fechaNacimiento = 'La fecha de nacimiento no puede ser futura';
          } else if (age > 120) {
            newErrors.fechaNacimiento = 'La edad no puede ser mayor a 120 años';
          }
        }
        break;

      case 2: // Contacto
        if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
        if (!formData.domicilio.trim()) newErrors.domicilio = 'El domicilio es requerido';
        if (!formData.ciudad.trim()) newErrors.ciudad = 'La ciudad es requerida';
        if (!formData.provincia.trim()) newErrors.provincia = 'La provincia es requerida';
        
        // Validación de email
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'El email no es válido';
        }
        
        // Validación de teléfono
        if (formData.telefono && !/^\d{7,10}$/.test(formData.telefono.replace(/\D/g, ''))) {
          newErrors.telefono = 'El teléfono debe tener entre 7 y 10 dígitos';
        }
        break;

      case 3: // Contacto de Emergencia
        if (!formData.contactoEmergenciaNombre.trim()) newErrors.contactoEmergenciaNombre = 'El contacto de emergencia es requerido';
        if (!formData.contactoEmergenciaTelefono.trim()) newErrors.contactoEmergenciaTelefono = 'El teléfono de emergencia es requerido';
        if (!formData.contactoEmergenciaParentesco) newErrors.contactoEmergenciaParentesco = 'El parentesco es requerido';
        break;

      case 4: // Información adicional y finalización
        if (!formData.motivoRegistro) newErrors.motivoRegistro = 'El motivo de registro es requerido';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SecretaryPatientFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(4, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(4)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular un pequeño delay para UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Crear el objeto del paciente con el formato correcto
      const newPatientData = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        tipoDocumento: formData.tipoDocumento as 'dni' | 'le' | 'lc' | 'ci' | 'pasaporte' | 'extranjero',
        numeroDocumento: formData.numeroDocumento,
        fechaNacimiento: formData.fechaNacimiento,
        genero: formData.genero as 'masculino' | 'femenino' | 'otro',
        telefono: formData.telefono,
        email: formData.email,
        direccion: {
          calle: formData.domicilio,
          numero: '',
          ciudad: formData.ciudad,
          provincia: formData.provincia,
          codigoPostal: ''
        },
        tipoSangre: formData.tipoSangre,
        contactoEmergencia: {
          nombre: formData.contactoEmergenciaNombre,
          telefono: formData.contactoEmergenciaTelefono,
          relacion: formData.contactoEmergenciaParentesco
        },
        seguroMedico: formData.tieneSeguro === 'si' ? {
          empresa: formData.nombreSeguro,
          numeroPoliza: formData.numeroPoliza,
          vigencia: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        } : undefined,
        alergias: formData.alergias ? formData.alergias.split(',').map(a => a.trim()) : [],
        medicamentosActuales: formData.medicamentos ? formData.medicamentos.split(',').map(m => m.trim()) : [],
        antecedentesPersonales: formData.enfermedades ? formData.enfermedades.split(',').map(e => e.trim()) : [],
        antecedentesFamiliares: [],
        doctorAsignado: undefined,
        // Campos específicos de secretaria (en observaciones)
        observaciones: `
          Motivo de registro: ${formData.motivoRegistro}
          Prioridad: ${formData.prioridad}
          ${formData.requiereAtencionInmediata ? 'REQUIERE ATENCIÓN INMEDIATA' : ''}
          ${formData.observacionesIniciales ? `Observaciones: ${formData.observacionesIniciales}` : ''}
        `.trim()
      };
      
      const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
      const userId = (currentUser as any)?.id;
      
      if (!clinicId || !userId) {
        showError('Error de autenticación', 'No se pudo obtener la información del usuario');
        setIsSubmitting(false);
        return;
      }
      
      // Preparar datos para el servicio
      const patientData: CreatePatientData = {
        nombres: newPatientData.nombres,
        apellidos: newPatientData.apellidos,
        tipoDocumento: newPatientData.tipoDocumento as 'dni' | 'le' | 'lc' | 'ci' | 'pasaporte' | 'extranjero',
        numeroDocumento: newPatientData.numeroDocumento,
        fechaNacimiento: newPatientData.fechaNacimiento,
        genero: newPatientData.genero as 'masculino' | 'femenino' | 'otro',
        telefono: newPatientData.telefono,
        email: newPatientData.email || undefined,
        direccion: newPatientData.direccion,
        tipoSangre: newPatientData.tipoSangre || undefined,
        contactoEmergencia: newPatientData.contactoEmergencia,
        seguroMedico: newPatientData.seguroMedico,
        alergias: newPatientData.alergias,
        medicamentosActuales: newPatientData.medicamentosActuales,
        antecedentesPersonales: newPatientData.antecedentesPersonales,
      };
      
      // Llamar al servicio para crear el paciente
      const response = await patientsService.createPatient(clinicId, userId, patientData);
      
      // Mostrar mensaje de éxito
      showSuccess(
        'Paciente registrado exitosamente',
        `Se ha creado la historia clínica N° ${response.data.numeroHistoriaClinica}`
      );
      
      // Navegar de vuelta a la lista de pacientes
      router.push('/secretary/patients');
      
    } catch (error: any) {
      console.error('❌ Error al registrar paciente:', error);
      showError(
        'Error al registrar el paciente',
        error.message || 'Por favor, verifique los datos e intente nuevamente'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = Object.values(formData).some(value => 
      typeof value === 'string' ? value.trim() !== '' : value === true
    );
    
    if (hasChanges) {
      const confirmCancel = window.confirm(
        '¿Estás seguro de que quieres cancelar? Se perderán todos los datos ingresados.'
      );
      
      if (confirmCancel) {
        router.push('/secretary/patients');
      }
    } else {
      router.push('/secretary/patients');
    }
  };

  const getStepConfig = (step: number) => {
    const configs = [
      { title: 'Información Personal', icon: User, color: 'purple' },
      { title: 'Contacto y Ubicación', icon: MapPin, color: 'blue' },
      { title: 'Contacto de Emergencia', icon: Phone, color: 'orange' },
      { title: 'Información Médica y Finalización', icon: Stethoscope, color: 'green' }
    ];
    return configs[step - 1];
  };

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => {
            const config = getStepConfig(step);
            const Icon = config.icon;
            const isActive = currentStep === step;
            const isCompleted = currentStep > step;
            
            return (
              <div key={step} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors
                  ${isActive ? `bg-${config.color}-600 border-${config.color}-600 text-white` : 
                    isCompleted ? `bg-green-600 border-green-600 text-white` : 
                    'bg-gray-100 border-gray-300 text-gray-600'}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="ml-4">
                  <div className={`text-sm font-medium ${isActive ? `text-${config.color}-600` : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    Paso {step}
                  </div>
                  <div className="text-sm text-gray-600">{config.title}</div>
                </div>
                
                {step < 4 && (
                  <div className={`ml-8 w-16 h-0.5 ${currentStep > step ? 'bg-green-600' : 'bg-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Información Personal */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                  <p className="text-sm text-gray-600 mt-1">Datos básicos de identificación del paciente</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombres}
                    onChange={(e) => handleInputChange('nombres', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-colors ${
                      errors.nombres ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ingrese los nombres"
                  />
                  {errors.nombres && (
                    <p className="text-sm text-red-600">{errors.nombres}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.apellidos}
                    onChange={(e) => handleInputChange('apellidos', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-colors ${
                      errors.apellidos ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ingrese los apellidos"
                  />
                  {errors.apellidos && (
                    <p className="text-sm text-red-600">{errors.apellidos}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Documento *
                  </label>
                  <select
                    required
                    value={formData.tipoDocumento}
                    onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-colors bg-white ${
                      errors.tipoDocumento ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccione el tipo de documento</option>
                    {tiposDocumento.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                  {errors.tipoDocumento && (
                    <p className="text-sm text-red-600">{errors.tipoDocumento}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numeroDocumento}
                    onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-colors ${
                      errors.numeroDocumento ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ingrese el número de documento"
                  />
                  {errors.numeroDocumento && (
                    <p className="text-sm text-red-600">{errors.numeroDocumento}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-colors ${
                      errors.fechaNacimiento ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.fechaNacimiento && (
                    <p className="text-sm text-red-600">{errors.fechaNacimiento}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Género *
                  </label>
                  <select
                    required
                    value={formData.genero}
                    onChange={(e) => handleInputChange('genero', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-colors bg-white ${
                      errors.genero ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccione el género</option>
                    {generos.map(genero => (
                      <option key={genero.value} value={genero.value}>{genero.label}</option>
                    ))}
                  </select>
                  {errors.genero && (
                    <p className="text-sm text-red-600">{errors.genero}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contacto */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Contacto y Ubicación</h2>
                  <p className="text-sm text-gray-600 mt-1">Información de contacto y dirección del paciente</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
                      errors.telefono ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: 11 4567-8901"
                  />
                  {errors.telefono && (
                    <p className="text-sm text-red-600">{errors.telefono}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="ejemplo@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Domicilio *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.domicilio}
                    onChange={(e) => handleInputChange('domicilio', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
                      errors.domicilio ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Calle y número"
                  />
                  {errors.domicilio && (
                    <p className="text-sm text-red-600">{errors.domicilio}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ciudad}
                    onChange={(e) => handleInputChange('ciudad', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
                      errors.ciudad ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ciudad"
                  />
                  {errors.ciudad && (
                    <p className="text-sm text-red-600">{errors.ciudad}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Provincia *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.provincia}
                    onChange={(e) => handleInputChange('provincia', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
                      errors.provincia ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Provincia"
                  />
                  {errors.provincia && (
                    <p className="text-sm text-red-600">{errors.provincia}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Contacto de Emergencia */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Phone className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Contacto de Emergencia</h2>
                  <p className="text-sm text-gray-600 mt-1">Persona a contactar en caso de emergencia</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactoEmergenciaNombre}
                    onChange={(e) => handleInputChange('contactoEmergenciaNombre', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-400 transition-colors ${
                      errors.contactoEmergenciaNombre ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nombre y apellido"
                  />
                  {errors.contactoEmergenciaNombre && (
                    <p className="text-sm text-red-600">{errors.contactoEmergenciaNombre}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Parentesco *
                  </label>
                  <select
                    required
                    value={formData.contactoEmergenciaParentesco}
                    onChange={(e) => handleInputChange('contactoEmergenciaParentesco', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-400 transition-colors bg-white ${
                      errors.contactoEmergenciaParentesco ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccione el parentesco</option>
                    {parentescos.map(parentesco => (
                      <option key={parentesco.value} value={parentesco.value}>{parentesco.label}</option>
                    ))}
                  </select>
                  {errors.contactoEmergenciaParentesco && (
                    <p className="text-sm text-red-600">{errors.contactoEmergenciaParentesco}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contactoEmergenciaTelefono}
                    onChange={(e) => handleInputChange('contactoEmergenciaTelefono', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-400 transition-colors ${
                      errors.contactoEmergenciaTelefono ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Teléfono de contacto"
                  />
                  {errors.contactoEmergenciaTelefono && (
                    <p className="text-sm text-red-600">{errors.contactoEmergenciaTelefono}</p>
                  )}
                </div>
              </div>

              {/* Información de Seguro */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Información de Seguro Médico
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      ¿Tiene seguro médico?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="tieneSeguro"
                          value="si"
                          checked={formData.tieneSeguro === 'si'}
                          onChange={(e) => handleInputChange('tieneSeguro', e.target.value)}
                          className="mr-2"
                        />
                        Sí
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="tieneSeguro"
                          value="no"
                          checked={formData.tieneSeguro === 'no'}
                          onChange={(e) => handleInputChange('tieneSeguro', e.target.value)}
                          className="mr-2"
                        />
                        No
                      </label>
                    </div>
                  </div>
                  
                  {formData.tieneSeguro === 'si' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Nombre del seguro
                        </label>
                        <input
                          type="text"
                          value={formData.nombreSeguro}
                          onChange={(e) => handleInputChange('nombreSeguro', e.target.value)}
                          className="w-full px-4 py-3 h-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-400 transition-colors"
                          placeholder="Ej: OSDE, Swiss Medical"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Número de póliza
                        </label>
                        <input
                          type="text"
                          value={formData.numeroPoliza}
                          onChange={(e) => handleInputChange('numeroPoliza', e.target.value)}
                          className="w-full px-4 py-3 h-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-gray-400 transition-colors"
                          placeholder="Número de póliza"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Información Médica y Finalización */}
        {currentStep === 4 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Información Médica y Finalización</h2>
                  <p className="text-sm text-gray-600 mt-1">Datos médicos relevantes y configuración inicial</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información Médica Básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de sangre
                  </label>
                  <select
                    value={formData.tipoSangre}
                    onChange={(e) => handleInputChange('tipoSangre', e.target.value)}
                    className="w-full px-4 py-3 h-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-colors bg-white"
                  >
                    {tiposSangre.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Motivo de registro *
                  </label>
                  <select
                    required
                    value={formData.motivoRegistro}
                    onChange={(e) => handleInputChange('motivoRegistro', e.target.value)}
                    className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-colors bg-white ${
                      errors.motivoRegistro ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccione el motivo</option>
                    {motivosRegistro.map(motivo => (
                      <option key={motivo.value} value={motivo.value}>{motivo.label}</option>
                    ))}
                  </select>
                  {errors.motivoRegistro && (
                    <p className="text-sm text-red-600">{errors.motivoRegistro}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Prioridad
                  </label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) => handleInputChange('prioridad', e.target.value)}
                    className="w-full px-4 py-3 h-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-colors bg-white"
                  >
                    {prioridades.map(prioridad => (
                      <option key={prioridad.value} value={prioridad.value}>{prioridad.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requiereAtencionInmediata}
                      onChange={(e) => handleInputChange('requiereAtencionInmediata', e.target.checked)}
                      className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Requiere atención inmediata
                    </span>
                  </label>
                  {formData.requiereAtencionInmediata && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-800">Este paciente será marcado como prioritario</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Campos médicos opcionales */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-green-600" />
                  Información Médica Adicional (Opcional)
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Alergias conocidas
                    </label>
                    <textarea
                      value={formData.alergias}
                      onChange={(e) => handleInputChange('alergias', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-colors"
                      placeholder="Separe las alergias con comas (ej: Penicilina, Aspirina)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Medicamentos actuales
                    </label>
                    <textarea
                      value={formData.medicamentos}
                      onChange={(e) => handleInputChange('medicamentos', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-colors"
                      placeholder="Separe los medicamentos con comas"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Enfermedades crónicas o antecedentes relevantes
                    </label>
                    <textarea
                      value={formData.enfermedades}
                      onChange={(e) => handleInputChange('enfermedades', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-colors"
                      placeholder="Separe las enfermedades con comas"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Observaciones iniciales
                    </label>
                    <textarea
                      value={formData.observacionesIniciales}
                      onChange={(e) => handleInputChange('observacionesIniciales', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-colors"
                      placeholder="Notas adicionales sobre el paciente o su situación"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>
            )}
            
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center space-x-2"
              >
                <span>Siguiente</span>
                <Calendar className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Registrar Paciente</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}