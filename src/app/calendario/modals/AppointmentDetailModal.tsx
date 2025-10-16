'use client';

import { useState } from 'react';
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
        return <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium">✅ Confirmada</span>;
      case 'programada': 
        return <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 font-medium">⏳ Programada</span>;
      case 'completada': 
        return <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 font-medium">✅ Completada</span>;
      case 'cancelada': 
        return <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 font-medium">❌ Cancelada</span>;
      default: 
        return <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800 font-medium">• Sin estado</span>;
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
        <div className="relative w-full max-w-2xl mx-4 medical-card max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b medical-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Detalles de la Cita
                  </h2>
                  {getStatusBadge(appointment.status)}
                </div>
                
                <div className={`
                  inline-block px-3 py-1 text-sm font-medium rounded-lg border
                  ${getAppointmentTypeColor(appointment.type)}
                `}>
                  {getTypeDisplayName(appointment.type)}
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors focus-ring"
                title="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Información principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Información del paciente */}
              <div className="medical-section">
                <div className="medical-section-header">
                  <span className="medical-section-icon">👤</span>
                  <h3 className="medical-section-title">Información del Paciente</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Nombre completo</label>
                    <p className="text-lg font-semibold text-slate-900">{appointment.patientName}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">ID Paciente</label>
                      <p className="text-slate-900 font-mono">{appointment.patientId}</p>
                    </div>
                    
                    {appointment.patientAge && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Edad</label>
                        <p className="text-slate-900">{appointment.patientAge} años</p>
                      </div>
                    )}
                  </div>
                  
                  {appointment.patientPhone && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Teléfono</label>
                      <p className="text-slate-900">{appointment.patientPhone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la cita */}
              <div className="medical-section">
                <div className="medical-section-header">
                  <span className="medical-section-icon">📅</span>
                  <h3 className="medical-section-title">Información de la Cita</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Fecha</label>
                    <p className="text-slate-900 capitalize">{formatDate(appointment.date)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Hora</label>
                      <p className="text-lg font-semibold text-slate-900">{appointment.time}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-600">Duración</label>
                      <p className="text-slate-900">{appointment.duration} minutos</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-600">Doctor asignado</label>
                    <p className="text-slate-900 font-medium">👨‍⚕️ {appointment.doctor}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notas adicionales */}
            {appointment.notes && (
              <div className="medical-section mb-6">
                <div className="medical-section-header">
                  <span className="medical-section-icon">📝</span>
                  <h3 className="medical-section-title">Notas y Observaciones</h3>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-700 leading-relaxed">{appointment.notes}</p>
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="medical-stat-card">
                <div className="text-lg font-semibold text-blue-600">#{appointment.id}</div>
                <div className="text-sm text-slate-600">ID de Cita</div>
              </div>
              
              <div className="medical-stat-card">
                <div className="text-lg font-semibold text-green-600">{appointment.time}</div>
                <div className="text-sm text-slate-600">Hora programada</div>
              </div>
              
              <div className="medical-stat-card">
                <div className="text-lg font-semibold text-purple-600">{appointment.duration}m</div>
                <div className="text-sm text-slate-600">Duración estimada</div>
              </div>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="p-6 border-t medical-border bg-slate-50">
            <div className="space-y-4">
              {/* Fila 1: Acción principal según estado */}
              <div className="flex justify-center">
                {appointment.status === 'programada' && (
                  <button
                    onClick={handleConfirm}
                    className="medical-button-primary px-8 py-3 text-base font-semibold"
                  >
                    ✅ Confirmar Cita
                  </button>
                )}
                
                {appointment.status === 'confirmada' && (
                  <button
                    onClick={handleComplete}
                    className="medical-button-primary px-8 py-3 text-base font-semibold"
                  >
                    ✅ Marcar como Completada
                  </button>
                )}

                {(appointment.status === 'completada' || appointment.status === 'cancelada') && (
                  <div className="text-center text-slate-600">
                    <p className="text-sm">Esta cita ya está {appointment.status}</p>
                  </div>
                )}
              </div>

              {/* Fila 2: Acciones de gestión */}
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  onClick={handleEdit}
                  className="medical-button-secondary px-4 py-2 text-sm"
                >
                  ✏️ Editar Cita
                </button>
                
                <button
                  onClick={() => window.open(`tel:${appointment.patientPhone}`, '_self')}
                  className="medical-button-secondary px-4 py-2 text-sm"
                  disabled={!appointment.patientPhone}
                >
                  📱 Llamar Paciente
                </button>
              </div>

              {/* Fila 3: Acciones críticas y cierre */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                {/* Cancelar cita */}
                <div>
                  {appointment.status !== 'cancelada' && appointment.status !== 'completada' && (
                    <>
                      {!showConfirmCancel ? (
                        <button
                          onClick={() => setShowConfirmCancel(true)}
                          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                        >
                          ❌ Cancelar Cita
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                          >
                            Confirmar Cancelación
                          </button>
                          <button
                            onClick={() => setShowConfirmCancel(false)}
                            className="px-4 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                          >
                            Mantener Cita
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Cerrar */}
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}