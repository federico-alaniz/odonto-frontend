'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

// Importar datos fake
import { patients } from '../../../utils/fake-patients';
import { appointments } from '../../../utils/fake-appointments';

export default function DoctorDashboard() {
  const [stats, setStats] = useState([
    { label: 'Mis Pacientes Hoy', value: '0', icon: Users, color: 'blue' },
    { label: 'Pacientes Esperando', value: '0', icon: UserCheck, color: 'yellow' },
    { label: 'Resultados Lab', value: '0', icon: TestTube, color: 'purple' },
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
    // Simular doctor ID actual (en real vendrá del contexto de auth)
    const currentDoctorId = 'user_doc_001'; // Corregido para que coincida con fake-appointments
    const today = '2025-10-20';

    // Calcular estadísticas específicas del doctor
    const calculateDoctorStats = () => {
      // 1. Pacientes asignados al doctor hoy
      const doctorAppointmentsToday = appointments.filter(apt => 
        apt.fecha === today && apt.doctorId === currentDoctorId
      );

      // 2. Pacientes esperando (confirmados)
      const waitingPatientsCount = appointments.filter(apt => 
        apt.doctorId === currentDoctorId &&
        apt.estado === 'confirmada'
      );

      // 3. Resultados de laboratorio pendientes (simulado)
      const pendingLabResults = Math.floor(Math.random() * 8) + 2; // 2-10 resultados

      // 4. Prescripciones activas (simulado) 
      const activePrescriptions = Math.floor(Math.random() * 15) + 5; // 5-20 prescripciones

      setStats([
        { 
          label: 'Mis Pacientes Hoy', 
          value: doctorAppointmentsToday.length.toString(), 
          icon: Users, 
          color: 'blue' 
        },
        { 
          label: 'Pacientes Esperando', 
          value: waitingPatientsCount.length.toString(), 
          icon: UserCheck, 
          color: 'yellow' 
        },
        { 
          label: 'Resultados Lab', 
          value: pendingLabResults.toString(), 
          icon: TestTube, 
          color: 'purple' 
        },
        { 
          label: 'Prescripciones', 
          value: activePrescriptions.toString(), 
          icon: FileText, 
          color: 'green' 
        }
      ]);
    };

    // Calcular pacientes esperando del doctor
    const calculateWaitingPatients = () => {
      const doctorWaitingAppointments = appointments
        .filter(apt => apt.doctorId === currentDoctorId && apt.estado === 'confirmada')
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
        .map(apt => {
          const patient = patients.find(p => p.id === apt.patientId);
          const patientName = patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente desconocido';
          
          // Calcular tiempo de espera simulado
          const appointmentTime = new Date(`2025-10-20 ${apt.horaInicio}`);
          const currentTime = new Date(`2025-10-20 15:30`); // Tiempo actual simulado
          const waitingMinutes = Math.max(0, Math.floor((currentTime.getTime() - appointmentTime.getTime()) / (1000 * 60)));
          
          const specialties: Record<string, string> = {
            'clinica-medica': 'Clínica Médica',
            'cardiologia': 'Cardiología',
            'pediatria': 'Pediatría',
            'dermatologia': 'Dermatología'
          };

          return {
            id: apt.id,
            patient: patientName,
            patientId: apt.patientId,
            time: apt.horaInicio,
            specialty: specialties[apt.especialidad] || apt.especialidad,
            reason: apt.motivo,
            waitingTime: waitingMinutes > 0 ? `${waitingMinutes} min` : 'Recién llegó',
            priority: waitingMinutes > 30 ? 'urgent' as const : 'normal' as const,
            consultorio: apt.consultorio
          };
        });

      setWaitingPatients(doctorWaitingAppointments);
    };

    // Calcular pacientes de hoy del doctor
    const calculateMyPatientsToday = () => {
      const doctorAppointmentsToday = appointments
        .filter(apt => apt.fecha === today && apt.doctorId === currentDoctorId)
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
        .slice(0, 6) // Mostrar máximo 6
        .map(apt => {
          const patient = patients.find(p => p.id === apt.patientId);
          const patientName = patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente desconocido';
          
          let type, status, icon, urgency: 'low' | 'medium' | 'high';
          
          switch (apt.estado) {
            case 'completada':
              type = 'success';
              status = 'Completada';
              icon = CheckCircle;
              urgency = 'low';
              break;
            case 'en-curso':
              type = 'info';
              status = 'En consulta';
              icon = Activity;
              urgency = 'high';
              break;
            case 'confirmada':
              type = 'warning';
              status = 'Confirmada';
              icon = ClipboardCheck;
              urgency = 'medium';
              break;
            case 'programada':
              type = 'info';
              status = 'Programada';
              icon = Calendar;
              urgency = 'low';
              break;
            default:
              type = 'info';
              status = 'Pendiente';
              icon = Clock;
              urgency = 'medium';
          }

          return {
            patient: patientName,
            time: apt.horaInicio,
            type,
            status,
            icon,
            urgency
          };
        });

      setMyPatients(doctorAppointmentsToday);
    };

    // Simular resultados de laboratorio pendientes
    const generatePendingLabResults = () => {
      const labTests = [
        'Hemograma Completo',
        'Glucemia en Ayunas',
        'Perfil Lipídico',
        'Función Renal',
        'Perfil Tiroideo',
        'Electrocardiograma',
        'Radiografía de Tórax',
        'Ecografía Abdominal'
      ];

      const mockResults = labTests.slice(0, 4).map((test, index) => {
        const patient = patients[index % patients.length];
        return {
          patient: `${patient.nombres} ${patient.apellidos}`,
          test,
          requestDate: '2025-10-18',
          priority: Math.random() > 0.7 ? 'urgent' as const : 'normal' as const,
          icon: TestTube
        };
      });

      setPendingResults(mockResults);
    };

    calculateDoctorStats();
    calculateWaitingPatients();
    generatePendingLabResults();
  }, []);

  const handleStartConsultation = (appointmentId: string, patientId: string) => {
    // Navegar a la nueva consulta con los datos del paciente
    window.location.href = `/doctor/consultations/new?appointmentId=${appointmentId}&patientId=${patientId}`;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border border-blue-200',
      green: 'bg-green-50 text-green-700 border border-green-200',
      yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      purple: 'bg-purple-50 text-purple-700 border border-purple-200'
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
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-l-green-500 bg-green-50';
    }
  };

  const getPriorityClasses = (priority: 'normal' | 'urgent') => {
    return priority === 'urgent' 
      ? 'border-l-4 border-l-red-500 bg-red-50'
      : 'border-l-4 border-l-blue-500 bg-blue-50';
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
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
                <span>Dr. Juan Pérez</span>
                <span>•</span>
                <span className="text-green-600 font-medium">Cardiología</span>
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
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-200 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <UserCheck className="w-5 h-5 text-yellow-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Pacientes Esperando</h2>
                    <p className="text-sm text-gray-600 mt-1">Pacientes confirmados listos para consulta</p>
                  </div>
                </div>
                {waitingPatients.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
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
                    <div key={patient.id} className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      patient.priority === 'urgent' 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-full ${
                            patient.priority === 'urgent' 
                              ? 'bg-red-100' 
                              : 'bg-blue-100'
                          }`}>
                            <Users className={`w-6 h-6 ${
                              patient.priority === 'urgent' 
                                ? 'text-red-600' 
                                : 'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">
                                {patient.patient}
                              </p>
                              {patient.priority === 'urgent' && (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Turno: {patient.time}
                              </span>
                              <span>Esperando: {patient.waitingTime}</span>
                              <span>Consultorio: {patient.consultorio}</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-medium">Motivo:</span> {patient.reason}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartConsultation(patient.id, patient.patientId)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Iniciar Consulta
                          </button>
                        </div>
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

          {/* Resultados de Laboratorio */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TestTube className="w-5 h-5 text-purple-700" />
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
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-700" />
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
                <div className="p-4 text-left rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Stethoscope className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Nueva Consulta</div>
                      <div className="text-sm text-gray-600">Iniciar consulta médica</div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/doctor/prescriptions" className="group block">
                <div className="p-4 text-left rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <FileText className="w-5 h-5 text-purple-600" />
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
    </div>
  );
}