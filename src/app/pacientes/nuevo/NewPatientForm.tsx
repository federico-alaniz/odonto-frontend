'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Phone, 
  Stethoscope, 
  AlertTriangle, 
  Shield,
  Loader2,
  UserPlus
} from 'lucide-react';
import { 
  getProvincias, 
  getDepartamentosPorProvincia, 
  getCiudadesPorProvincia
} from '@/utils';
import { patientsService } from '@/services/api/patients.service';
import { CreatePatientData } from '@/types';

interface PatientFormData {
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
}

interface FormErrors {
  [key: string]: string;
}

export default function NewPatientForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { buildPath } = useTenant();
  const { showSuccess, showError } = useToast();
  const { currentUser } = useAuth();
  
  // Detectar si viene del flujo de citas
  const fromAppointments = searchParams?.get('from') === 'appointments';
  const doctorId = searchParams?.get('doctorId');
  const date = searchParams?.get('date');
  const time = searchParams?.get('time');
  
  const [formData, setFormData] = useState<PatientFormData>({
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
    tieneSeguro: '',
    nombreSeguro: '',
    numeroPoliza: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validaciones requeridas
    if (!formData.nombres.trim()) newErrors.nombres = 'Los nombres son requeridos';
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son requeridos';
    if (!formData.tipoDocumento) newErrors.tipoDocumento = 'El tipo de documento es requerido';
    if (!formData.numeroDocumento.trim()) newErrors.numeroDocumento = 'El número de documento es requerido';
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    if (!formData.genero) newErrors.genero = 'El género es requerido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.ciudad.trim()) newErrors.ciudad = 'La ciudad es requerida';
    if (!formData.provincia.trim()) newErrors.provincia = 'La provincia es requerida';

    // Validación de email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validación de teléfono (básica)
    if (formData.telefono && !/^\d{7,10}$/.test(formData.telefono.replace(/\D/g, ''))) {
      newErrors.telefono = 'El teléfono debe tener entre 7 y 10 dígitos';
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
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

  const handleProvinciaChange = (provincia: string) => {
    setFormData(prev => ({
      ...prev,
      provincia,
      departamento: '', // Limpiar departamento cuando cambia la provincia
      ciudad: '' // Limpiar ciudad cuando cambia la provincia
    }));
    
    // Limpiar errores relacionados
    if (errors.provincia) {
      setErrors(prev => ({
        ...prev,
        provincia: '',
        departamento: '',
        ciudad: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
      const userId = (currentUser as any)?.id;
      
      if (!clinicId || !userId) {
        showError('Error de autenticación', 'No se pudo obtener la información del usuario');
        setIsSubmitting(false);
        return;
      }
      
      // Crear el objeto del paciente con el formato correcto
      const newPatientData: CreatePatientData = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        tipoDocumento: formData.tipoDocumento as 'dni' | 'le' | 'lc' | 'ci' | 'pasaporte' | 'extranjero',
        numeroDocumento: formData.numeroDocumento,
        fechaNacimiento: formData.fechaNacimiento,
        genero: formData.genero as 'masculino' | 'femenino' | 'otro',
        telefono: formData.telefono,
        email: formData.email || undefined,
        direccion: formData.domicilio || formData.ciudad || formData.provincia ? {
          calle: formData.domicilio,
          numero: '',
          ciudad: formData.ciudad,
          provincia: formData.provincia,
          codigoPostal: ''
        } : undefined,
        tipoSangre: formData.tipoSangre || undefined,
        contactoEmergencia: formData.contactoEmergenciaNombre ? {
          nombre: formData.contactoEmergenciaNombre,
          telefono: formData.contactoEmergenciaTelefono,
          relacion: formData.contactoEmergenciaParentesco
        } : undefined,
        seguroMedico: formData.tieneSeguro === 'si' && formData.nombreSeguro ? {
          empresa: formData.nombreSeguro,
          numeroPoliza: formData.numeroPoliza,
          vigencia: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 año desde hoy
        } : undefined,
        alergias: formData.alergias ? formData.alergias.split(',').map(a => a.trim()).filter(a => a) : undefined,
        medicamentosActuales: formData.medicamentos ? formData.medicamentos.split(',').map(m => m.trim()).filter(m => m) : undefined,
        antecedentesPersonales: formData.enfermedades ? formData.enfermedades.split(',').map(e => e.trim()).filter(e => e) : undefined,
      };
      
      // Llamar al servicio para crear el paciente
      const response = await patientsService.createPatient(clinicId, userId, newPatientData);
      
      // Mostrar mensaje de éxito
      showSuccess(
        'Paciente registrado exitosamente',
        `Se ha creado la historia clínica N° ${response.data.numeroHistoriaClinica}`
      );
      
      // Redirigir según el origen
      if (fromAppointments && doctorId && date && time) {
        // Volver al flujo de citas con los parámetros originales
        router.push(buildPath(`/secretary/appointments/new?doctorId=${doctorId}&date=${date}&time=${time}`));
      } else {
        // Redirigir a la lista de pacientes de secretaría
        router.push(buildPath('/secretary/patients'));
      }
      
    } catch (error: any) {
      console.error('Error al registrar paciente:', error);
      showError(
        'Error al registrar el paciente',
        error.message || 'Por favor, verifique los datos e intente nuevamente'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Verificar si hay cambios en el formulario
    const hasChanges = Object.values(formData).some(value => value.trim() !== '');
    
    if (hasChanges) {
      // Confirmar cancelación si hay cambios
      const confirmCancel = window.confirm(
        '¿Estás seguro de que quieres cancelar? Se perderán todos los datos ingresados.'
      );
      
      if (confirmCancel) {
        if (fromAppointments && doctorId && date && time) {
          // Volver al flujo de citas
          router.push(buildPath(`/secretary/appointments/new?doctorId=${doctorId}&date=${date}&time=${time}`));
        } else {
          router.push(buildPath('/secretary/patients'));
        }
      }
    } else {
      // Si no hay cambios, navegar según el origen
      if (fromAppointments && doctorId && date && time) {
        router.push(buildPath(`/secretary/appointments/new?doctorId=${doctorId}&date=${date}&time=${time}`));
      } else {
        router.push(buildPath('/secretary/patients'));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información Personal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-700" />
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
                className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
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
                className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
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
                className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors bg-white ${
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
                className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
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
                className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
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
                className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors bg-white ${
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

      {/* Información de Contacto */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Phone className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Información de Contacto</h2>
              <p className="text-sm text-gray-600 mt-1">Datos de contacto y ubicación del paciente</p>
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
                placeholder="Ej: 3001234567"
              />
              {errors.telefono && (
                <p className="text-sm text-red-600">{errors.telefono}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="ejemplo@correo.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Domicilio
            </label>
            <input
              type="text"
              value={formData.domicilio}
              onChange={(e) => handleInputChange('domicilio', e.target.value)}
              className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
                errors.domicilio ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: Av. Corrientes 1234, Piso 5, Depto B"
            />
            {errors.domicilio && (
              <p className="text-sm text-red-600">{errors.domicilio}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Provincia *
              </label>
              <select
                required
                value={formData.provincia}
                onChange={(e) => handleProvinciaChange(e.target.value)}
                className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors bg-white ${
                  errors.provincia ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione la provincia</option>
                {getProvincias().map(provincia => (
                  <option key={provincia.value} value={provincia.value}>{provincia.label}</option>
                ))}
              </select>
              {errors.provincia && (
                <p className="text-sm text-red-600">{errors.provincia}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Departamento
              </label>
              <select
                value={formData.departamento}
                onChange={(e) => handleInputChange('departamento', e.target.value)}
                disabled={!formData.provincia}
                className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors bg-white ${
                  errors.departamento ? 'border-red-300' : 'border-gray-300'
                } ${!formData.provincia ? 'bg-gray-100 text-gray-400' : ''}`}
              >
                <option value="">
                  {formData.provincia ? "Seleccione el departamento" : "Primero seleccione una provincia"}
                </option>
                {getDepartamentosPorProvincia(formData.provincia).map(depto => (
                  <option key={depto.value} value={depto.value}>{depto.label}</option>
                ))}
              </select>
              {errors.departamento && (
                <p className="text-sm text-red-600">{errors.departamento}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Ciudad *
              </label>
              <select
                required
                value={formData.ciudad}
                onChange={(e) => handleInputChange('ciudad', e.target.value)}
                disabled={!formData.provincia}
                className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors bg-white ${
                  errors.ciudad ? 'border-red-300' : 'border-gray-300'
                } ${!formData.provincia ? 'bg-gray-100 text-gray-400' : ''}`}
              >
                <option value="">
                  {formData.provincia ? "Seleccione la ciudad" : "Primero seleccione una provincia"}
                </option>
                {getCiudadesPorProvincia(formData.provincia).map(ciudad => (
                  <option key={ciudad.value} value={ciudad.value}>{ciudad.label}</option>
                ))}
              </select>
              {errors.ciudad && (
                <p className="text-sm text-red-600">{errors.ciudad}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información Médica */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Información Médica</h2>
              <p className="text-sm text-gray-600 mt-1">Historial médico y condiciones de salud relevantes</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tipo de Sangre
              </label>
              <select
                value={formData.tipoSangre}
                onChange={(e) => handleInputChange('tipoSangre', e.target.value)}
                className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors bg-white ${
                  errors.tipoSangre ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione el tipo de sangre</option>
                {tiposSangre.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
              {errors.tipoSangre && (
                <p className="text-sm text-red-600">{errors.tipoSangre}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Alergias Conocidas
              </label>
              <textarea
                rows={3}
                value={formData.alergias}
                onChange={(e) => handleInputChange('alergias', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors resize-y ${
                  errors.alergias ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ingrese las alergias conocidas (medicamentos, alimentos, etc.)"
              />
              {errors.alergias && (
                <p className="text-sm text-red-600">{errors.alergias}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Medicamentos Actuales
            </label>
            <textarea
              rows={3}
              value={formData.medicamentos}
              onChange={(e) => handleInputChange('medicamentos', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors resize-y ${
                errors.medicamentos ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Lista de medicamentos que toma actualmente"
            />
            {errors.medicamentos && (
              <p className="text-sm text-red-600">{errors.medicamentos}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Enfermedades Preexistentes
            </label>
            <textarea
              rows={3}
              value={formData.enfermedades}
              onChange={(e) => handleInputChange('enfermedades', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors resize-y ${
                errors.enfermedades ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Historial de enfermedades o condiciones médicas"
            />
            {errors.enfermedades && (
              <p className="text-sm text-red-600">{errors.enfermedades}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contacto de Emergencia */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Contacto de Emergencia</h2>
              <p className="text-sm text-gray-600 mt-1">Persona a contactar en caso de emergencia médica</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <input
                type="text"
                value={formData.contactoEmergenciaNombre}
                onChange={(e) => handleInputChange('contactoEmergenciaNombre', e.target.value)}
                className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
                  errors.contactoEmergenciaNombre ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nombre del contacto de emergencia"
              />
              {errors.contactoEmergenciaNombre && (
                <p className="text-sm text-red-600">{errors.contactoEmergenciaNombre}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Parentesco
              </label>
              <select
                value={formData.contactoEmergenciaParentesco}
                onChange={(e) => handleInputChange('contactoEmergenciaParentesco', e.target.value)}
                className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors bg-white ${
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
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.contactoEmergenciaTelefono}
                onChange={(e) => handleInputChange('contactoEmergenciaTelefono', e.target.value)}
                className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
                  errors.contactoEmergenciaTelefono ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Teléfono de emergencia"
              />
              {errors.contactoEmergenciaTelefono && (
                <p className="text-sm text-red-600">{errors.contactoEmergenciaTelefono}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información de Seguro */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Shield className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Información de Seguro Médico</h2>
              <p className="text-sm text-gray-600 mt-1">Datos del seguro médico o obra social del paciente</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ¿Tiene Seguro Médico?
            </label>
            <select
              value={formData.tieneSeguro}
              onChange={(e) => handleInputChange('tieneSeguro', e.target.value)}
              className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors bg-white ${
                errors.tieneSeguro ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione una opción</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
            {errors.tieneSeguro && (
              <p className="text-sm text-red-600">{errors.tieneSeguro}</p>
            )}
          </div>
          
          {formData.tieneSeguro === 'si' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Seguro
                </label>
                <input
                  type="text"
                  value={formData.nombreSeguro}
                  onChange={(e) => handleInputChange('nombreSeguro', e.target.value)}
                  className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
                    errors.nombreSeguro ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nombre de la aseguradora"
                />
                {errors.nombreSeguro && (
                  <p className="text-sm text-red-600">{errors.nombreSeguro}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Número de Póliza
                </label>
                <input
                  type="text"
                  value={formData.numeroPoliza}
                  onChange={(e) => handleInputChange('numeroPoliza', e.target.value)}
                  className={`w-full px-4 py-3 h-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors ${
                    errors.numeroPoliza ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Número de póliza o afiliación"
                />
                {errors.numeroPoliza && (
                  <p className="text-sm text-red-600">{errors.numeroPoliza}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <div className="w-5 h-5 text-blue-600 font-semibold flex items-center justify-center">ℹ</div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-1">Información importante</h3>
            <p className="text-sm text-blue-700">
              Los campos marcados con asterisco (*) son obligatorios. Asegúrese de completar toda la información requerida antes de continuar con el registro del paciente.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all font-medium"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              px-10 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md
              ${isSubmitting 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Registrando...
              </span>
            ) : (
              <span className="flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Registrar Paciente
              </span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
