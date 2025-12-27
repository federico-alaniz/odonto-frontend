'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  List, 
  User, 
  CheckCircle, 
  XCircle
} from 'lucide-react';
import NewAppointmentModal from './modals/NewAppointmentModal';
import AppointmentDetailModal from './modals/AppointmentDetailModal';
import EditAppointmentModal from './modals/EditAppointmentModal';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  type: 'consulta' | 'control' | 'procedimiento' | 'urgencia';
  duration: number; // minutos
  status: 'programada' | 'confirmada' | 'completada' | 'cancelada';
  doctor: string;
  notes?: string;
  patientPhone?: string;
  patientAge?: number;
}

// Datos de muestra de citas extendidos
const sampleAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'María Elena González',
    patientId: '1',
    date: '2025-10-15',
    time: '08:00',
    type: 'consulta',
    duration: 30,
    status: 'confirmada',
    doctor: 'Dr. Carlos Mendoza',
    notes: 'Control rutinario de hipertensión',
    patientPhone: '3001234567',
    patientAge: 45
  },
  {
    id: '2',
    patientName: 'Juan Carlos Pérez',
    patientId: '2',
    date: '2025-10-15',
    time: '08:30',
    type: 'control',
    duration: 20,
    status: 'programada',
    doctor: 'Dr. Ana Rodríguez',
    notes: 'Seguimiento post-operatorio',
    patientPhone: '3109876543',
    patientAge: 38
  },
  {
    id: '3',
    patientName: 'Ana María López',
    patientId: '3',
    date: '2025-10-15',
    time: '09:15',
    type: 'procedimiento',
    duration: 45,
    status: 'confirmada',
    doctor: 'Dr. Carlos Mendoza',
    notes: 'Electrocardiograma de rutina',
    patientPhone: '3156789012',
    patientAge: 52
  },
  {
    id: '4',
    patientName: 'Roberto García Castillo',
    patientId: '4',
    date: '2025-10-15',
    time: '10:30',
    type: 'consulta',
    duration: 30,
    status: 'programada',
    doctor: 'Dr. Ana Rodríguez',
    notes: 'Consulta de medicina general',
    patientPhone: '3007654321',
    patientAge: 41
  },
  {
    id: '5',
    patientName: 'Carmen Ruiz Martínez',
    patientId: '5',
    date: '2025-10-15',
    time: '11:15',
    type: 'urgencia',
    duration: 60,
    status: 'confirmada',
    doctor: 'Dr. Carlos Mendoza',
    notes: 'Dolor abdominal agudo - Requiere evaluación inmediata',
    patientPhone: '3128901234',
    patientAge: 33
  },
  {
    id: '6',
    patientName: 'Luis Fernando Martín',
    patientId: '6',
    date: '2025-10-15',
    time: '14:00',
    type: 'control',
    duration: 25,
    status: 'programada',
    doctor: 'Dr. Ana Rodríguez',
    notes: 'Control de diabetes mellitus',
    patientPhone: '3195432167',
    patientAge: 62
  },
  {
    id: '7',
    patientName: 'Patricia Jiménez Vega',
    patientId: '7',
    date: '2025-10-15',
    time: '15:30',
    type: 'consulta',
    duration: 30,
    status: 'confirmada',
    doctor: 'Dr. Carlos Mendoza',
    notes: 'Primera consulta - Evaluación general',
    patientPhone: '3162345678',
    patientAge: 28
  },
  {
    id: '8',
    patientName: 'Alberto Ramírez Cruz',
    patientId: '8',
    date: '2025-10-15',
    time: '16:15',
    type: 'procedimiento',
    duration: 40,
    status: 'programada',
    doctor: 'Dr. Ana Rodríguez',
    notes: 'Toma de presión arterial y análisis',
    patientPhone: '3178765432',
    patientAge: 55
  }
];

// Horarios de trabajo (slots de 15 minutos)
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 7; // 7:00 AM
  const endHour = 18; // 6:00 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  return slots;
};

export default function DailyAgenda() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  
  // Filtrar citas por fecha seleccionada
  const dayAppointments = useMemo(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.date === dateString)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDate, appointments]);

  // Obtener cita para un slot de tiempo específico
  const getAppointmentForTimeSlot = (timeSlot: string) => {
    return dayAppointments.find(apt => {
      const aptTime = apt.time;
      const slotTime = timeSlot;
      return aptTime === slotTime;
    });
  };

  // Verificar si un slot está ocupado por una cita en progreso
  const isSlotOccupied = (timeSlot: string) => {
    return dayAppointments.some(apt => {
      const aptStartTime = apt.time;
      const aptEndMinutes = parseInt(aptStartTime.split(':')[0]) * 60 + 
                           parseInt(aptStartTime.split(':')[1]) + 
                           apt.duration;
      const slotMinutes = parseInt(timeSlot.split(':')[0]) * 60 + 
                         parseInt(timeSlot.split(':')[1]);
      const aptStartMinutes = parseInt(aptStartTime.split(':')[0]) * 60 + 
                             parseInt(aptStartTime.split(':')[1]);
      
      return slotMinutes >= aptStartMinutes && slotMinutes < aptEndMinutes;
    });
  };

  // Obtener color del tipo de cita
  const getAppointmentTypeColor = (type: Appointment['type']) => {
    switch (type) {
      case 'consulta': return 'border-l-blue-500 bg-blue-50';
      case 'control': return 'border-l-green-500 bg-green-50';
      case 'procedimiento': return 'border-l-purple-500 bg-purple-50';
      case 'urgencia': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Obtener badge del estado
  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmada': 
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Confirmada</span>
          </span>
        );
      case 'programada': 
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Programada</span>
          </span>
        );
      case 'completada': 
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Completada</span>
          </span>
        );
      case 'cancelada': 
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Cancelada</span>
          </span>
        );
      default: 
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">• Sin estado</span>;
    }
  };

  // Navegar entre días
  const navigateDay = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 1);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleNewAppointment = (timeSlot?: string) => {
    setSelectedTimeSlot(timeSlot || '');
    setShowNewAppointmentModal(true);
  };

  const handleSaveAppointment = (newAppointment: Omit<Appointment, 'id'>) => {
    const appointmentWithId: Appointment = {
      ...newAppointment,
      id: `new_${Date.now()}`
    };
    setAppointments(prev => [...prev, appointmentWithId]);
    setShowNewAppointmentModal(false);
  };

  // Funciones para el modal de detalles
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetail(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setAppointmentToEdit(appointment);
    setShowEditAppointmentModal(true);
    // Cerrar el modal de detalles si está abierto
    setShowAppointmentDetail(false);
  };

  const handleSaveEditedAppointment = (updatedAppointment: Appointment) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === updatedAppointment.id 
          ? updatedAppointment
          : apt
      )
    );
    setShowEditAppointmentModal(false);
    setAppointmentToEdit(null);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'cancelada' as const }
          : apt
      )
    );
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'completada' as const }
          : apt
      )
    );
  };

  const handleConfirmAppointment = (appointmentId: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'confirmada' as const }
          : apt
      )
    );
  };

  return (
    <div className="bg-white medical-card">
      {/* Header de la agenda */}
      <div className="p-6 border-b medical-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDay('prev')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors focus-ring"
              title="Día anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {formatDate(selectedDate)}
              </h2>
              {isToday(selectedDate) && (
                <span className="text-sm text-blue-600 font-medium">Hoy</span>
              )}
            </div>
            <button
              onClick={() => navigateDay('next')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors focus-ring"
              title="Día siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="medical-button-secondary text-sm flex items-center space-x-1"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Ir a Hoy</span>
            </button>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
              className="medical-input text-sm"
            />
          </div>
        </div>

        {/* Estadísticas del día */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="medical-stat-card">
            <div className="text-2xl font-bold text-blue-600">{dayAppointments.length}</div>
            <div className="text-sm text-slate-600">Citas Totales</div>
          </div>
          <div className="medical-stat-card">
            <div className="text-2xl font-bold text-green-600">
              {dayAppointments.filter(apt => apt.status === 'confirmada').length}
            </div>
            <div className="text-sm text-slate-600">Confirmadas</div>
          </div>
          <div className="medical-stat-card">
            <div className="text-2xl font-bold text-yellow-600">
              {dayAppointments.filter(apt => apt.status === 'programada').length}
            </div>
            <div className="text-sm text-slate-600">Pendientes</div>
          </div>
          <div className="medical-stat-card">
            <div className="text-2xl font-bold text-purple-600">
              {dayAppointments.reduce((total, apt) => total + apt.duration, 0)} min
            </div>
            <div className="text-sm text-slate-600">Tiempo Total</div>
          </div>
        </div>
      </div>

      {/* Vista de agenda por horarios */}
      <div className="p-6">
        {/* Instrucciones de uso */}
        {dayAppointments.length > 0 && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Haz clic en cualquier cita para ver los detalles completos del paciente y opciones de gestión.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: Horarios */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Horarios del Día</span>
            </h3>
            
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {timeSlots.filter(slot => {
                const hour = parseInt(slot.split(':')[0]);
                return hour >= 8 && hour < 17; // Mostrar horario de trabajo principal
              }).map((timeSlot) => {
                const appointment = getAppointmentForTimeSlot(timeSlot);
                const isOccupied = isSlotOccupied(timeSlot);
                
                return (
                  <div key={timeSlot} className="flex items-center">
                    <div className="w-16 text-sm text-slate-600 font-mono">
                      {timeSlot}
                    </div>
                    <div className="flex-1 ml-4">
                      {appointment ? (
                        <div 
                          onClick={() => handleAppointmentClick(appointment)}
                          className={`
                            p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all
                            hover:scale-[1.02] hover:border-l-8 group
                            ${getAppointmentTypeColor(appointment.type)}
                          `}
                          title="🖱️ Hacer clic para ver detalles completos de la cita"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-slate-900">
                                  {appointment.patientName}
                                </h4>
                              </div>
                              <p className="text-sm text-slate-600">
                                {appointment.doctor} • {appointment.duration} min
                              </p>
                              <div className="mt-1">
                                {getStatusBadge(appointment.status)}
                              </div>
                            </div>
                            <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => handleAppointmentClick(appointment)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded" 
                                title="Ver detalles"
                              >
                                👁️
                              </button>
                              <button 
                                onClick={() => handleEditAppointment(appointment)}
                                className="p-1 text-green-600 hover:bg-green-100 rounded" 
                                title="Editar"
                              >
                                ✏️
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : isOccupied ? (
                        <div className="h-8 bg-slate-100 rounded border-l-4 border-slate-300"></div>
                      ) : (
                        <button 
                          onClick={() => handleNewAppointment(timeSlot)}
                          className="
                            w-full h-8 text-left px-3 py-1 text-sm text-slate-400 
                            hover:bg-blue-50 hover:text-blue-600 rounded transition-colors
                            border border-dashed border-slate-200 hover:border-blue-300
                          "
                        >
                          + Agendar Cita
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Columna derecha: Lista detallada de citas */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <List className="w-5 h-5 text-green-600" />
              <span>Citas del Día ({dayAppointments.length})</span>
            </h3>
            
            {dayAppointments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CalendarIcon className="w-16 h-16 mx-auto mb-2 text-slate-300" />
                <p>No hay citas programadas para este día</p>
                <button 
                  onClick={() => handleNewAppointment()}
                  className="mt-4 medical-button-primary text-sm"
                >
                  + Programar Primera Cita
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {dayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    onClick={() => handleAppointmentClick(appointment)}
                    className={`
                      p-4 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer group
                      hover:scale-[1.01] hover:border-l-8
                      ${getAppointmentTypeColor(appointment.type)}
                    `}
                    title="🖱️ Hacer clic aquí para ver todos los detalles de la cita"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-semibold text-slate-900">
                          {appointment.time}
                        </div>
                        <span className={`
                          px-2 py-1 text-xs rounded font-medium
                          ${appointment.type === 'consulta' ? 'bg-blue-100 text-blue-800' : ''}
                          ${appointment.type === 'control' ? 'bg-green-100 text-green-800' : ''}
                          ${appointment.type === 'procedimiento' ? 'bg-purple-100 text-purple-800' : ''}
                          ${appointment.type === 'urgencia' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                        </span>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="text-lg font-medium text-slate-900 mb-1">
                        {appointment.patientName}
                      </h4>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{appointment.doctor}</span>
                        </p>
                        <p className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{appointment.duration} minutos</span>
                        </p>
                        {appointment.patientAge && (
                          <p className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{appointment.patientAge} años</span>
                          </p>
                        )}
                        {appointment.patientPhone && (
                          <p className="flex items-center space-x-1">
                            <span>📱</span>
                            <span>{appointment.patientPhone}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mb-3 p-2 bg-slate-50 rounded text-sm text-slate-700">
                        <strong>Notas:</strong> {appointment.notes}
                      </div>
                    )}
                    
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleAppointmentClick(appointment)}
                        className="medical-button-secondary text-xs"
                      >
                        👁️ Ver Detalles
                      </button>
                      <button 
                        onClick={() => handleEditAppointment(appointment)}
                        className="medical-button-secondary text-xs"
                      >
                        ✏️ Editar Cita
                      </button>
                      <button 
                        onClick={() => window.open(`tel:${appointment.patientPhone}`, '_self')}
                        className="medical-button-secondary text-xs"
                        disabled={!appointment.patientPhone}
                      >
                        📱 Contactar
                      </button>
                      <button 
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="medical-button-secondary text-xs text-red-600 hover:text-red-700 flex items-center space-x-1"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Nueva Cita */}
      <NewAppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        onSave={handleSaveAppointment}
        selectedDate={selectedDate}
        selectedTime={selectedTimeSlot}
      />

      {/* Modal de Detalles de Cita */}
      <AppointmentDetailModal
        isOpen={showAppointmentDetail}
        onClose={() => setShowAppointmentDetail(false)}
        appointment={selectedAppointment}
        onEdit={handleEditAppointment}
        onCancel={handleCancelAppointment}
        onComplete={handleCompleteAppointment}
        onConfirm={handleConfirmAppointment}
      />

      {/* Modal de Edición de Cita */}
      <EditAppointmentModal
        isOpen={showEditAppointmentModal}
        onClose={() => {
          setShowEditAppointmentModal(false);
          setAppointmentToEdit(null);
        }}
        appointment={appointmentToEdit}
        onSave={handleSaveEditedAppointment}
      />
    </div>
  );
}