'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/Spinner';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar as CalendarIcon, 
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  MapPin,
  Stethoscope,
  Filter as FilterIcon,
  Plus,
  Clock
} from 'lucide-react';
import { appointmentsService } from '@/services/api/appointments.service';
import { usersService } from '@/services/api/users.service';
import { patientsService } from '@/services/api/patients.service';
import type { Appointment, Patient } from '@/types';
import { clinicSettingsService } from '@/services/api/clinic-settings.service';
import { User as UserType } from '@/types/roles';
import { dateHelper } from '@/utils/date-helper';

type ViewMode = 'search' | 'scheduled';


interface DoctorWithRating extends UserType {
  rating?: number;
  reviewCount?: number;
}

function SecretaryAppointmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();
  const { buildPath } = useTenant();
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorWithRating[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search filters
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [dateRange, setDateRange] = useState('week');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(dateHelper.now());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [favoritesDoctors, setFavoritesDoctors] = useState<Set<string>>(new Set());
  const [expandedDoctors, setExpandedDoctors] = useState<Set<string>>(new Set());
  const [doctorSlots, setDoctorSlots] = useState<Map<string, string[]>>(new Map());
  
  // Calendar for scheduled view
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(dateHelper.now());

  // Memoize clinicId to prevent unnecessary re-renders
  const clinicId = useMemo(() => {
    return (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
  }, [currentUser?.id]);

  useEffect(() => {
    if (clinicId) {
      loadData();
      loadSpecialties();
    }
  }, [clinicId]);

  // Read view parameter from URL
  useEffect(() => {
    const viewParam = searchParams?.get('view');
    if (viewParam === 'scheduled') {
      setViewMode('scheduled');
    }
  }, [searchParams]);

  useEffect(() => {
    if (doctors.length > 0 && appointments.length >= 0) {
      loadDoctorSlots(doctors, appointments);
    }
  }, [dateRange]);

  const loadData = async () => {
    if (!clinicId) return;

    try {
      setLoading(true);
      const [appointmentsRes, doctorsRes, adminsRes, patientsRes] = await Promise.all([
        appointmentsService.getAppointments(clinicId, { limit: 1000 }),
        usersService.getUsers(clinicId, { role: 'doctor', limit: 100 }),
        usersService.getUsers(clinicId, { role: 'admin', limit: 100 }),
        patientsService.getPatients(clinicId, { limit: 1000 })
      ]);

      const adminDoctors = adminsRes.data.filter((user: UserType) => user.isDoctor === true);
      const allDoctors = [...doctorsRes.data, ...adminDoctors].map(doc => {
        return {
          ...doc,
          rating: 4.5 + Math.random() * 0.5,
          reviewCount: Math.floor(Math.random() * 200) + 50
        };
      });

      setAppointments(appointmentsRes.data);
      setDoctors(allDoctors);
      setPatients(patientsRes.data);
      
      // Cargar slots disponibles para cada doctor
      loadDoctorSlots(allDoctors, appointmentsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorSlots = (doctors: DoctorWithRating[], appointments: Appointment[]) => {
    const slotsMap = new Map<string, string[]>();
    
    if (dateRange === 'today') {
      // Mostrar horas disponibles para hoy
      const today = dateHelper.now();
      const todayStr = today.toISOString().split('T')[0];
      const dayOfWeek = today.getDay();
      const backendDay = dayOfWeek === 0 ? 7 : dayOfWeek;
      
      doctors.forEach(doctor => {
        const horario = doctor.horariosAtencion?.find(
          (h) => h.activo && h.dia === backendDay
        );
        
        
        if (!horario) {
          slotsMap.set(doctor.id, []);
          return;
        }
        
        const doctorAppointments = appointments.filter(
          apt => apt.doctorId === doctor.id && apt.fecha === todayStr
        );
        const bookedTimes = new Set(doctorAppointments.map(apt => apt.horaInicio));
        
        const [startHour, startMin] = horario.horaInicio.split(':').map(Number);
        const [endHour, endMin] = horario.horaFin.split(':').map(Number);
        
        const slots: string[] = [];
        let currentHour = startHour;
        let currentMin = startMin;
        const currentTime = today.getHours() * 60 + today.getMinutes();
        
        
        while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
          const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
          const slotTime = currentHour * 60 + currentMin;
          
          if (slotTime > currentTime && !bookedTimes.has(timeStr)) {
            slots.push(timeStr);
          }
          
          currentMin += 30;
          if (currentMin >= 60) {
            currentMin = 0;
            currentHour++;
          }
        }
        
        slotsMap.set(doctor.id, slots);
      });
    } else if (dateRange === 'week') {
      // Mostrar fechas disponibles esta semana
      const today = dateHelper.now();
      const daysToShow = 7;
      
      doctors.forEach(doctor => {
        const availableDates: string[] = [];
        
        for (let i = 0; i < daysToShow; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() + i);
          const dateStr = checkDate.toISOString().split('T')[0];
          const dayOfWeek = checkDate.getDay();
          const backendDay = dayOfWeek === 0 ? 7 : dayOfWeek;
          
          // Verificar si el doctor atiende este día
          const horario = (doctor as any).horariosAtencion?.find(
            (h: any) => h.activo && h.dia === backendDay
          );
          
          if (horario) {
            // Verificar si hay slots disponibles ese día
            const doctorAppointments = appointments.filter(
              apt => apt.doctorId === doctor.id && apt.fecha === dateStr
            );
            
            const [startHour, startMin] = horario.horaInicio.split(':').map(Number);
            const [endHour, endMin] = horario.horaFin.split(':').map(Number);
            const totalSlots = Math.floor(((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 30);
            
            // Si hay slots disponibles (no todos están ocupados)
            if (doctorAppointments.length < totalSlots) {
              const dayName = checkDate.toLocaleDateString('es-AR', { weekday: 'short' });
              const dayNum = checkDate.getDate();
              const month = checkDate.toLocaleDateString('es-AR', { month: 'short' });
              availableDates.push(`${dayName} ${dayNum} ${month}`);
            }
          }
        }
        
        slotsMap.set(doctor.id, availableDates);
      });
    } else if (dateRange === 'month') {
      // Mostrar fechas disponibles este mes
      const today = dateHelper.now();
      const daysToShow = 30;
      
      doctors.forEach(doctor => {
        const availableDates: string[] = [];
        
        for (let i = 0; i < daysToShow; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() + i);
          const dateStr = checkDate.toISOString().split('T')[0];
          const dayOfWeek = checkDate.getDay();
          const backendDay = dayOfWeek === 0 ? 7 : dayOfWeek;
          
          const horario = (doctor as any).horariosAtencion?.find(
            (h: any) => h.activo && h.dia === backendDay
          );
          
          if (horario) {
            const doctorAppointments = appointments.filter(
              apt => apt.doctorId === doctor.id && apt.fecha === dateStr
            );
            
            const [startHour, startMin] = horario.horaInicio.split(':').map(Number);
            const [endHour, endMin] = horario.horaFin.split(':').map(Number);
            const totalSlots = Math.floor(((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 30);
            
            if (doctorAppointments.length < totalSlots) {
              const dayNum = checkDate.getDate();
              const month = checkDate.toLocaleDateString('es-AR', { month: 'short' });
              availableDates.push(`${dayNum} ${month}`);
            }
          }
        }
        
        slotsMap.set(doctor.id, availableDates);
      });
    }
    
    setDoctorSlots(slotsMap);
  };

  const [specialtiesMap, setSpecialtiesMap] = useState<Map<string, string>>(new Map());
  const [consultoriosMap, setConsultoriosMap] = useState<Map<string, string>>(new Map());

  const loadSpecialties = async () => {
    if (!clinicId) return;
    
    try {
      const [specialtiesRes, consultoriosRes] = await Promise.all([
        clinicSettingsService.getSpecialties(clinicId),
        clinicSettingsService.getConsultingRooms(clinicId)
      ]);
      
      // Procesar especialidades
      if (specialtiesRes.success && specialtiesRes.data) {
        const activeSpecialties = specialtiesRes.data
          .filter((esp: { active: boolean; name: string }) => esp.active)
          .map((esp: { name: string }) => esp.name)
          .sort();
        setSpecialties(activeSpecialties);
        
        const specMap = new Map<string, string>();
        specialtiesRes.data.forEach((esp: { id: string; name: string; active: boolean }) => {
          if (esp.active && esp.id && esp.name) {
            specMap.set(esp.id, esp.name);
          }
        });
        setSpecialtiesMap(specMap);
      }
      
      // Procesar consultorios
      if (consultoriosRes.success && consultoriosRes.data) {
        const consMap = new Map<string, string>();
        consultoriosRes.data.forEach((cons: { id: string; nombre?: string; name?: string }) => {
          const nombre = cons.nombre || cons.name;
          if (cons.id && nombre) {
            consMap.set(cons.id, nombre);
          }
        });
        setConsultoriosMap(consMap);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchDoctor === '' || 
      `${doctor.nombres} ${doctor.apellidos}`.toLowerCase().includes(searchDoctor.toLowerCase());
    const matchesSpecialty = selectedSpecialty === '' || 
      doctor.especialidades?.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const toggleFavorite = (doctorId: string) => {
    setFavoritesDoctors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(doctorId)) {
        newSet.delete(doctorId);
      } else {
        newSet.add(doctorId);
      }
      return newSet;
    });
  };

  const toggleExpandSlots = (doctorId: string) => {
    setExpandedDoctors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(doctorId)) {
        newSet.delete(doctorId);
      } else {
        newSet.add(doctorId);
      }
      return newSet;
    });
  };

  const handleDoctorSelect = (doctorId: string) => {
    router.push(buildPath(`/secretary/appointments/new?doctorId=${doctorId}`));
  };

  // Calendar functions for scheduled view
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const generateSmallCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 35; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === new Date().toDateString();
      const hasAppointments = appointments.some(apt => apt.fecha === currentDate.toISOString().split('T')[0]);

      days.push({
        date: currentDate,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        hasAppointments
      });
    }

    return days;
  };

  const getAppointmentsForMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.fecha + 'T12:00:00');
      return aptDate.getFullYear() === year && aptDate.getMonth() === month;
    }).sort((a, b) => {
      const dateA = new Date(`${a.fecha} ${a.horaInicio}`);
      const dateB = new Date(`${b.fecha} ${b.horaInicio}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    
    return appointments.filter(apt => {
      // Crear fecha y hora completa de la cita
      const aptDateTime = new Date(`${apt.fecha}T${apt.horaInicio}`);
      
      // Solo incluir citas futuras (fecha y hora posteriores a ahora)
      return aptDateTime > now && apt.estado !== 'cancelada';
    }).sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.horaInicio}`);
      const dateB = new Date(`${b.fecha}T${b.horaInicio}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.nombres} ${doctor.apellidos}` : 'Doctor no encontrado';
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente no encontrado';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <LoadingSpinner message="Cargando..." />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <CalendarIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {viewMode === 'search' ? 'Búsqueda de Turnos' : 'Mis Turnos Programados'}
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {viewMode === 'search' 
                    ? 'Encuentra disponibilidad por médico o especialidad'
                    : 'Gestiona tu agenda médica y visualiza tus próximas consultas'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'search' ? 'scheduled' : 'search')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                {viewMode === 'search' ? 'Ver Calendario de turnos' : 'Buscar Turnos'}
              </button>
              <Link
                href={buildPath('/secretary/appointments/new')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nuevo Turno
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search View */}
      {viewMode === 'search' && (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden sticky top-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Filtros de Búsqueda
                  </h3>
                  <p className="text-blue-100 text-xs mt-1">Encuentra el turno ideal</p>
                </div>
                <div className="p-6">
                
                  {/* Doctor Name Search */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      Nombre del Médico
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Ej. Dr. Juan Pérez"
                        value={searchDoctor}
                        onChange={(e) => setSearchDoctor(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                      />
                    </div>
                  </div>

                  {/* Specialty Filter */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Especialidad
                    </label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white cursor-pointer"
                    >
                      <option value="">Seleccionar especialidad...</option>
                      {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-teal-600" />
                      Rango de Fecha
                    </label>
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white cursor-pointer"
                    >
                      <option value="today">Hoy</option>
                      <option value="week">Esta Semana</option>
                      <option value="month">Este Mes</option>
                    </select>
                  </div>

                  {/* Mini Calendar */}
                  <div className="border-t border-gray-200 pt-5 mt-2">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                      Disponibilidad
                    </h4>
                    <div className="text-xs">
                    <div className="flex items-center justify-between mb-3">
                      <button onClick={goToPreviousMonth} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="font-semibold text-sm text-gray-900 capitalize">
                        {currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={goToNextMonth} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, idx) => (
                        <div key={`day-${idx}`} className="text-gray-600 font-semibold text-xs">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {generateSmallCalendarDays().map((day, idx) => (
                        <button
                          key={idx}
                          className={`
                            aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all
                            ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                            ${day.isToday ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold shadow-md' : ''}
                            ${day.hasAppointments && !day.isToday ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' : ''}
                            ${!day.isToday && !day.hasAppointments ? 'hover:bg-gray-100' : ''}
                          `}
                        >
                          {day.day}
                        </button>
                      ))}
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Results */}
            <div className="lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Resultados encontrados ({filteredDoctors.length})
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Ordenar por:</span>
                  <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                    <option>Disponibilidad</option>
                    <option>Calificación</option>
                    <option>Nombre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor, index) => {
                  // Rotar entre diferentes gradientes de colores
                  const colorSchemes = [
                    { gradient: 'from-blue-500 to-blue-600', border: 'hover:border-blue-200', icon: 'text-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', borderColor: 'border-blue-200' },
                    { gradient: 'from-purple-500 to-purple-600', border: 'hover:border-purple-200', icon: 'text-purple-600', bg: 'bg-purple-50', text: 'text-purple-700', borderColor: 'border-purple-200' },
                    { gradient: 'from-teal-500 to-teal-600', border: 'hover:border-teal-200', icon: 'text-teal-600', bg: 'bg-teal-50', text: 'text-teal-700', borderColor: 'border-teal-200' },
                    { gradient: 'from-indigo-500 to-indigo-600', border: 'hover:border-indigo-200', icon: 'text-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-700', borderColor: 'border-indigo-200' },
                    { gradient: 'from-rose-500 to-rose-600', border: 'hover:border-rose-200', icon: 'text-rose-600', bg: 'bg-rose-50', text: 'text-rose-700', borderColor: 'border-rose-200' },
                    { gradient: 'from-amber-500 to-amber-600', border: 'hover:border-amber-200', icon: 'text-amber-600', bg: 'bg-amber-50', text: 'text-amber-700', borderColor: 'border-amber-200' },
                  ];
                  const colors = colorSchemes[index % colorSchemes.length];
                  
                  return (
                  <div key={doctor.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg ${colors.border} transition-all`}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0 overflow-hidden`}>
                        {(doctor as any).avatar ? (
                          <img
                            src={(doctor as any).avatar}
                            alt={`${doctor.nombres} ${doctor.apellidos}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{doctor.nombres?.[0]?.toUpperCase()}{doctor.apellidos?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Dr. {doctor.nombres} {doctor.apellidos}
                        </h3>
                        <p className="text-sm text-blue-600 font-medium">
                          {(() => {
                            const especialidades = doctor.especialidades;
                            
                            // Si es un array, convertir IDs a nombres
                            if (Array.isArray(especialidades) && especialidades.length > 0) {
                                const nombres = especialidades
                                  .map((esp: string | { name?: string; nombre?: string }) => {
                                    // Si es un objeto con name/nombre
                                    if (typeof esp === 'object' && esp !== null) {
                                      return esp.name || esp.nombre;
                                    }
                                    // Si es un ID, buscar en el mapa
                                    if (typeof esp === 'string') {
                                      return specialtiesMap.get(esp) || esp;
                                    }
                                    return esp;
                                  })
                                  .filter(Boolean);
                                
                                return nombres.length > 0 ? nombres.join(', ') : 'Medicina General';
                              }
                              
                              // Si es un string directo
                              if (typeof especialidades === 'string') {
                                return specialtiesMap.get(especialidades) || especialidades || 'Medicina General';
                              }
                              
                              return 'Medicina General';
                            })()}
                          </p>
                        </div>
                      </div>

                    <div className="mb-4">
                      <div className={`flex items-center gap-2 text-sm text-gray-600 ${colors.bg} px-3 py-2 rounded-lg`}>
                        <MapPin className={`w-4 h-4 ${colors.icon}`} />
                        <span className="font-medium">
                          {(() => {
                            const consultorio = doctor.consultorio;
                            if (!consultorio) return 'Consultorio no asignado';
                            
                            // Si es un ID, buscar en el mapa
                            if (typeof consultorio === 'string') {
                              return consultoriosMap.get(consultorio) || consultorio;
                            }
                            
                            return consultorio;
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                      {(() => {
                        const slots = doctorSlots.get(doctor.id) || [];
                        const isExpanded = expandedDoctors.has(doctor.id);
                        const visibleSlots = isExpanded ? slots : slots.slice(0, 3);
                        const remainingCount = slots.length - 3;
                        
                        const labelText = dateRange === 'today' 
                          ? 'PRÓXIMOS TURNOS HOY:' 
                          : dateRange === 'week' 
                            ? 'FECHAS DISPONIBLES ESTA SEMANA:' 
                            : 'FECHAS DISPONIBLES ESTE MES:';
                        
                        const emptyText = dateRange === 'today' 
                          ? 'No hay turnos disponibles hoy' 
                          : dateRange === 'week' 
                            ? 'No hay fechas disponibles esta semana' 
                            : 'No hay fechas disponibles este mes';
                        
                        return (
                          <>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                              {labelText}
                            </p>
                            {slots.length > 0 ? (
                              <>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {visibleSlots.map((time, idx) => (
                                    <span
                                      key={idx}
                                      className={`px-3 py-1.5 ${colors.bg} ${colors.text} rounded-lg text-sm font-semibold border ${colors.borderColor}`}
                                    >
                                      {time}
                                    </span>
                                  ))}
                                  {!isExpanded && remainingCount > 0 && (
                                    <button
                                      onClick={() => toggleExpandSlots(doctor.id)}
                                      className="px-3 py-1 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                      +{remainingCount} más
                                    </button>
                                  )}
                                  {isExpanded && slots.length > 3 && (
                                    <button
                                      onClick={() => toggleExpandSlots(doctor.id)}
                                      className="px-3 py-1 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                      Ver menos
                                    </button>
                                  )}
                                </div>
                              </>
                            ) : (
                              <p className="text-sm text-gray-500 mb-4">{emptyText}</p>
                            )}
                            <button
                              onClick={() => router.push(buildPath(`/secretary/appointments/availability/${doctor.id}`))}
                              className={`w-full bg-gradient-to-r ${colors.gradient} text-white px-4 py-3 rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg text-sm font-semibold`}
                            >
                              Reservar Turno
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  );
                })}
              </div>

              {filteredDoctors.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron médicos
                  </h3>
                  <p className="text-gray-600">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scheduled View */}
      {viewMode === 'scheduled' && (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).charAt(0).toUpperCase() + 
                     currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).slice(1)}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="mb-4">
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {generateSmallCalendarDays().map((day, idx) => {
                      const dayAppointments = appointments.filter(apt => 
                        apt.fecha === day.date.toISOString().split('T')[0]
                      );
                      
                      return (
                        <div
                          key={idx}
                          className={`
                            min-h-24 p-2 rounded-lg border cursor-pointer transition-all
                            ${!day.isCurrentMonth ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200'}
                            ${day.isToday ? 'ring-2 ring-blue-600' : ''}
                            hover:shadow-md
                          `}
                        >
                          <div className={`text-sm font-medium mb-1 ${day.isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                            {day.day}
                          </div>
                          {dayAppointments.slice(0, 2).map((apt, i) => (
                            <div
                              key={i}
                              className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded mb-1 truncate"
                            >
                              {apt.horaInicio} {getPatientName(apt.patientId).split(' ')[0]}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-gray-500">+{dayAppointments.length - 2}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                    Todos
                  </button>
                  {specialties.slice(0, 3).map(specialty => (
                    <button
                      key={specialty}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Appointment Details Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                {selectedAppointment ? (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Detalle del Turno</h3>
                    {/* Appointment details would go here */}
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Próximos Turnos</h3>
                    {getUpcomingAppointments().slice(0, 3).map((apt, idx) => (
                      <div key={idx} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className="text-center">
                            <div className="text-blue-600 font-bold text-lg">
                              {new Date(apt.fecha + 'T12:00:00').getDate()}
                            </div>
                            <div className="text-xs text-gray-500 uppercase">
                              {new Date(apt.fecha + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short' })}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {getPatientName(apt.patientId)}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {apt.horaInicio} - {apt.horaFin}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              {getDoctorName(apt.doctorId)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {getUpcomingAppointments().length === 0 && (
                      <div className="text-center py-8">
                        <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">No hay turnos próximos</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SecretaryAppointmentsPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando..." />}>
      <SecretaryAppointmentsContent />
    </Suspense>
  );
}
