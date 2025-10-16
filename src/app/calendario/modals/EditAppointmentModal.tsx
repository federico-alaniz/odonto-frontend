'use client';

import { useState, useEffect } from 'react';
import Portal from '../components/Portal';

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consulta': return 'border-blue-300 bg-blue-50';
      case 'control': return 'border-green-300 bg-green-50';
      case 'procedimiento': return 'border-purple-300 bg-purple-50';
      case 'urgencia': return 'border-red-300 bg-red-50';
      default: return 'border-gray-300 bg-gray-50';
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
        <div className="relative w-full max-w-3xl medical-card max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b medical-border bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  ✏️ Editar Cita
                </h2>
                <p className="text-slate-600">
                  Modifica los detalles de la cita médica
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/80 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                title="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información del Paciente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  👤 Información del Paciente
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    className={`medical-input ${errors.patientName ? 'border-red-300' : ''}`}
                    placeholder="Nombre del paciente"
                  />
                  {errors.patientName && (
                    <p className="text-red-500 text-sm mt-1">{errors.patientName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      ID Paciente
                    </label>
                    <input
                      type="text"
                      value={formData.patientId}
                      onChange={(e) => handleInputChange('patientId', e.target.value)}
                      className="medical-input"
                      placeholder="ID"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Edad
                    </label>
                    <input
                      type="number"
                      value={formData.patientAge || ''}
                      onChange={(e) => handleInputChange('patientAge', parseInt(e.target.value) || undefined)}
                      className={`medical-input ${errors.patientAge ? 'border-red-300' : ''}`}
                      placeholder="Edad"
                      min="0"
                      max="150"
                    />
                    {errors.patientAge && (
                      <p className="text-red-500 text-sm mt-1">{errors.patientAge}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.patientPhone || ''}
                    onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                    className={`medical-input ${errors.patientPhone ? 'border-red-300' : ''}`}
                    placeholder="3001234567"
                  />
                  {errors.patientPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.patientPhone}</p>
                  )}
                </div>
              </div>

              {/* Información de la Cita */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  📅 Información de la Cita
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className={`medical-input ${errors.date ? 'border-red-300' : ''}`}
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Hora *
                    </label>
                    <select
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className={`medical-input ${errors.time ? 'border-red-300' : ''}`}
                    >
                      <option value="">Seleccionar hora</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    {errors.time && (
                      <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo de Cita *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['consulta', 'control', 'procedimiento', 'urgencia'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleInputChange('type', type)}
                        className={`
                          p-3 rounded-lg border-2 transition-all text-sm font-medium
                          ${formData.type === type 
                            ? `${getTypeColor(type)} border-current` 
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                          }
                        `}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Duración (minutos) *
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                      className={`medical-input ${errors.duration ? 'border-red-300' : ''}`}
                      min="15"
                      max="120"
                      step="15"
                    />
                    {errors.duration && (
                      <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="medical-input"
                    >
                      <option value="programada">Programada</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Doctor *
                  </label>
                  <select
                    value={formData.doctor}
                    onChange={(e) => handleInputChange('doctor', e.target.value)}
                    className={`medical-input ${errors.doctor ? 'border-red-300' : ''}`}
                  >
                    <option value="">Seleccionar doctor</option>
                    {availableDoctors.map(doctor => (
                      <option key={doctor} value={doctor}>{doctor}</option>
                    ))}
                  </select>
                  {errors.doctor && (
                    <p className="text-red-500 text-sm mt-1">{errors.doctor}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                📝 Notas y Observaciones
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="medical-input h-24 resize-none"
                placeholder="Notas adicionales sobre la cita..."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="medical-button-primary px-8 py-3"
              >
                💾 Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}