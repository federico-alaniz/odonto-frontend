'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

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
}

// Datos de muestra de citas
const sampleAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'María Elena González',
    patientId: '1',
    date: '2025-10-15',
    time: '09:00',
    type: 'consulta',
    duration: 30,
    status: 'confirmada',
    doctor: 'Dr. Carlos Mendoza',
    notes: 'Control rutinario'
  },
  {
    id: '2',
    patientName: 'Juan Carlos Pérez',
    patientId: '2',
    date: '2025-10-15',
    time: '10:30',
    type: 'control',
    duration: 20,
    status: 'programada',
    doctor: 'Dr. Ana Rodríguez',
  },
  {
    id: '3',
    patientName: 'Ana María López',
    patientId: '3',
    date: '2025-10-16',
    time: '14:00',
    type: 'procedimiento',
    duration: 60,
    status: 'confirmada',
    doctor: 'Dr. Carlos Mendoza',
    notes: 'Procedimiento especializado'
  },
  {
    id: '4',
    patientName: 'Roberto García',
    patientId: '4',
    date: '2025-10-17',
    time: '11:15',
    type: 'consulta',
    duration: 30,
    status: 'programada',
    doctor: 'Dr. Ana Rodríguez',
  },
  {
    id: '5',
    patientName: 'Carmen Ruiz',
    patientId: '5',
    date: '2025-10-18',
    time: '08:30',
    type: 'urgencia',
    duration: 45,
    status: 'confirmada',
    doctor: 'Dr. Carlos Mendoza',
    notes: 'Cita de urgencia'
  },
  {
    id: '6',
    patientName: 'Luis Fernando Martín',
    patientId: '6',
    date: '2025-10-21',
    time: '15:30',
    type: 'control',
    duration: 20,
    status: 'programada',
    doctor: 'Dr. Ana Rodríguez',
  }
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments] = useState<Appointment[]>(sampleAppointments);

  // Obtener el primer día del mes actual
  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  // Obtener los días que se muestran en el calendario (incluyendo días del mes anterior y siguiente)
  const calendarDays = useMemo(() => {
    const days = [];
    const startDate = new Date(firstDayOfMonth);
    
    // Ajustar al lunes anterior si el mes no empieza en lunes
    const dayOfWeek = startDate.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);

    // Generar 42 días (6 semanas)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }

    return days;
  }, [firstDayOfMonth]);

  // Obtener citas para una fecha específica
  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateString);
  };

  // Navegar entre meses
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Obtener color del tipo de cita
  const getAppointmentTypeColor = (type: Appointment['type']) => {
    switch (type) {
      case 'consulta': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'control': return 'bg-green-100 text-green-800 border-green-200';
      case 'procedimiento': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'urgencia': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtener color del estado de la cita
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmada': return 'bg-green-500';
      case 'programada': return 'bg-yellow-500';
      case 'completada': return 'bg-blue-500';
      case 'cancelada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Verificar si una fecha es hoy
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Verificar si una fecha está en el mes actual
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="bg-white medical-card">
      {/* Header del calendario */}
      <div className="p-6 border-b medical-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors focus-ring"
              title="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors focus-ring"
              title="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="medical-button-secondary text-sm flex items-center space-x-1"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Hoy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leyenda de tipos de cita */}
      <div className="p-4 bg-slate-50 border-b medical-border">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>Consulta</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Control</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <span>Procedimiento</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Urgencia</span>
          </div>
        </div>
      </div>

      {/* Grid del calendario */}
      <div className="p-6">
        {/* Nombres de los días */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-slate-600 bg-slate-50 rounded-lg">
              {day}
            </div>
          ))}
        </div>

        {/* Días del calendario */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const dayAppointments = getAppointmentsForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                className={`
                  min-h-[120px] p-2 border border-slate-200 rounded-lg cursor-pointer
                  hover:border-blue-300 hover:bg-blue-50/30 transition-all
                  ${!isCurrentMonthDay ? 'bg-slate-50 text-slate-400' : 'bg-white'}
                  ${isTodayDate ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                  ${selectedDate?.toDateString() === date.toDateString() ? 'ring-2 ring-green-500 bg-green-50' : ''}
                `}
                onClick={() => setSelectedDate(date)}
              >
                {/* Número del día */}
                <div className={`
                  text-sm font-medium mb-2
                  ${isTodayDate ? 'text-blue-700' : isCurrentMonthDay ? 'text-slate-900' : 'text-slate-400'}
                `}>
                  {date.getDate()}
                </div>

                {/* Citas del día */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`
                        text-xs p-1 rounded border cursor-pointer
                        hover:shadow-sm transition-shadow
                        ${getAppointmentTypeColor(appointment.type)}
                      `}
                      title={`${appointment.time} - ${appointment.patientName} (${appointment.doctor})`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">
                          {appointment.time}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(appointment.status)}`}></div>
                      </div>
                      <div className="truncate">
                        {appointment.patientName}
                      </div>
                    </div>
                  ))}
                  
                  {/* Indicador de más citas */}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-slate-600 font-medium">
                      +{dayAppointments.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vista detallada del día seleccionado */}
      {selectedDate && (
        <div className="border-t medical-border bg-slate-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Citas para {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <p className="text-slate-600">No hay citas programadas para este día.</p>
            ) : (
              <div className="space-y-3">
                {getAppointmentsForDate(selectedDate)
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`
                      p-4 rounded-lg border-l-4 bg-white
                      ${appointment.type === 'consulta' ? 'border-l-blue-500' : ''}
                      ${appointment.type === 'control' ? 'border-l-green-500' : ''}
                      ${appointment.type === 'procedimiento' ? 'border-l-purple-500' : ''}
                      ${appointment.type === 'urgencia' ? 'border-l-red-500' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-semibold text-slate-900">
                            {appointment.time}
                          </span>
                          <span className={`
                            px-2 py-1 text-xs rounded-full font-medium
                            ${getAppointmentTypeColor(appointment.type)}
                          `}>
                            {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                          </span>
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`}></div>
                        </div>
                        <h4 className="text-lg font-medium text-slate-900 mt-2">
                          {appointment.patientName}
                        </h4>
                        <p className="text-slate-600">{appointment.doctor}</p>
                        <p className="text-sm text-slate-500">
                          Duración: {appointment.duration} minutos
                        </p>
                        {appointment.notes && (
                          <p className="text-sm text-slate-600 mt-2 italic">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all focus-ring"
                          title="Ver detalles"
                        >
                          👁️
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all focus-ring"
                          title="Cancelar cita"
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}