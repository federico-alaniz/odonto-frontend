'use client';

import { useState } from 'react';
import { Stethoscope, User } from 'lucide-react';
import {
  MedicalFormContainer,
  MedicalFormSection,
  MedicalFieldGroup,
  MedicalInputField,
  MedicalSelectField,
  MedicalTextareaField,
  MedicalButton,
  MedicalFormActions,
  MedicalFormNotice,
  MEDICAL_FORM_COLORS
} from '@/components/forms';

interface ConsultationFormData {
  patientId: string;
  consultationType: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function ExampleConsultationForm() {
  const [formData, setFormData] = useState<ConsultationFormData>({
    patientId: '',
    consultationType: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const consultationTypes = [
    { value: 'preventiva', label: 'Consulta Preventiva' },
    { value: 'urgencia', label: 'Urgencia' },
    { value: 'control', label: 'Control' },
    { value: 'tratamiento', label: 'Tratamiento' }
  ];

  const handleInputChange = (field: keyof ConsultationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.patientId.trim()) newErrors.patientId = 'Debe seleccionar un paciente';
    if (!formData.consultationType) newErrors.consultationType = 'Debe seleccionar el tipo de consulta';
    if (!formData.symptoms.trim()) newErrors.symptoms = 'Debe describir los síntomas';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('✅ Consulta registrada exitosamente');
      
      // Limpiar formulario
      setFormData({
        patientId: '',
        consultationType: '',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        notes: ''
      });
      
    } catch {
      alert('❌ Error al registrar la consulta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Consulta</h1>
        <p className="text-gray-600">Registre una nueva consulta médica</p>
      </div>

      <MedicalFormContainer className="custom-form" onSubmit={handleSubmit}>
        {/* Sección: Información de la Consulta */}
        <MedicalFormSection
          title="Información de la Consulta"
          description="Datos básicos de la consulta médica"
          icon={User}
          iconColor={MEDICAL_FORM_COLORS.personal}
        >
          <MedicalFieldGroup columns={2}>
            <MedicalInputField
              label="ID del Paciente"
              value={formData.patientId}
              onChange={(value) => handleInputChange('patientId', value)}
              required
              error={errors.patientId}
              placeholder="Buscar paciente..."
            />
            
            <MedicalSelectField
              label="Tipo de Consulta"
              value={formData.consultationType}
              onChange={(value) => handleInputChange('consultationType', value)}
              options={consultationTypes}
              required
              error={errors.consultationType}
            />
          </MedicalFieldGroup>
        </MedicalFormSection>

        {/* Sección: Información Médica */}
        <MedicalFormSection
          title="Información Médica"
          description="Detalles clínicos de la consulta"
          icon={Stethoscope}
          iconColor={MEDICAL_FORM_COLORS.medical}
        >
          <div className="space-y-6">
            <MedicalTextareaField
              label="Síntomas"
              value={formData.symptoms}
              onChange={(value) => handleInputChange('symptoms', value)}
              required
              error={errors.symptoms}
              placeholder="Describa los síntomas presentados por el paciente"
              rows={4}
            />
            
            <MedicalFieldGroup columns={1}>
              <MedicalTextareaField
                label="Diagnóstico"
                value={formData.diagnosis}
                onChange={(value) => handleInputChange('diagnosis', value)}
                placeholder="Diagnóstico médico"
              />
              
              <MedicalTextareaField
                label="Tratamiento"
                value={formData.treatment}
                onChange={(value) => handleInputChange('treatment', value)}
                placeholder="Tratamiento prescrito"
              />
            </MedicalFieldGroup>
            
            <MedicalTextareaField
              label="Observaciones Adicionales"
              value={formData.notes}
              onChange={(value) => handleInputChange('notes', value)}
              placeholder="Notas adicionales sobre la consulta"
            />
          </div>
        </MedicalFormSection>

        {/* Aviso informativo */}
        <MedicalFormNotice
          type="info"
          message="Asegúrese de completar todos los campos obligatorios antes de guardar la consulta."
        />

        {/* Acciones del formulario */}
        <MedicalFormActions>
          <MedicalButton variant="secondary" type="button">
            Cancelar
          </MedicalButton>
          
          <MedicalButton 
            variant="primary" 
            type="submit"
            loading={isSubmitting}
            loadingText="Guardando consulta..."
          >
            Guardar Consulta
          </MedicalButton>
        </MedicalFormActions>
      </MedicalFormContainer>
    </div>
  );
}