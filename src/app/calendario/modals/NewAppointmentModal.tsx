'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, Clock, Phone, User as UserIcon, Search, X } from 'lucide-react';
import Portal from '../components/Portal';
import MedicalFormSection from '@/components/forms/MedicalFormSection';
import MedicalInputField from '@/components/forms/MedicalInputField';
import MedicalSelectField from '@/components/forms/MedicalSelectField';
import MedicalTextareaField from '@/components/forms/MedicalTextareaField';
import MedicalFieldGroup from '@/components/forms/MedicalFieldGroup';
import MedicalButton from '@/components/forms/MedicalButton';
import { useToast } from '@/components/ui/ToastProvider';

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
  const { showSuccess, showError } = useToast();
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
      showSuccess(
        'Cita programada exitosamente',
        'La nueva cita ha sido agregada al calendario'
      );
      onClose();
    } catch (error) {
      console.error('Error al programar cita:', error);
      showError(
        'Error al programar la cita',
        'Ha ocurrido un problema. Intente nuevamente'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl mx-4 bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white shadow-sm rounded-lg border border-blue-200">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-800">
                    Nueva Cita Médica
                  </h2>
                  <p className="text-blue-600 mt-1 font-medium">
                    Complete la información para programar una nueva cita
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                disabled={isSaving}
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-blue-500 hover:text-blue-700"
                title="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">`
        {/* Selección de Paciente */}
        <MedicalFormSection
          title="Información del Paciente"
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
                    checked={!isNewPatient}
                    onChange={() => handleNewPatientToggle()}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Paciente Existente</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={isNewPatient}
                    onChange={() => handleNewPatientToggle()}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Nuevo Paciente</span>
                </label>
              </div>
            </div>

            {!isNewPatient ? (
              <div className="space-y-4">
                <div className="relative">
                  <MedicalInputField
                    label="Buscar Paciente"
                    value={patientSearch}
                    onChange={(value) => setPatientSearch(value)}
                    placeholder="Escriba el nombre del paciente..."
                  />
                  <Search className="absolute right-3 top-8 h-5 w-5 text-gray-400" />
                </div>
                
                {patientSearch && filteredPatients.length > 0 && (
                  <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-sm">
                    {filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handlePatientSelect(patient)}
                        className="w-full text-left p-4 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors focus:outline-none focus:bg-blue-50"
                      >
                        <div className="font-medium text-gray-900 flex items-center space-x-2">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                          <span>{patient.name}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1 flex items-center space-x-4">
                          <span>{patient.age} años</span>
                          <span className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{patient.phone}</span>
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <MedicalFieldGroup>
                <MedicalInputField
                  label="Nombre Completo"
                  value={formData.patientName}
                  onChange={(value) => handleInputChange('patientName', value)}
                  error={errors.patientName}
                  placeholder="Nombre completo del paciente"
                  required
                />
                <MedicalInputField
                  label="Teléfono"
                  value={formData.patientPhone}
                  onChange={(value) => handleInputChange('patientPhone', value)}
                  error={errors.patientPhone}
                  placeholder="3001234567"
                  required
                />
                <MedicalInputField
                  label="Edad"
                  type="number"
                  value={formData.patientAge?.toString() || ''}
                  onChange={(value) => handleInputChange('patientAge', parseInt(value) || 0)}
                  error={errors.patientAge}
                  placeholder="25"
                  required
                />
              </MedicalFieldGroup>
            )}
          </div>
        </MedicalFormSection>

        {/* Información de la Cita */}
        <MedicalFormSection
          title="Detalles de la Cita"
          description="Configure los detalles de la cita médica"
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
              placeholder="Seleccione una hora"
              required
            />
            <MedicalSelectField
              label="Tipo de Cita"
              value={formData.type}
              onChange={(value) => handleInputChange('type', value)}
              options={[
                { value: 'consulta', label: 'Consulta General' },
                { value: 'control', label: 'Control de Seguimiento' },
                { value: 'procedimiento', label: 'Procedimiento' },
                { value: 'urgencia', label: 'Cita de Urgencia' }
              ]}
              placeholder="Seleccione el tipo"
              required
            />
            <MedicalInputField
              label="Duración (minutos)"
              type="number"
              value={formData.duration.toString()}
              onChange={(value) => handleInputChange('duration', parseInt(value) || 30)}
              error={errors.duration}
              min={15}
              step={15}
              placeholder="30"
              required
            />
            <MedicalSelectField
              label="Doctor"
              value={formData.doctor}
              onChange={(value) => handleInputChange('doctor', value)}
              error={errors.doctor}
              options={availableDoctors.map(doctor => ({ value: doctor, label: doctor }))}
              placeholder="Seleccione un doctor"
              required
            />
            <MedicalSelectField
              label="Estado"
              value={formData.status}
              onChange={(value) => handleInputChange('status', value)}
              options={[
                { value: 'programada', label: 'Programada' },
                { value: 'confirmada', label: 'Confirmada' }
              ]}
              required
            />
          </MedicalFieldGroup>
          
          <div className="mt-6">
            <MedicalTextareaField
              label="Notas Adicionales"
              value={formData.notes}
              onChange={(value) => handleInputChange('notes', value)}
              placeholder="Motivo de la consulta, síntomas, observaciones especiales..."
              rows={3}
            />
          </div>
        </MedicalFormSection>

        {/* Resumen de la Cita */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Resumen de la Cita</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p><strong>Paciente:</strong> {formData.patientName || 'Por seleccionar'}</p>
              <p><strong>Fecha:</strong> {formData.date || 'Por definir'}</p>
              <p><strong>Hora:</strong> {formData.time || 'Por definir'}</p>
            </div>
            <div>
              <p><strong>Doctor:</strong> {formData.doctor || 'Por asignar'}</p>
              <p><strong>Tipo:</strong> {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}</p>
              <p><strong>Duración:</strong> {formData.duration} minutos</p>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
          <MedicalButton
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancelar
          </MedicalButton>
          
          <MedicalButton
            type="submit"
            variant="primary"
            loading={isSaving}
            loadingText="Programando..."
          >
            <Calendar className="w-4 h-4 mr-2" />
            Programar Cita
          </MedicalButton>
        </div>
      </form>
          </div>
        </div>
      </div>
    </Portal>
  );
}