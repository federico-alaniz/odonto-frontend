'use client';

import { useState } from 'react';
import MedicalInput from '@/components/forms/MedicalInput';
import MedicalSelect from '@/components/forms/MedicalSelect';
import MedicalTextarea from '@/components/forms/MedicalTextarea';

interface PatientFormData {
  // Información Personal
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: string;
  estadoCivil: string;
  
  // Contacto
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  
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
    estadoCivil: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    departamento: '',
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
    { value: 'cc', label: 'Cédula de Ciudadanía' },
    { value: 'ti', label: 'Tarjeta de Identidad' },
    { value: 'ce', label: 'Cédula de Extranjería' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'rc', label: 'Registro Civil' }
  ];

  const generos = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' }
  ];

  const estadosCiviles = [
    { value: 'soltero', label: 'Soltero/a' },
    { value: 'casado', label: 'Casado/a' },
    { value: 'union_libre', label: 'Unión Libre' },
    { value: 'divorciado', label: 'Divorciado/a' },
    { value: 'viudo', label: 'Viudo/a' }
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
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida';
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
        estadoCivil: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
        departamento: '',
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información Personal */}
      <div className="medical-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
          👤 Información Personal
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MedicalInput
            label="Nombres"
            icon="✏️"
            value={formData.nombres}
            onChange={(e) => handleInputChange('nombres', e.target.value)}
            error={errors.nombres}
            required
            placeholder="Ingrese los nombres"
          />
          
          <MedicalInput
            label="Apellidos"
            icon="✏️"
            value={formData.apellidos}
            onChange={(e) => handleInputChange('apellidos', e.target.value)}
            error={errors.apellidos}
            required
            placeholder="Ingrese los apellidos"
          />
          
          <MedicalSelect
            label="Tipo de Documento"
            icon="🆔"
            value={formData.tipoDocumento}
            onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
            error={errors.tipoDocumento}
            options={tiposDocumento}
            placeholder="Seleccione el tipo de documento"
            required
          />
          
          <MedicalInput
            label="Número de Documento"
            icon="🔢"
            value={formData.numeroDocumento}
            onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
            error={errors.numeroDocumento}
            required
            placeholder="Ingrese el número de documento"
          />
          
          <MedicalInput
            label="Fecha de Nacimiento"
            icon="📅"
            type="date"
            value={formData.fechaNacimiento}
            onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
            error={errors.fechaNacimiento}
            required
          />
          
          <MedicalSelect
            label="Género"
            icon="⚧️"
            value={formData.genero}
            onChange={(e) => handleInputChange('genero', e.target.value)}
            error={errors.genero}
            options={generos}
            placeholder="Seleccione el género"
            required
          />
          
          <MedicalSelect
            label="Estado Civil"
            icon="💑"
            value={formData.estadoCivil}
            onChange={(e) => handleInputChange('estadoCivil', e.target.value)}
            error={errors.estadoCivil}
            options={estadosCiviles}
            placeholder="Seleccione el estado civil"
          />
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="medical-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
          📞 Información de Contacto
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MedicalInput
            label="Teléfono"
            icon="📱"
            type="tel"
            value={formData.telefono}
            onChange={(e) => handleInputChange('telefono', e.target.value)}
            error={errors.telefono}
            required
            placeholder="Ej: 3001234567"
          />
          
          <MedicalInput
            label="Email"
            icon="📧"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            placeholder="ejemplo@correo.com"
          />
          
          <div className="md:col-span-2">
            <MedicalInput
              label="Dirección"
              icon="🏠"
              value={formData.direccion}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
              error={errors.direccion}
              required
              placeholder="Ingrese la dirección completa"
            />
          </div>
          
          <MedicalInput
            label="Ciudad"
            icon="🏙️"
            value={formData.ciudad}
            onChange={(e) => handleInputChange('ciudad', e.target.value)}
            error={errors.ciudad}
            placeholder="Ingrese la ciudad"
          />
          
          <MedicalInput
            label="Departamento/Estado"
            icon="🗺️"
            value={formData.departamento}
            onChange={(e) => handleInputChange('departamento', e.target.value)}
            error={errors.departamento}
            placeholder="Ingrese el departamento"
          />
        </div>
      </div>

      {/* Información Médica */}
      <div className="medical-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
          🩺 Información Médica
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MedicalSelect
            label="Tipo de Sangre"
            icon="🩸"
            value={formData.tipoSangre}
            onChange={(e) => handleInputChange('tipoSangre', e.target.value)}
            error={errors.tipoSangre}
            options={tiposSangre}
            placeholder="Seleccione el tipo de sangre"
          />
          
          <div className="md:col-span-1">
            <MedicalTextarea
              label="Alergias Conocidas"
              icon="⚠️"
              value={formData.alergias}
              onChange={(e) => handleInputChange('alergias', e.target.value)}
              error={errors.alergias}
              placeholder="Ingrese las alergias conocidas (medicamentos, alimentos, etc.)"
            />
          </div>
          
          <div className="md:col-span-2">
            <MedicalTextarea
              label="Medicamentos Actuales"
              icon="💊"
              value={formData.medicamentos}
              onChange={(e) => handleInputChange('medicamentos', e.target.value)}
              error={errors.medicamentos}
              placeholder="Lista de medicamentos que toma actualmente"
            />
          </div>
          
          <div className="md:col-span-2">
            <MedicalTextarea
              label="Enfermedades Preexistentes"
              icon="🏥"
              value={formData.enfermedades}
              onChange={(e) => handleInputChange('enfermedades', e.target.value)}
              error={errors.enfermedades}
              placeholder="Historial de enfermedades o condiciones médicas"
            />
          </div>
        </div>
      </div>

      {/* Contacto de Emergencia */}
      <div className="medical-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
          🚨 Contacto de Emergencia
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MedicalInput
            label="Nombre Completo"
            icon="👥"
            value={formData.contactoEmergenciaNombre}
            onChange={(e) => handleInputChange('contactoEmergenciaNombre', e.target.value)}
            error={errors.contactoEmergenciaNombre}
            required
            placeholder="Nombre del contacto de emergencia"
          />
          
          <MedicalSelect
            label="Parentesco"
            icon="👨‍👩‍👧‍👦"
            value={formData.contactoEmergenciaParentesco}
            onChange={(e) => handleInputChange('contactoEmergenciaParentesco', e.target.value)}
            error={errors.contactoEmergenciaParentesco}
            options={parentescos}
            placeholder="Seleccione el parentesco"
          />
          
          <MedicalInput
            label="Teléfono"
            icon="📞"
            type="tel"
            value={formData.contactoEmergenciaTelefono}
            onChange={(e) => handleInputChange('contactoEmergenciaTelefono', e.target.value)}
            error={errors.contactoEmergenciaTelefono}
            required
            placeholder="Teléfono de emergencia"
          />
        </div>
      </div>

      {/* Información de Seguro */}
      <div className="medical-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
          🛡️ Información de Seguro Médico
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MedicalSelect
            label="¿Tiene Seguro Médico?"
            icon="❓"
            value={formData.tieneSeguro}
            onChange={(e) => handleInputChange('tieneSeguro', e.target.value)}
            error={errors.tieneSeguro}
            options={[
              { value: 'si', label: 'Sí' },
              { value: 'no', label: 'No' }
            ]}
            placeholder="Seleccione una opción"
          />
          
          {formData.tieneSeguro === 'si' && (
            <>
              <MedicalInput
                label="Nombre del Seguro"
                icon="🏢"
                value={formData.nombreSeguro}
                onChange={(e) => handleInputChange('nombreSeguro', e.target.value)}
                error={errors.nombreSeguro}
                placeholder="Nombre de la aseguradora"
              />
              
              <MedicalInput
                label="Número de Póliza"
                icon="📋"
                value={formData.numeroPoliza}
                onChange={(e) => handleInputChange('numeroPoliza', e.target.value)}
                error={errors.numeroPoliza}
                placeholder="Número de póliza o afiliación"
              />
            </>
          )}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          type="button"
          className="px-6 py-3 border medical-border rounded-lg text-slate-700 hover:bg-slate-50 transition-colors focus-ring"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            px-8 py-3 rounded-lg font-medium transition-all focus-ring
            ${isSubmitting 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'medical-button-primary hover:shadow-lg'
            }
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2">⏳</span>
              Registrando...
            </span>
          ) : (
            <span className="flex items-center">
              <span className="mr-2">💾</span>
              Registrar Paciente
            </span>
          )}
        </button>
      </div>
    </form>
  );
}