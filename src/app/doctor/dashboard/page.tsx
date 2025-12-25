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
import { appointmentsService } from '@/services/api/appointments.service';
import { patientsService } from '@/services/api/patients.service';
import { dateHelper } from '@/utils/date-helper';
import { DebugDateControl } from '@/components/DebugDateControl';

export default function DoctorDashboard() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [doctorName, setDoctorName] = useState('Doctor');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [stats, setStats] = useState([
    { label: 'Mis Pacientes Hoy', value: '0', icon: Users, color: 'blue' },
    { label: 'Pacientes Esperando', value: '0', icon: UserCheck, color: 'yellow' },
    { label: 'Resultados Lab', value: '0', icon: TestTube, color: 'blue' },
    { label: 'Prescripciones', value: '0', icon: FileText, color: 'green' }
  ]);

  const [waitingPatients, setWaitingPatients] = useState<Array<{
    id: string;
    patient: string;
    patientId: string;
    time: string;
    specialty: string;
    reason: string;
    waitingTime: string;
    priority: 'normal' | 'urgent';
    consultorio: string;
  }>>([]);

  const [myPatients, setMyPatients] = useState<Array<{
    patient: string;
    time: string;
    type: string;
    status: string;
    icon: LucideIcon;
    urgency: 'low' | 'medium' | 'high';
  }>>([]);

  const [pendingResults, setPendingResults] = useState<Array<{
    patient: string;
    test: string;
    requestDate: string;
    priority: 'normal' | 'urgent';
    icon: LucideIcon;
  }>>([]);

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
      // Cargar citas y pacientes (solicitar más citas para cubrir todo el mes)
      const [appointmentsResponse, patientsResponse] = await Promise.all([
        appointmentsService.getAppointments(clinicId, { 
          doctorId: currentDoctorId,
          limit: 200  // Aumentar límite para obtener todas las citas del mes
        }),
        patientsService.getPatients(clinicId)
      ]);

      const appointmentsData = appointmentsResponse.data;
      const patientsData = patientsResponse.data;

      // Filtrar citas del doctor
      const doctorAppointments = appointmentsData.filter((apt: any) => 
        apt.doctorId === currentDoctorId && !apt.deletedAt
      );

      // Citas de hoy
      const todayAppointments = doctorAppointments.filter((apt: any) => 
        apt.fecha === today
      );

      const stats = {
        doctorAppointmentsDates: doctorAppointments.map((a: any) => a.fecha)
      };

      // Pacientes esperando (confirmadas o en espera)
      const waitingCount = doctorAppointments.filter((apt: any) => 
        apt.estado === 'confirmada' || apt.estado === 'esperando'
      ).length;

      // Actualizar stats
      setStats([
        { 
          label: 'Mis Pacientes Hoy', 
          value: todayAppointments.length.toString(), 
          icon: Users, 
          color: 'blue' 
        },
        { 
          label: 'Pacientes Esperando', 
          value: waitingCount.toString(), 
          icon: UserCheck, 
          color: 'yellow' 
        },
        { 
          label: 'Resultados Lab', 
          value: '0', 
          icon: TestTube, 
          color: 'purple' 
        },
        { 
          label: 'Prescripciones', 
          value: '0', 
          icon: FileText, 
          color: 'green' 
        }
      ]);

      // Calcular pacientes esperando
      calculateWaitingPatients(doctorAppointments, patientsData);

      // Calcular pacientes de hoy
      calculateMyPatientsToday(todayAppointments, patientsData);

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

  const calculateWaitingPatients = (appointments: any[], patients: any[]) => {
    const waiting = appointments
      .filter((apt: any) => apt.estado === 'confirmada' || apt.estado === 'esperando')
      .sort((a: any, b: any) => a.horaInicio.localeCompare(b.horaInicio))
      .map((apt: any) => {
        const patient = patients.find((p: any) => p.id === apt.patientId);
        const patientName = patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente desconocido';
        
        return {
          id: apt.id,
          patient: patientName,
          patientId: apt.patientId,
          time: apt.horaInicio,
          specialty: apt.tipo || 'Consulta',
          reason: apt.motivo,
          waitingTime: calculateWaitingTime(apt),
          priority: 'normal' as const,
          consultorio: apt.consultorio || 'Consultorio 1'
        };
      });

    setWaitingPatients(waiting);
  };

  const calculateMyPatientsToday = (appointments: any[], patients: any[]) => {
    const myPatientsData = appointments
      .sort((a: any, b: any) => a.horaInicio.localeCompare(b.horaInicio))
      .slice(0, 6)
      .map((apt: any) => {
        const patient = patients.find((p: any) => p.id === apt.patientId);
        const patientName = patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente desconocido';
        
        let status, icon, urgency: 'low' | 'medium' | 'high';
        
        switch (apt.estado) {
          case 'completada':
            status = 'Completada';
            icon = CheckCircle;
            urgency = 'low';
            break;
          case 'en-curso':
            status = 'En consulta';
            icon = Activity;
            urgency = 'high';
            break;
          case 'confirmada':
            status = 'Confirmada';
            icon = ClipboardCheck;
            urgency = 'medium';
            break;
          case 'esperando':
            status = 'Esperando';
            icon = UserCheck;
            urgency = 'high';
            break;
          default:
            status = 'Programada';
            icon = Calendar;
            urgency = 'low';
        }

        return {
          patient: `${patientName} - ${apt.horaInicio}`,
          time: apt.horaInicio,
          type: apt.tipo || 'Consulta',
          status,
          icon,
          urgency
        };
      });

    setMyPatients(myPatientsData);
  };

  const handleStartConsultation = (appointmentId: string, patientId: string) => {
    // Navegar a la historia clínica del paciente
    router.push(`/doctor/patients/${patientId}/medical-record?appointmentId=${appointmentId}`);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-gray-50 text-blue-700 border border-gray-200',
      green: 'bg-green-50 text-green-700 border border-green-200',
      yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      purple: 'bg-gray-50 text-blue-700 border border-gray-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTypeClasses = (type: string) => {
    const types = {
      success: 'bg-green-100 text-green-800',
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    return types[type as keyof typeof types] || types.info;
  };

  const getUrgencyClasses = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'high':
        return 'border-l-4 border-l-blue-600 bg-blue-50';
      case 'medium':
        return 'border-l-4 border-l-blue-400 bg-gray-50';
      default:
        return 'border-l-4 border-l-gray-300 bg-white';
    }
  };

  const getPriorityClasses = (priority: 'normal' | 'urgent') => {
    return priority === 'urgent' 
      ? 'border-l-4 border-l-red-500 bg-red-50'
      : 'border-l-4 border-l-gray-500 bg-gray-50';
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
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Pacientes Esperando */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserCheck className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Pacientes Esperando</h2>
                    <p className="text-sm text-gray-600 mt-1">Pacientes confirmados listos para consulta</p>
                  </div>
                </div>
                {waitingPatients.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span>{waitingPatients.length} esperando</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {waitingPatients.length > 0 ? (
                  waitingPatients.map((patient) => (
                    <div key={patient.id} className="p-5 rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between gap-4">
                        {/* Información del paciente */}
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 rounded-full bg-blue-100">
                            <Users className="w-7 h-7 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">
                              {patient.patient}
                            </h3>
                            <div className="flex items-center gap-6 text-sm">
                              <span className="flex items-center gap-1.5 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">Turno:</span> {patient.time}
                              </span>
                              <span className="flex items-center gap-1.5 text-orange-600">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">Esperando:</span> {patient.waitingTime}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium text-gray-700">Motivo:</span> {patient.reason}
                            </p>
                          </div>
                        </div>

                        {/* Botón de acción */}
                        <button
                          onClick={() => handleStartConsultation(patient.id, patient.patientId)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Iniciar Consulta
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-lg">No hay pacientes esperando</p>
                    <p className="text-sm text-gray-400 mt-2">Los pacientes confirmados aparecerán aquí cuando lleguen</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mis Pacientes Hoy */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Mis Pacientes Hoy</h2>
                    <p className="text-sm text-gray-600 mt-1">Citas programadas para hoy</p>
                  </div>
                </div>
                {myPatients.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                    <Users className="w-4 h-4" />
                    <span>{myPatients.length} pacientes</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {myPatients.length > 0 ? (
                  myPatients.map((patient, index) => {
                    const IconComponent = patient.icon;
                    return (
                      <div key={index} className="p-5 rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-full bg-blue-100">
                              <IconComponent className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {patient.patient}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {patient.type}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                              patient.status === 'Completada' ? 'bg-green-100 text-green-800 border border-green-200' :
                              patient.status === 'En consulta' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              patient.status === 'Confirmada' ? 'bg-yellow-100 text-yellow-900 border border-yellow-200' :
                              patient.status === 'Esperando' ? 'bg-orange-100 text-orange-900 border border-orange-200' :
                              'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {patient.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-lg">No hay pacientes para hoy</p>
                    <p className="text-sm text-gray-400 mt-2">Las citas programadas aparecerán aquí</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resultados de Laboratorio */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TestTube className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Resultados de Laboratorio</h2>
                  <p className="text-sm text-gray-600 mt-1">Estudios pendientes de revisión</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingResults.map((result, index) => {
                  const IconComponent = result.icon;
                  return (
                    <div key={index} className={`p-4 rounded-lg ${getPriorityClasses(result.priority)} hover:bg-opacity-80 transition-colors`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`w-5 h-5 ${
                            result.priority === 'urgent' ? 'text-red-600' : 'text-blue-600'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900">
                              {result.patient}
                            </p>
                            <p className="text-sm text-gray-600">
                              {result.test}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            result.priority === 'urgent' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {result.priority === 'urgent' ? 'Urgente' : 'Normal'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {result.requestDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Acciones Rápidas</h2>
                <p className="text-sm text-gray-600 mt-1">Funciones médicas principales</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <Link href="/doctor/patients" className="group block">
                <div className="p-4 text-left rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Ver Pacientes</div>
                      <div className="text-sm text-gray-600">Gestionar pacientes asignados</div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/doctor/consultations" className="group block">
                <div className="p-4 text-left rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Nueva Consulta</div>
                      <div className="text-sm text-gray-600">Iniciar consulta médica</div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/doctor/prescriptions" className="group block">
                <div className="p-4 text-left rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Prescripciones</div>
                      <div className="text-sm text-gray-600">Gestionar recetas médicas</div>
                    </div>
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </div>

      </div>
      
      {/* Control de fecha debug */}
      <DebugDateControl />
    </div>
  );
}