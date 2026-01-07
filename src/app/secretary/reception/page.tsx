'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Phone,
  UserCheck,
  Calendar,
  Stethoscope,
  Bell,
  Eye,
  Edit,
  ArrowRight,
  User,
  MapPin,
  Activity,
  Timer,
  XCircle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { appointmentsService, Appointment } from '@/services/api/appointments.service';
import { usersService } from '@/services/api/users.service';
import { patientsService, Patient } from '@/services/api/patients.service';
import { clinicSettingsService } from '@/services/api/clinic-settings.service';
import { User as UserType } from '@/types/roles';
import { dateHelper } from '@/utils/date-helper';
import { backendToFrontend, frontendToBackend, type FrontendAppointmentState } from '@/utils/appointment-state-mapper';

interface ReceptionAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  time: string;
  endTime: string;
  consultorio: string;
  motivo: string;
  status: FrontendAppointmentState;
  arrivalTime?: string;
  consultationStartTime?: string;
  priority: 'normal' | 'urgent';
  isNewPatient: boolean;
  estimatedDuration: number; // en minutos
  isDelayed?: boolean; // Indica si la cita está retrasada (hora pasó y no se confirmó)
}

interface WaitingStats {
  esperando: number;
  enConsulta: number;
  completadas: number;
  noShow: number;
  promedio: number; // tiempo promedio de espera
}

export default function ReceptionPage() {
  const { currentUser } = useAuth();
  const { buildPath } = useTenant();
  const [todayAppointments, setTodayAppointments] = useState<ReceptionAppointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<ReceptionAppointment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<UserType[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<WaitingStats>({
    esperando: 0,
    enConsulta: 0,
    completadas: 0,
    noShow: 0,
    promedio: 0
  });
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(dateHelper.now());
  const [showColon, setShowColon] = useState(true);

  const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;

  // Actualizar hora actual cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Parpadeo de los dos puntos cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setShowColon(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (clinicId) {
      loadReceptionData();
    }
  }, [clinicId]);

  const loadReceptionData = async () => {
    if (!clinicId) {
      console.log('⏳ Esperando clinicId...');
      return;
    }

    try {
      setLoading(true);

      // Cargar datos en paralelo
      const [appointmentsRes, doctorsRes, adminsRes, patientsRes, settingsRes] = await Promise.all([
        appointmentsService.getAppointments(clinicId),
        usersService.getUsers(clinicId, { role: 'doctor', estado: 'activo' }),
        usersService.getUsers(clinicId, { role: 'admin' }),
        patientsService.getPatients(clinicId),
        clinicSettingsService.getSettings(clinicId)
      ]);

      if (appointmentsRes.success && doctorsRes.success && adminsRes.success && patientsRes.success && settingsRes.success) {
        // Crear mapas de IDs a nombres para especialidades y consultorios
        const specialtiesMap = new Map(
          settingsRes.data.specialties.map(s => [s.id, s.name])
        );
        const consultingRoomsMap = new Map(
          settingsRes.data.consultingRooms.map(r => [r.id, r.name || r.number])
        );
        
        console.log('📋 Specialties map:', Array.from(specialtiesMap.entries()));
        console.log('🏥 Consulting rooms map:', Array.from(consultingRoomsMap.entries()));
        setAppointments(appointmentsRes.data);
        const adminDoctors = adminsRes.data.filter((user: any) => user.isDoctor === true);
        const allDoctors = [...doctorsRes.data, ...adminDoctors];
        setDoctors(allDoctors);
        setPatients(patientsRes.data);

        // Obtener fecha de hoy (respeta modo debug)
        const today = dateHelper.today();
        
        // Filtrar citas de hoy y procesarlas
        const todayCitas = (appointmentsRes.data || [])
          .filter(apt => apt.fecha === today)
          .map(apt => {
            const patient = patientsRes.data.find(p => p.id === apt.patientId);
            const adminDoctors = adminsRes.data.filter((user: any) => user.isDoctor === true);
            const allDoctors = [...doctorsRes.data, ...adminDoctors];
            const doctor = allDoctors.find(d => d.id === apt.doctorId);
            
            const patientName = patient 
              ? `${patient.nombres} ${patient.apellidos}` 
              : 'Paciente desconocido';
            
            const doctorName = doctor
              ? `Dr. ${doctor.nombres} ${doctor.apellidos}`
              : 'Doctor no asignado';

            // Debug: ver estructura de datos del doctor
            if (doctor && (doctor.role === 'admin' || doctor.isDoctor)) {
              console.log('🔍 Doctor data:', {
                id: doctor.id,
                role: doctor.role,
                isDoctor: doctor.isDoctor,
                especialidades: doctor.especialidades,
                consultorio: doctor.consultorio
              });
            }

            // Resolver especialidad desde el ID
            let specialty = 'General';
            if (doctor?.especialidades) {
              if (Array.isArray(doctor.especialidades) && doctor.especialidades.length > 0) {
                const firstEspId = doctor.especialidades[0];
                specialty = specialtiesMap.get(firstEspId) || firstEspId || 'General';
              } else if (typeof doctor.especialidades === 'string') {
                specialty = specialtiesMap.get(doctor.especialidades) || doctor.especialidades || 'General';
              }
            }

            // Resolver consultorio desde el ID
            let consultorio = 'N/A';
            if (doctor?.consultorio) {
              consultorio = consultingRoomsMap.get(doctor.consultorio) || doctor.consultorio || 'N/A';
            }

            // Calcular tiempo estimado de finalización
            const startTime = apt.horaInicio;
            const duration = 30; // 30 minutos por defecto
            const [hours, minutes] = startTime.split(':').map(Number);
            const endTime = `${String(hours + Math.floor((minutes + duration) / 60)).padStart(2, '0')}:${String((minutes + duration) % 60).padStart(2, '0')}`;

            // Detectar si la cita está retrasada (hora ya pasó y no está confirmada/en espera/en curso)
            const currentTime = new Date();
            const [aptHours, aptMinutes] = apt.horaInicio.split(':').map(Number);
            const appointmentTime = new Date();
            appointmentTime.setHours(aptHours, aptMinutes, 0, 0);
            
            const isDelayed = currentTime > appointmentTime && 
                            (apt.estado === 'programada' || apt.estado === 'confirmada');

            return {
              id: apt.id,
              patientId: apt.patientId,
              patientName,
              patientPhone: patient?.telefono || 'N/A',
              doctorId: apt.doctorId,
              doctorName,
              specialty,
              time: apt.horaInicio,
              endTime,
              consultorio,
              motivo: apt.motivo || 'Consulta general',
              status: backendToFrontend(apt.estado) as FrontendAppointmentState,
              arrivalTime: undefined,
              consultationStartTime: undefined,
              priority: 'normal' as any,
              isNewPatient: false,
              estimatedDuration: duration,
              isDelayed
            } as ReceptionAppointment;
          })
          .sort((a, b) => a.time.localeCompare(b.time));

        // Calcular estadísticas
        // Calcular tiempo promedio de espera real (desde confirmación hasta inicio de consulta)
        const citasConEsperaCompleta = todayCitas.filter(apt => 
          apt.arrivalTime && apt.consultationStartTime && 
          (apt.status === 'en-curso' || apt.status === 'completada')
        );
        let promedioEspera = 0;
        
        if (citasConEsperaCompleta.length > 0) {
          const tiemposEspera = citasConEsperaCompleta.map(apt => {
            if (!apt.arrivalTime || !apt.consultationStartTime) return 0;
            try {
              const [arrHours, arrMinutes] = apt.arrivalTime.split(':').map(Number);
              const [startHours, startMinutes] = apt.consultationStartTime.split(':').map(Number);
              const arrivalMinutes = arrHours * 60 + arrMinutes;
              const consultationStartMinutes = startHours * 60 + startMinutes;
              return Math.max(0, consultationStartMinutes - arrivalMinutes);
            } catch {
              return 0;
            }
          });
          
          const totalEspera = tiemposEspera.reduce((sum, time) => sum + time, 0);
          promedioEspera = Math.round(totalEspera / citasConEsperaCompleta.length);
        }

        const newStats = {
          esperando: todayCitas.filter(apt => apt.status === 'esperando' || apt.status === 'confirmada' || apt.status === 'programada').length,
          enConsulta: todayCitas.filter(apt => apt.status === 'en-curso').length,
          completadas: todayCitas.filter(apt => apt.status === 'completada').length,
          noShow: todayCitas.filter(apt => apt.status === 'no-show').length,
          promedio: promedioEspera
        };

        setTodayAppointments(todayCitas);
        setStats(newStats);
      }
    } catch (error) {
      console.error('❌ Error cargando datos de recepción:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar citas
  useEffect(() => {
    let filtered = todayAppointments;

    // Filtro por estado
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === selectedFilter);
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.consultorio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  }, [todayAppointments, selectedFilter, searchTerm]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'programada':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Calendar,
          text: 'Programada',
          bgCard: 'bg-blue-50'
        };
      case 'confirmada':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Clock,
          text: 'Confirmada',
          bgCard: 'bg-orange-50'
        };
      case 'esperando':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Timer,
          text: 'En espera',
          bgCard: 'bg-yellow-50'
        };
      case 'en-curso':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Activity,
          text: 'En consulta',
          bgCard: 'bg-green-50'
        };
      case 'completada':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: CheckCircle,
          text: 'Completada',
          bgCard: 'bg-gray-50'
        };
      case 'no-show':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          text: 'No asistió',
          bgCard: 'bg-red-50'
        };
      case 'cancelada':
        return {
    
    const patientName = patient 
      ? `${patient.nombres} ${patient.apellidos}` 
      : 'Paciente desconocido';
    
    const doctorName = doctor
      ? `Dr. ${doctor.nombres} ${doctor.apellidos}`
      : 'Doctor no asignado';

    // Debug: ver estructura de datos del doctor
    if (doctor && (doctor.role === 'admin' || doctor.isDoctor)) {
      console.log('🔍 Doctor data:', {
        id: doctor.id,
        role: doctor.role,
        isDoctor: doctor.isDoctor,
        especialidades: doctor.especialidades,
        consultorio: doctor.consultorio
      });
    }

    // Resolver especialidad desde el ID
    let specialty = 'General';
    if (doctor?.especialidades) {
      if (Array.isArray(doctor.especialidades) && doctor.especialidades.length > 0) {
        const firstEspId = doctor.especialidades[0];
        specialty = specialtiesMap.get(firstEspId) || firstEspId || 'General';
      } else if (typeof doctor.especialidades === 'string') {
        specialty = specialtiesMap.get(doctor.especialidades) || doctor.especialidades || 'General';
      }
    }

    // Resolver consultorio desde el ID
    let consultorio = 'N/A';
    if (doctor?.consultorio) {
      consultorio = consultingRoomsMap.get(doctor.consultorio) || doctor.consultorio || 'N/A';
    }

    // Calcular tiempo estimado de finalización
    const startTime = apt.horaInicio;
    const duration = 30; // 30 minutos por defecto
    const [hours, minutes] = startTime.split(':').map(Number);
    const endTime = `${String(hours + Math.floor((minutes + duration) / 60)).padStart(2, '0')}:${String((minutes + duration) % 60).padStart(2, '0')}`;

    // Detectar si la cita está retrasada (hora ya pasó y no está confirmada/en espera/en curso)
    const currentTime = new Date();
    const [aptHours, aptMinutes] = apt.horaInicio.split(':').map(Number);
    const appointmentTime = new Date();
    appointmentTime.setHours(aptHours, aptMinutes, 0, 0);
    
    const isDelayed = currentTime > appointmentTime && 
                    (apt.estado === 'programada' || apt.estado === 'confirmada');

    return {
      id: apt.id,
      patientId: apt.patientId,
      patientName,
      patientPhone: patient?.telefono || 'N/A',
      doctorId: apt.doctorId,
      doctorName,
      specialty,
      time: apt.horaInicio,
      endTime,
      consultorio,
      motivo: apt.motivo || 'Consulta general',
      status: backendToFrontend(apt.estado) as FrontendAppointmentState,
      arrivalTime: undefined,
      consultationStartTime: undefined,
      priority: 'normal' as any,
      isNewPatient: false,
      estimatedDuration: duration,
      isDelayed
    } as ReceptionAppointment;
  })
  .sort((a, b) => a.time.localeCompare(b.time));

// Calcular estadísticas
// Calcular tiempo promedio de espera real (desde confirmación hasta inicio de consulta)
const citasConEsperaCompleta = todayCitas.filter(apt => 
  apt.arrivalTime && apt.consultationStartTime && 
  (apt.status === 'en-curso' || apt.status === 'completada')
);
let promedioEspera = 0;
  
if (citasConEsperaCompleta.length > 0) {
  const tiemposEspera = citasConEsperaCompleta.map(apt => {
    if (!apt.arrivalTime || !apt.consultationStartTime) return 0;
    try {
      const [arrHours, arrMinutes] = apt.arrivalTime.split(':').map(Number);
      const [startHours, startMinutes] = apt.consultationStartTime.split(':').map(Number);
      const arrivalMinutes = arrHours * 60 + arrMinutes;
      const consultationStartMinutes = startHours * 60 + startMinutes;
      return Math.max(0, consultationStartMinutes - arrivalMinutes);
    } catch {
      return 0;
      if (arrTimeParts.length !== 2) return '';
      
      const arrHours = parseInt(arrTimeParts[0], 10);
      const arrMinutes = parseInt(arrTimeParts[1], 10);
      
      // Validar que sean números válidos
      if (isNaN(arrHours) || isNaN(arrMinutes)) return '';
      
      const arrivalTotalMinutes = arrHours * 60 + arrMinutes;
      let endTotalMinutes: number;
      
      // Si la cita ya está en curso o completada, usar el tiempo de inicio de consulta
      if (appointment.consultationStartTime) {
        const startTimeParts = appointment.consultationStartTime.split(':');
        if (startTimeParts.length !== 2) return '';
        
        const startHours = parseInt(startTimeParts[0], 10);
        const startMinutes = parseInt(startTimeParts[1], 10);
        
        if (isNaN(startHours) || isNaN(startMinutes)) return '';
        endTotalMinutes = startHours * 60 + startMinutes;
      } else if (appointment.status === 'esperando') {
        // Si está esperando, usar la hora actual
        const nowHours = currentTime.getHours();
        const nowMinutes = currentTime.getMinutes();
        endTotalMinutes = nowHours * 60 + nowMinutes;
      } else {
        return '';
      }
      
      const waitingMinutes = endTotalMinutes - arrivalTotalMinutes;
      
      if (waitingMinutes < 0) return '';
      if (waitingMinutes < 60) return `${waitingMinutes}m`;
      
      const hours = Math.floor(waitingMinutes / 60);
      const minutes = waitingMinutes % 60;
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error('Error calculando tiempo de espera:', error);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando recepción...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between gap-6">
            {/* Título e ícono */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Recepción</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Control de llegadas y sala de espera
                </p>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="flex-1 max-w-2xl relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar paciente, doctor o consultorio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filtros y acciones */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Filtro por estado */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="pl-9 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="programada">Programadas</option>
                  <option value="confirmada">Confirmadas</option>
                  <option value="esperando">En espera</option>
                  <option value="en-curso">En consulta</option>
                  <option value="completada">Completadas</option>
                  <option value="no-show">No asistió</option>
                </select>
              </div>

              {/* Botón actualizar */}
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                title="Actualizar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Hora actual */}
              <div className="text-right pl-3 border-l border-gray-300">
                <div className="text-xs text-gray-500">Hora actual (Buenos Aires)</div>
                <div className="text-lg font-bold text-green-600 font-mono">
                  {currentTime.toLocaleTimeString('es-AR', { 
                    timeZone: 'America/Argentina/Buenos_Aires',
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false
                  }).split(':').map((part, index) => (
                    <span key={index}>
                      {part}
                      {index === 0 && (
                        <span className={`transition-opacity duration-200 ${showColon ? 'opacity-100' : 'opacity-0'}`}>
                          :
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Timer className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">En Espera</div>
                <div className="text-2xl font-bold text-gray-900">{stats.esperando}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">En Consulta</div>
                <div className="text-2xl font-bold text-gray-900">{stats.enConsulta}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Completadas</div>
                <div className="text-2xl font-bold text-gray-900">{stats.completadas}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">No Show</div>
                <div className="text-2xl font-bold text-gray-900">{stats.noShow}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Espera Promedio</div>
                <div className="text-2xl font-bold text-gray-900">{stats.promedio}m</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Citas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultorio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => {
                    const statusConfig = getStatusConfig(appointment.status);
                    const StatusIcon = statusConfig.icon;
                    const waitingTime = getWaitingTime(appointment);

                    return (
                      <tr key={appointment.id} className={`hover:bg-gray-50 ${appointment.isDelayed ? 'bg-red-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${appointment.isDelayed ? 'bg-red-100' : 'bg-blue-100'}`}>
                                <User className={`h-5 w-5 ${appointment.isDelayed ? 'text-red-600' : 'text-blue-600'}`} />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                              {appointment.isDelayed && <div className="text-xs text-red-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Retrasada</div>}
                              {waitingTime && !appointment.isDelayed && <div className="text-xs text-yellow-600">Espera: {waitingTime}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${appointment.isDelayed ? 'text-red-600' : 'text-gray-900'}`}>{appointment.time}</div>
                          <div className="text-xs text-gray-500">{appointment.endTime}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.doctorName}</div>
                          <div className="text-xs text-gray-500">{appointment.specialty}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.consultorio}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.patientPhone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {appointment.status === 'programada' && (
                              <>
                                <button onClick={() => handleStatusChange(appointment.id, 'esperando')} className="p-1 text-yellow-600 hover:text-yellow-700 transition-colors" title="Confirmar Llegada">
                                  <Timer className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleStatusChange(appointment.id, 'no-show')} className="p-1 text-red-600 hover:text-red-700 transition-colors" title="Marcar como No Asistió">
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {appointment.status === 'confirmada' && (
                              <>
                                <button onClick={() => handleStatusChange(appointment.id, 'esperando')} className="p-1 text-yellow-600 hover:text-yellow-700 transition-colors" title="Confirmar Llegada">
                                  <Timer className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleStatusChange(appointment.id, 'no-show')} className="p-1 text-red-600 hover:text-red-700 transition-colors" title="Marcar como No Asistió">
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {appointment.status === 'esperando' && (
                              <>
                                <span className="text-xs text-yellow-700 font-medium bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                                  En sala de espera
                                </span>
                                <button onClick={() => handleStatusChange(appointment.id, 'en-curso')} className="p-1 text-green-600 hover:text-green-700 transition-colors" title="Pasar a Consulta">
                                  <ArrowRight className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron citas
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay citas programadas para hoy'
                }
              </p>
              <Link 
                href={buildPath('/secretary/appointments/new')}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Nuevo Turno
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}