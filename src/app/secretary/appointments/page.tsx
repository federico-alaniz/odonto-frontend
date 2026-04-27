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
  Clock,
  X,
  HelpCircle
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
  const [viewMode, setViewMode] = useState<ViewMode>('scheduled');
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
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Calendar for scheduled view
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(dateHelper.now());
  
  // Calendar for availability view
  const [calendarWeekStart, setCalendarWeekStart] = useState(() => {
    const now = dateHelper.now();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysUntilMonday);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Filter for scheduled view
  const [scheduledCalendarDoctorFilter, setScheduledCalendarDoctorFilter] = useState<string>('');
  const [scheduledPatientFilter, setScheduledPatientFilter] = useState<string>('');
  const [scheduledDateFilter, setScheduledDateFilter] = useState<string>('');

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

  const goToPreviousWeek = () => {
    setCalendarWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCalendarWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  };

  const getWeekRange = () => {
    const weekEnd = new Date(calendarWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const format = (date: Date) => {
      return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    };
    
    return `${format(calendarWeekStart)} - ${format(weekEnd)}`;
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
                  Turnos
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Gestiona y agenda turnos médicos
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                title="¿Cómo agendar un turno?"
              >
                <HelpCircle className="w-6 h-6" />
              </button>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('search')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'search'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Búsqueda
                </button>
                <button
                  onClick={() => setViewMode('scheduled')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'scheduled'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Programados
                </button>
              </div>
              <button
                onClick={() => setViewMode('search')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nuevo Turno
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search View */}
      {viewMode === 'search' && (
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Doctor Name Search */}
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nombre del médico..."
                      value={searchDoctor}
                      onChange={(e) => setSearchDoctor(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Specialty Filter */}
                <div className="flex-1 min-w-[200px]">
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="">Todas las especialidades...</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div className="flex-1 min-w-[150px]">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="today">Hoy</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Doctor Results */}
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultorio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibilidad</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDoctors.slice(0, 5).map((doctor) => {
                      const slots = doctorSlots.get(doctor.id) || [];
                      const labelText = dateRange === 'today' 
                        ? 'PRÓXIMOS TURNOS HOY' 
                        : dateRange === 'week' 
                          ? 'ESTA SEMANA' 
                          : 'ESTE MES';
                      
                      const emptyText = dateRange === 'today' 
                        ? 'No disponible hoy' 
                        : dateRange === 'week' 
                          ? 'No disponible esta semana' 
                          : 'No disponible este mes';

                      const getSpecialtyName = () => {
                        const especialidades = doctor.especialidades;
                        
                        if (Array.isArray(especialidades) && especialidades.length > 0) {
                          const nombres = especialidades
                            .map((esp: string | { name?: string; nombre?: string }) => {
                              if (typeof esp === 'object' && esp !== null) {
                                return esp.name || esp.nombre;
                              }
                              if (typeof esp === 'string') {
                                return specialtiesMap.get(esp) || esp;
                              }
                              return esp;
                            })
                            .filter(Boolean);
                          return nombres.length > 0 ? nombres.join(', ') : 'Medicina General';
                        }
                        
                        if (typeof especialidades === 'string') {
                          return specialtiesMap.get(especialidades) || especialidades || 'Medicina General';
                        }
                        
                        return 'Medicina General';
                      };

                      const getConsultorioName = () => {
                        const consultorio = doctor.consultorio;
                        if (!consultorio) return 'No asignado';
                        
                        if (typeof consultorio === 'string') {
                          return consultoriosMap.get(consultorio) || consultorio;
                        }
                        
                        return consultorio;
                      };

                      return (
                        <tr key={doctor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {doctor.nombres?.[0]?.toUpperCase()}{doctor.apellidos?.[0]?.toUpperCase()}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  Dr. {doctor.nombres} {doctor.apellidos}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getSpecialtyName()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getConsultorioName()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                {labelText}
                              </p>
                              {slots.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {slots.slice(0, 5).map((time, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200"
                                    >
                                      {time}
                                    </span>
                                  ))}
                                  {slots.length > 5 && (
                                    <span className="text-xs text-gray-500">+{slots.length - 5} más</span>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">{emptyText}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => router.push(buildPath(`/secretary/appointments/availability/${doctor.id}`))}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              Reservar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredDoctors.length === 0 && (
                <div className="p-12 text-center">
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

            {/* Calendar View */}
            {filteredDoctors.length > 0 && (
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Calendario de Disponibilidad</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={goToPreviousWeek}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-medium text-gray-700">
                        {getWeekRange()}
                      </span>
                      <button
                        onClick={goToNextWeek}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Calendar Header - Days */}
                    <div className="grid grid-cols-8 border-b border-gray-200">
                      <div className="p-3 bg-gray-50 font-medium text-sm text-gray-600 text-center border-r border-gray-200">
                        Horario
                      </div>
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, idx) => {
                        const date = new Date(calendarWeekStart);
                        date.setDate(date.getDate() + idx);
                        const dayDate = date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
                        return (
                          <div key={day} className="p-3 bg-gray-50 font-medium text-sm text-gray-600 text-center">
                            <div>{day}</div>
                            <div className="text-xs text-gray-400">{dayDate}</div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Calendar Body - Time Slots */}
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((time) => (
                      <div key={time} className="grid grid-cols-8 border-b border-gray-200 last:border-0">
                        <div className="p-3 text-sm text-gray-600 text-center border-r border-gray-200 font-medium">
                          {time}
                        </div>
                        {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek, dayIdx) => {
                          // Calculate the actual date for this cell
                          const cellDate = new Date(calendarWeekStart);
                          cellDate.setDate(calendarWeekStart.getDate() + dayIdx);
                          const [timeHour, timeMin] = time.split(':').map(Number);
                          cellDate.setHours(timeHour, timeMin, 0, 0);
                          
                          // Check if this time slot is in the past
                          const now = dateHelper.now();
                          const isPast = cellDate < now;

                          // Get all doctors for this time slot and day (both available and busy)
                          const doctorsInSlot = filteredDoctors.slice(0, 5).map(doctor => {
                            const horarios = (doctor as any).horariosAtencion || [];
                            const horario = horarios.find((h: any) => h.activo && h.dia === dayOfWeek);
                            
                            if (!horario) return null;
                            
                            const [startHour, startMin] = horario.horaInicio.split(':').map(Number);
                            const [endHour, endMin] = horario.horaFin.split(':').map(Number);
                            
                            const timeInMinutes = timeHour * 60 + timeMin;
                            const startInMinutes = startHour * 60 + startMin;
                            const endInMinutes = endHour * 60 + endMin;
                            
                            // Check if time is within working hours
                            if (timeInMinutes < startInMinutes || timeInMinutes >= endInMinutes) {
                              return null;
                            }
                            
                            // Check if there's an existing appointment at this time using calendarWeekStart
                            const checkDate = new Date(calendarWeekStart);
                            checkDate.setDate(calendarWeekStart.getDate() + dayIdx);
                            const dateStr = checkDate.toISOString().split('T')[0];
                            
                            const hasAppointment = appointments.some(
                              apt => apt.doctorId === doctor.id && 
                                     apt.fecha === dateStr && 
                                     apt.horaInicio === time
                            );
                            
                            return {
                              doctor,
                              isOccupied: hasAppointment
                            };
                          }).filter(Boolean);

                          // Color schemes for doctors
                          const doctorColorSchemes = [
                            { bg: 'bg-blue-500', text: 'text-white', hover: 'hover:bg-blue-600', border: 'border-blue-600' },
                            { bg: 'bg-purple-500', text: 'text-white', hover: 'hover:bg-purple-600', border: 'border-purple-600' },
                            { bg: 'bg-emerald-500', text: 'text-white', hover: 'hover:bg-emerald-600', border: 'border-emerald-600' },
                            { bg: 'bg-amber-500', text: 'text-white', hover: 'hover:bg-amber-600', border: 'border-amber-600' },
                            { bg: 'bg-rose-500', text: 'text-white', hover: 'hover:bg-rose-600', border: 'border-rose-600' },
                          ];

                          return (
                            <div 
                              key={`${time}-${dayOfWeek}`} 
                              className={`p-2 min-h-[60px] border-r border-gray-200 last:border-r-0 ${isPast ? 'bg-gray-100' : ''}`}
                            >
                              {doctorsInSlot.length > 0 && !isPast && (
                                <div className="space-y-1">
                                  {doctorsInSlot.slice(0, 2).map((item: any, idx: number) => {
                                    const doctor = item.doctor;
                                    const isOccupied = item.isOccupied;
                                    const doctorIndex = filteredDoctors.findIndex(d => d.id === doctor.id);
                                    const colors = doctorColorSchemes[doctorIndex % doctorColorSchemes.length];
                                    
                                    return (
                                      <div
                                        key={idx}
                                        className={`text-xs px-2 py-1 rounded truncate transition-colors border ${
                                          isOccupied 
                                            ? 'bg-gray-300 text-gray-600 border-gray-400 cursor-not-allowed' 
                                            : `${colors.bg} ${colors.text} cursor-pointer ${colors.hover} border ${colors.border}`
                                        }`}
                                        title={`Dr. ${doctor.nombres} ${doctor.apellidos}${isOccupied ? ' - Ocupado' : ''}`}
                                        onClick={() => !isOccupied && router.push(buildPath(`/secretary/appointments/availability/${doctor.id}`))}
                                      >
                                        Dr. {doctor.nombres?.split(' ')[0]} {doctor.apellidos?.split(' ')[0]}
                                        {isOccupied && <span className="ml-1 text-xs">🔒</span>}
                                      </div>
                                    );
                                  })}
                                  {doctorsInSlot.length > 2 && (
                                    <div className="text-xs text-gray-500">+{doctorsInSlot.length - 2} más</div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scheduled View */}
      {viewMode === 'scheduled' && (
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-wrap">
                  <h2 className="text-xl font-semibold text-gray-900">Turnos Programados</h2>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Filtrar por paciente..."
                      value={scheduledPatientFilter}
                      onChange={(e) => setScheduledPatientFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Doctor:</label>
                    <select
                      value={scheduledCalendarDoctorFilter}
                      onChange={(e) => setScheduledCalendarDoctorFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Todos los doctores</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.nombres} {doctor.apellidos}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Fecha:</label>
                    <input
                      type="date"
                      value={scheduledDateFilter}
                      onChange={(e) => setScheduledDateFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {scheduledDateFilter && (
                      <button 
                        onClick={() => setScheduledDateFilter('')}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Limpiar fecha"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      {currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).charAt(0).toUpperCase() + 
                       currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }).slice(1)}
                    </span>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments
                    .filter(apt => {
                      const aptDate = new Date(apt.fecha);
                      const matchesMonth = aptDate.getMonth() === currentMonth.getMonth() && 
                                          aptDate.getFullYear() === currentMonth.getFullYear();
                      const matchesDoctor = !scheduledCalendarDoctorFilter || apt.doctorId === scheduledCalendarDoctorFilter;
                      
                      const patientName = getPatientName(apt.patientId).toLowerCase();
                      const matchesPatient = !scheduledPatientFilter || patientName.includes(scheduledPatientFilter.toLowerCase());
                      
                      const matchesDate = !scheduledDateFilter || apt.fecha === scheduledDateFilter;

                      return matchesMonth && apt.estado !== 'cancelada' && matchesDoctor && matchesPatient && matchesDate;
                    })
                    .sort((a, b) => {
                      const dateA = new Date(`${a.fecha}T${a.horaInicio}`);
                      const dateB = new Date(`${b.fecha}T${b.horaInicio}`);
                      return dateA.getTime() - dateB.getTime();
                    })
                    .map((appointment) => {
                      const getStatusColor = (estado: string) => {
                        switch (estado) {
                          case 'programada':
                            return 'bg-blue-100 text-blue-800 border-blue-200';
                          case 'confirmada':
                            return 'bg-orange-100 text-orange-800 border-orange-200';
                          case 'en_curso':
                            return 'bg-green-100 text-green-800 border-green-200';
                          case 'completada':
                            return 'bg-gray-100 text-gray-800 border-gray-200';
                          case 'no_asistio':
                            return 'bg-red-100 text-red-800 border-red-200';
                          default:
                            return 'bg-gray-100 text-gray-800 border-gray-200';
                        }
                      };

                      const getStatusText = (estado: string) => {
                        switch (estado) {
                          case 'programada':
                            return 'Programada';
                          case 'confirmada':
                            return 'Confirmada';
                          case 'en_curso':
                            return 'En curso';
                          case 'completada':
                            return 'Completada';
                          case 'no_asistio':
                            return 'No asistió';
                          default:
                            return estado;
                        }
                      };

                      return (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {getPatientName(appointment.patientId)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(appointment.fecha)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.horaInicio} - {appointment.horaFin}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getDoctorName(appointment.doctorId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.estado)}`}>
                              {getStatusText(appointment.estado)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {appointment.estado === 'programada' ? (
                              <Link
                                href={buildPath(`/secretary/appointments/${appointment.id}/edit`)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Editar
                              </Link>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {appointments.filter(apt => {
              const aptDate = new Date(apt.fecha);
              return aptDate.getMonth() === currentMonth.getMonth() && 
                     aptDate.getFullYear() === currentMonth.getFullYear() &&
                     apt.estado !== 'cancelada' &&
                     (!scheduledCalendarDoctorFilter || apt.doctorId === scheduledCalendarDoctorFilter);
            }).length === 0 && (
              <div className="p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay turnos programados
                </h3>
                <p className="text-gray-600 mb-6">
                  No se encontraron turnos para este mes
                </p>
                <Link
                  href={buildPath('/secretary/appointments/new')}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Nuevo Turno
                </Link>
              </div>
            )}
          </div>

          {/* Calendar View for Scheduled Appointments */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Calendario de Turnos</h3>
                  <p className="text-sm text-gray-600 mt-1">Vista semanal de turnos programados</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCalendarWeekStart(prev => {
                      const newDate = new Date(prev);
                      newDate.setDate(newDate.getDate() - 7);
                      return newDate;
                    })}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {getWeekRange()}
                  </span>
                  <button
                    onClick={() => setCalendarWeekStart(prev => {
                      const newDate = new Date(prev);
                      newDate.setDate(newDate.getDate() + 7);
                      return newDate;
                    })}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Calendar Header - Days */}
                <div className="grid grid-cols-8 border-b border-gray-200">
                  <div className="p-3 bg-gray-50 font-medium text-sm text-gray-600 text-center border-r border-gray-200">
                    Horario
                  </div>
                  {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, idx) => {
                    const date = new Date(calendarWeekStart);
                    date.setDate(date.getDate() + idx);
                    const dayDate = date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
                    return (
                      <div key={day} className="p-3 bg-gray-50 font-medium text-sm text-gray-600 text-center">
                        <div>{day}</div>
                        <div className="text-xs text-gray-400">{dayDate}</div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Calendar Body - Time Slots */}
                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b border-gray-200 last:border-0">
                    <div className="p-3 text-sm text-gray-600 text-center border-r border-gray-200 font-medium">
                      {time}
                    </div>
                    {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek, dayIdx) => {
                      // Calculate the actual date for this cell
                      const cellDate = new Date(calendarWeekStart);
                      cellDate.setDate(calendarWeekStart.getDate() + dayIdx);
                      const [timeHour, timeMin] = time.split(':').map(Number);
                      cellDate.setHours(timeHour, timeMin, 0, 0);
                      const dateStr = cellDate.toISOString().split('T')[0];

                      // Get appointments for this time slot and day
                      const slotAppointments = appointments.filter(apt => {
                        const matchesDate = apt.fecha === dateStr;
                        const notCancelled = apt.estado !== 'cancelada';
                        const matchesDoctor = !scheduledCalendarDoctorFilter || apt.doctorId === scheduledCalendarDoctorFilter;
                        
                        // Verificar si el turno se superpone con esta franja horaria (1 hora)
                        // Ej: Un turno de 11:30 a 13:30 debe aparecer en las celdas de 11:00, 12:00 y 13:00
                        const [aptStartH, aptStartM] = apt.horaInicio.split(':').map(Number);
                        const [aptEndH, aptEndM] = apt.horaFin.split(':').map(Number);
                        const aptStartTotal = aptStartH * 60 + aptStartM;
                        const aptEndTotal = aptEndH * 60 + aptEndM;
                        
                        const slotStartTotal = timeHour * 60;
                        const slotEndTotal = (timeHour + 1) * 60;

                        const overlaps = (aptStartTotal < slotEndTotal) && (aptEndTotal > slotStartTotal);
                        
                        const patientName = getPatientName(apt.patientId).toLowerCase();
                        const matchesPatient = !scheduledPatientFilter || patientName.includes(scheduledPatientFilter.toLowerCase());

                        const matchesDateFilter = !scheduledDateFilter || apt.fecha === scheduledDateFilter;

                        return matchesDate && overlaps && notCancelled && matchesDoctor && matchesPatient && matchesDateFilter;
                      });

                      // Color schemes for doctors
                      const doctorColorSchemes = [
                        { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' },
                        { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' },
                        { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600' },
                        { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-600' },
                        { bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-600' },
                      ];

                      const getStatusColor = (estado: string) => {
                        switch (estado) {
                          case 'programada':
                            return 'bg-blue-500';
                          case 'confirmada':
                            return 'bg-orange-500';
                          case 'en_curso':
                            return 'bg-green-500';
                          case 'completada':
                            return 'bg-gray-500';
                          case 'no_asistio':
                            return 'bg-red-500';
                          default:
                            return 'bg-gray-500';
                        }
                      };

                      return (
                        <div key={`${time}-${dayOfWeek}`} className="p-2 min-h-[60px] border-r border-gray-200 last:border-r-0">
                          {slotAppointments.length > 0 && (
                            <div className="space-y-1">
                              {slotAppointments.slice(0, 2).map((apt, idx) => {
                                const doctor = doctors.find(d => d.id === apt.doctorId);
                                const doctorIndex = doctors.findIndex(d => d.id === apt.doctorId);
                                const colors = doctorColorSchemes[doctorIndex % doctorColorSchemes.length];
                                
                                const patientName = getPatientName(apt.patientId);
                                const patientLastName = patientName.split(' ').slice(-1)[0] || patientName;
                                const doctorLastName = doctor?.apellidos?.split(' ')[0] || '';
                                const doctorFirstNameInitial = doctor?.nombres?.[0] || '';
                                
                                return (
                                  <div
                                    key={idx}
                                    className={`text-xs px-2 py-1 ${getStatusColor(apt.estado)} text-white rounded truncate ${apt.estado === 'programada' ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} transition-colors border ${colors.border}`}
                                    title={`${getPatientName(apt.patientId)} - ${getDoctorName(apt.doctorId)}`}
                                    onClick={() => apt.estado === 'programada' && router.push(buildPath(`/secretary/appointments/${apt.id}/edit`))}
                                  >
                                    {patientLastName} - Dr. {doctorLastName}, {doctorFirstNameInitial}
                                  </div>
                                );
                              })}
                              {slotAppointments.length > 2 && (
                                <div className="text-xs text-gray-500">+{slotAppointments.length - 2} más</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Ayuda - Flujo de Reserva */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-bold text-lg">¿Cómo agendar un turno?</h3>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <p className="font-bold text-gray-900">Ir a la pestaña "Búsqueda"</p>
                    <p className="text-sm text-gray-600 mt-1">Haz clic en el botón <span className="font-semibold">Nuevo Turno</span> o selecciona la pestaña <span className="font-semibold">Búsqueda</span>.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <p className="font-bold text-gray-900">Filtrar por Profesional</p>
                    <p className="text-sm text-gray-600 mt-1">Busca al médico por nombre o especialidad para ver su disponibilidad.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <p className="font-bold text-gray-900">Seleccionar Horario</p>
                    <p className="text-sm text-gray-600 mt-1">En el calendario inferior, haz clic en un casillero <span className="text-blue-600 font-semibold">azul</span> disponible para el médico elegido.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <p className="font-bold text-gray-900">Elegir Paciente y Motivo</p>
                    <p className="text-sm text-gray-600 mt-1">Busca al paciente, ingresa el motivo de la consulta y confirma la reserva.</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full mt-8 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
              >
                Entendido
              </button>
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
