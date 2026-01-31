'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { publicAppointmentsService, type PatientData, type Doctor, type TimeSlot } from '@/services/publicAppointments';

type Step = 1 | 2 | 3 | 4;

function ReservarTurnoContent() {
  const searchParams = useSearchParams();
  const clinicId = searchParams.get('clinicId');
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [patientData, setPatientData] = useState<PatientData>({
    numeroDocumento: '',
    tipoDocumento: 'dni',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    genero: 'masculino',
  });
  const [existingPatient, setExistingPatient] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDniBlur = async () => {
    if (patientData.numeroDocumento.length < 6) return;

    if (!clinicId) return;
    
    console.log('🔍 Buscando paciente con DNI:', patientData.numeroDocumento, 'en clínica:', clinicId);
    setIsLoading(true);
    try {
      const result = await publicAppointmentsService.checkPatient(
        patientData.numeroDocumento,
        clinicId
      );

      console.log('📋 Resultado de búsqueda:', result);

      if (result.exists) {
        setExistingPatient(true);
        setPatientData({
          ...patientData,
          nombres: result.data.nombres,
          apellidos: result.data.apellidos,
          email: result.data.email || '',
          telefono: result.data.telefono || '',
          fechaNacimiento: result.data.fechaNacimiento || '',
          genero: result.data.genero || 'masculino',
        });
        toast.success('¡Paciente encontrado! Datos pre-cargados');
      } else {
        setExistingPatient(false);
        toast('Paciente nuevo. Complete sus datos', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('❌ Error checking patient:', error);
      toast.error('Error al verificar paciente. Verifique la consola.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const validateStep1 = () => {
    const required = ['numeroDocumento', 'tipoDocumento', 'nombres', 'apellidos', 'email', 'telefono', 'fechaNacimiento', 'genero'];
    return required.every((field) => patientData[field as keyof PatientData]);
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot || !clinicId) {
      toast.error('Faltan datos para completar la reserva');
      return;
    }

    setIsLoading(true);
    try {
      const result = await publicAppointmentsService.createAppointment(
        clinicId,
        patientData,
        {
          doctorId: selectedDoctor.id,
          fecha: selectedDate,
          horaInicio: selectedSlot.horaInicio,
          horaFin: selectedSlot.horaFin,
          motivo: 'Consulta general',
        }
      );

      if (result.success) {
        handleNextStep();
        toast.success('¡Turno reservado exitosamente!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al reservar turno');
    } finally {
      setIsLoading(false);
    }
  };

  // Validar que exista clinicId
  if (!clinicId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-8 py-6">
              <h1 className="text-3xl font-bold text-white">Enlace Inválido</h1>
            </div>
            <div className="px-8 py-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                No se pudo cargar el formulario de reserva
              </h2>
              <p className="text-gray-600 mb-6">
                El enlace que utilizaste no es válido o está incompleto. Por favor, solicita un nuevo enlace de reserva a tu clínica.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-700">
                  <strong>Nota:</strong> Para reservar un turno, necesitas acceder mediante el enlace único proporcionado por tu clínica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Reservar Turno</h1>
            <p className="text-blue-100 mt-2">Complete los siguientes pasos para reservar su turno</p>
          </div>

          {/* Progress Steps */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                      currentStep >= step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-24 h-1 mx-2 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-600">Datos</span>
              <span className="text-xs text-gray-600">Doctor</span>
              <span className="text-xs text-gray-600">Horario</span>
              <span className="text-xs text-gray-600">Confirmar</span>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {currentStep === 1 && (
              <Step1PatientData
                patientData={patientData}
                setPatientData={setPatientData}
                existingPatient={existingPatient}
                onDniBlur={handleDniBlur}
                isLoading={isLoading}
              />
            )}
            {currentStep === 2 && clinicId && (
              <Step2SelectDoctor
                selectedDoctor={selectedDoctor}
                setSelectedDoctor={setSelectedDoctor}
                clinicId={clinicId}
              />
            )}
            {currentStep === 3 && clinicId && (
              <Step3SelectDateTime
                doctor={selectedDoctor!}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                clinicId={clinicId}
              />
            )}
            {currentStep === 4 && (
              <Step4Confirmation
                patientData={patientData}
                doctor={selectedDoctor!}
                date={selectedDate}
                slot={selectedSlot!}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="px-8 py-6 bg-gray-50 flex justify-between">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1 || currentStep === 4}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            {currentStep < 3 && (
              <button
                onClick={handleNextStep}
                disabled={
                  (currentStep === 1 && !validateStep1()) ||
                  (currentStep === 2 && !selectedDoctor)
                }
                className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            )}
            {currentStep === 3 && (
              <button
                onClick={handleSubmit}
                disabled={!selectedDate || !selectedSlot || isLoading}
                className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Reservando...' : 'Confirmar Turno'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step1PatientData({
  patientData,
  setPatientData,
  existingPatient,
  onDniBlur,
  isLoading,
}: {
  patientData: PatientData;
  setPatientData: (data: PatientData) => void;
  existingPatient: boolean;
  onDniBlur: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <User className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-800">Datos del Paciente</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Documento *
          </label>
          <select
            value={patientData.tipoDocumento}
            onChange={(e) => setPatientData({ ...patientData, tipoDocumento: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="dni">DNI</option>
            <option value="le">LE</option>
            <option value="lc">LC</option>
            <option value="ci">CI</option>
            <option value="pasaporte">Pasaporte</option>
            <option value="extranjero">Extranjero</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Documento *
          </label>
          <input
            type="text"
            value={patientData.numeroDocumento}
            onChange={(e) => setPatientData({ ...patientData, numeroDocumento: e.target.value })}
            onBlur={onDniBlur}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="12345678"
          />
          {existingPatient && (
            <p className="text-xs text-green-600 mt-1">✓ Paciente existente</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombres *
          </label>
          <input
            type="text"
            value={patientData.nombres}
            onChange={(e) => setPatientData({ ...patientData, nombres: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Juan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apellidos *
          </label>
          <input
            type="text"
            value={patientData.apellidos}
            onChange={(e) => setPatientData({ ...patientData, apellidos: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={patientData.email}
            onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="juan@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            value={patientData.telefono}
            onChange={(e) => setPatientData({ ...patientData, telefono: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1234567890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Nacimiento *
          </label>
          <input
            type="date"
            value={patientData.fechaNacimiento}
            onChange={(e) => setPatientData({ ...patientData, fechaNacimiento: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Género *
          </label>
          <select
            value={patientData.genero}
            onChange={(e) => setPatientData({ ...patientData, genero: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function Step2SelectDoctor({
  selectedDoctor,
  setSelectedDoctor,
  clinicId,
}: {
  selectedDoctor: Doctor | null;
  setSelectedDoctor: (doctor: Doctor) => void;
  clinicId: string;
}) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const result = await publicAppointmentsService.getDoctors(clinicId);
        setDoctors(result.data);
      } catch (error) {
        toast.error('Error al cargar doctores');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, [clinicId]);

  if (isLoading) {
    return <div className="text-center py-8">Cargando doctores...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <User className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-800">Seleccionar Doctor</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doctor) => (
          <button
            key={doctor.id}
            onClick={() => setSelectedDoctor(doctor)}
            className={`p-6 border-2 rounded-lg text-left transition-all ${
              selectedDoctor?.id === doctor.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                {doctor.nombres[0]}{doctor.apellidos[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{doctor.nombreCompleto}</h3>
                {doctor.especialidades.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {doctor.especialidades.join(', ')}
                  </p>
                )}
                {doctor.nextAvailable && (
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <Clock className="w-4 h-4 mr-1" />
                    Próximo disponible: {new Date(doctor.nextAvailable).toLocaleDateString('es-AR')}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step3SelectDateTime({
  doctor,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  clinicId,
}: {
  doctor: Doctor;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedSlot: TimeSlot | null;
  setSelectedSlot: (slot: TimeSlot) => void;
  clinicId: string;
}) {
  const [availableSlots, setAvailableSlots] = useState<{ [date: string]: TimeSlot[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchSlots = async () => {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 14);

      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      console.log('📅 Buscando slots para:', {
        doctorId: doctor.id,
        clinicId,
        startDate: startDateStr,
        endDate: endDateStr
      });

      try {
        const result = await publicAppointmentsService.getAvailableSlots(
          doctor.id,
          clinicId,
          startDateStr,
          endDateStr
        );
        console.log('📋 Slots recibidos:', result);
        console.log('📊 Cantidad de fechas:', Object.keys(result.data).length);
        setAvailableSlots(result.data);
      } catch (error) {
        console.error('❌ Error al cargar slots:', error);
        toast.error('Error al cargar horarios disponibles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlots();
  }, [doctor.id, clinicId]);

  if (isLoading) {
    return <div className="text-center py-8">Cargando horarios disponibles...</div>;
  }

  const availableDates = Object.keys(availableSlots);

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isAvailable = availableDates.includes(dateStr);
      const isSelected = selectedDate === dateStr;
      const isPast = new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));
      
      days.push({
        day,
        dateStr,
        isAvailable,
        isSelected,
        isPast
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-800">Seleccionar Fecha y Hora</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Calendario</h3>
          
          {/* Navegación del mes */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Mes anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h4 className="text-lg font-semibold capitalize">{monthName}</h4>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Mes siguiente"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Días del calendario */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              return (
                <button
                  key={day.dateStr}
                  onClick={() => {
                    if (day.isAvailable) {
                      setSelectedDate(day.dateStr);
                      setSelectedSlot(null as any);
                    }
                  }}
                  disabled={!day.isAvailable || day.isPast}
                  className={`
                    aspect-square rounded-lg text-sm font-medium transition-all
                    ${day.isSelected 
                      ? 'bg-blue-600 text-white shadow-lg scale-105' 
                      : day.isAvailable 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 hover:scale-105 cursor-pointer' 
                        : day.isPast
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {day.day}
                </button>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="mt-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-gray-600">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-gray-600">Seleccionado</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-3">Horarios Disponibles</h3>
          {selectedDate ? (
            <div className="grid grid-cols-2 gap-2">
              {availableSlots[selectedDate]?.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    selectedSlot?.horaInicio === slot.horaInicio
                      ? 'border-blue-600 bg-blue-50 scale-105 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:scale-105'
                  }`}
                >
                  {slot.horaInicio}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Seleccione una fecha en el calendario</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Step4Confirmation({
  patientData,
  doctor,
  date,
  slot,
}: {
  patientData: PatientData;
  doctor: Doctor;
  date: string;
  slot: TimeSlot;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <CheckCircle className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-semibold text-gray-800">¡Turno Confirmado!</h2>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <p className="text-green-800 mb-4">
          Su turno ha sido reservado exitosamente. Recibirá un email de confirmación en breve.
        </p>

        <div className="space-y-3 text-gray-700">
          <div>
            <span className="font-semibold">Paciente:</span> {patientData.nombres} {patientData.apellidos}
          </div>
          <div>
            <span className="font-semibold">Doctor:</span> {doctor.nombreCompleto}
          </div>
          <div>
            <span className="font-semibold">Fecha:</span>{' '}
            {new Date(date).toLocaleDateString('es-AR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div>
            <span className="font-semibold">Hora:</span> {slot.horaInicio}
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => window.location.reload()}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reservar Otro Turno
        </button>
      </div>
    </div>
  );
}

export default function ReservarTurnoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <ReservarTurnoContent />
    </Suspense>
  );
}
