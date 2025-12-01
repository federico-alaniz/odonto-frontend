'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Stethoscope,
  Check,
  Search,
  ChevronRight,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowLeft
} from 'lucide-react';
import { patientsService, Patient } from '@/services/api/patients.service';
import { usersService } from '@/services/api/users.service';
import { appointmentsService, Appointment } from '@/services/api/appointments.service';
import { User, HorarioAtencion } from '@/types/roles';

// Tipos
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  consultorio: string;
  especialidades: string[];
  horariosAtencion: HorarioAtencion[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

// Generar horarios disponibles
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 8; hour < 18; hour++) {
    slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, available: true });
    slots.push({ time: `${hour.toString().padStart(2, '0')}:30`, available: true });
  }
  return slots;
};

export default function NewAppointmentWizard() {
  const router = useRouter();
  
  // Estados del wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]); // Horarios ocupados
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  
  // Datos del turno
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [motivo, setMotivo] = useState('');

  // Cargar pacientes y doctores
  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, []);

  // Limpiar fecha y hora cuando cambia el doctor
  useEffect(() => {
    setSelectedDate('');
    setSelectedTime('');
    setBookedSlots([]);
  }, [selectedDoctor]);

  // Cargar horarios ocupados cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadDoctorSchedule();
    }
  }, [selectedDate, selectedDoctor]);

  const loadDoctorSchedule = async () => {
    if (!selectedDoctor || !selectedDate) return;
    
    try {
      setLoadingSchedule(true);
      const clinicId = 'clinic_001'; // TODO: obtener del contexto
      const response = await appointmentsService.getDoctorSchedule(
        clinicId,
        selectedDoctor.id,
        selectedDate
      );
      
      // Extraer los horarios ocupados
      const occupied = response.data.map(apt => apt.horaInicio);
      setBookedSlots(occupied);
    } catch (error) {
      console.error('Error loading doctor schedule:', error);
      setBookedSlots([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const clinicId = 'clinic_001'; // TODO: obtener del contexto
      const response = await patientsService.getPatients(clinicId, { limit: 100 });
      setPatients(response.data);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const clinicId = 'clinic_001'; // TODO: obtener del contexto
      const response = await usersService.getUsers(clinicId, { 
        role: 'doctor',
        estado: 'activo',
        limit: 100
      });
      
      // Transformar usuarios a formato Doctor
      const doctorsData: Doctor[] = response.data.map((user: User) => ({
        id: user.id,
        name: `${user.nombres} ${user.apellidos}`,
        specialty: user.especialidades?.[0] || 'General',
        consultorio: user.consultorio || 'Sin asignar',
        especialidades: user.especialidades || [],
        horariosAtencion: user.horariosAtencion || []
      }));
      
      setDoctors(doctorsData);
      
      // Extraer especialidades únicas
      const uniqueSpecialties = Array.from(
        new Set(doctorsData.flatMap(d => d.especialidades))
      ).sort();
      setSpecialties(uniqueSpecialties);
      
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Filtrar pacientes por búsqueda
  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.nombres.toLowerCase().includes(searchLower) ||
      patient.apellidos.toLowerCase().includes(searchLower) ||
      patient.numeroDocumento.includes(searchTerm)
    );
  });

  // Filtrar doctores por especialidad
  const filteredDoctors = selectedSpecialty
    ? doctors.filter(doc => doc.especialidades.includes(selectedSpecialty))
    : doctors;

  // Generar fechas disponibles basadas en los horarios del doctor
  const getAvailableDates = () => {
    if (!selectedDoctor || !selectedDoctor.horariosAtencion.length) {
      return [];
    }

    const dates = [];
    const today = new Date();
    
    // Obtener días activos del doctor (1=Lunes, 2=Martes, ..., 6=Sábado)
    const activeDays = selectedDoctor.horariosAtencion
      .filter(h => h.activo)
      .map(h => h.dia);

    // Generar próximos 30 días
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
      
      // Convertir de formato JS (0-6) a formato backend (1-6, donde 1=Lunes)
      const backendDay = dayOfWeek === 0 ? 7 : dayOfWeek;
      
      // Solo incluir si el doctor atiende ese día
      if (activeDays.includes(backendDay) && backendDay !== 7) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  // Generar horarios disponibles para la fecha seleccionada
  const getAvailableTimeSlots = (): TimeSlot[] => {
    if (!selectedDoctor || !selectedDate) {
      return [];
    }

    const date = new Date(selectedDate + 'T12:00:00');
    const dayOfWeek = date.getDay();
    const backendDay = dayOfWeek === 0 ? 7 : dayOfWeek;

    // Buscar el horario de atención para ese día
    const horario = selectedDoctor.horariosAtencion.find(
      h => h.activo && h.dia === backendDay
    );

    if (!horario) {
      return [];
    }

    // Generar slots cada 30 minutos entre horaInicio y horaFin
    const slots: TimeSlot[] = [];
    const [startHour, startMin] = horario.horaInicio.split(':').map(Number);
    const [endHour, endMin] = horario.horaFin.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      
      // Verificar si el horario está ocupado
      const isBooked = bookedSlots.includes(timeStr);
      
      slots.push({ time: timeStr, available: !isBooked });

      // Incrementar 30 minutos
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }

    return slots;
  };

  const availableDates = getAvailableDates();
  const timeSlots = getAvailableTimeSlots();

  // Navegación del wizard
  const canGoNext = () => {
    switch (currentStep) {
      case 1: return selectedPatient !== null;
      case 2: return selectedDoctor !== null;
      case 3: return selectedDate !== '' && selectedTime !== '';
      default: return false;
    }
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !selectedDoctor || !selectedDate || !selectedTime) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      const clinicId = 'clinic_001'; // TODO: obtener del contexto
      const userId = 'usr_000001'; // TODO: obtener del contexto

      // Calcular horaFin (30 minutos después de horaInicio)
      const [hour, min] = selectedTime.split(':').map(Number);
      let endHour = hour;
      let endMin = min + 30;
      if (endMin >= 60) {
        endMin = 0;
        endHour++;
      }
      const horaFin = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

      const appointmentData = {
        patientId: selectedPatient.id,
        doctorId: selectedDoctor.id,
        fecha: selectedDate,
        horaInicio: selectedTime,
        horaFin: horaFin,
        motivo: motivo || 'Consulta general',
        tipo: 'consulta' as const
      };

      console.log('🚀 Creando cita:', appointmentData);

      const response = await appointmentsService.createAppointment(
        clinicId,
        userId,
        appointmentData
      );

      console.log('✅ Cita creada:', response);

      alert('Turno agendado exitosamente');
      router.push('/secretary/appointments');
    } catch (error: any) {
      console.error('❌ Error al agendar turno:', error);
      alert('Error al agendar el turno: ' + error.message);
    }
  };

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long'
    });
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase();
  };

  const getDayNumber = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.getDate();
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/secretary/appointments')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nuevo Turno</h1>
              <p className="text-gray-600 mt-1">Agenda una cita médica en simples pasos</p>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              { num: 1, label: 'Paciente', icon: UserIcon },
              { num: 2, label: 'Doctor', icon: Stethoscope },
              { num: 3, label: 'Fecha y Hora', icon: Calendar },
              { num: 4, label: 'Confirmar', icon: Check }
            ].map((step, index) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep > step.num
                      ? 'bg-green-500 text-white'
                      : currentStep === step.num
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.num ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    currentStep >= step.num ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`h-1 flex-1 mx-2 rounded transition-all ${
                    currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Step 1: Seleccionar Paciente */}
          {currentStep === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccionar Paciente</h2>
              <p className="text-gray-600 mb-6">Busca y selecciona el paciente para el turno</p>

              {/* Búsqueda */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Lista de pacientes */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loadingPatients ? (
                  <div className="text-center py-8 text-gray-500">Cargando pacientes...</div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    No se encontraron pacientes
                  </div>
                ) : (
                  filteredPatients.map(patient => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPatient?.id === patient.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {patient.nombres} {patient.apellidos}
                          </div>
                          <div className="text-sm text-gray-600">
                            DNI: {patient.numeroDocumento} • {patient.telefono}
                          </div>
                        </div>
                        {selectedPatient?.id === patient.id && (
                          <CheckCircle2 className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: Seleccionar Doctor */}
          {currentStep === 2 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccionar Doctor</h2>
              <p className="text-gray-600 mb-6">Elige la especialidad y el profesional</p>

              {/* Filtro por especialidad */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por especialidad
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSpecialty('')}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedSpecialty === ''
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    Todas
                  </button>
                  {specialties.map(specialty => (
                    <button
                      key={specialty}
                      onClick={() => setSelectedSpecialty(specialty)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedSpecialty === specialty
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de doctores */}
              {loadingDoctors ? (
                <div className="text-center py-8 text-gray-500">Cargando doctores...</div>
              ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  No hay doctores disponibles para esta especialidad
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDoctors.map(doctor => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      selectedDoctor?.id === doctor.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg mb-1">
                          {doctor.name}
                        </div>
                        <div className="text-sm text-blue-600 font-medium mb-2">
                          {doctor.specialty}
                        </div>
                        <div className="text-sm text-gray-600">
                          📍 {doctor.consultorio}
                        </div>
                      </div>
                      {selectedDoctor?.id === doctor.id && (
                        <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Seleccionar Fecha y Hora */}
          {currentStep === 3 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Fecha y Hora</h2>
              <p className="text-gray-600 mb-6">
                Selecciona el día y horario del turno con <strong>{selectedDoctor?.name}</strong>
              </p>

              {!selectedDoctor?.horariosAtencion.length ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Doctor sin horarios configurados
                  </h3>
                  <p className="text-gray-600">
                    Este doctor no tiene horarios de atención configurados. Por favor, contacta al administrador.
                  </p>
                </div>
              ) : availableDates.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay fechas disponibles
                  </h3>
                  <p className="text-gray-600">
                    El doctor no tiene días de atención activos en los próximos 30 días.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Fechas */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Seleccionar Fecha</h3>
                    <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                      {availableDates.map(date => (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedDate === date
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            {getDayName(date)}
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {getDayNumber(date)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horarios */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Seleccionar Horario</h3>
                  {!selectedDate ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      Primero selecciona una fecha
                    </div>
                  ) : loadingSchedule ? (
                    <div className="text-center py-8 text-gray-500">
                      Cargando horarios disponibles...
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      No hay horarios disponibles para esta fecha
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 mb-3 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                          <span className="text-gray-600">Disponible</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                          <span className="text-gray-600">Ocupado</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                        {timeSlots.map(slot => (
                          <button
                            key={slot.time}
                            onClick={() => slot.available && setSelectedTime(slot.time)}
                            disabled={!slot.available}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              selectedTime === slot.time
                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                                : slot.available
                                ? 'border-green-200 bg-green-50 hover:border-green-400 hover:bg-green-100 text-green-700'
                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <div className="text-center font-medium">
                              {slot.time}
                            </div>
                            {!slot.available && (
                              <div className="text-xs mt-1">Ocupado</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirmar */}
          {currentStep === 4 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmar Turno</h2>
              <p className="text-gray-600 mb-6">Revisa los datos antes de confirmar</p>

              <div className="space-y-6">
                {/* Resumen */}
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <UserIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Paciente</div>
                      <div className="font-semibold text-gray-900">
                        {selectedPatient?.nombres} {selectedPatient?.apellidos}
                      </div>
                      <div className="text-sm text-gray-600">
                        DNI: {selectedPatient?.numeroDocumento}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Stethoscope className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Doctor</div>
                      <div className="font-semibold text-gray-900">
                        {selectedDoctor?.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedDoctor?.specialty} • {selectedDoctor?.consultorio}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Fecha y Hora</div>
                      <div className="font-semibold text-gray-900">
                        {formatDate(selectedDate)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedTime} hs
                      </div>
                    </div>
                  </div>
                </div>

                {/* Motivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de la consulta (opcional)
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={4}
                    placeholder="Describa brevemente el motivo de la consulta..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer con botones */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Atrás
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/secretary/appointments')}
                className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Confirmar Turno
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
