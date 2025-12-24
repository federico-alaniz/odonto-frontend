'use client';

import { useState } from 'react';
import { Calendar, User, Stethoscope } from 'lucide-react';
import MedicalModal from '@/components/ui/MedicalModal';
import MedicalFormSection from '@/components/forms/MedicalFormSection';
import MedicalInputField from '@/components/forms/MedicalInputField';
import MedicalSelectField from '@/components/forms/MedicalSelectField';
import MedicalTextareaField from '@/components/forms/MedicalTextareaField';
import MedicalFieldGroup from '@/components/forms/MedicalFieldGroup';
import MedicalFormActions from '@/components/forms/MedicalFormActions';
import MedicalFormNotice from '@/components/forms/MedicalFormNotice';
import MedicalButton from '@/components/forms/MedicalButton';
import { useToast } from '@/components/ui/ToastProvider';

interface Patient {
  id: string;
  nombres: string;
  apellidos: string;
}

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

interface AppointmentData {
  fecha: string;
  hora: string;
  tipoConsulta: string;
  medico: string;
  especialidad: string;
  motivo: string;
  observaciones: string;
}

export default function NewAppointmentModal({ isOpen, onClose, patient }: NewAppointmentModalProps) {
  const { showSuccess, showError, showWarning } = useToast();
  const [formData, setFormData] = useState<AppointmentData>({
    fecha: '',
    hora: '',
    tipoConsulta: '',
    medico: '',
    especialidad: '',
    motivo: '',
    observaciones: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const tiposConsulta = [
    { value: 'primera_vez', label: 'Primera Vez' },
    { value: 'control', label: 'Control' },
    { value: 'urgencia', label: 'Urgencia' },
    { value: 'seguimiento', label: 'Seguimiento' },
    { value: 'especializada', label: 'Consulta Especializada' }
  ];

  const especialidades = [
    { value: 'medicina_general', label: 'Medicina General' },
    { value: 'pediatria', label: 'Pediatría' },
    { value: 'ginecologia', label: 'Ginecología' },
    { value: 'cardiologia', label: 'Cardiología' },
    { value: 'dermatologia', label: 'Dermatología' },
    { value: 'neurologia', label: 'Neurología' },
    { value: 'ortopedia', label: 'Ortopedia' },
    { value: 'psiquiatria', label: 'Psiquiatría' }
  ];

  const medicos = [
    { value: 'dr_rodriguez', label: 'Dr. Carlos Rodríguez' },
    { value: 'dra_martinez', label: 'Dra. Ana Martínez' },
    { value: 'dr_lopez', label: 'Dr. Miguel López' },
    { value: 'dra_garcia', label: 'Dra. Laura García' },
    { value: 'dr_hernandez', label: 'Dr. Roberto Hernández' }
  ];

  // Generar horarios disponibles
  const horariosDisponibles = [];
  for (let hour = 8; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      horariosDisponibles.push({
        value: timeString,
        label: timeString
      });
    }
  }

  const handleInputChange = (field: keyof AppointmentData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fecha || !formData.hora || !formData.tipoConsulta || !formData.medico) {
      showWarning(
        'Campos requeridos',
        'Por favor complete todos los campos obligatorios'
      );
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccess(
        'Cita programada exitosamente',
        'La cita ha sido registrada en el calendario'
      );
      onClose();
      
      // Limpiar formulario
      setFormData({
        fecha: '',
        hora: '',
        tipoConsulta: '',
        medico: '',
        especialidad: '',
        motivo: '',
        observaciones: ''
      });
      
    } catch {
      showError(
        'Error al programar la cita',
        'Ha ocurrido un problema. Intente nuevamente'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtener la fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  if (!patient) return null;

  return (
    <MedicalModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Nueva Cita - ${patient.nombres} ${patient.apellidos}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información del Paciente */}
        <MedicalFormSection
          title="Información del Paciente"
          description="Datos del paciente para quien se programa la cita"
          icon={User}
          iconColor="text-blue-600"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  {patient.nombres} {patient.apellidos}
                </h3>
                <p className="text-sm text-blue-700">Programando nueva cita médica</p>
              </div>
            </div>
          </div>
        </MedicalFormSection>

        {/* Información de la Cita */}
        <MedicalFormSection
          title="Información de la Cita"
          description="Detalles de fecha, hora y tipo de consulta"
          icon={Calendar}
          iconColor="text-green-600"
        >
          <MedicalFieldGroup columns={2}>
            <MedicalInputField
              label="Fecha de la Cita"
              name="fecha"
              type="date"
              value={formData.fecha}
              onChange={(value) => handleInputChange('fecha', value)}
              min={today}
              required
              placeholder="dd/mm/aaaa"
            />
            
            <MedicalSelectField
              label="Hora de la Cita"
              name="hora"
              value={formData.hora}
              onChange={(value) => handleInputChange('hora', value)}
              options={horariosDisponibles}
              placeholder="Seleccione la hora"
              required
            />
            
            <MedicalSelectField
              label="Tipo de Consulta"
              name="tipoConsulta"
              value={formData.tipoConsulta}
              onChange={(value) => handleInputChange('tipoConsulta', value)}
              options={tiposConsulta}
              placeholder="Seleccione el tipo"
              required
            />
            
            <MedicalSelectField
              label="Especialidad"
              name="especialidad"
              value={formData.especialidad}
              onChange={(value) => handleInputChange('especialidad', value)}
              options={especialidades}
              placeholder="Seleccione especialidad"
            />
          </MedicalFieldGroup>
          
          <MedicalSelectField
            label="Médico Asignado"
            name="medico"
            value={formData.medico}
            onChange={(value) => handleInputChange('medico', value)}
            options={medicos}
            placeholder="Seleccione el médico"
            required
          />
        </MedicalFormSection>

        {/* Motivo y Observaciones */}
        <MedicalFormSection
          title="Motivo de la Consulta"
          description="Detalles adicionales sobre la cita médica"
          icon={Stethoscope}
          iconColor="text-purple-600"
        >
          <MedicalFieldGroup>
            <MedicalInputField
              label="Motivo de la Consulta"
              name="motivo"
              value={formData.motivo}
              onChange={(value) => handleInputChange('motivo', value)}
              placeholder="Ej: Dolor de cabeza, control rutinario, etc."
            />
            
            <MedicalTextareaField
              label="Observaciones Adicionales"
              name="observaciones"
              value={formData.observaciones}
              onChange={(value) => handleInputChange('observaciones', value)}
              placeholder="Información adicional relevante para la consulta..."
              rows={3}
            />
          </MedicalFieldGroup>
        </MedicalFormSection>

        {/* Información Importante */}
        <MedicalFormNotice
          type="info"
          title="Información Importante"
          message="• Las citas se confirmarán por teléfono o email
• Llegue 15 minutos antes de su cita
• Traiga documento de identidad y carnet de seguro
• Las cancelaciones deben hacerse con 24h de anticipación"
        />

        {/* Acciones del Formulario */}
        <MedicalFormActions>
          <MedicalButton
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </MedicalButton>
          <MedicalButton
            type="submit"
            variant="primary"
            loading={isSubmitting}
            loadingText="Programando..."
          >
            📅 Programar Cita
          </MedicalButton>
        </MedicalFormActions>
      </form>
    </MedicalModal>
  );
}