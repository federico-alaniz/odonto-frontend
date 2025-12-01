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
  Search,
  ChevronRight,
  FileText,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { patientsService } from '@/services/api/patients.service';

// TODO: Reemplazar con llamadas al backend
// import { patients } from '../../../../utils/fake-patients';
// import { appointments } from '../../../../utils/fake-appointments';
// import { users } from '../../../../utils/fake-users';

// Datos temporales vacíos hasta integrar con backend
const patients: any[] = [];
const appointments: any[] = [];
const users: any[] = [];

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  consultorio: string;
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

// Mapeo de especialidades de código a nombre legible
const SPECIALTY_NAMES: Record<string, string> = {
  'clinica-medica': 'Clínica Médica',
  'medicina-interna': 'Medicina Interna',
  'cardiologia': 'Cardiología',
  'pediatria': 'Pediatría',
  'dermatologia': 'Dermatología',
  'ginecologia': 'Ginecología',
  'obstetricia': 'Obstetricia',
  'odontologia': 'Odontología',
  'cirugia-oral': 'Cirugía Oral',
  'traumatologia': 'Traumatología',
  'ortopedia': 'Ortopedia',
  'psiquiatria': 'Psiquiatría'
};

// Obtener doctores activos del sistema
const DOCTORS: Doctor[] = users
  .filter(user => user.role === 'doctor' && user.estado === 'activo')
  .map(doctor => ({
    id: doctor.id,
    name: `${doctor.nombres} ${doctor.apellidos}`,
    specialty: doctor.especialidades?.[0] || '',
    consultorio: doctor.consultorio || ''
  }));

// Obtener especialidades únicas de los doctores (sin duplicados)
const SPECIALTIES = Array.from(
  new Set(
    users
      .filter(user => user.role === 'doctor' && user.estado === 'activo')
      .flatMap(doctor => doctor.especialidades || [])
  )
).sort();

export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [motivo, setMotivo] = useState<string>('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const generateWeekSchedule = (doctor: Doctor, baseDate: Date) => {
    const startOfWeek = new Date(baseDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const schedule: DaySchedule[] = [];
    
    for (let i = 0; i < 5; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      
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
        
        return { time, available: true, isBooked: false };
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
      setIsCalendarOpen(true);
    }
  }, [selectedDoctor, currentWeek]);

  useEffect(() => {
    try {
      const patientId = searchParams?.get('patientId');
      if (patientId) {
        const patient = patients.find(p => p.id === patientId);
        if (patient) setSelectedPatient(patient);
      }
    } catch {}
  }, [searchParams]);

  const filteredDoctors = selectedSpecialty
    ? DOCTORS.filter(doc => doc.specialty === selectedSpecialty)
    : DOCTORS;

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
  };

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setIsCalendarOpen(false);
  };

  const handleDoctorChange = (doctorId: string) => {
    const doctor = DOCTORS.find(d => d.id === doctorId);
    setSelectedDoctor(doctor || null);
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient || !selectedDoctor || !selectedDate || !selectedTime) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    console.log('Nuevo turno:', {
      patient: selectedPatient,
      specialty: selectedSpecialty,
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      motivo
    });
    
    alert('Turno agendado exitosamente');
    router.push('/secretary/appointments');
  };

  const isFormValid = selectedPatient && selectedDoctor && selectedDate && selectedTime;

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
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/secretary/appointments" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nuevo Turno</h1>
              <p className="text-gray-600 mt-1">Complete el formulario para agendar una cita médica</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            
            {/* Paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Paciente *
              </label>
              <select
                value={selectedPatient?.id || ''}
                onChange={(e) => {
                  const patient = patients.find(p => p.id === e.target.value);
                  setSelectedPatient(patient || null);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Seleccione un paciente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nombres} {patient.apellidos} - DNI: {patient.numeroDocumento}
                  </option>
                ))}
              </select>
            </div>

            {/* Especialidad */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Stethoscope className="w-4 h-4 inline mr-2" />
                Especialidad *
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Seleccione una especialidad</option>
                {SPECIALTIES.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {SPECIALTY_NAMES[specialty] || specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Stethoscope className="w-4 h-4 inline mr-2" />
                Doctor *
              </label>
              <select
                value={selectedDoctor?.id || ''}
                onChange={(e) => handleDoctorChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={!selectedSpecialty}
              >
                <option value="">Seleccione un doctor</option>
                {filteredDoctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.consultorio}
                  </option>
                ))}
              </select>
            </div>

            {/* Accordion Calendario */}
            {selectedDoctor && (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="w-full px-4 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">
                      Calendario Disponible - {selectedDoctor.name}
                    </span>
                  </div>
                  {isCalendarOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {isCalendarOpen && (
                  <div className="p-6 bg-white">
                    <div className="flex items-center justify-between mb-6">
                      <button
                        type="button"
                        onClick={handlePrevWeek}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                      </button>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {weekSchedule.length > 0 && formatDate(weekSchedule[0].date)}
                      </h3>
                      <button
                        type="button"
                        onClick={handleNextWeek}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-600" />
                      </button>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                      {weekSchedule.map((day) => (
                        <div key={day.date} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-purple-50 p-3 text-center">
                            <div className="font-semibold text-gray-900 text-sm">{day.dayName}</div>
                            <div className="text-2xl font-bold text-purple-600">{day.dayNumber}</div>
                          </div>
                          
                          <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                            {day.slots.map((slot) => (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => slot.available && handleTimeSlotClick(day.date, slot.time)}
                                disabled={!slot.available}
                                className={`w-full p-2 text-sm rounded text-left transition-colors ${
                                  selectedDate === day.date && selectedTime === slot.time
                                    ? 'bg-purple-600 text-white border-2 border-purple-600'
                                    : slot.available
                                    ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{slot.time}</span>
                                  {selectedDate === day.date && selectedTime === slot.time ? (
                                    <Check className="w-4 h-4" />
                                  ) : slot.available ? (
                                    <Clock className="w-4 h-4" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                </div>
                                {slot.isBooked && (
                                  <div className="text-xs mt-1 truncate">
                                    {slot.patientName}
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedDate && selectedTime && (
                      <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2 text-purple-900">
                          <Check className="w-5 h-5" />
                          <span className="font-medium">
                            Seleccionado: {formatDate(selectedDate)} a las {selectedTime}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Motivo de la consulta (opcional)
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                placeholder="Describa brevemente el motivo de la consulta..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Botones */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                href="/secretary/appointments"
                className="px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={!isFormValid}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Agendar Turno
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}