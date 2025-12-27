'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  Clock, 
  Stethoscope,
  Activity,
  TestTube,
  FileText,
  CheckCircle,
  Info,
  ClipboardCheck,
  PlayCircle,
  UserCheck,
  AlertCircle,
  type LucideIcon
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useConsultation } from '@/contexts/ConsultationContext';
import { appointmentsService } from '@/services/api/appointments.service';
import { patientsService } from '@/services/api/patients.service';
import { dateHelper } from '@/utils/date-helper';
import { useToast } from '@/components/ui/ToastProvider';

export default function DoctorDashboard() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { startConsultation } = useConsultation();
  const { showSuccess, showError } = useToast();
  const [doctorName, setDoctorName] = useState('Doctor');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<Array<{
    id: string;
    patientId: string;
    patientName: string;
    fecha: string;
    horaInicio: string;
    motivo: string;
    estado: string;
    waitingTime: string;
    consultorio: string;
    tipo: string;
  }>>([]);

  const [stats, setStats] = useState({
    total: 0,
    confirmadas: 0,
    enCurso: 0,
    completadas: 0
  });

  useEffect(() => {
    // Cargar datos del usuario logueado
    const userName = localStorage.getItem('userName') || 'Doctor';
    const userSpecialty = localStorage.getItem('userSpecialty') || '';
    setDoctorName(userName);
    setDoctorSpecialty(userSpecialty);
    
    loadDashboardData();
  }, []);

  // Actualizar hora actual cada minuto para recalcular tiempos de espera
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    const currentDoctorId = (currentUser as any)?.id;
    const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
    const today = dateHelper.today();
    
    if (!currentDoctorId || !clinicId) return;
    
    try {
      // Cargar citas y pacientes
      const [appointmentsResponse, patientsResponse] = await Promise.all([
        appointmentsService.getAppointments(clinicId, { 
          doctorId: currentDoctorId,
          limit: 200
        }),
        patientsService.getPatients(clinicId)
      ]);

      const appointmentsData = appointmentsResponse.data;
      const patientsData = patientsResponse.data;

      // Filtrar citas del doctor desde hoy en adelante
      const futureAppointments = appointmentsData
        .filter((apt: any) => 
          apt.doctorId === currentDoctorId && 
          !apt.deletedAt &&
          apt.fecha >= today &&
          apt.estado !== 'cancelada' &&
          apt.estado !== 'no-show'
        )
        .sort((a: any, b: any) => {
          if (a.fecha === b.fecha) {
            return a.horaInicio.localeCompare(b.horaInicio);
          }
          return a.fecha.localeCompare(b.fecha);
        })
        .map((apt: any) => {
          const patient = patientsData.find((p: any) => p.id === apt.patientId);
          const patientName = patient 
            ? `${patient.nombres} ${patient.apellidos}` 
            : 'Paciente desconocido';
          
          return {
            id: apt.id,
            patientId: apt.patientId,
            patientName,
            fecha: apt.fecha,
            horaInicio: apt.horaInicio,
            motivo: apt.motivo || 'Consulta general',
            estado: apt.estado,
            waitingTime: (apt.estado === 'confirmada' || apt.estado === 'esperando') 
              ? calculateWaitingTime(apt) 
              : '',
            consultorio: apt.consultorio || 'N/A',
            tipo: apt.tipo || 'Consulta'
          };
        });

      setUpcomingAppointments(futureAppointments);

      // Calcular estadísticas
      const newStats = {
        total: futureAppointments.length,
        confirmadas: futureAppointments.filter((apt: any) => 
          apt.estado === 'confirmada' || apt.estado === 'esperando'
        ).length,
        enCurso: futureAppointments.filter((apt: any) => apt.estado === 'en-curso').length,
        completadas: futureAppointments.filter((apt: any) => apt.estado === 'completada').length
      };

      setStats(newStats);

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    }
  };

  const calculateWaitingTime = (appointment: any): string => {
    // Extraer información de pago de las notas para obtener el timestamp de confirmación
    if (!appointment.notas || !appointment.notas.includes('Pago registrado')) {
      return '0 min';
    }

    // El updatedAt de la cita es cuando se confirmó la llegada
    // Usar la hora actual para calcular el tiempo transcurrido
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

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'programada':
        return {
          text: 'Programada',
          className: 'bg-blue-100 text-blue-800 border border-blue-200'
        };
      case 'confirmada':
        return {
          text: 'Confirmada',
          className: 'bg-orange-100 text-orange-800 border border-orange-200'
        };
      case 'esperando':
        return {
          text: 'Esperando',
          className: 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        };
      case 'en-curso':
        return {
          text: 'En Consulta',
          className: 'bg-green-100 text-green-800 border border-green-200'
        };
      case 'completada':
        return {
          text: 'Completada',
          className: 'bg-gray-100 text-gray-800 border border-gray-200'
        };
      default:
        return {
          text: estado,
          className: 'bg-gray-100 text-gray-800 border border-gray-200'
        };
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleStartConsultation = async (appointmentId: string, patientId: string, patientName: string) => {
    const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
    const userId = (currentUser as any)?.id;
    
    if (!clinicId || !userId) {
      showError('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    try {
      // Cambiar el estado de la cita a 'en_curso'
      const response = await appointmentsService.updateAppointment(
        clinicId,
        userId,
        appointmentId,
        { estado: 'en_curso' }
      );

      if (response.success) {
        // Activar el temporizador de consulta
        startConsultation(appointmentId, patientId, patientName);
        
        // Navegar a la historia clínica del paciente
        router.push(`/doctor/patients/${patientId}/medical-record?appointmentId=${appointmentId}`);
        
        showSuccess('Consulta iniciada', 'El temporizador de consulta está activo');
      } else {
        throw new Error(response.message || 'Error al iniciar la consulta');
      }
    } catch (error: any) {
      console.error('Error iniciando consulta:', error);
      showError('Error', error.message || 'No se pudo iniciar la consulta');
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Médico</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Panel de control para funciones clínicas y diagnósticos
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>{doctorName}</span>
                {doctorSpecialty && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">{doctorSpecialty}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Citas</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 text-blue-700 border border-gray-200">
                <Calendar className="w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{stats.confirmadas}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200">
                <UserCheck className="w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Curso</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{stats.enCurso}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-700 border border-green-200">
                <Activity className="w-7 h-7" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{stats.completadas}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 text-gray-700 border border-gray-200">
                <CheckCircle className="w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Citas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Mis Citas Programadas</h2>
                <p className="text-sm text-gray-600 mt-1">Todas las citas desde hoy en adelante</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hora</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tiempo Espera</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => {
                    const statusBadge = getStatusBadge(appointment.estado);
                    const canStartConsultation = appointment.estado === 'confirmada' || appointment.estado === 'esperando';
                    
                    return (
                      <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(appointment.fecha)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {appointment.horaInicio}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appointment.patientName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {appointment.motivo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.className}`}>
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {appointment.waitingTime ? (
                            <span className="inline-flex items-center gap-1 text-orange-600 font-medium">
                              <Clock className="w-4 h-4" />
                              {appointment.waitingTime}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {canStartConsultation ? (
                            <button
                              onClick={() => handleStartConsultation(appointment.id, appointment.patientId, appointment.patientName)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                            >
                              <PlayCircle className="w-4 h-4" />
                              Iniciar Consulta
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium text-lg">No hay citas programadas</p>
                      <p className="text-sm text-gray-400 mt-2">Las citas futuras aparecerán aquí</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}