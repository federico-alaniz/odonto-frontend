'use client';

import { useState, useEffect, useMemo } from 'react';
import { LoadingSpinner } from '@/components/ui/Spinner';
import { useRouter, useParams } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { 
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon
} from 'lucide-react';
import { usersService } from '@/services/api/users.service';
import { appointmentsService } from '@/services/api/appointments.service';
import type { Appointment } from '@/types';
import { clinicSettingsService } from '@/services/api/clinic-settings.service';
import { dateHelper } from '@/utils/date-helper';
import { User } from '@/types/roles';

interface TimeSlot {
  time: string;
  available: boolean;
  date: string;
}

export default function DoctorAvailabilityPage() {
  const router = useRouter();
  const params = useParams();
  const { buildPath } = useTenant();
  const { currentUser } = useAuth();
  
  const doctorId = params?.doctorId as string;
  const [doctor, setDoctor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(dateHelper.now()));
  const [weekSlots, setWeekSlots] = useState<Map<string, TimeSlot[]>>(new Map());
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [specialtiesMap, setSpecialtiesMap] = useState<Map<string, string>>(new Map());

  // Memoize clinicId to prevent unnecessary re-renders
  const clinicId = useMemo(() => {
    return (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
  }, [currentUser?.id]);

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); // Reset time to start of day
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes como inicio
    const weekStart = new Date(d);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  useEffect(() => {
    if (clinicId && doctorId) {
      loadDoctorData();
    }
  }, [clinicId, doctorId]);

  // Generate week slots when doctor, appointments, or currentWeekStart change
  useEffect(() => {
    if (doctor) {
      generateWeekSlots();
    }
  }, [currentWeekStart, doctor, appointments]);

  const loadDoctorData = async () => {
    if (!clinicId || !doctorId) return;

    try {
      setLoading(true);
      
      // Cargar especialidades
      const specialtiesRes = await clinicSettingsService.getSpecialties(clinicId);
      const specMap = new Map<string, string>();
      specialtiesRes.data.forEach((spec: any) => {
        specMap.set(spec.id, spec.name || spec.nombre);
      });
      setSpecialtiesMap(specMap);
      
      // Cargar doctor
      const [doctorsRes, adminsRes] = await Promise.all([
        usersService.getUsers(clinicId, { role: 'doctor', limit: 100 }),
        usersService.getUsers(clinicId, { role: 'admin', limit: 100 })
      ]);

      const allDoctors = [...doctorsRes.data, ...adminsRes.data.filter((u: any) => u.isDoctor)];
      const foundDoctor = allDoctors.find(d => d.id === doctorId);
      
      if (foundDoctor) {
        setDoctor(foundDoctor);
      }

      // Cargar citas del doctor
      const appointmentsRes = await appointmentsService.getAppointments(clinicId, { 
        doctorId,
        limit: 1000 
      });
      setAppointments(appointmentsRes.data);

    } catch (error) {
      console.error('Error loading doctor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeekSlots = () => {
    if (!doctor) return;

    const slotsMap = new Map<string, TimeSlot[]>();
    const today = dateHelper.now();
    const todayStr = today.toISOString().split('T')[0];
    
    // Generar slots para 7 días
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(currentWeekStart);
      currentDate.setDate(currentWeekStart.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      const backendDay = dayOfWeek === 0 ? 7 : dayOfWeek;

      // Verificar si la fecha es anterior a hoy
      const isPastDate = dateStr < todayStr;

      // Buscar horario de atención para este día
      const horario = (doctor as any).horariosAtencion?.find(
        (h: any) => h.activo && h.dia === backendDay
      );

      if (!horario || isPastDate) {
        slotsMap.set(dateStr, []);
        continue;
      }

      // Obtener citas reservadas para este día
      const dayAppointments = appointments.filter(apt => apt.fecha === dateStr);
      const bookedTimes = new Set(dayAppointments.map(apt => apt.horaInicio));

      // Generar slots
      const [startHour, startMin] = horario.horaInicio.split(':').map(Number);
      const [endHour, endMin] = horario.horaFin.split(':').map(Number);

      const slots: TimeSlot[] = [];
      let currentHour = startHour;
      let currentMin = startMin;

      // Solo filtrar por tiempo si es hoy
      const isToday = dateStr === todayStr;
      const currentTime = isToday ? today.getHours() * 60 + today.getMinutes() : -1;

      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
        const slotTime = currentHour * 60 + currentMin;
        
        const isPast = isToday && slotTime <= currentTime;
        const isBooked = bookedTimes.has(timeStr);

        slots.push({
          time: timeStr,
          available: !isPast && !isBooked,
          date: dateStr
        });

        currentMin += 30;
        if (currentMin >= 60) {
          currentMin = 0;
          currentHour++;
        }
      }

      slotsMap.set(dateStr, slots);
    }

    setWeekSlots(slotsMap);
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    
    // No permitir navegar a semanas anteriores a la actual
    const today = dateHelper.now();
    const weekStart = getWeekStart(today);
    
    if (newStart < weekStart) {
      return; // No permitir ir a semanas pasadas
    }
    
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedSlot({ date, time });
  };

  const handleConfirm = () => {
    if (!selectedSlot) return;
    
    // Redirigir a la página de selección de paciente
    router.push(buildPath(`/secretary/appointments/new?doctorId=${doctorId}&date=${selectedSlot.date}&time=${selectedSlot.time}`));
  };

  const formatWeekRange = () => {
    const weekDays = getWeekDays();
    const start = weekDays[0];
    const end = weekDays[6];
    
    return `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`;
  };

  const getTimeSlots = () => {
    // Obtener todos los horarios únicos de la semana
    const allTimes = new Set<string>();
    weekSlots.forEach(slots => {
      slots.forEach(slot => allTimes.add(slot.time));
    });
    return Array.from(allTimes).sort();
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <LoadingSpinner message="Cargando disponibilidad..." />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Doctor no encontrado</p>
        </div>
      </div>
    );
  }

  const weekDays = getWeekDays();
  const timeSlots = getTimeSlots();

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
                  Disponibilidad de Turnos
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Selecciona fecha y horario para tu consulta
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(buildPath('/secretary/appointments'))}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Reserva de Turnos</h2>
              <p className="text-sm text-gray-600 mb-6">
                Configure los filtros para encontrar el horario ideal
              </p>

              {/* Doctor Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Profesional
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
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
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      Dr. {doctor.nombres} {doctor.apellidos}
                    </div>
                    <div className="text-xs text-blue-600">
                      {(() => {
                        const especialidades = (doctor as any).especialidades;
                        if (Array.isArray(especialidades) && especialidades.length > 0) {
                          const firstSpec = especialidades[0];
                          return specialtiesMap.get(firstSpec) || firstSpec || 'Medicina General';
                        }
                        return 'Medicina General';
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">i</span>
                  </div>
                  <div>
                    <p className="text-xs text-blue-900 font-medium mb-1">
                      ¿No encuentra turno?
                    </p>
                    <p className="text-xs text-blue-800">
                      Puede unirse a la lista de espera para recibir una notificación si se libera un espacio.
                    </p>
                    <button className="text-xs text-blue-600 font-medium mt-2 hover:underline">
                      Unirse a la lista de espera
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
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
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Dr. {doctor.nombres} {doctor.apellidos}
                    </h3>
                    <p className="text-sm text-blue-600">
                      {(() => {
                        const especialidades = (doctor as any).especialidades;
                        if (Array.isArray(especialidades) && especialidades.length > 0) {
                          const firstSpec = especialidades[0];
                          return specialtiesMap.get(firstSpec) || firstSpec || 'Medicina General';
                        }
                        return 'Medicina General';
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPreviousWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-gray-900">
                    {formatWeekRange()}
                  </span>
                  <button
                    onClick={goToNextWeek}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2 ml-4">
                    <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                      Semana
                    </button>
                    <button className="px-4 py-2 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100">
                      Mes
                    </button>
                  </div>
                </div>
              </div>

              {/* Week Calendar */}
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Days Header */}
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    <div className="text-xs font-medium text-gray-500"></div>
                    {weekDays.map((day, idx) => {
                      const isToday = day.toDateString() === new Date().toDateString();
                      return (
                        <div key={idx} className="text-center">
                          <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                            {day.toLocaleDateString('es-AR', { weekday: 'short' })}
                          </div>
                          <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                            {day.getDate()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Time Slots Grid */}
                  <div className="space-y-2">
                    {/* Morning Section */}
                    {timeSlots.some(t => parseInt(t.split(':')[0]) < 12) && (
                      <>
                        <div className="text-xs font-medium text-gray-500 uppercase mt-4 mb-2">Mañana</div>
                        {timeSlots
                          .filter(t => parseInt(t.split(':')[0]) < 12)
                          .map((time, timeIdx) => (
                            <div key={timeIdx} className="grid grid-cols-8 gap-2">
                              <div className="flex items-center justify-end pr-4 text-sm text-gray-600">
                                {time}
                              </div>
                              {weekDays.map((day, dayIdx) => {
                                const dateStr = day.toISOString().split('T')[0];
                                const daySlots = weekSlots.get(dateStr) || [];
                                const slot = daySlots.find(s => s.time === time);
                                
                                if (!slot) {
                                  return (
                                    <div key={dayIdx} className="h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                                      <span className="text-sm text-gray-400">-</span>
                                    </div>
                                  );
                                }

                                const isSelected = selectedSlot?.date === dateStr && selectedSlot?.time === time;

                                return (
                                  <button
                                    key={dayIdx}
                                    onClick={() => slot.available && handleSlotSelect(dateStr, time)}
                                    disabled={!slot.available}
                                    className={`
                                      h-12 rounded-lg text-sm font-medium transition-all
                                      ${slot.available 
                                        ? isSelected
                                          ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                                          : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      }
                                    `}
                                  >
                                    {slot.available ? 'Disponible' : '-'}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                      </>
                    )}

                    {/* Afternoon Section */}
                    {timeSlots.some(t => parseInt(t.split(':')[0]) >= 12) && (
                      <>
                        <div className="text-xs font-medium text-gray-500 uppercase mt-6 mb-2">Tarde</div>
                        {timeSlots
                          .filter(t => parseInt(t.split(':')[0]) >= 12)
                          .map((time, timeIdx) => (
                            <div key={timeIdx} className="grid grid-cols-8 gap-2">
                              <div className="flex items-center justify-end pr-4 text-sm text-gray-600">
                                {time}
                              </div>
                              {weekDays.map((day, dayIdx) => {
                                const dateStr = day.toISOString().split('T')[0];
                                const daySlots = weekSlots.get(dateStr) || [];
                                const slot = daySlots.find(s => s.time === time);
                                
                                if (!slot) {
                                  return (
                                    <div key={dayIdx} className="h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                                      <span className="text-xs text-gray-400">-</span>
                                    </div>
                                  );
                                }

                                const isSelected = selectedSlot?.date === dateStr && selectedSlot?.time === time;

                                return (
                                  <button
                                    key={dayIdx}
                                    onClick={() => slot.available && handleSlotSelect(dateStr, time)}
                                    disabled={!slot.available}
                                    className={`
                                      h-12 rounded-lg text-sm font-medium transition-all
                                      ${slot.available 
                                        ? isSelected
                                          ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                                          : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      }
                                    `}
                                  >
                                    {slot.available ? 'Disponible' : '-'}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Confirmation Bar */}
      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-sm text-gray-600">Seleccionado:</div>
                <div className="font-semibold text-gray-900">
                  {new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString('es-AR', { 
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}, {selectedSlot.time} hs
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Confirmar Turno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
