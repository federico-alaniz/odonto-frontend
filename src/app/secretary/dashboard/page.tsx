'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { appointmentsService, Appointment } from '@/services/api/appointments.service';
import { patientsService, Patient } from '@/services/api/patients.service';
import { usersService } from '@/services/api/users.service';
import { User as UserType } from '@/types/roles';
import { dateHelper } from '@/utils/date-helper';
import { getAppointmentStatusConfig } from '@/utils/appointment-status';
import { ConfirmArrivalModal } from '@/components/ConfirmArrivalModal';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Phone,
  UserCheck,
  ClipboardCheck,
  CalendarCheck,
  CalendarX,
  UserPlus,
  Bell,
  TrendingUp,
  Activity,
  Eye,
  FileText,
  PhoneCall
} from 'lucide-react';

interface SecretaryStats {
  citasHoy: number;
  pacientesEsperando: number;
  citasPendientes: number;
  consultasCompletadas: number;
}

interface TodayAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  specialty: string;
  time: string;
  status: 'programada' | 'confirmada' | 'en-curso' | 'completada' | 'cancelada';
  consultorio: string;
  motivo: string;
  priority: 'normal' | 'urgent';
  isNewPatient: boolean;
}

interface Reminder {
  id: string;
  type: 'waiting' | 'confirm' | 'urgent';
  title: string;
  description: string;
  count?: number;
}

export default function SecretaryDashboard() {
  const { currentUser } = useAuth();
  const { buildPath } = useTenant();
  const [stats, setStats] = useState<SecretaryStats>({
    citasHoy: 0,
    pacientesEsperando: 0,
    citasPendientes: 0,
    consultasCompletadas: 0
  });
  
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<TodayAppointment | null>(null);
  const [confirmingArrival, setConfirmingArrival] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadSecretaryData();
    }
  }, [currentUser]);

  const loadSecretaryData = async () => {
    const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
    
    if (!clinicId) {
      console.log('No clinicId available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const today = dateHelper.now();
      const todayString = today.toISOString().split('T')[0];
      
      // Cargar datos en paralelo
      const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
        appointmentsService.getAppointments(clinicId, { limit: 1000 }),
        patientsService.getPatients(clinicId, { limit: 1000 }),
        usersService.getUsers(clinicId, { role: 'doctor', limit: 100 })
      ]);

      const allAppointments = appointmentsRes.data;
      const patients = patientsRes.data;
      const doctors = doctorsRes.data;
      
      // Filtrar citas de hoy
      const todayCitas = allAppointments.filter(apt => apt.fecha === todayString);
      
      // Procesar citas para el dashboard
      const processedAppointments: TodayAppointment[] = todayCitas.map(apt => {
        const patient = patients.find(p => p.id === apt.patientId);
        const doctor = doctors.find(d => d.id === apt.doctorId);
        const patientName = patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente desconocido';
        const doctorName = doctor ? `Dr. ${doctor.nombres} ${doctor.apellidos}` : 'Doctor no asignado';
        const specialty = doctor?.especialidades?.[0] || doctor?.specialization || 'Sin especialidad';

        return {
          id: apt.id,
          patientId: apt.patientId,
          patientName,
          patientPhone: patient?.telefono || 'N/A',
          doctorName,
          specialty,
          time: apt.horaInicio,
          status: apt.estado as TodayAppointment['status'],
          consultorio: doctor?.consultorio || 'Sin consultorio',
          motivo: apt.motivo,
          priority: 'normal' as const,
          isNewPatient: false
        };
      }).sort((a, b) => a.time.localeCompare(b.time));

      // Calcular estadísticas
      const newStats = {
        citasHoy: todayCitas.length,
        pacientesEsperando: todayCitas.filter(apt => apt.estado === 'confirmada').length,
        citasPendientes: todayCitas.filter(apt => apt.estado === 'programada').length,
        consultasCompletadas: todayCitas.filter(apt => apt.estado === 'completada').length
      };

      // Generar recordatorios
      const newReminders: Reminder[] = [];
      
      const waitingCount = todayCitas.filter(apt => apt.estado === 'confirmada').length;
      if (waitingCount > 0) {
        newReminders.push({
          id: 'waiting',
          type: 'waiting',
          title: `${waitingCount} paciente${waitingCount > 1 ? 's' : ''} esperando`,
          description: 'Confirmar llegadas pendientes',
          count: waitingCount
        });
      }

      // Citas de mañana para confirmar
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];
      const tomorrowAppointments = allAppointments.filter(
        apt => apt.fecha === tomorrowString && apt.estado === 'programada'
      );
      
      if (tomorrowAppointments.length > 0) {
        newReminders.push({
          id: 'confirm',
          type: 'confirm',
          title: 'Confirmar citas de mañana',
          description: `${tomorrowAppointments.length} llamada${tomorrowAppointments.length > 1 ? 's' : ''} pendiente${tomorrowAppointments.length > 1 ? 's' : ''}`,
          count: tomorrowAppointments.length
        });
      }

      // Próxima cita urgente (próxima en las siguientes 2 horas)
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const twoHoursLaterTime = `${twoHoursLater.getHours().toString().padStart(2, '0')}:${twoHoursLater.getMinutes().toString().padStart(2, '0')}`;
      
      const upcomingAppointment = todayCitas.find(
        apt => apt.horaInicio >= currentTime && apt.horaInicio <= twoHoursLaterTime && apt.estado === 'programada'
      );
      
      if (upcomingAppointment) {
        const doctor = doctors.find(d => d.id === upcomingAppointment.doctorId);
        const doctorName = doctor ? `Dr. ${doctor.apellidos}` : 'Doctor';
        newReminders.push({
          id: 'urgent',
          type: 'urgent',
          title: 'Próxima cita',
          description: `${doctorName} - ${upcomingAppointment.horaInicio}`
        });
      }

      setStats(newStats);
      setTodayAppointments(processedAppointments);
      setReminders(newReminders);

    } catch (error) {
      console.error('Error loading secretary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmArrival = (appointmentId: string) => {
    const appointment = todayAppointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setConfirmModalOpen(true);
    }
  };

  const handleConfirmWithPayment = async (paymentData: {
    sena: number;
    complemento: number;
    total: number;
    pagado: boolean;
  }) => {
    if (!selectedAppointment || !currentUser) return;

    try {
      setConfirmingArrival(true);
      const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
      const userId = currentUser.id;

      // Actualizar el estado de la cita a 'confirmada'
      await appointmentsService.updateAppointment(
        clinicId,
        userId,
        selectedAppointment.id,
        { 
          estado: 'confirmada',
          notas: `Pago registrado - Seña: $${paymentData.sena.toFixed(2)}, Complemento: $${paymentData.complemento.toFixed(2)}, Total: $${paymentData.total.toFixed(2)}, Pagado: ${paymentData.pagado ? 'Sí' : 'No'}`
        }
      );

      // Actualizar el estado local
      setTodayAppointments(prev => 
        prev.map(apt => 
          apt.id === selectedAppointment.id 
            ? { ...apt, status: 'confirmada' as const }
            : apt
        )
      );

      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        pacientesEsperando: prev.pacientesEsperando + 1,
        citasPendientes: prev.citasPendientes - 1
      }));

      // Cerrar modal
      setConfirmModalOpen(false);
      setSelectedAppointment(null);

      // Recargar datos para reflejar cambios
      await loadSecretaryData();

    } catch (error) {
      console.error('Error confirming arrival:', error);
      alert('Error al confirmar llegada. Por favor intente nuevamente.');
    } finally {
      setConfirmingArrival(false);
    }
  };

  const handleCallPatient = (patientPhone: string) => {
    // Aquí se integraría con sistema de telefonía
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando panel de secretaría...</p>
          </div>
        </div>
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
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Panel de Secretaría</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  Gestión de turnos y recepción de pacientes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={buildPath('/secretary/appointments/new')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-md inline-flex items-center space-x-2"
              >
                <CalendarCheck className="w-5 h-5" />
                <span>Nuevo Turno</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Citas de Hoy</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{stats.citasHoy}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Calendar className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacientes Esperando</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{stats.pacientesEsperando}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <Clock className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{stats.citasPendientes}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <AlertTriangle className="w-7 h-7 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{stats.consultasCompletadas}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Agenda del Día */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CalendarCheck className="w-5 h-5 text-purple-700" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Agenda del Día</h2>
                      <p className="text-sm text-gray-600 mt-1">Turnos programados para hoy</p>
                    </div>
                  </div>
                  <Link 
                    href={buildPath('/secretary/appointments')}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    Ver todos
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {todayAppointments.length > 0 ? (
                    todayAppointments.slice(0, 8).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-purple-600" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {appointment.patientName}
                              </p>
                              {appointment.isNewPatient && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Nuevo
                                </span>
                              )}
                              {appointment.priority === 'urgent' && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {appointment.time}
                              </span>
                              <span>{appointment.doctorName}</span>
                              <span>{appointment.specialty}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getAppointmentStatusConfig(appointment.status).color}`}>
                            {getAppointmentStatusConfig(appointment.status).icon && (() => {
                              const Icon = getAppointmentStatusConfig(appointment.status).icon;
                              return <Icon className="w-4 h-4" />;
                            })()}
                            {getAppointmentStatusConfig(appointment.status).text}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {appointment.status === 'programada' && (
                              <button
                                onClick={() => handleConfirmArrival(appointment.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Confirmar llegada"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleCallPatient(appointment.patientPhone)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Llamar paciente"
                            >
                              <PhoneCall className="w-4 h-4" />
                            </button>
                            
                            <Link
                              href={buildPath(`/secretary/patients/${appointment.patientId}`)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Ver paciente"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No hay citas programadas para hoy</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Panel Lateral - Acciones Rápidas */}
          <div className="space-y-6">
            
            {/* Acciones Rápidas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <Link
                  href={buildPath('/secretary/appointments/new')}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CalendarCheck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Nuevo Turno</div>
                    <div className="text-sm text-gray-600">Agendar cita</div>
                  </div>
                </Link>

                <Link
                  href={buildPath('/secretary/reception')}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Recepción</div>
                    <div className="text-sm text-gray-600">Confirmar llegadas</div>
                  </div>
                </Link>

                <Link
                  href={buildPath('/pacientes/nuevo')}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Nuevo Paciente</div>
                    <div className="text-sm text-gray-600">Registrar paciente</div>
                  </div>
                </Link>

                <Link
                  href={buildPath('/secretary/billing')}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Facturación</div>
                    <div className="text-sm text-gray-600">Gestionar pagos</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Notificaciones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Bell className="w-5 h-5 text-yellow-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Recordatorios</h3>
                </div>
              </div>
              
              <div className="p-6 space-y-3">
                {reminders.length > 0 ? (
                  reminders.map(reminder => {
                    const bgColor = reminder.type === 'waiting' ? 'bg-yellow-50' : 
                                   reminder.type === 'confirm' ? 'bg-blue-50' : 'bg-red-50';
                    const iconColor = reminder.type === 'waiting' ? 'text-yellow-600' : 
                                     reminder.type === 'confirm' ? 'text-blue-600' : 'text-red-600';
                    const Icon = reminder.type === 'waiting' ? Clock : 
                                reminder.type === 'confirm' ? Phone : AlertTriangle;
                    
                    return (
                      <div key={reminder.id} className={`flex items-start gap-3 p-3 ${bgColor} rounded-lg`}>
                        <Icon className={`w-5 h-5 ${iconColor} mt-0.5`} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{reminder.title}</div>
                          <div className="text-xs text-gray-600">{reminder.description}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No hay recordatorios pendientes</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Modal de confirmación de llegada */}
      {selectedAppointment && (
        <ConfirmArrivalModal
          isOpen={confirmModalOpen}
          onClose={() => {
            setConfirmModalOpen(false);
            setSelectedAppointment(null);
          }}
          onConfirm={handleConfirmWithPayment}
          patientName={selectedAppointment.patientName}
          appointmentTime={selectedAppointment.time}
          loading={confirmingArrival}
        />
      )}
    </div>
  );
}