'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Stethoscope, 
  Edit3, 
  X, 
  Save 
} from 'lucide-react';
import Portal from '../components/Portal';
import MedicalButton from '@/components/forms/MedicalButton';
import MedicalInputField from '@/components/forms/MedicalInputField';
import MedicalSelectField from '@/components/forms/MedicalSelectField';
import MedicalTextareaField from '@/components/forms/MedicalTextareaField';
import MedicalFieldGroup from '@/components/forms/MedicalFieldGroup';
import MedicalFormSection from '@/components/forms/MedicalFormSection';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  type: 'consulta' | 'control' | 'procedimiento' | 'urgencia';
  duration: number;
  status: 'programada' | 'confirmada' | 'completada' | 'cancelada';
  doctor: string;
  notes?: string;
  patientPhone?: string;
  patientAge?: number;
}

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSave: (updatedAppointment: Appointment) => void;
}

// Lista de doctores disponibles
const availableDoctors = [
  'Dr. Carlos Mendoza',
  'Dr. Ana Rodríguez',
  'Dr. María González',
  'Dr. Luis Martínez',
  'Dr. Carmen López'
];

// Generar slots de tiempo cada 15 minutos
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 7; hour < 19; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  return slots;
};

export default function EditAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onSave
}: EditAppointmentModalProps) {
  const [formData, setFormData] = useState<Appointment>({
    id: '',
    patientName: '',
    patientId: '',
    date: '',
    time: '',
    type: 'consulta',
    duration: 30,
    status: 'programada',
    doctor: '',
    notes: '',
    patientPhone: '',
    patientAge: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    if (appointment) {
      setFormData(appointment);
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientName.trim()) {
      newErrors.patientName = 'El nombre del paciente es obligatorio';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria';
    }

    if (!formData.time) {
      newErrors.time = 'La hora es obligatoria';
    }

    if (!formData.doctor) {
      newErrors.doctor = 'Debe seleccionar un doctor';
    }

    if (formData.duration < 15 || formData.duration > 120) {
      newErrors.duration = 'La duración debe estar entre 15 y 120 minutos';
    }

    if (formData.patientPhone && !/^\d{10}$/.test(formData.patientPhone.replace(/\s/g, ''))) {
      newErrors.patientPhone = 'El teléfono debe tener 10 dígitos';
    }

    if (formData.patientAge && (formData.patientAge < 0 || formData.patientAge > 150)) {
      newErrors.patientAge = 'La edad debe estar entre 0 y 150 años';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof Appointment, value: string | number | undefined) => {
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

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl mx-4 bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">`
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Editar Cita
                  </h2>
                  <p className="text-gray-600">
                    Modifica los detalles de la cita médica
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/80 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                title="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {/* Información del Paciente */}
              <MedicalFormSection
                title="Información del Paciente"
                description="Datos del paciente asociado a la cita"
                icon={User}
                iconColor="text-blue-600"
              >
                <MedicalFieldGroup>
                  <MedicalInputField
                    label="Nombre completo"
                    value={formData.patientName}
                    onChange={(value) => handleInputChange('patientName', value)}
                    error={errors.patientName}
                    placeholder="Nombre del paciente"
                    required
                  />
                  <MedicalInputField
                    label="ID Paciente"
                    value={formData.patientId}
                    onChange={(value) => handleInputChange('patientId', value)}
                    placeholder="ID del paciente"
                  />
                  <MedicalInputField
                    label="Edad"
                    type="number"
                    value={formData.patientAge?.toString() || ''}
                    onChange={(value) => handleInputChange('patientAge', parseInt(value) || undefined)}
                    error={errors.patientAge}
                    placeholder="Edad"
                    min={0}
                    max={150}
                  />
                  <MedicalInputField
                    label="Teléfono"
                    type="tel"
                    value={formData.patientPhone || ''}
                    onChange={(value) => handleInputChange('patientPhone', value)}
                    error={errors.patientPhone}
                    placeholder="3001234567"
                  />
                </MedicalFieldGroup>
              </MedicalFormSection>

              {/* Información de la Cita */}
              <MedicalFormSection
                title="Información de la Cita"
                description="Detalles y programación de la cita médica"
                icon={Calendar}
                iconColor="text-green-600"
              >
                <MedicalFieldGroup>
                  <MedicalInputField
                    label="Fecha"
                    type="date"
                    value={formData.date}
                    onChange={(value) => handleInputChange('date', value)}
                    error={errors.date}
                    required
                  />
                  <MedicalSelectField
                    label="Hora"
                    value={formData.time}
                    onChange={(value) => handleInputChange('time', value)}
                    error={errors.time}
                    options={timeSlots.map(time => ({ value: time, label: time }))}
                    placeholder="Seleccionar hora"
                    required
                  />
                  <MedicalInputField
                    label="Duración (minutos)"
                    type="number"
                    value={formData.duration.toString()}
                    onChange={(value) => handleInputChange('duration', parseInt(value))}
                    error={errors.duration}
                    min={15}
                    max={120}
                    step={15}
                    required
                  />
                  <MedicalSelectField
                    label="Doctor"
                    value={formData.doctor}
                    onChange={(value) => handleInputChange('doctor', value)}
                    error={errors.doctor}
                    options={availableDoctors.map(doctor => ({ value: doctor, label: doctor }))}
                    placeholder="Seleccionar doctor"
                    required
                  />
                </MedicalFieldGroup>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Tipo de Cita
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['consulta', 'control', 'procedimiento', 'urgencia'] as const).map(type => {
                      const typeColors = {
                        consulta: 'border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100',
                        control: 'border-green-300 bg-green-50 text-green-800 hover:bg-green-100',
                        procedimiento: 'border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100',
                        urgencia: 'border-red-300 bg-red-50 text-red-800 hover:bg-red-100'
                      };
                      
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleInputChange('type', type)}
                          className={`
                            p-3 rounded-lg border-2 transition-all text-sm font-medium
                            ${formData.type === type 
                              ? `${typeColors[type]} border-current` 
                              : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                            }
                          `}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6">
                  <MedicalSelectField
                    label="Estado"
                    value={formData.status}
                    onChange={(value) => handleInputChange('status', value)}
                    options={[
                      { value: 'programada', label: 'Programada' },
                      { value: 'confirmada', label: 'Confirmada' },
                      { value: 'completada', label: 'Completada' },
                      { value: 'cancelada', label: 'Cancelada' }
                    ]}
                  />
                </div>
              </MedicalFormSection>

              {/* Notas */}
              <MedicalFormSection
                title="Notas y Observaciones"
                description="Información adicional sobre la cita"
                icon={Stethoscope}
                iconColor="text-purple-600"
              >
                <MedicalTextareaField
                  label="Notas adicionales"
                  value={formData.notes || ''}
                  onChange={(value) => handleInputChange('notes', value)}
                  placeholder="Notas adicionales sobre la cita..."
                  rows={4}
                />
              </MedicalFormSection>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
              <MedicalButton
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancelar
              </MedicalButton>
              
              <MedicalButton
                type="submit"
                variant="primary"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </MedicalButton>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}