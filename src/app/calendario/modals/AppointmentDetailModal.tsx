'use client';

import { useState } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  Phone, 
  Edit3, 
  X, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Stethoscope
} from 'lucide-react';
import Portal from '../components/Portal';
import MedicalButton from '@/components/forms/MedicalButton';

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

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onEdit?: (appointment: Appointment) => void;
  onCancel?: (appointmentId: string) => void;
  onComplete?: (appointmentId: string) => void;
  onConfirm?: (appointmentId: string) => void;
}

export default function AppointmentDetailModal({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onCancel,
  onComplete,
  onConfirm
}: AppointmentDetailModalProps) {
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  if (!isOpen || !appointment) return null;

  // Obtener color del tipo de cita
  const getAppointmentTypeColor = (type: Appointment['type']) => {
    switch (type) {
      case 'consulta': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'control': return 'bg-green-50 border-green-200 text-green-800';
      case 'procedimiento': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'urgencia': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // Obtener badge del estado
  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmada': 
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium">
            <CheckCircle className="w-4 h-4 mr-1" />
            Confirmada
          </span>
        );
      case 'programada': 
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 font-medium">
            <Clock className="w-4 h-4 mr-1" />
            Programada
          </span>
        );
      case 'completada': 
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 font-medium">
            <CheckCircle className="w-4 h-4 mr-1" />
            Completada
          </span>
        );
      case 'cancelada': 
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 font-medium">
            <XCircle className="w-4 h-4 mr-1" />
            Cancelada
          </span>
        );
      default: 
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800 font-medium">
            <AlertCircle className="w-4 h-4 mr-1" />
            Sin estado
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeDisplayName = (type: Appointment['type']) => {
    switch (type) {
      case 'consulta': return 'Consulta Médica';
      case 'control': return 'Control de Seguimiento';
      case 'procedimiento': return 'Procedimiento Médico';
      case 'urgencia': return 'Atención de Urgencia';
      default: return type;
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(appointment.id);
      setShowConfirmCancel(false);
      onClose();
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(appointment.id);
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(appointment.id);
      onClose();
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(appointment);
      onClose();
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl mx-4 bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">`
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Detalles de la Cita
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Información completa de la cita médica
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getStatusBadge(appointment.status)}
                  <div className={`
                    inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg border
                    ${getAppointmentTypeColor(appointment.type)}
                  `}>
                    {getTypeDisplayName(appointment.type)}
                  </div>
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

          {/* Content */}
          <div className="p-6">
            {/* Información principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Información del paciente */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">Información del Paciente</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-blue-700">Nombre completo</label>
                    <p className="text-lg font-semibold text-blue-900">{appointment.patientName}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-blue-700">ID Paciente</label>
                      <p className="text-blue-900 font-mono text-sm">{appointment.patientId}</p>
                    </div>
                    
                    {appointment.patientAge && (
                      <div>
                        <label className="text-sm font-medium text-blue-700">Edad</label>
                        <p className="text-blue-900">{appointment.patientAge} años</p>
                      </div>
                    )}
                  </div>
                  
                  {appointment.patientPhone && (
                    <div>
                      <label className="text-sm font-medium text-blue-700">Teléfono</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <p className="text-blue-900">{appointment.patientPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la cita */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-900">Información de la Cita</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-green-700">Fecha</label>
                    <p className="text-green-900 capitalize">{formatDate(appointment.date)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-green-700">Hora</label>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <p className="text-lg font-semibold text-green-900">{appointment.time}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-green-700">Duración</label>
                      <p className="text-green-900">{appointment.duration} minutos</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-green-700">Doctor asignado</label>
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4 text-green-600" />
                      <p className="text-green-900 font-medium">{appointment.doctor}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notas adicionales */}
            {appointment.notes && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200 mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-900">Notas y Observaciones</h3>
                </div>
                <div className="bg-white/60 rounded-lg p-4 border border-purple-200">
                  <p className="text-purple-900 leading-relaxed">{appointment.notes}</p>
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">#{appointment.id}</div>
                <div className="text-sm text-gray-600">ID de Cita</div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">{appointment.time}</div>
                </div>
                <div className="text-sm text-gray-600">Hora programada</div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{appointment.duration}m</div>
                <div className="text-sm text-gray-600">Duración estimada</div>
              </div>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="space-y-6">
              {/* Fila 1: Acción principal según estado */}
              <div className="flex justify-center">
                {appointment.status === 'programada' && (
                  <MedicalButton
                    variant="primary"
                    onClick={handleConfirm}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Cita
                  </MedicalButton>
                )}
                
                {appointment.status === 'confirmada' && (
                  <MedicalButton
                    variant="primary"
                    onClick={handleComplete}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Completada
                  </MedicalButton>
                )}

                {(appointment.status === 'completada' || appointment.status === 'cancelada') && (
                  <div className="text-center text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm">Esta cita ya está {appointment.status}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fila 2: Acciones de gestión */}
              <div className="flex justify-center gap-4 flex-wrap">
                <MedicalButton
                  variant="secondary"
                  onClick={handleEdit}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar Cita
                </MedicalButton>
                
                <MedicalButton
                  variant="secondary"
                  onClick={() => window.open(`tel:${appointment.patientPhone}`, '_self')}
                  disabled={!appointment.patientPhone}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Llamar Paciente
                </MedicalButton>
              </div>

              {/* Fila 3: Acciones críticas y cierre */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                {/* Cancelar cita */}
                <div>
                  {appointment.status !== 'cancelada' && appointment.status !== 'completada' && (
                    <>
                      {!showConfirmCancel ? (
                        <MedicalButton
                          variant="secondary"
                          onClick={() => setShowConfirmCancel(true)}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancelar Cita
                        </MedicalButton>
                      ) : (
                        <div className="flex gap-3">
                          <MedicalButton
                            variant="primary"
                            onClick={handleCancel}
                            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                          >
                            Confirmar Cancelación
                          </MedicalButton>
                          <MedicalButton
                            variant="secondary"
                            onClick={() => setShowConfirmCancel(false)}
                          >
                            Mantener Cita
                          </MedicalButton>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Cerrar */}
                <MedicalButton
                  variant="secondary"
                  onClick={onClose}
                >
                  Cerrar
                </MedicalButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}