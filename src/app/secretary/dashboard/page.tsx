'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

// Importar datos fake
import { appointments } from '../../../utils/fake-appointments';
import { patients } from '../../../utils/fake-patients';

interface SecretaryStats {
  citasHoy: number;
  pacientesEsperando: number;
  citasPendientes: number;
  consultasCompletadas: number;
}

interface TodayAppointment {
  id: string;
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

export default function SecretaryDashboard() {
  const [stats, setStats] = useState<SecretaryStats>({
    citasHoy: 0,
    pacientesEsperando: 0,
    citasPendientes: 0,
    consultasCompletadas: 0
  });
  
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSecretaryData = () => {
      const today = '2025-10-20'; // Fecha actual
      
      // Filtrar citas de hoy
      const todayCitas = appointments.filter(apt => apt.fecha === today);
      
      // Procesar citas para el dashboard de secretaria
      const processedAppointments: TodayAppointment[] = todayCitas.map(apt => {
        const patient = patients.find(p => p.id === apt.patientId);
        const patientName = patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente desconocido';
        
        // Simular doctor names basado en ID
        const doctorNames: Record<string, string> = {
          'user_doc_001': 'Dr. Juan Pérez',
          'user_doc_002': 'Dra. María González', 
          'user_doc_003': 'Dr. Carlos Rodríguez'
        };
        
        const specialties: Record<string, string> = {
          'clinica-medica': 'Clínica Médica',
          'cardiologia': 'Cardiología',
          'pediatria': 'Pediatría',
          'dermatologia': 'Dermatología'
        };

        return {
          id: apt.id,
          patientName,
          patientPhone: patient?.telefono || 'N/A',
          doctorName: doctorNames[apt.doctorId] || 'Doctor no asignado',
          specialty: specialties[apt.especialidad] || apt.especialidad,
          time: apt.horaInicio,
          status: apt.estado as TodayAppointment['status'],
          consultorio: apt.consultorio,
          motivo: apt.motivo,
          priority: Math.random() > 0.8 ? 'urgent' as const : 'normal' as const,
          isNewPatient: Math.random() > 0.7
        };
      }).sort((a, b) => a.time.localeCompare(b.time));

      // Calcular estadísticas
      const newStats = {
        citasHoy: todayCitas.length,
        pacientesEsperando: todayCitas.filter(apt => apt.estado === 'confirmada').length,
        citasPendientes: todayCitas.filter(apt => apt.estado === 'programada').length,
        consultasCompletadas: todayCitas.filter(apt => apt.estado === 'completada').length
      };

      setStats(newStats);
      setTodayAppointments(processedAppointments);
      setLoading(false);
    };

    setTimeout(loadSecretaryData, 1000); // Simular carga
  }, []);

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'programada':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'en-curso':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completada':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'programada':
        return <Calendar className="w-4 h-4" />;
      case 'confirmada':
        return <Clock className="w-4 h-4" />;
      case 'en-curso':
        return <Activity className="w-4 h-4" />;
      case 'completada':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelada':
        return <CalendarX className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'programada': return 'Programada';
      case 'confirmada': return 'Paciente esperando';
      case 'en-curso': return 'En consulta';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const handleConfirmArrival = (appointmentId: string) => {
    setTodayAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'confirmada' as const }
          : apt
      )
    );
  };

  const handleCallPatient = (patientPhone: string) => {
    console.log(`Llamando a paciente: ${patientPhone}`);
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
      <div className="bg-white border-b border-gray-200">
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
                href="/secretary/appointments/new"
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
                    href="/secretary/appointments"
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
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusClasses(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            {getStatusText(appointment.status)}
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
                              href={`/secretary/appointments/${appointment.id}`}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Ver detalles"
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
                  href="/secretary/appointments/new"
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
                  href="/secretary/reception"
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
                  href="/pacientes/nuevo"
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
                  href="/secretary/billing"
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
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">3 pacientes esperando</div>
                    <div className="text-xs text-gray-600">Confirmar llegadas pendientes</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Confirmar citas de mañana</div>
                    <div className="text-xs text-gray-600">5 llamadas pendientes</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Cita urgente</div>
                    <div className="text-xs text-gray-600">Dr. Pérez - 15:30</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}