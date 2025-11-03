'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  ArrowLeft,
  Check,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

// Importar datos fake
import { patients } from '../../../../utils/fake-patients';
import { appointments } from '../../../../utils/fake-appointments';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  consultorio: string;
  avatar?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  isBooked?: boolean;
  patientName?: string;
}

interface DaySchedule {
  date: string;
  dayName: string;
  dayNumber: number;
  slots: TimeSlot[];
}

const DOCTORS: Doctor[] = [
  {
    id: 'user_doc_001',
    name: 'Dr. Juan Pérez',
    specialty: 'Clínica Médica',
    consultorio: 'Consultorio 1'
  },
  {
    id: 'user_doc_002', 
    name: 'Dra. María González',
    specialty: 'Cardiología',
    consultorio: 'Consultorio 2'
  },
  {
    id: 'user_doc_003',
    name: 'Dr. Carlos Rodríguez', 
    specialty: 'Pediatría',
    consultorio: 'Consultorio Pediátrico'
  }
];

// const SPECIALTIES = [
//   'Clínica Médica',
//   'Cardiología', 
//   'Pediatría',
//   'Dermatología',
//   'Ginecología'
// ];

export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1); // 1: Doctor, 2: Fecha/Hora, 3: Paciente, 4: Confirmación
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null);
  const [searchPatient, setSearchPatient] = useState('');
  const [patientResults, setPatientResults] = useState<typeof patients>([]);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([]);
  const [newPatientData, setNewPatientData] = useState({
    nombres: '',
    apellidos: '',
    numeroDocumento: '',
    telefono: '',
    email: '',
    motivo: ''
  });

  // Generar horarios de trabajo (ej: 8:00 - 18:00)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Generar semana actual
  const generateWeekSchedule = (doctor: Doctor, baseDate: Date) => {
    const startOfWeek = new Date(baseDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lunes
    startOfWeek.setDate(diff);

    const schedule: DaySchedule[] = [];
    
    for (let i = 0; i < 5; i++) { // Lunes a Viernes
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      
      // Obtener citas existentes para este doctor en esta fecha
      const existingAppointments = appointments.filter(apt => 
        apt.doctorId === doctor.id && apt.fecha === dateStr
      );

      const timeSlots = generateTimeSlots();
      const slots: TimeSlot[] = timeSlots.map(time => {
        const existingApt = existingAppointments.find(apt => apt.horaInicio === time);
        
        if (existingApt) {
          const patient = patients.find(p => p.id === existingApt.patientId);
          return {
            time,
            available: false,
            isBooked: true,
            patientName: patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente'
          };
        }
        
        return {
          time,
          available: true,
          isBooked: false
        };
      });

      schedule.push({
        date: dateStr,
        dayName: dayNames[currentDate.getDay()],
        dayNumber: currentDate.getDate(),
        slots
      });
    }

    return schedule;
  };

  useEffect(() => {
    if (selectedDoctor) {
      const schedule = generateWeekSchedule(selectedDoctor, currentWeek);
      setWeekSchedule(schedule);
    }
  }, [selectedDoctor, currentWeek]);

  useEffect(() => {
    if (searchPatient.length >= 2) {
      const results = patients.filter(patient => 
        `${patient.nombres} ${patient.apellidos}`.toLowerCase().includes(searchPatient.toLowerCase()) ||
        patient.numeroDocumento.includes(searchPatient)
      ).slice(0, 5);
      setPatientResults(results);
    } else {
      setPatientResults([]);
    }
  }, [searchPatient]);

  // Pre-cargar paciente si viene patientId en query string
  useEffect(() => {
    try {
      const patientId = searchParams?.get('patientId');
      if (patientId) {
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
          setSelectedPatient(patient);
          setSearchPatient(`${patient.nombres} ${patient.apellidos}`);
          setPatientResults([]);
          setIsNewPatient(false);
          // keep the step as-is so the user can pick doctor/fecha/horario;
          // patient data will be available when reaching the patient step
        }
      }
    } catch {
      // noop - in case searchParams isn't available on first render
    }
  }, [searchParams]);

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  const handlePrevWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  const handleTimeSlotClick = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep(3);
  };

  const handlePatientSelect = (patient: typeof patients[0]) => {
    setSelectedPatient(patient);
    setSearchPatient(`${patient.nombres} ${patient.apellidos}`);
    setPatientResults([]);
    setIsNewPatient(false);
  };

  const handleNewPatient = () => {
    setIsNewPatient(true);
    setSelectedPatient(null);
    setSearchPatient('');
    setPatientResults([]);
  };

  const handleConfirmAppointment = () => {
    // Aquí se enviaría la data al backend
    console.log('Nuevo turno:', {
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      patient: isNewPatient ? newPatientData : selectedPatient
    });
    
    // Simular éxito y volver al dashboard
    alert('Turno agendado exitosamente');
    router.push('/secretary/dashboard');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/secretary/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nuevo Turno</h1>
                <p className="text-gray-600 mt-1">Agendar cita médica</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center space-x-8">
            {[
              { num: 1, label: 'Doctor' },
              { num: 2, label: 'Fecha y Hora' },
              { num: 3, label: 'Paciente' },
              { num: 4, label: 'Confirmación' }
            ].map((stepItem, index) => (
              <div key={stepItem.num} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium border-2 ${
                  step >= stepItem.num 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'bg-white text-gray-400 border-gray-300'
                }`}>
                  {step > stepItem.num ? <Check className="w-5 h-5" /> : stepItem.num}
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  step >= stepItem.num ? 'text-purple-600' : 'text-gray-400'
                }`}>
                  {stepItem.label}
                </span>
                {index < 3 && (
                  <div className={`ml-8 w-16 h-0.5 ${
                    step > stepItem.num ? 'bg-purple-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Paso 1: Seleccionar Doctor */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccionar Doctor</h2>
              <p className="text-gray-600">Elige el profesional para la consulta</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DOCTORS.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setStep(2);
                  }}
                  className="border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Stethoscope className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-purple-600 font-medium">{doctor.specialty}</p>
                      <p className="text-sm text-gray-500">{doctor.consultorio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 2: Seleccionar Fecha y Hora */}
        {step === 2 && selectedDoctor && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Seleccionar Fecha y Hora</h2>
                  <p className="text-gray-600">Agenda de {selectedDoctor.name} - {selectedDoctor.specialty}</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  Cambiar Doctor
                </button>
              </div>

              {/* Navegación de semana */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePrevWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  Semana del {weekSchedule.length > 0 && formatDate(weekSchedule[0].date)}
                </h3>
                <button
                  onClick={handleNextWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Calendario semanal */}
            <div className="grid grid-cols-5 gap-4">
              {weekSchedule.map((day) => (
                <div key={day.date} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 text-center">
                    <div className="font-semibold text-gray-900">{day.dayName}</div>
                    <div className="text-2xl font-bold text-purple-600">{day.dayNumber}</div>
                  </div>
                  
                  <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                    {day.slots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && handleTimeSlotClick(day.date, slot.time)}
                        disabled={!slot.available}
                        className={`w-full p-2 text-sm rounded text-left transition-colors ${
                          slot.available
                            ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{slot.time}</span>
                          {slot.available ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </div>
                        {slot.isBooked && (
                          <div className="text-xs text-gray-500 truncate">
                            {slot.patientName}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Seleccionar/Registrar Paciente */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Datos del Paciente</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{selectedDoctor?.name}</span>
                <span>•</span>
                <span>{formatDate(selectedDate)}</span>
                <span>•</span>
                <span>{selectedTime}</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Buscar paciente existente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Paciente Existente
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                    placeholder="Buscar por nombre o documento..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Resultados de búsqueda */}
                {patientResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-sm">
                    {patientResults.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => handlePatientSelect(patient)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {patient.nombres} {patient.apellidos}
                            </div>
                            <div className="text-sm text-gray-600">
                              DNI: {patient.numeroDocumento} • Tel: {patient.telefono}
                            </div>
                          </div>
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Paciente seleccionado */}
              {selectedPatient && !isNewPatient && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {selectedPatient.nombres} {selectedPatient.apellidos}
                      </div>
                      <div className="text-sm text-gray-600">
                        DNI: {selectedPatient.numeroDocumento} • Tel: {selectedPatient.telefono}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPatient(null);
                        setSearchPatient('');
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Separador */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>

              {/* Nuevo paciente */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Registrar Nuevo Paciente
                  </label>
                  <button
                    onClick={handleNewPatient}
                    className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    Nuevo Paciente
                  </button>
                </div>

                {isNewPatient && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                      <input
                        type="text"
                        value={newPatientData.nombres}
                        onChange={(e) => setNewPatientData(prev => ({ ...prev, nombres: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                      <input
                        type="text"
                        value={newPatientData.apellidos}
                        onChange={(e) => setNewPatientData(prev => ({ ...prev, apellidos: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                      <input
                        type="text"
                        value={newPatientData.numeroDocumento}
                        onChange={(e) => setNewPatientData(prev => ({ ...prev, numeroDocumento: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        value={newPatientData.telefono}
                        onChange={(e) => setNewPatientData(prev => ({ ...prev, telefono: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newPatientData.email}
                        onChange={(e) => setNewPatientData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de la consulta</label>
                      <textarea
                        value={newPatientData.motivo}
                        onChange={(e) => setNewPatientData(prev => ({ ...prev, motivo: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de navegación */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!selectedPatient && !isNewPatient}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Paso 4: Confirmación */}
        {step === 4 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmar Turno</h2>
              <p className="text-gray-600">Revisa los datos antes de confirmar</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {/* Resumen del turno */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Turno</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-600">Doctor</div>
                      <div className="font-medium">{selectedDoctor?.name}</div>
                      <div className="text-sm text-purple-600">{selectedDoctor?.specialty}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-600">Fecha y Hora</div>
                      <div className="font-medium">{formatDate(selectedDate)}</div>
                      <div className="text-sm text-purple-600">{selectedTime}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-600">Consultorio</div>
                      <div className="font-medium">{selectedDoctor?.consultorio}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-600">Paciente</div>
                      <div className="font-medium">
                        {isNewPatient 
                          ? `${newPatientData.nombres} ${newPatientData.apellidos}`
                          : `${selectedPatient?.nombres} ${selectedPatient?.apellidos}`
                        }
                      </div>
                      <div className="text-sm text-purple-600">
                        {isNewPatient ? 'Nuevo paciente' : 'Paciente existente'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between pt-6">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={handleConfirmAppointment}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Confirmar Turno
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}