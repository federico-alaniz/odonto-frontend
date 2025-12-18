'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  User, 
  Calendar, 
  Stethoscope, 
  FileText, 
  Camera,
  Activity,
  ChevronLeft
} from 'lucide-react';
import { MedicalHistory } from '../../historiales/adapter';
import Odontogram, { ToothCondition } from '../../historiales/components/Odontogram';
import MedicalFormContainer from '@/components/forms/MedicalFormContainer';
import MedicalFormSection from '@/components/forms/MedicalFormSection';
import MedicalInputField from '@/components/forms/MedicalInputField';
import MedicalSelectField from '@/components/forms/MedicalSelectField';
import MedicalTextareaField from '@/components/forms/MedicalTextareaField';
import MedicalFieldGroup from '@/components/forms/MedicalFieldGroup';
import MedicalFormActions from '@/components/forms/MedicalFormActions';
import MedicalFormNotice from '@/components/forms/MedicalFormNotice';
import MedicalButton from '@/components/forms/MedicalButton';
import { useToast } from '@/components/ui/ToastProvider';

type MedicalSpecialty = 'clinica-medica' | 'pediatria' | 'cardiologia' | 'traumatologia' | 'ginecologia' | 'dermatologia' | 'neurologia' | 'psiquiatria' | 'odontologia' | 'oftalmologia' | 'otorrinolaringologia' | 'urologia' | 'endocrinologia' | 'gastroenterologia' | 'nefrologia' | 'neumologia';

export default function NuevaConsultaPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  
  const [isExistingPatient, setIsExistingPatient] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [diagnosticImages, setDiagnosticImages] = useState<Array<{
    file: File;
    preview: string;
    description: string;
    type: 'radiografia' | 'ecografia' | 'tomografia' | 'resonancia' | 'endoscopia' | 'laboratorio' | 'otro';
  }>>([]);
  const [odontogramData, setOdontogramData] = useState<ToothCondition[]>([]);
  const [formData, setFormData] = useState({
    patient: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      age: 0,
      dni: ''
    },
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    doctor: 'Dr. García',
    specialty: 'clinica-medica' as MedicalSpecialty,
    type: 'consultation' as const,
    diagnosis: '',
    symptoms: '',
    treatment: '',
    medications: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    notes: '',
    status: 'active' as const
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pacientes existentes simulados
  const existingPatients = [
    { id: '1', firstName: 'María', lastName: 'González', age: 45, phone: '555-0101', email: 'maria@email.com', dni: '12345678' },
    { id: '2', firstName: 'Carlos', lastName: 'López', age: 32, phone: '555-0102', email: 'carlos@email.com', dni: '87654321' },
    { id: '3', firstName: 'Ana', lastName: 'Martínez', age: 28, phone: '555-0103', email: 'ana@email.com', dni: '11223344' },
    { id: '4', firstName: 'Pedro', lastName: 'Rodríguez', age: 67, phone: '555-0104', email: 'pedro@email.com', dni: '44332211' },
    { id: '5', firstName: 'Laura', lastName: 'Sánchez', age: 38, phone: '555-0105', email: 'laura@email.com', dni: '55667788' }
  ];

  // Doctores disponibles
  const availableDoctors = [
    'Dr. García',
    'Dra. Rodríguez',
    'Dr. Martínez',
    'Dra. López',
    'Dr. Sánchez'
  ];

  // Especialidades médicas disponibles
  const availableSpecialties = [
    { value: 'clinica-medica', label: 'Clínica Médica' },
    { value: 'pediatria', label: 'Pediatría' },
    { value: 'cardiologia', label: 'Cardiología' },
    { value: 'traumatologia', label: 'Traumatología' },
    { value: 'ginecologia', label: 'Ginecología' },
    { value: 'dermatologia', label: 'Dermatología' },
    { value: 'neurologia', label: 'Neurología' },
    { value: 'psiquiatria', label: 'Psiquiatría' },
    { value: 'odontologia', label: 'Odontología' },
    { value: 'oftalmologia', label: 'Oftalmología' },
    { value: 'otorrinolaringologia', label: 'Otorrinolaringología' },
    { value: 'urologia', label: 'Urología' },
    { value: 'endocrinologia', label: 'Endocrinología' },
    { value: 'gastroenterologia', label: 'Gastroenterología' },
    { value: 'nefrologia', label: 'Nefrología' },
    { value: 'neumologia', label: 'Neumología' }
  ];

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Validaciones de paciente
    if (!isExistingPatient) {
      if (!formData.patient.firstName.trim()) newErrors['patient.firstName'] = 'El nombre es requerido';
      if (!formData.patient.lastName.trim()) newErrors['patient.lastName'] = 'El apellido es requerido';
      if (!formData.patient.dni.trim()) newErrors['patient.dni'] = 'El DNI es requerido';
      if (!formData.patient.phone.trim()) newErrors['patient.phone'] = 'El teléfono es requerido';
      if (formData.patient.age <= 0) newErrors['patient.age'] = 'La edad debe ser mayor a 0';
    } else {
      if (!selectedPatientId) newErrors.selectedPatientId = 'Debe seleccionar un paciente';
    }

    // Validaciones de consulta
    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (!formData.time) newErrors.time = 'La hora es requerida';
    if (!formData.doctor.trim()) newErrors.doctor = 'El doctor es requerido';
    if (!formData.specialty) newErrors.specialty = 'La especialidad es requerida';
    if (!formData.symptoms.trim()) newErrors.symptoms = 'Los síntomas son requeridos';
    if (!formData.diagnosis.trim()) newErrors.diagnosis = 'El diagnóstico es requerido';

    // Validación de fecha no pasada
    const consultationDate = new Date(`${formData.date}T${formData.time}`);
    const now = new Date();
    if (consultationDate < now) {
      newErrors.date = 'La fecha y hora no pueden ser anteriores al momento actual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string | number>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = existingPatients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatientId(patientId);
      setFormData(prev => ({
        ...prev,
        patient: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          age: patient.age,
          dni: patient.dni
        }
      }));
    }
  };

  const parseMedications = (medicationsText: string) => {
    if (!medicationsText.trim()) return [];
    
    return medicationsText.split('\n').map(line => {
      const parts = line.split(',').map(part => part.trim());
      return {
        name: parts[0] || '',
        dosage: parts[1] || '',
        frequency: parts[2] || '',
        duration: parts[3] || ''
      };
    }).filter(med => med.name);
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setDiagnosticImages(prev => [...prev, {
            file,
            preview: e.target?.result as string,
            description: '',
            type: 'otro'
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setDiagnosticImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageDescription = (index: number, description: string) => {
    setDiagnosticImages(prev => prev.map((img, i) => 
      i === index ? { ...img, description } : img
    ));
  };

  const updateImageType = (index: number, type: typeof diagnosticImages[0]['type']) => {
    setDiagnosticImages(prev => prev.map((img, i) => 
      i === index ? { ...img, type } : img
    ));
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
      
      const medications = parseMedications(formData.medications);
      
      const newHistory: Omit<MedicalHistory, 'id'> = {
        patientId: selectedPatientId || `new_${Date.now()}`,
        patient: formData.patient,
        consultationDate: formData.date,
        consultationTime: formData.time,
        doctor: formData.doctor,
        specialty: formData.specialty,
        type: formData.type,
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms,
        treatment: formData.treatment,
        medications: medications.length > 0 ? medications : undefined,
        vitalSigns: Object.values(formData.vitalSigns).some(v => v) ? {
          bloodPressure: formData.vitalSigns.bloodPressure || undefined,
          heartRate: formData.vitalSigns.heartRate ? parseFloat(formData.vitalSigns.heartRate) : undefined,
          temperature: formData.vitalSigns.temperature ? parseFloat(formData.vitalSigns.temperature) : undefined,
          weight: formData.vitalSigns.weight ? parseFloat(formData.vitalSigns.weight) : undefined,
          height: formData.vitalSigns.height ? parseFloat(formData.vitalSigns.height) : undefined
        } : undefined,
        notes: formData.notes || undefined,
        status: formData.status,
        diagnosticImages: diagnosticImages.length > 0 ? diagnosticImages.map((img, index) => ({
          id: `img_${Date.now()}_${index}`,
          name: img.file.name,
          url: img.preview,
          description: img.description,
          type: img.type,
          uploadDate: new Date().toISOString()
        })) : undefined,
        odontogram: formData.specialty === 'odontologia' && odontogramData.length > 0 
          ? odontogramData.map(tooth => ({
              id: tooth.number,
              status: tooth.status,
              sectors: tooth.sectors,
              hasCrown: tooth.hasCrown,
              hasProsthesis: tooth.hasProsthesis,
              notes: tooth.notes
            }))
          : undefined,
        createdAt: new Date().toISOString()
      };

      // Aquí iría la llamada real a la API
      console.log('Nueva consulta creada:', newHistory);
      
      // Mostrar mensaje de éxito
      showSuccess(
        'Consulta registrada exitosamente',
        'Los datos de la consulta han sido guardados en el historial'
      );
      
      // Redirigir a la página de registros
      router.push('/registros');
      
    } catch {
      showError(
        'Error al registrar la consulta',
        'Ha ocurrido un problema. Intente nuevamente'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/registros')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nueva Consulta</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Complete el formulario para crear un nuevo registro médico
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <MedicalFormContainer onSubmit={handleSubmit}>
          {/* Selección de Paciente */}
          <MedicalFormSection
            title="Selección de Paciente"
            description="Seleccione un paciente existente o registre uno nuevo"
            icon={User}
            iconColor="text-blue-600"
          >
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Tipo de Paciente</p>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="patientType"
                      checked={isExistingPatient}
                      onChange={() => setIsExistingPatient(true)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Paciente Existente</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="patientType"
                      checked={!isExistingPatient}
                      onChange={() => setIsExistingPatient(false)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Nuevo Paciente</span>
                  </label>
                </div>
              </div>

              {isExistingPatient ? (
                <MedicalSelectField
                  label="Seleccionar Paciente"
                  required
                  value={selectedPatientId}
                  onChange={handlePatientSelect}
                  options={existingPatients.map(patient => ({
                    value: patient.id,
                    label: `${patient.firstName} ${patient.lastName} - DNI: ${patient.dni}`
                  }))}
                  error={errors.selectedPatientId}
                  placeholder="Seleccione un paciente"
                />
              ) : (
                <MedicalFieldGroup>
                  <MedicalInputField
                    label="Nombres"
                    required
                    value={formData.patient.firstName}
                    onChange={(value) => handleInputChange('patient.firstName', value)}
                    error={errors['patient.firstName']}
                    placeholder="Ingrese los nombres"
                  />
                  <MedicalInputField
                    label="Apellidos"
                    required
                    value={formData.patient.lastName}
                    onChange={(value) => handleInputChange('patient.lastName', value)}
                    error={errors['patient.lastName']}
                    placeholder="Ingrese los apellidos"
                  />
                  <MedicalInputField
                    label="DNI"
                    required
                    value={formData.patient.dni}
                    onChange={(value) => handleInputChange('patient.dni', value)}
                    error={errors['patient.dni']}
                    placeholder="Número de documento"
                  />
                  <MedicalInputField
                    label="Teléfono"
                    type="tel"
                    required
                    value={formData.patient.phone}
                    onChange={(value) => handleInputChange('patient.phone', value)}
                    error={errors['patient.phone']}
                    placeholder="Número de teléfono"
                  />
                  <MedicalInputField
                    label="Email"
                    type="email"
                    value={formData.patient.email}
                    onChange={(value) => handleInputChange('patient.email', value)}
                    error={errors['patient.email']}
                    placeholder="Correo electrónico"
                  />
                  <MedicalInputField
                    label="Edad"
                    type="number"
                    required
                    value={formData.patient.age.toString()}
                    onChange={(value) => handleInputChange('patient.age', parseInt(value) || 0)}
                    error={errors['patient.age']}
                    placeholder="Edad del paciente"
                  />
                </MedicalFieldGroup>
              )}
            </div>
          </MedicalFormSection>

          {/* Información de la Consulta */}
          <MedicalFormSection
            title="Información de la Consulta"
            description="Datos básicos de la consulta médica"
            icon={Calendar}
            iconColor="text-green-600"
          >
            <MedicalFieldGroup>
              <MedicalInputField
                label="Fecha"
                type="date"
                required
                value={formData.date}
                onChange={(value) => handleInputChange('date', value)}
                error={errors.date}
              />
              <MedicalInputField
                label="Hora"
                type="time"
                required
                value={formData.time}
                onChange={(value) => handleInputChange('time', value)}
                error={errors.time}
              />
              <MedicalSelectField
                label="Doctor"
                required
                value={formData.doctor}
                onChange={(value) => handleInputChange('doctor', value)}
                options={availableDoctors.map(doctor => ({
                  value: doctor,
                  label: doctor
                }))}
                error={errors.doctor}
                placeholder="Seleccione un doctor"
              />
              <MedicalSelectField
                label="Especialidad"
                required
                value={formData.specialty}
                onChange={(value) => handleInputChange('specialty', value)}
                options={availableSpecialties}
                error={errors.specialty}
                placeholder="Seleccione una especialidad"
              />
            </MedicalFieldGroup>
          </MedicalFormSection>

          {/* Diagnóstico y Síntomas */}
          <MedicalFormSection
            title="Diagnóstico y Síntomas"
            description="Información médica de la consulta"
            icon={Stethoscope}
            iconColor="text-purple-600"
          >
            <div className="space-y-6">
              <MedicalTextareaField
                label="Síntomas"
                required
                value={formData.symptoms}
                onChange={(value) => handleInputChange('symptoms', value)}
                error={errors.symptoms}
                placeholder="Describa los síntomas presentados por el paciente"
                rows={3}
              />
              <MedicalTextareaField
                label="Diagnóstico"
                required
                value={formData.diagnosis}
                onChange={(value) => handleInputChange('diagnosis', value)}
                error={errors.diagnosis}
                placeholder="Diagnóstico médico"
                rows={3}
              />
              <MedicalTextareaField
                label="Tratamiento"
                value={formData.treatment}
                onChange={(value) => handleInputChange('treatment', value)}
                error={errors.treatment}
                placeholder="Plan de tratamiento recomendado"
                rows={3}
              />
              <MedicalTextareaField
                label="Medicamentos"
                value={formData.medications}
                onChange={(value) => handleInputChange('medications', value)}
                error={errors.medications}
                placeholder="Lista de medicamentos (uno por línea: nombre, dosis, frecuencia, duración)"
                rows={4}
              />
            </div>
          </MedicalFormSection>

          {/* Signos Vitales */}
          <MedicalFormSection
            title="Signos Vitales"
            description="Mediciones y signos vitales del paciente"
            icon={Activity}
            iconColor="text-red-600"
          >
            <MedicalFieldGroup>
              <MedicalInputField
                label="Presión Arterial"
                value={formData.vitalSigns.bloodPressure}
                onChange={(value) => handleInputChange('vitalSigns.bloodPressure', value)}
                placeholder="120/80 mmHg"
              />
              <MedicalInputField
                label="Frecuencia Cardíaca"
                value={formData.vitalSigns.heartRate}
                onChange={(value) => handleInputChange('vitalSigns.heartRate', value)}
                placeholder="72 bpm"
              />
              <MedicalInputField
                label="Temperatura"
                value={formData.vitalSigns.temperature}
                onChange={(value) => handleInputChange('vitalSigns.temperature', value)}
                placeholder="36.5°C"
              />
              <MedicalInputField
                label="Peso"
                value={formData.vitalSigns.weight}
                onChange={(value) => handleInputChange('vitalSigns.weight', value)}
                placeholder="70 kg"
              />
              <MedicalInputField
                label="Altura"
                value={formData.vitalSigns.height}
                onChange={(value) => handleInputChange('vitalSigns.height', value)}
                placeholder="170 cm"
              />
            </MedicalFieldGroup>
          </MedicalFormSection>

          {/* Imágenes Diagnósticas */}
          <MedicalFormSection
            title="Imágenes Diagnósticas"
            description="Subir imágenes médicas relacionadas con la consulta"
            icon={Camera}
            iconColor="text-indigo-600"
          >
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                <div className="text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">
                      Subir Imágenes Diagnósticas
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF hasta 10MB cada una
                    </p>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                </div>
              </div>

              {diagnosticImages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Imágenes Subidas ({diagnosticImages.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {diagnosticImages.map((image, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative mb-3">
                          <Image
                            src={image.preview}
                            alt={`Imagen diagnóstica ${index + 1}`}
                            width={200}
                            height={150}
                            className="w-full h-32 object-cover rounded-md"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
                            title="Eliminar imagen"
                          >
                            ×
                          </button>
                        </div>
                        <div className="space-y-3">
                          <MedicalSelectField
                            label="Tipo de Imagen"
                            value={image.type}
                            onChange={(value) => updateImageType(index, value as typeof image.type)}
                            options={[
                              { value: 'radiografia', label: 'Radiografía' },
                              { value: 'ecografia', label: 'Ecografía' },
                              { value: 'tomografia', label: 'Tomografía' },
                              { value: 'resonancia', label: 'Resonancia' },
                              { value: 'endoscopia', label: 'Endoscopia' },
                              { value: 'laboratorio', label: 'Laboratorio' },
                              { value: 'otro', label: 'Otro' }
                            ]}
                          />
                          <MedicalInputField
                            label="Descripción"
                            value={image.description}
                            onChange={(value) => updateImageDescription(index, value)}
                            placeholder="Descripción de la imagen"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </MedicalFormSection>

          {/* Odontograma - Solo si es odontología */}
          {formData.specialty === 'odontologia' && (
            <MedicalFormSection
              title="Odontograma"
              description="Estado dental del paciente"
              icon={Stethoscope}
              iconColor="text-yellow-600"
            >
              <Odontogram
                initialConditions={odontogramData}
                onUpdate={setOdontogramData}
              />
            </MedicalFormSection>
          )}

          {/* Notas Adicionales */}
          <MedicalFormSection
            title="Notas Adicionales"
            description="Observaciones y comentarios adicionales"
            icon={FileText}
            iconColor="text-gray-600"
          >
            <MedicalTextareaField
              label="Notas"
              value={formData.notes}
              onChange={(value) => handleInputChange('notes', value)}
              placeholder="Observaciones adicionales sobre la consulta"
              rows={4}
            />
          </MedicalFormSection>

          {/* Nota informativa */}
          <MedicalFormNotice 
            message="Los campos marcados con asterisco (*) son obligatorios. Asegúrese de completar toda la información requerida antes de guardar la consulta."
          />

          {/* Acciones del formulario */}
          <MedicalFormActions>
            <MedicalButton
              type="button"
              variant="secondary"
              onClick={() => router.push('/registros')}
            >
              Cancelar
            </MedicalButton>
            
            <MedicalButton
              type="submit"
              variant="primary"
              loading={isSubmitting}
              loadingText="Guardando..."
            >
              Guardar Consulta
            </MedicalButton>
          </MedicalFormActions>
        </MedicalFormContainer>
      </div>
    </div>
  );
}