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
import { appointmentsService, Appointment } from '@/services/api/appointments.service';
import { usersService } from '@/services/api/users.service';
import { patientsService, Patient } from '@/services/api/patients.service';
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
  priority: 'normal' | 'urgent';
  isNewPatient: boolean;
  estimatedDuration: number; // en minutos
}

interface WaitingStats {
  esperando: number;
  enConsulta: number;
  completadas: number;
  noShow: number;
  promedio: number; // tiempo promedio de espera
}

export default function ReceptionPage() {
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

  const clinicId = 'clinic_001'; // TODO: obtener del contexto

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
    loadReceptionData();
  }, []);

  const loadReceptionData = async () => {
    try {
      setLoading(true);
      console.log('📊 Cargando datos de recepción...');

      // Cargar datos en paralelo
      const [appointmentsRes, doctorsRes, patientsRes] = await Promise.all([
        appointmentsService.getAppointments(clinicId),
        usersService.getUsers(clinicId, { role: 'doctor', estado: 'activo' }),
        patientsService.getPatients(clinicId)
      ]);

      console.log('🔍 Respuestas del backend:');
      console.log('  - Appointments:', appointmentsRes);
      console.log('  - Doctors:', doctorsRes);
      console.log('  - Patients:', patientsRes);

      if (appointmentsRes.success && doctorsRes.success && patientsRes.success) {
        setAppointments(appointmentsRes.data);
        setDoctors(doctorsRes.data);
        setPatients(patientsRes.data);

        // Obtener fecha de hoy (respeta modo debug)
        const today = dateHelper.today();
        console.log('📅 Filtrando citas del día:', today);
        console.log('📊 Total de citas en el backend:', appointmentsRes.data?.length || 0);
        
        if (appointmentsRes.data && appointmentsRes.data.length > 0) {
          console.log('📋 Fechas disponibles:', [...new Set(appointmentsRes.data.map(a => a.fecha))]);
          console.log('📋 Primera cita como ejemplo:', appointmentsRes.data[0]);
        } else {
          console.warn('⚠️ No hay citas en appointmentsRes.data');
        }

        // Filtrar citas de hoy y procesarlas
        const todayCitas = (appointmentsRes.data || [])
          .filter(apt => {
            console.log(`  Comparando: "${apt.fecha}" === "${today}" = ${apt.fecha === today}`);
            return apt.fecha === today;
          })
          .map(apt => {
            const patient = patientsRes.data.find(p => p.id === apt.patientId);
            const doctor = doctorsRes.data.find(d => d.id === apt.doctorId);
            
            const patientName = patient 
              ? `${patient.nombres} ${patient.apellidos}` 
              : 'Paciente desconocido';
            
            const doctorName = doctor
              ? `Dr. ${doctor.nombres} ${doctor.apellidos}`
              : 'Doctor no asignado';

            const specialty = doctor?.especialidades?.[0] || 'General';
            const consultorio = doctor?.consultorio || 'N/A';

            // Calcular tiempo estimado de finalización
            const startTime = apt.horaInicio;
            const duration = 30; // 30 minutos por defecto
            const [hours, minutes] = startTime.split(':').map(Number);
            const endTime = `${String(hours + Math.floor((minutes + duration) / 60)).padStart(2, '0')}:${String((minutes + duration) % 60).padStart(2, '0')}`;

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
              status: apt.estado as any,
              arrivalTime: apt.estado === 'confirmada' ? '08:45' : undefined,
              priority: 'normal' as any,
              isNewPatient: false,
              estimatedDuration: duration
            } as ReceptionAppointment;
          })
          .sort((a, b) => a.time.localeCompare(b.time));

        console.log(`✅ ${todayCitas.length} citas encontradas para hoy`);
        console.log('📋 Citas procesadas:', todayCitas);

        // Calcular estadísticas
        const newStats = {
          esperando: todayCitas.filter(apt => apt.status === 'esperando' || apt.status === 'confirmada' || apt.status === 'programada').length,
          enConsulta: todayCitas.filter(apt => apt.status === 'en-curso').length,
          completadas: todayCitas.filter(apt => apt.status === 'completada').length,
          noShow: todayCitas.filter(apt => apt.status === 'no-show').length,
          promedio: 15
        };

        console.log('📊 Estadísticas:', newStats);

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

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    setTodayAppointments(prev => 
      prev.map(apt => {
        if (apt.id === appointmentId) {
          const updatedApt = { ...apt, status: newStatus as any };
          
          // Si se confirma llegada, agregar hora de llegada
          if (newStatus === 'esperando') {
            updatedApt.arrivalTime = new Date().toLocaleTimeString('es-AR', { 
              timeZone: 'America/Argentina/Buenos_Aires',
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false
            });
          }
          
          return updatedApt;
        }
        return apt;
      })
    );

    // Notificar cambio (aquí se integraría con el backend)
    console.log(`Cita ${appointmentId} cambió a estado: ${newStatus}`);
  };

  const handleNotifyDoctor = (appointment: ReceptionAppointment) => {
    console.log(`Notificando al ${appointment.doctorName} que ${appointment.patientName} está listo`);
    // Aquí se enviaría notificación al doctor
  };

  const getWaitingTime = (appointment: ReceptionAppointment) => {
    if (!appointment.arrivalTime) return '';
    
    try {
      const timeParts = appointment.arrivalTime.split(':');
      if (timeParts.length !== 2) return '';
      
      const arrHours = parseInt(timeParts[0], 10);
      const arrMinutes = parseInt(timeParts[1], 10);
      
      // Validar que sean números válidos
      if (isNaN(arrHours) || isNaN(arrMinutes)) return '';
      
      const nowHours = currentTime.getHours();
      const nowMinutes = currentTime.getMinutes();
      
      const arrivalTotalMinutes = arrHours * 60 + arrMinutes;
      const nowTotalMinutes = nowHours * 60 + nowMinutes;
      const waitingMinutes = nowTotalMinutes - arrivalTotalMinutes;
      
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

        {/* Lista de Citas */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => {
              const statusConfig = getStatusConfig(appointment.status);
              const StatusIcon = statusConfig.icon;
              const waitingTime = getWaitingTime(appointment);

              return (
                <div 
                  key={appointment.id} 
                  className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden ${statusConfig.bgCard}`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      
                      {/* Información principal */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {appointment.patientName}
                            </h3>
                            
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              {statusConfig.text}
                            </div>
                            
                            {appointment.isNewPatient && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Nuevo
                              </span>
                            )}
                            
                            {appointment.priority === 'urgent' && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            
                            {waitingTime && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Espera: {waitingTime}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.time} - {appointment.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4" />
                              <span>{appointment.doctorName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{appointment.consultorio}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{appointment.patientPhone}</span>
                            </div>
                          </div>
                          
                          {appointment.arrivalTime && (
                            <div className="mt-2 text-sm text-green-600">
                              Llegó a las {appointment.arrivalTime}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center space-x-2">
                        
                        {/* Botones de estado */}
                        {appointment.status === 'programada' && (
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'esperando')}
                            className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm inline-flex items-center gap-1"
                          >
                            <Timer className="w-4 h-4" />
                            Confirmar Llegada
                          </button>
                        )}
                        
                        {appointment.status === 'confirmada' && (
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'esperando')}
                            className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm inline-flex items-center gap-1"
                          >
                            <Timer className="w-4 h-4" />
                            En Espera
                          </button>
                        )}
                        
                        {appointment.status === 'esperando' && (
                          <>
                            <button
                              onClick={() => handleNotifyDoctor(appointment)}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm inline-flex items-center gap-1"
                            >
                              <Bell className="w-4 h-4" />
                              Notificar Doctor
                            </button>
                            <button
                              onClick={() => handleStatusChange(appointment.id, 'en-curso')}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm inline-flex items-center gap-1"
                            >
                              <ArrowRight className="w-4 h-4" />
                              Pasar a Consulta
                            </button>
                          </>
                        )}
                        
                        {appointment.status === 'en-curso' && (
                          <div className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm inline-flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            En Consulta
                          </div>
                        )}
                        
                        {appointment.status === 'programada' && (
                          <button
                            onClick={() => handleStatusChange(appointment.id, 'no-show')}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm inline-flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            No Show
                          </button>
                        )}

                        {/* Acciones adicionales */}
                        <Link
                          href={`/historiales/${appointment.patientId}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver historial"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        
                        <Link
                          href={`/secretary/appointments/${appointment.id}/edit`}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Editar cita"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
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
                href="/secretary/appointments/new"
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
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