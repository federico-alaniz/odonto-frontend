'use client';

import { useState, useEffect } from 'react';
import MedicalModal from '@/components/ui/MedicalModal';
import MedicalInput from '@/components/forms/MedicalInput';
import MedicalSelect from '@/components/forms/MedicalSelect';
import MedicalTextarea from '@/components/forms/MedicalTextarea';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: NewAppointment) => void;
  selectedDate?: Date;
  selectedTime?: string;
}

interface NewAppointment {
  patientName: string;
  patientId: string;
  patientPhone: string;
  patientAge: number;
  date: string;
  time: string;
  type: 'consulta' | 'control' | 'procedimiento' | 'urgencia';
  duration: number;
  doctor: string;
  notes: string;
  status: 'programada' | 'confirmada';
}

interface FormErrors {
  [key: string]: string;
}

// Lista de pacientes existentes (simulado)
const existingPatients = [
  { id: '1', name: 'María Elena González', phone: '3001234567', age: 45 },
  { id: '2', name: 'Juan Carlos Pérez', phone: '3109876543', age: 38 },
  { id: '3', name: 'Ana María López', phone: '3156789012', age: 52 },
  { id: '4', name: 'Roberto García Castillo', phone: '3007654321', age: 41 },
  { id: '5', name: 'Carmen Ruiz Martínez', phone: '3128901234', age: 33 },
  { id: '6', name: 'Luis Fernando Martín', phone: '3195432167', age: 62 },
];

// Lista de doctores disponibles
const availableDoctors = [
  'Dr. Carlos Mendoza',
  'Dr. Ana Rodríguez',
  'Dr. Patricia Jiménez',
  'Dr. Miguel Santos',
  'Dr. Laura Fernández'
];

// Generar horarios disponibles
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 17 && minute > 0) break; // Terminar a las 17:00
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  return slots;
};

export default function NewAppointmentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedDate,
  selectedTime 
}: NewAppointmentModalProps) {
  const [formData, setFormData] = useState<NewAppointment>({
    patientName: '',
    patientId: '',
    patientPhone: '',
    patientAge: 0,
    date: '',
    time: '',
    type: 'consulta',
    duration: 30,
    doctor: '',
    notes: '',
    status: 'programada'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(existingPatients);

  const timeSlots = generateTimeSlots();

  // Inicializar formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      const initialDate = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const initialTime = selectedTime || '09:00';
      
      setFormData({
        patientName: '',
        patientId: '',
        patientPhone: '',
        patientAge: 0,
        date: initialDate,
        time: initialTime,
        type: 'consulta',
        duration: 30,
        doctor: availableDoctors[0],
        notes: '',
        status: 'programada'
      });
      setErrors({});
      setIsNewPatient(false);
      setPatientSearch('');
    }
  }, [isOpen, selectedDate, selectedTime]);

  // Filtrar pacientes por búsqueda
  useEffect(() => {
    if (patientSearch) {
      setFilteredPatients(
        existingPatients.filter(patient =>
          patient.name.toLowerCase().includes(patientSearch.toLowerCase())
        )
      );
    } else {
      setFilteredPatients(existingPatients);
    }
  }, [patientSearch]);

  const handleInputChange = (field: string, value: string | number) => {
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

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    handleInputChange(field, value);
  };

  const handlePatientSelect = (patient: typeof existingPatients[0]) => {
    setFormData(prev => ({
      ...prev,
      patientName: patient.name,
      patientId: patient.id,
      patientPhone: patient.phone,
      patientAge: patient.age
    }));
    setPatientSearch(patient.name);
    setIsNewPatient(false);
  };

  const handleNewPatientToggle = () => {
    setIsNewPatient(!isNewPatient);
    if (!isNewPatient) {
      // Limpiar datos del paciente al cambiar a nuevo paciente
      setFormData(prev => ({
        ...prev,
        patientName: '',
        patientId: '',
        patientPhone: '',
        patientAge: 0
      }));
      setPatientSearch('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.patientName.trim()) newErrors.patientName = 'El nombre del paciente es requerido';
    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (!formData.time) newErrors.time = 'La hora es requerida';
    if (!formData.doctor) newErrors.doctor = 'Debe seleccionar un doctor';
    if (formData.duration <= 0) newErrors.duration = 'La duración debe ser mayor a 0';
    
    if (isNewPatient) {
      if (!formData.patientPhone.trim()) newErrors.patientPhone = 'El teléfono es requerido';
      if (formData.patientAge <= 0) newErrors.patientAge = 'La edad debe ser mayor a 0';
    }

    // Validar que la fecha no sea en el pasado
    const appointmentDate = new Date(formData.date + 'T' + formData.time);
    const now = new Date();
    if (appointmentDate < now) {
      newErrors.date = 'No se pueden programar citas en el pasado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generar ID único para nuevo paciente si es necesario
      const appointmentData = {
        ...formData,
        patientId: isNewPatient ? `new_${Date.now()}` : formData.patientId
      };
      
      onSave(appointmentData);
      alert('✅ Cita programada exitosamente');
      onClose();
    } catch (error) {
      console.error('Error al programar cita:', error);
      alert('❌ Error al programar la cita. Intente nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  return (
    <MedicalModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Cita Médica"
      icon="📅"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de Paciente */}
        <div className="medical-section">
          <div className="medical-section-header">
            <span className="medical-section-icon">👤</span>
            <h3 className="medical-section-title">Información del Paciente</h3>
          </div>
          <div className="medical-section-content">
            <div className="mb-4">
              <div className="flex items-center space-x-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isNewPatient}
                    onChange={() => handleNewPatientToggle()}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Paciente Existente</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isNewPatient}
                    onChange={() => handleNewPatientToggle()}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Nuevo Paciente</span>
                </label>
              </div>

              {!isNewPatient ? (
                <div className="space-y-3">
                  <MedicalInput
                    label="Buscar Paciente"
                    value={patientSearch}
                    onChange={handleFormChange('patientSearch')}
                    placeholder="Escriba el nombre del paciente..."
                    onInput={(e) => setPatientSearch(e.currentTarget.value)}
                  />
                  
                  {patientSearch && filteredPatients.length > 0 && (
                    <div className="border medical-border rounded-lg max-h-40 overflow-y-auto">
                      {filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => handlePatientSelect(patient)}
                          className="w-full text-left p-3 hover:bg-blue-50 border-b medical-border last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-slate-900">{patient.name}</div>
                          <div className="text-sm text-slate-600">
                            {patient.age} años • {patient.phone}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MedicalInput
                    label="Nombre Completo"
                    value={formData.patientName}
                    onChange={handleFormChange('patientName')}
                    error={errors.patientName}
                    placeholder="Nombre completo del paciente"
                    required
                  />
                  <MedicalInput
                    label="Teléfono"
                    value={formData.patientPhone}
                    onChange={handleFormChange('patientPhone')}
                    error={errors.patientPhone}
                    placeholder="3001234567"
                    required
                  />
                  <MedicalInput
                    label="Edad"
                    type="number"
                    value={formData.patientAge || ''}
                    onChange={handleFormChange('patientAge')}
                    error={errors.patientAge}
                    placeholder="25"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información de la Cita */}
        <div className="medical-section">
          <div className="medical-section-header">
            <span className="medical-section-icon">📅</span>
            <h3 className="medical-section-title">Detalles de la Cita</h3>
          </div>
          <div className="medical-section-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MedicalInput
                label="Fecha"
                type="date"
                value={formData.date}
                onChange={handleFormChange('date')}
                error={errors.date}
                required
              />
              <MedicalSelect
                label="Hora"
                value={formData.time}
                onChange={handleFormChange('time')}
                error={errors.time}
                options={timeSlots.map(time => ({ value: time, label: time }))}
                required
              />
              <MedicalSelect
                label="Tipo de Cita"
                value={formData.type}
                onChange={handleFormChange('type')}
                options={[
                  { value: 'consulta', label: 'Consulta General' },
                  { value: 'control', label: 'Control de Seguimiento' },
                  { value: 'procedimiento', label: 'Procedimiento' },
                  { value: 'urgencia', label: 'Cita de Urgencia' }
                ]}
                required
              />
              <MedicalInput
                label="Duración (minutos)"
                type="number"
                value={formData.duration}
                onChange={handleFormChange('duration')}
                error={errors.duration}
                min="15"
                step="15"
                required
              />
              <MedicalSelect
                label="Doctor"
                value={formData.doctor}
                onChange={handleFormChange('doctor')}
                error={errors.doctor}
                options={availableDoctors.map(doctor => ({ value: doctor, label: doctor }))}
                required
              />
              <MedicalSelect
                label="Estado"
                value={formData.status}
                onChange={handleFormChange('status')}
                options={[
                  { value: 'programada', label: 'Programada' },
                  { value: 'confirmada', label: 'Confirmada' }
                ]}
                required
              />
            </div>
            <div className="mt-4">
              <MedicalTextarea
                label="Notas Adicionales"
                value={formData.notes}
                onChange={handleFormChange('notes')}
                placeholder="Motivo de la consulta, síntomas, observaciones especiales..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Resumen de la Cita */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">📋 Resumen de la Cita</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Paciente:</strong> {formData.patientName || 'Por seleccionar'}</p>
            <p><strong>Fecha y Hora:</strong> {formData.date || 'Por definir'} a las {formData.time || 'Por definir'}</p>
            <p><strong>Doctor:</strong> {formData.doctor || 'Por asignar'}</p>
            <p><strong>Tipo:</strong> {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}</p>
            <p><strong>Duración:</strong> {formData.duration} minutos</p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justified-end space-x-4 pt-6 border-t medical-border">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="medical-button-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="medical-button-primary"
          >
            {isSaving ? (
              <>
                <span className="animate-spin inline-block mr-2">⏳</span>
                Programando...
              </>
            ) : (
              <>
                <span className="mr-2">📅</span>
                Programar Cita
              </>
            )}
          </button>
        </div>
      </form>
    </MedicalModal>
  );
}