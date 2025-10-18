'use client';

import { useState } from 'react';
import { 
  User, 
  Phone, 
  Stethoscope, 
  AlertTriangle, 
  Shield,
  Loader2
} from 'lucide-react';
import { 
  getProvincias, 
  getDepartamentosPorProvincia, 
  getCiudadesPorProvincia 
} from '../../../utils';

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
    if (!formData.domicilio.trim()) newErrors.domicilio = 'El domicilio es requerido';
    if (!formData.ciudad.trim()) newErrors.ciudad = 'La ciudad es requerida';
    if (!formData.provincia.trim()) newErrors.provincia = 'La provincia es requerida';
    if (!formData.contactoEmergenciaNombre.trim()) newErrors.contactoEmergenciaNombre = 'El contacto de emergencia es requerido';
    if (!formData.contactoEmergenciaTelefono.trim()) newErrors.contactoEmergenciaTelefono = 'El teléfono de emergencia es requerido';

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
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la llamada real a la API
      console.log('Datos del paciente:', formData);
      
      // Mostrar mensaje de éxito
      alert('✅ Paciente registrado exitosamente');
      
      // Limpiar formulario
      setFormData({
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
      
    } catch {
      alert('❌ Error al registrar el paciente. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {/* Información Personal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Datos básicos de identificación del paciente</p>
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Información de Contacto</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Datos de contacto y ubicación del paciente</p>
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
              Domicilio *
            </label>
            <input
              type="text"
              required
              value={formData.domicilio}
              onChange={(e) => handleInputChange('domicilio', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Información Médica</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Historial médico y condiciones de salud relevantes</p>
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
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
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
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
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Contacto de Emergencia</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Persona a contactar en caso de emergencia médica</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={formData.contactoEmergenciaNombre}
                onChange={(e) => handleInputChange('contactoEmergenciaNombre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Información de Seguro Médico</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Datos del seguro médico o obra social del paciente</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ¿Tiene Seguro Médico?
            </label>
            <select
              value={formData.tieneSeguro}
              onChange={(e) => handleInputChange('tieneSeguro', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
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
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 text-blue-400 mt-0.5">ℹ</div>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Los campos marcados con asterisco (*) son obligatorios. Asegúrese de completar toda la información requerida antes de continuar.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            px-8 py-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isSubmitting 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
            }
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Registrando...
            </span>
          ) : (
            'Registrar Paciente'
          )}
        </button>
      </div>
    </form>
  );
}