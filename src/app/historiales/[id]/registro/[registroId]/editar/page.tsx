'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/Spinner';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ChevronLeft, 
  Calendar, 
  Stethoscope, 
  FileText, 
  Activity,
  Camera,
  Save,
  X,
  Plus
} from 'lucide-react';
import { MedicalHistory, getMedicalHistoryById } from '../../../../adapter';
import Odontogram from '../../../../components/Odontogram';
import MedicalFormContainer from '@/components/forms/MedicalFormContainer';
import MedicalFormSection from '@/components/forms/MedicalFormSection';
import MedicalInputField from '@/components/forms/MedicalInputField';
import MedicalSelectField from '@/components/forms/MedicalSelectField';
import MedicalTextareaField from '@/components/forms/MedicalTextareaField';
import MedicalFieldGroup from '@/components/forms/MedicalFieldGroup';
import MedicalFormActions from '@/components/forms/MedicalFormActions';
import MedicalButton from '@/components/forms/MedicalButton';
import { ToothCondition, ToothSector } from '@/services/medicalRecords';

export default function RegistroEditPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const registroId = params.registroId as string;
  
  const [registro, setRegistro] = useState<MedicalHistory | null>(null);
  const [patientName, setPatientName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados adicionales para odontograma e imágenes
  const [odontogramData, setOdontogramData] = useState<ToothCondition[]>([]);
  const [diagnosticImages, setDiagnosticImages] = useState<Array<{
    file: File;
    preview: string;
    description: string;
    type: 'radiografia' | 'ecografia' | 'tomografia' | 'resonancia' | 'endoscopia' | 'laboratorio' | 'otro';
  }>>([]);

  // Estados del formulario
  const [formData, setFormData] = useState({
    consultationDate: '',
    consultationTime: '',
    doctor: '',
    specialty: '',
    type: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    status: '',
    medications: [] as Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>,
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    nextAppointment: ''
  });

  useEffect(() => {
    // Buscar el registro médico específico usando el adaptador
    const foundRegistro = getMedicalHistoryById(registroId);
    
    if (foundRegistro) {
      setPatientName(`${foundRegistro.patient.firstName} ${foundRegistro.patient.lastName}`);
      setRegistro(foundRegistro);
      // Mapear el odontograma del adaptador (que usa 'id') al tipo ToothCondition (que usa 'number')
      const mappedOdontogram: ToothCondition[] = (foundRegistro.odontogram || []).map((tooth: any) => ({
        number: tooth.id,
        status: tooth.status,
        sectors: tooth.sectors,
        hasCrown: tooth.hasCrown,
        hasProsthesis: tooth.hasProsthesis,
        notes: tooth.notes
      }));
      setOdontogramData(mappedOdontogram);
      // Inicializar el formulario con los datos del registro
      setFormData({
        consultationDate: foundRegistro.consultationDate.split('T')[0], // Solo la fecha
        consultationTime: foundRegistro.consultationTime,
        doctor: foundRegistro.doctor,
        specialty: foundRegistro.specialty,
        type: foundRegistro.type,
        symptoms: foundRegistro.symptoms,
        diagnosis: foundRegistro.diagnosis,
        treatment: foundRegistro.treatment,
        notes: foundRegistro.notes || '',
        status: foundRegistro.status,
        medications: foundRegistro.medications || [],
        vitalSigns: {
          bloodPressure: foundRegistro.vitalSigns?.bloodPressure || '',
          heartRate: foundRegistro.vitalSigns?.heartRate?.toString() || '',
          temperature: foundRegistro.vitalSigns?.temperature?.toString() || '',
          weight: foundRegistro.vitalSigns?.weight?.toString() || '',
          height: foundRegistro.vitalSigns?.height?.toString() || ''
        },
        nextAppointment: foundRegistro.nextAppointment ? foundRegistro.nextAppointment.split('T')[0] : ''
      });
    }
    setLoading(false);
  }, [registroId]);

  const handleBack = () => {
    router.push(`/historiales/${patientId}/registro/${registroId}`);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVitalSignsChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [field]: value
      }
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }]
    }));
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
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

  const updateImageType = (index: number, type: 'radiografia' | 'ecografia' | 'tomografia' | 'resonancia' | 'endoscopia' | 'laboratorio' | 'otro') => {
    setDiagnosticImages(prev => prev.map((img, i) => 
      i === index ? { ...img, type } : img
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Aquí iría la lógica para guardar los cambios
    // Por ahora solo simularemos la operación
    setTimeout(() => {
      setSaving(false);
      // Redirigir a la vista de detalles después de guardar
      router.push(`/historiales/${patientId}/registro/${registroId}`);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <LoadingSpinner message="Cargando registro..." />
      </div>
    );
  }

  if (!registro) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Registro médico no encontrado</h2>
          <p className="text-gray-600 mb-4">El registro médico que buscas no existe o ha sido eliminado.</p>
          <MedicalButton
            variant="primary"
            onClick={() => router.push(`/historiales/${patientId}`)}
          >
            Volver a Historia Clínica
          </MedicalButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Editar Registro Médico</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {patientName}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <MedicalButton
              variant="secondary"
              onClick={handleBack}
            >
              Cancelar
            </MedicalButton>
            <MedicalButton
              variant="primary"
              onClick={handleSave}
              loading={saving}
              loadingText="Guardando..."
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </MedicalButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <MedicalFormContainer>
          
          {/* Información General */}
          <MedicalFormSection
            title="Información de la Consulta"
            description="Datos básicos del registro médico"
            icon={Calendar}
            iconColor="text-blue-600"
          >
            <MedicalFieldGroup>
              <MedicalInputField
                label="Fecha de Consulta"
                type="date"
                value={formData.consultationDate}
                onChange={(value) => handleInputChange('consultationDate', value)}
                required
              />
              <MedicalInputField
                label="Hora de Consulta"
                type="time"
                value={formData.consultationTime}
                onChange={(value) => handleInputChange('consultationTime', value)}
                required
              />
              <MedicalInputField
                label="Doctor"
                value={formData.doctor}
                onChange={(value) => handleInputChange('doctor', value)}
                placeholder="Nombre del doctor"
                required
              />
              <MedicalSelectField
                label="Especialidad"
                value={formData.specialty}
                onChange={(value) => handleInputChange('specialty', value)}
                options={[
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
                ]}
                required
              />
              <MedicalSelectField
                label="Tipo de Consulta"
                value={formData.type}
                onChange={(value) => handleInputChange('type', value)}
                options={[
                  { value: 'consultation', label: 'Consulta General' },
                  { value: 'follow-up', label: 'Control de Seguimiento' },
                  { value: 'emergency', label: 'Consulta de Urgencia' },
                  { value: 'procedure', label: 'Procedimiento' },
                  { value: 'preventive', label: 'Consulta Preventiva' }
                ]}
                required
              />
              <MedicalSelectField
                label="Estado"
                value={formData.status}
                onChange={(value) => handleInputChange('status', value)}
                options={[
                  { value: 'active', label: 'Activo' },
                  { value: 'completed', label: 'Completado' },
                  { value: 'cancelled', label: 'Cancelado' },
                  { value: 'pending', label: 'Pendiente' }
                ]}
                required
              />
            </MedicalFieldGroup>
          </MedicalFormSection>

          {/* Diagnóstico y Síntomas */}
          <MedicalFormSection
            title="Diagnóstico y Síntomas"
            description="Información clínica de la consulta"
            icon={Stethoscope}
            iconColor="text-purple-600"
          >
            <div className="space-y-6">
              <MedicalTextareaField
                label="Síntomas"
                value={formData.symptoms}
                onChange={(value) => handleInputChange('symptoms', value)}
                placeholder="Describa los síntomas presentados por el paciente"
                rows={4}
                required
              />
              <MedicalTextareaField
                label="Diagnóstico"
                value={formData.diagnosis}
                onChange={(value) => handleInputChange('diagnosis', value)}
                placeholder="Diagnóstico médico"
                rows={4}
                required
              />
              <MedicalTextareaField
                label="Tratamiento"
                value={formData.treatment}
                onChange={(value) => handleInputChange('treatment', value)}
                placeholder="Plan de tratamiento recomendado"
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
                onChange={(value) => handleVitalSignsChange('bloodPressure', value)}
                placeholder="120/80 mmHg"
              />
              <MedicalInputField
                label="Frecuencia Cardíaca"
                value={formData.vitalSigns.heartRate}
                onChange={(value) => handleVitalSignsChange('heartRate', value)}
                placeholder="72 bpm"
              />
              <MedicalInputField
                label="Temperatura"
                value={formData.vitalSigns.temperature}
                onChange={(value) => handleVitalSignsChange('temperature', value)}
                placeholder="36.5°C"
              />
              <MedicalInputField
                label="Peso"
                value={formData.vitalSigns.weight}
                onChange={(value) => handleVitalSignsChange('weight', value)}
                placeholder="70 kg"
              />
              <MedicalInputField
                label="Altura"
                value={formData.vitalSigns.height}
                onChange={(value) => handleVitalSignsChange('height', value)}
                placeholder="170 cm"
              />
            </MedicalFieldGroup>
          </MedicalFormSection>

          {/* Medicamentos */}
          <MedicalFormSection
            title="Medicamentos"
            description="Lista de medicamentos prescritos"
            icon={FileText}
            iconColor="text-orange-600"
          >
            <div className="space-y-6">
              {formData.medications.map((medication, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">Medicamento {index + 1}</h4>
                    <button
                      onClick={() => removeMedication(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <MedicalFieldGroup>
                    <MedicalInputField
                      label="Nombre del medicamento"
                      value={medication.name}
                      onChange={(value) => updateMedication(index, 'name', value)}
                      placeholder="Nombre del medicamento"
                    />
                    <MedicalInputField
                      label="Dosis"
                      value={medication.dosage}
                      onChange={(value) => updateMedication(index, 'dosage', value)}
                      placeholder="500mg"
                    />
                    <MedicalInputField
                      label="Frecuencia"
                      value={medication.frequency}
                      onChange={(value) => updateMedication(index, 'frequency', value)}
                      placeholder="Cada 8 horas"
                    />
                    <MedicalInputField
                      label="Duración"
                      value={medication.duration}
                      onChange={(value) => updateMedication(index, 'duration', value)}
                      placeholder="7 días"
                    />
                  </MedicalFieldGroup>
                  <div className="mt-4">
                    <MedicalTextareaField
                      label="Instrucciones especiales"
                      value={medication.instructions || ''}
                      onChange={(value) => updateMedication(index, 'instructions', value)}
                      placeholder="Instrucciones adicionales para el paciente"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              
              <button
                onClick={addMedication}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 font-medium">Agregar Medicamento</span>
              </button>
            </div>
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
                            <X className="w-4 h-4" />
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
            <div className="mt-6">
              <MedicalInputField
                label="Próxima Cita"
                type="date"
                value={formData.nextAppointment}
                onChange={(value) => handleInputChange('nextAppointment', value)}
              />
            </div>
          </MedicalFormSection>

          {/* Acciones del formulario */}
          <MedicalFormActions>
            <MedicalButton
              variant="secondary"
              onClick={handleBack}
            >
              Cancelar
            </MedicalButton>
            
            <MedicalButton
              variant="primary"
              onClick={handleSave}
              loading={saving}
              loadingText="Guardando..."
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </MedicalButton>
          </MedicalFormActions>
        </MedicalFormContainer>
      </div>
    </div>
  );
}