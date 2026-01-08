'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/Spinner';
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
import { appointmentsService } from '@/services/api/appointments.service';
import { usersService } from '@/services/api/users.service';
import { patientsService } from '@/services/api/patients.service';
import type { Appointment, Patient } from '@/types';
import { clinicSettingsService, ConsultingRoom, MedicalSpecialty } from '@/services/api/clinic-settings.service';
import { User as UserType } from '@/types/roles';
import { dateHelper } from '@/utils/date-helper';

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
  status: 'programada' | 'confirmada' | 'esperando' | 'en-curso' | 'completada' | 'no-show' | 'cancelada';
  arrivalTime?: string;
  consultationStartTime?: string;
  priority: 'normal' | 'urgent';
  isNewPatient: boolean;
  estimatedDuration: number; // en minutos
  updatedAt?: string; // Para calcular tiempo de espera
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
  const [consultingRooms, setConsultingRooms] = useState<ConsultingRoom[]>([]);
  const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
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
      const [appointmentsRes, doctorsRes, adminsRes, patientsRes, roomsRes, specialtiesRes] = await Promise.all([
        appointmentsService.getAppointments(clinicId),
        usersService.getUsers(clinicId, { role: 'doctor', estado: 'activo' }),
        usersService.getUsers(clinicId, { role: 'admin' }),
        patientsService.getPatients(clinicId),
        clinicSettingsService.getConsultingRooms(clinicId),
        clinicSettingsService.getSpecialties(clinicId)
      ]);

      if (appointmentsRes.success && doctorsRes.success && adminsRes.success && patientsRes.success) {
        setAppointments(appointmentsRes.data);
        const adminDoctors = adminsRes.data.filter((user: any) => user.isDoctor === true);
        const allDoctors = [...doctorsRes.data, ...adminDoctors];
        setDoctors(allDoctors);
        setPatients(patientsRes.data);
        
        // Cargar consultorios y especialidades
        if (roomsRes.success && roomsRes.data) {
          setConsultingRooms(roomsRes.data);
        }
        if (specialtiesRes.success && specialtiesRes.data) {
          setSpecialties(specialtiesRes.data);
        }

        // Obtener fecha de hoy (respeta modo debug)
        const today = dateHelper.today();
        
        // Filtrar citas de hoy y procesarlas
        const todayCitas = (appointmentsRes.data || [])
          .filter(apt => apt.fecha === today)
          .map(apt => {
            const patient = patientsRes.data.find(p => p.id === apt.patientId);
            const adminDoctors = adminsRes.data.filter((user: UserType) => user.isDoctor === true);
            const allDoctors = [...doctorsRes.data, ...adminDoctors];
            const doctor = allDoctors.find(d => d.id === apt.doctorId);
            
            const patientName = patient 
              ? `${patient.nombres} ${patient.apellidos}` 
              : 'Paciente desconocido';
            
            const doctorName = doctor
              ? `Dr. ${doctor.nombres} ${doctor.apellidos}`
              : 'Doctor no asignado';

            const specialty = doctor?.especialidades?.[0] || 'General';
            const consultorio = doctor?.consultorio || 'N/A';

            const startTime = apt.horaInicio;
            const duration = 30; // 30 minutos por defecto
            const [hours, minutes] = startTime.split(':').map(Number);
            const endTime = `${String(hours + Math.floor((minutes + duration) / 60)).padStart(2, '0')}:${String((minutes + duration) % 60).padStart(2, '0')}`;

            // Convertir estado backend a frontend para la UI
            let frontendStatus: string = apt.estado;
            if (apt.estado === 'en_curso') frontendStatus = 'en-curso';
            if (apt.estado === 'no_asistio') frontendStatus = 'no-show';
            // 'confirmada' se mantiene igual en ambos lados
            
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
              status: frontendStatus as any,
              arrivalTime: undefined,
              consultationStartTime: undefined,
              priority: 'normal' as any,
              isNewPatient: false,
              estimatedDuration: duration,
              updatedAt: apt.updatedAt
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

  const getSpecialtyName = (specialtyId: string): string => {
    if (!specialtyId) return 'General';
    
    // Buscar por ID en las especialidades cargadas
    const specialty = specialties.find(s => s.id === specialtyId);
    if (specialty) {
      return specialty.name;
    }
    
    // Fallback: mapeo estático
    const names: Record<string, string> = {
      'odontologia': 'Odontología',
      'clinica-medica': 'Clínica Médica',
      'pediatria': 'Pediatría'
    };
    
    return names[specialtyId] || specialtyId;
  };

  const getConsultingRoomName = (consultorioId: string): string => {
    if (!consultorioId || consultorioId === 'N/A') return 'Sin consultorio';
    
    // Buscar por ID
    const room = consultingRooms.find(r => r.id === consultorioId);
    if (room) {
      return room.name;
    }
    
    // Buscar por número
    const roomByNumber = consultingRooms.find(r => r.number === consultorioId);
    if (roomByNumber) {
      return roomByNumber.name;
    }
    
    return `Consultorio ${consultorioId}`;
  };

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
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          text: 'Cancelada',
          bgCard: 'bg-red-50'
        };
      default:
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Calendar,
          text: status,
          bgCard: 'bg-blue-50'
        };
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    if (!clinicId || !currentUser?.id) {
      console.error('❌ No hay clinicId o userId');
      return;
    }

    try {
      console.log('🔄 Cambiando estado de cita:', { appointmentId, newStatus });

      // Convertir estado frontend a backend (esperando -> confirmada, en-curso -> en_curso, no-show -> no_asistio)
      let backendStatus: string = newStatus;
      if (newStatus === 'esperando') backendStatus = 'confirmada';
      if (newStatus === 'en-curso') backendStatus = 'en_curso';
      if (newStatus === 'no-show') backendStatus = 'no_asistio';

      // Actualizar en el backend
      const response = await appointmentsService.updateAppointment(
        clinicId,
        currentUser.id,
        appointmentId,
        { estado: backendStatus as any }
      );

      console.log('📥 Respuesta del backend:', response);

      if (response.success) {
        // Actualizar estado local solo si el backend confirma
        setTodayAppointments(prev => 
          prev.map(apt => {
            if (apt.id === appointmentId) {
              const updatedApt = { ...apt, status: newStatus as any };
              
              const currentTime = new Date().toLocaleTimeString('es-AR', { 
                timeZone: 'America/Argentina/Buenos_Aires',
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
              });
              
              // Si se confirma llegada, agregar hora de llegada
              if (newStatus === 'esperando' && !apt.arrivalTime) {
                updatedApt.arrivalTime = currentTime;
              }
              
              // Si pasa a consulta, agregar hora de inicio de consulta
              if (newStatus === 'en-curso' && !apt.consultationStartTime) {
                updatedApt.consultationStartTime = currentTime;
              }
              
              console.log('✅ Estado actualizado localmente:', updatedApt.status);
              return updatedApt;
            }
            return apt;
          })
        );
      } else {
        console.error('❌ Backend no confirmó la actualización');
        alert('No se pudo actualizar el estado de la cita.');
      }
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      alert('Error al actualizar el estado de la cita.');
    }
  };

  const handleNotifyDoctor = (appointment: ReceptionAppointment) => {
    // Aquí se enviaría notificación al doctor
  };

  const getWaitingTime = (appointment: ReceptionAppointment) => {
    // Solo mostrar tiempo de espera para citas confirmadas o en espera
    if (appointment.status !== 'confirmada' && appointment.status !== 'esperando') {
      return '';
    }

    // Usar updatedAt para calcular el tiempo desde que se confirmó la cita
    if (!appointment.updatedAt) {
      return '0 min';
    }

    try {
      const updatedAt = new Date(appointment.updatedAt);
      const now = currentTime;
      const diffMs = now.getTime() - updatedAt.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);

      if (diffMinutes < 0) return '0 min';
      if (diffMinutes < 60) return `${diffMinutes} min`;
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error('Error calculando tiempo de espera:', error);
      return '0 min';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <LoadingSpinner message="Cargando recepción..." />
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
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                              {waitingTime && <div className="text-xs text-yellow-600">Espera: {waitingTime}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.time}</div>
                          <div className="text-xs text-gray-500">{appointment.endTime}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.doctorName}</div>
                          <div className="text-xs text-gray-500">{getSpecialtyName(appointment.specialty)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getConsultingRoomName(appointment.consultorio)}</td>
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
                              <button onClick={() => handleStatusChange(appointment.id, 'esperando')} className="p-1 text-yellow-600 hover:text-yellow-700 transition-colors" title="Confirmar Llegada">
                                <Timer className="w-5 h-5" />
                              </button>
                            )}
                            {appointment.status === 'confirmada' && (
                              <button onClick={() => handleStatusChange(appointment.id, 'esperando')} className="p-1 text-yellow-600 hover:text-yellow-700 transition-colors" title="En Espera">
                                <Timer className="w-5 h-5" />
                              </button>
                            )}
                            {appointment.status === 'esperando' && (
                              <button onClick={() => handleStatusChange(appointment.id, 'en-curso')} className="p-1 text-green-600 hover:text-green-700 transition-colors" title="Pasar a Consulta">
                                <ArrowRight className="w-5 h-5" />
                              </button>
                            )}
                            {appointment.status === 'programada' && (
                              <button onClick={() => handleStatusChange(appointment.id, 'no-show')} className="p-1 text-red-600 hover:text-red-700 transition-colors" title="No Asistio">
                                <XCircle className="w-5 h-5" />
                              </button>
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