'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar as CalendarIcon, 
  List, 
  Plus, 
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Stethoscope,
  Eye,
  Edit3,
  UserPlus
} from 'lucide-react';
import { appointmentsService, Appointment } from '@/services/api/appointments.service';
import { usersService } from '@/services/api/users.service';
import { patientsService, Patient } from '@/services/api/patients.service';
import { User as UserType } from '@/types/roles';
import { dateHelper } from '@/utils/date-helper';

type ViewMode = 'calendar' | 'agenda';

export default function SecretaryAppointmentsPage() {
  const { currentUser } = useAuth();
  const { buildPath } = useTenant();
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState(dateHelper.now());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<UserType[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showTodayOnly, setShowTodayOnly] = useState(false); // Cambiado a false para mostrar todas las citas
  const [agendaDate, setAgendaDate] = useState(dateHelper.now());
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales cuando currentUser esté disponible
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
    
    if (!clinicId) {
      console.log('No clinicId available');
      return;
    }

    try {
      setLoading(true);

      // Cargar citas, doctores y pacientes en paralelo
      const [appointmentsRes, doctorsRes, adminsRes, patientsRes] = await Promise.all([
        appointmentsService.getAppointments(clinicId, { limit: 1000 }),
        usersService.getUsers(clinicId, { role: 'doctor', limit: 100 }),
        usersService.getUsers(clinicId, { role: 'admin', limit: 100 }),
        patientsService.getPatients(clinicId, { limit: 1000 })
      ]);

      console.log(' Appointments loaded:', appointmentsRes.data.length);
      console.log(' Doctors loaded:', doctorsRes.data.length);
      console.log(' Patients loaded:', patientsRes.data.length);

      // Filtrar admins que tienen isDoctor = true y combinar con doctores
      const adminDoctors = adminsRes.data.filter((user: any) => user.isDoctor === true);
      const allDoctors = [...doctorsRes.data, ...adminDoctors];

      setAppointments(appointmentsRes.data);
      setDoctors(allDoctors);
      setPatients(patientsRes.data);

    } catch (error) {
      console.error(' Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar appointments
  useEffect(() => {
    let filtered = appointments;

    if (filterDoctor) {
      filtered = filtered.filter(apt => apt.doctorId === filterDoctor);
    }

    if (filterStatus) {
      filtered = filtered.filter(apt => apt.estado === filterStatus);
    }

    if (showTodayOnly) {
      const selectedDay = formatDateForComparison(agendaDate);
      filtered = filtered.filter(apt => apt.fecha === selectedDay);
    }

    setFilteredAppointments(filtered);
  }, [filterDoctor, filterStatus, showTodayOnly, agendaDate, appointments]);

  const formatDate = (date: Date | string) => {
    // Si es un string en formato YYYY-MM-DD, parsearlo manualmente para evitar conversión UTC
    if (typeof date === 'string') {
      const [year, month, day] = date.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      return localDate.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateForComparison = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) {
      console.log('Doctor not found for ID:', doctorId);
      console.log('Available doctors:', doctors.map(d => ({ id: d.id, name: `${d.nombres} ${d.apellidos}` })));
    }
    return doctor ? `Dr. ${doctor.nombres} ${doctor.apellidos}` : 'Doctor no encontrado';
  };

  const getDoctorConsultorio = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.consultorio || 'Sin consultorio';
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente no encontrado';
  };

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'programada':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Programada' };
      case 'confirmada':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', text: 'Confirmada' };
      case 'completada':
        return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Completada' };
      case 'cancelada':
        return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Cancelada' };
      case 'en-curso':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', text: 'En curso' };
      case 'no-show':
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'No asistió' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', text: estado };
    }
  };

  // Obtener turnos del día seleccionado
  const getAppointmentsForDate = (date: Date) => {
    const dateString = formatDateForComparison(date);
    return filteredAppointments.filter(apt => apt.fecha === dateString);
  };

  // Navegación de calendario
  const goToPreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setSelectedDate(dateHelper.now());
  };

  // Navegación de agenda por días
  const goToPreviousDay = () => {
    const prevDay = new Date(agendaDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setAgendaDate(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(agendaDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setAgendaDate(nextDay);
  };

  const goToAgendaToday = () => {
    setAgendaDate(dateHelper.now());
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = formatDateForComparison(currentDate) === formatDateForComparison(dateHelper.now());
      const isSelected = formatDateForComparison(currentDate) === formatDateForComparison(selectedDate);
      const dayAppointments = getAppointmentsForDate(currentDate);

      days.push({
        date: currentDate,
        isCurrentMonth,
        isToday,
        isSelected,
        appointmentCount: dayAppointments.length,
        appointments: dayAppointments
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Turnos</h1>
              <p className="text-gray-600 mt-1">Visualiza y gestiona todos los turnos del centro médico</p>
            </div>
            <Link
              href={buildPath('/secretary/appointments/new')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Turno
            </Link>
          </div>

          {/* Controles de Vista y Filtros */}
          <div className="mt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Selector de Vista */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'calendar'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                Calendario
              </button>
              <button
                onClick={() => {
                  setViewMode('agenda');
                  if (showTodayOnly) {
                    setAgendaDate(selectedDate); // Sincronizar fecha del calendario con agenda
                  }
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === 'agenda'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                Agenda
              </button>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterDoctor}
                  onChange={(e) => setFilterDoctor(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Todos los doctores</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.nombres} {doctor.apellidos}
                    </option>
                  ))}
                </select>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Todos los estados</option>
                  <option value="programada">Programada</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="en-curso">En curso</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="no-show">No asistió</option>
                </select>

                {viewMode === 'agenda' && (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={showTodayOnly}
                        onChange={(e) => setShowTodayOnly(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      Vista diaria
                    </label>
                    
                    {showTodayOnly && (
                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white">
                        <button
                          onClick={goToPreviousDay}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Día anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <input
                          type="date"
                          value={formatDateForComparison(agendaDate)}
                          onChange={(e) => setAgendaDate(new Date(e.target.value))}
                          className="text-sm border-0 focus:ring-0 px-2 py-1 min-w-32"
                        />
                        
                        <button
                          onClick={goToAgendaToday}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                          title="Ir a hoy"
                        >
                          Hoy
                        </button>
                        
                        <button
                          onClick={goToNextDay}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Día siguiente"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vista de Calendario */}
      {viewMode === 'calendar' && (
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Navegación del Calendario */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedDate.toLocaleDateString('es-AR', { 
                    month: 'long', 
                    year: 'numeric' 
                  }).charAt(0).toUpperCase() + selectedDate.toLocaleDateString('es-AR', { 
                    month: 'long', 
                    year: 'numeric' 
                  }).slice(1)}
                </h2>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                >
                  Hoy
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grilla del Calendario */}
            <div className="p-6">
              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-px mb-4">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del calendario */}
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={`
                      min-h-32 bg-white p-2 cursor-pointer transition-colors relative
                      ${day.isCurrentMonth ? 'hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                      ${day.isToday ? 'bg-purple-50' : ''}
                      ${day.isSelected ? 'ring-2 ring-purple-600 ring-inset' : ''}
                    `}
                  >
                    <div className={`
                      text-sm font-medium mb-1
                      ${day.isToday ? 'text-purple-600' : ''}
                      ${day.isSelected ? 'text-purple-600' : ''}
                    `}>
                      {day.date.getDate()}
                    </div>
                    
                    {day.appointmentCount > 0 && (
                      <div className="space-y-1">
                        {day.appointments.slice(0, 3).map(apt => {
                          const estadoConfig = getEstadoConfig(apt.estado);
                          return (
                            <div
                              key={apt.id}
                              className={`text-xs px-1 py-0.5 rounded truncate ${estadoConfig.color}`}
                              title={`${apt.horaInicio} - ${getDoctorName(apt.doctorId)} - ${getPatientName(apt.patientId)}`}
                            >
                              {apt.horaInicio} {getPatientName(apt.patientId).split(' ')[0]}
                            </div>
                          );
                        })}
                        {day.appointmentCount > 3 && (
                          <div className="text-xs text-gray-500 font-medium">
                            +{day.appointmentCount - 3} más
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detalles del día seleccionado */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Turnos del {formatDate(selectedDate)}
              </h3>
            </div>
            
            <div className="p-6">
              {getAppointmentsForDate(selectedDate).length > 0 ? (
                <div className="space-y-4">
                  {getAppointmentsForDate(selectedDate)
                    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                    .map(appointment => {
                      const estadoConfig = getEstadoConfig(appointment.estado);
                      return (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {appointment.horaInicio}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.horaFin}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">
                                  {getPatientName(appointment.patientId)}
                                </h4>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${estadoConfig.color}`}>
                                  {estadoConfig.text}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Stethoscope className="w-4 h-4" />
                                  {getDoctorName(appointment.doctorId)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {getDoctorConsultorio(appointment.doctorId)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {appointment.motivo}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalle">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Editar">
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No hay turnos programados para este día</p>
                  <Link
                    href={buildPath('/secretary/appointments/new')}
                    className="inline-flex items-center gap-2 mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Programar Turno
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vista de Agenda */}
      {viewMode === 'agenda' && (
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {showTodayOnly ? `Agenda del ${formatDate(agendaDate)}` : 'Agenda de Turnos'}
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              {filteredAppointments.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consultorio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Motivo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments
                      .sort((a, b) => {
                        const dateA = new Date(`${a.fecha} ${a.horaInicio}`);
                        const dateB = new Date(`${b.fecha} ${b.horaInicio}`);
                        
                        if (showTodayOnly) {
                          // En vista diaria, ordenar por hora ascendente
                          return dateA.getTime() - dateB.getTime();
                        } else {
                          // En vista completa, ordenar por fecha descendente (más actual primero)
                          return dateB.getTime() - dateA.getTime();
                        }
                      })
                      .map(appointment => {
                        const estadoConfig = getEstadoConfig(appointment.estado);
                        return (
                          <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(appointment.fecha)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.horaInicio} - {appointment.horaFin}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                  <User className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {getPatientName(appointment.patientId)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <Stethoscope className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {getDoctorName(appointment.doctorId)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                                {getDoctorConsultorio(appointment.doctorId)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${estadoConfig.color}`}>
                                {estadoConfig.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              <div title={appointment.motivo}>
                                {appointment.motivo}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalle">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Editar turno">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <Link
                                  href={`/secretary/patients/${appointment.patientId}`}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Ver paciente"
                                >
                                  <UserPlus className="w-4 h-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay turnos para mostrar</h3>
                  <p className="text-gray-600 mb-6">Ajusta los filtros o programa nuevos turnos</p>
                  <Link
                    href={buildPath('/secretary/appointments/new')}
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Programar Turno
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}