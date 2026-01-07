'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { useToast } from '@/components/ui/ToastProvider';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Stethoscope,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  List,
  Grid3x3,
  Phone,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { patientsService, Patient } from '@/services/api/patients.service';
import { usersService } from '@/services/api/users.service';
import { appointmentsService } from '@/services/api/appointments.service';
import { clinicSettingsService } from '@/services/api/clinic-settings.service';
import { User, HorarioAtencion } from '@/types/roles';
import { useAuth } from '@/hooks/useAuth';

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

export default function NewAppointmentFlow() {
  const router = useRouter();
  const { buildPath } = useTenant();
  const searchParams = useSearchParams();
  const { showSuccess, showError, showWarning } = useToast();
  const { currentUser } = useAuth();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedObraSocial, setSelectedObraSocial] = useState('');
  
  // Datos del turno (pre-seleccionados desde la búsqueda)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [motivo, setMotivo] = useState('');
  const [specialtiesMap, setSpecialtiesMap] = useState<Map<string, string>>(new Map());

  const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
  const doctorIdParam = searchParams?.get('doctorId');
  const dateParam = searchParams?.get('date');
  const timeParam = searchParams?.get('time');

  useEffect(() => {
    if (currentUser && clinicId) {
      loadPatients();
      loadDoctors();
    }
  }, [currentUser, clinicId]);

  useEffect(() => {
    if (doctorIdParam && doctors.length > 0) {
      const doctor = doctors.find(d => d.id === doctorIdParam);
      if (doctor) {
        setSelectedDoctor(doctor);
      }
    }
  }, [doctorIdParam, doctors]);

  useEffect(() => {
    if (dateParam) {
      setSelectedDate(dateParam);
    }
    if (timeParam) {
      setSelectedTime(timeParam);
    }
  }, [dateParam, timeParam]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadDoctorSchedule();
    }
  }, [selectedDate, selectedDoctor]);

  const loadDoctors = async () => {
    if (!clinicId) return;

    try {
      // Cargar especialidades primero
      const specialtiesRes = await clinicSettingsService.getSpecialties(clinicId);
      const specMap = new Map<string, string>();
      specialtiesRes.data.forEach((spec: any) => {
        specMap.set(spec.id, spec.name || spec.nombre);
      });
      setSpecialtiesMap(specMap);

      const [doctorsRes, adminsRes] = await Promise.all([
        usersService.getUsers(clinicId, { role: 'doctor', limit: 100 }),
        usersService.getUsers(clinicId, { role: 'admin', limit: 100 })
      ]);

      const allDoctors = [...doctorsRes.data, ...adminsRes.data.filter((u: any) => u.isDoctor)];
      const doctorsData: Doctor[] = allDoctors.map((user: User) => ({
        id: user.id,
        name: `${user.nombres} ${user.apellidos}`,
        specialty: user.especialidades?.[0] ? (specMap.get(user.especialidades[0]) || user.especialidades[0]) : 'General',
        consultorio: user.consultorio || 'Sin asignar',
        especialidades: user.especialidades || [],
        horariosAtencion: user.horariosAtencion || []
      }));
      
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadPatients = async () => {
    if (!clinicId) return;
    
    try {
      setLoadingPatients(true);
      const response = await patientsService.getPatients(clinicId, { limit: 1000 });
      
      if (response.success && response.data) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadDoctorSchedule = async () => {
    if (!selectedDoctor || !selectedDate || !clinicId) return;
    
    try {
      setLoadingSchedule(true);
      const response = await appointmentsService.getDoctorSchedule(
        clinicId,
        selectedDoctor.id,
        selectedDate
      );
      
      const occupied = response.data.map((apt: any) => apt.horaInicio);
      setBookedSlots(occupied);
      
      // Generate available slots
      const slots = generateAvailableTimeSlots();
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading doctor schedule:', error);
      setBookedSlots([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const generateAvailableTimeSlots = (): TimeSlot[] => {
    if (!selectedDoctor || !selectedDate) return [];

    const date = new Date(selectedDate + 'T12:00:00');
    const dayOfWeek = date.getDay();
    const backendDay = dayOfWeek === 0 ? 7 : dayOfWeek;

    const horario = selectedDoctor.horariosAtencion.find(
      h => h.activo && h.dia === backendDay
    );

    if (!horario) return [];

    const slots: TimeSlot[] = [];
    const [startHour, startMin] = horario.horaInicio.split(':').map(Number);
    const [endHour, endMin] = horario.horaFin.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      const isBooked = bookedSlots.includes(timeStr);
      
      slots.push({ time: timeStr, available: !isBooked });

      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }

    return slots;
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      patient.nombres.toLowerCase().includes(searchLower) ||
      patient.apellidos.toLowerCase().includes(searchLower) ||
      patient.numeroDocumento.includes(searchTerm);
    
    const matchesObraSocial = selectedObraSocial === '' || 
      (patient as any).obraSocial === selectedObraSocial;
    
    return matchesSearch && matchesObraSocial;
  });

  const handlePatientSelect = (patient: Patient) => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      showWarning('Datos incompletos', 'Por favor selecciona doctor, fecha y hora primero');
      return;
    }

    if (!motivo.trim()) {
      showWarning('Motivo requerido', 'Por favor ingrese el motivo de la consulta');
      return;
    }

    // Redirigir a la página de confirmación con todos los datos
    const params = new URLSearchParams({
      doctorId: selectedDoctor.id,
      patientId: patient.id,
      date: selectedDate,
      time: selectedTime,
      motivo: motivo.trim()
    });

    router.push(buildPath(`/secretary/appointments/confirm?${params.toString()}`));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return `${timeStr} hs`;
  };

  const obrasSociales = Array.from(new Set(patients.map(p => (p as any).obraSocial).filter(Boolean)));

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <UserIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Seleccionar Paciente
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Busca y selecciona el paciente para el turno reservado
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
        {/* Resumen del Turno */}
        {selectedDoctor && selectedDate && selectedTime && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">RESUMEN DEL TURNO A RESERVAR</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-blue-600 font-medium mb-1">PROFESIONAL</div>
                  <div className="font-semibold text-gray-900">{selectedDoctor.name}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-blue-600 font-medium mb-1">ESPECIALIDAD</div>
                  <div className="font-semibold text-gray-900">{selectedDoctor.specialty}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-blue-600 font-medium mb-1">FECHA Y HORA</div>
                  <div className="font-semibold text-gray-900">
                    {formatDate(selectedDate)}, {formatTime(selectedTime)}
                  </div>
                </div>
              </div>
            </div>

            {/* Motivo de Consulta */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de Consulta *
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej: Control de rutina, dolor de cabeza, seguimiento de tratamiento..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Este campo es obligatorio. Describa brevemente el motivo de la consulta.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Búsqueda */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Buscar Paciente</h3>
              
              {/* Búsqueda General */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Búsqueda General
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rodriguez"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtro por Obra Social */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Obra Social
                </label>
                <select
                  value={selectedObraSocial}
                  onChange={(e) => setSelectedObraSocial(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas las Obras Sociales</option>
                  {obrasSociales.map(os => (
                    <option key={os} value={os}>{os}</option>
                  ))}
                </select>
              </div>

              {/* Botón Buscar */}
              <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                <Search className="w-4 h-4" />
                Buscar
              </button>

              {/* Crear Nuevo Paciente */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">¿El paciente no existe?</p>
                <button 
                  onClick={() => router.push(buildPath('/secretary/patients/new'))}
                  className="w-full border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Crear Nuevo Paciente
                </button>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header de Resultados */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Resultados <span className="text-gray-500">({filteredPatients.length} encontrados)</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Lista de Pacientes */}
              <div className="p-6">
                {loadingPatients ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando pacientes...</p>
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pacientes</h3>
                    <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPatients.map(patient => (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {patient.nombres[0]}{patient.apellidos[0]}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {patient.nombres} {patient.apellidos}
                              </h4>
                              <span className="text-sm text-blue-600 font-medium">
                                DNI {patient.numeroDocumento}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <UserIcon className="w-4 h-4" />
                                {patient.edad || 'N/A'} años
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {patient.telefono || 'Sin teléfono'}
                              </span>
                              {(patient as any).obraSocial && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                  {(patient as any).obraSocial} {(patient as any).numeroAfiliado}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => router.push(buildPath(`/secretary/patients/${patient.id}`))}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            Ver Perfil
                          </button>
                          <button
                            onClick={() => handlePatientSelect(patient)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            Seleccionar
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Paginación */}
                {filteredPatients.length > 0 && (
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Mostrando 1 a {Math.min(3, filteredPatients.length)} de {filteredPatients.length} resultados
                    </p>
                    <div className="flex items-center gap-2">
                      <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
