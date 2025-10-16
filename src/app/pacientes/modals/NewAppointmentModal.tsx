'use client';

import { useState } from 'react';
import MedicalModal from '@/components/ui/MedicalModal';
import MedicalInput from '@/components/forms/MedicalInput';
import MedicalSelect from '@/components/forms/MedicalSelect';
import MedicalTextarea from '@/components/forms/MedicalTextarea';

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
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Nueva cita programada:', {
        paciente: patient,
        cita: formData
      });
      
      alert('✅ Cita programada exitosamente');
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
      alert('❌ Error al programar la cita. Intente nuevamente.');
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
      icon="📅"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del paciente */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center">
            <span className="text-2xl mr-3">👤</span>
            <div>
              <h3 className="font-semibold text-green-900">
                {patient.nombres} {patient.apellidos}
              </h3>
              <p className="text-sm text-green-700">Programando nueva cita médica</p>
            </div>
          </div>
        </div>

        {/* Información de la cita */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MedicalInput
            label="Fecha de la Cita"
            icon="📅"
            type="date"
            value={formData.fecha}
            onChange={(e) => handleInputChange('fecha', e.target.value)}
            min={today}
            required
          />
          
          <MedicalSelect
            label="Hora de la Cita"
            icon="🕐"
            value={formData.hora}
            onChange={(e) => handleInputChange('hora', e.target.value)}
            options={horariosDisponibles}
            placeholder="Seleccione la hora"
            required
          />
          
          <MedicalSelect
            label="Tipo de Consulta"
            icon="🏥"
            value={formData.tipoConsulta}
            onChange={(e) => handleInputChange('tipoConsulta', e.target.value)}
            options={tiposConsulta}
            placeholder="Seleccione el tipo"
            required
          />
          
          <MedicalSelect
            label="Especialidad"
            icon="🩺"
            value={formData.especialidad}
            onChange={(e) => handleInputChange('especialidad', e.target.value)}
            options={especialidades}
            placeholder="Seleccione especialidad"
          />
          
          <div className="md:col-span-2">
            <MedicalSelect
              label="Médico Asignado"
              icon="👨‍⚕️"
              value={formData.medico}
              onChange={(e) => handleInputChange('medico', e.target.value)}
              options={medicos}
              placeholder="Seleccione el médico"
              required
            />
          </div>
        </div>

        {/* Motivo y observaciones */}
        <div className="space-y-4">
          <MedicalInput
            label="Motivo de la Consulta"
            icon="📝"
            value={formData.motivo}
            onChange={(e) => handleInputChange('motivo', e.target.value)}
            placeholder="Ej: Dolor de cabeza, control rutinario, etc."
          />
          
          <MedicalTextarea
            label="Observaciones Adicionales"
            icon="📋"
            value={formData.observaciones}
            onChange={(e) => handleInputChange('observaciones', e.target.value)}
            placeholder="Información adicional relevante para la consulta..."
            rows={3}
          />
        </div>

        {/* Información importante */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <span className="text-blue-600 mr-2 text-xl">ℹ️</span>
            <div>
              <p className="text-sm font-medium text-blue-800">Información Importante</p>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Las citas se confirmarán por teléfono o email</li>
                <li>• Llegue 15 minutos antes de su cita</li>
                <li>• Traiga documento de identidad y carnet de seguro</li>
                <li>• Las cancelaciones deben hacerse con 24h de anticipación</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end border-t medical-border pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 border medical-border rounded-lg text-slate-700 hover:bg-slate-50 transition-colors focus-ring disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              px-8 py-2 rounded-lg font-medium transition-all focus-ring
              ${isSubmitting 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'medical-button-primary hover:shadow-lg'
              }
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⏳</span>
                Programando...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="mr-2">📅</span>
                Programar Cita
              </span>
            )}
          </button>
        </div>
      </form>
    </MedicalModal>
  );
}