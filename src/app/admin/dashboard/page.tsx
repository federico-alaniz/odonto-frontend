'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Activity,
  UserCheck,
  Clock,
  AlertCircle,
  DollarSign,
  Stethoscope,
  FileText,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  Download,
  Filter,
  X,
  CheckSquare,
  Square,
  ChevronDown,
  Zap
} from 'lucide-react';
import { appointmentsService } from '@/services/api/appointments.service';
import { patientsService } from '@/services/api/patients.service';
import { usersService } from '@/services/api/users.service';

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

interface AppointmentBySpecialty {
  specialty: string;
  count: number;
  percentage: number;
}

interface DailyAppointment {
  day: string;
  count: number;
}

interface PeakHour {
  hour: string;
  count: number;
  percentage: number;
}

interface DoctorStats {
  doctorId: string;
  doctorName: string;
  totalAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  averageDuration: number;
  occupancyRate: number;
}

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [appointmentsBySpecialty, setAppointmentsBySpecialty] = useState<AppointmentBySpecialty[]>([]);
  const [dailyAppointments, setDailyAppointments] = useState<DailyAppointment[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Nuevos estados para filtros
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [showDoctorFilter, setShowDoctorFilter] = useState(false);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [doctorStats, setDoctorStats] = useState<DoctorStats[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (appointments.length > 0) {
      calculateStats();
      calculateAppointmentsBySpecialty();
      calculateDailyAppointments();
      loadRecentAppointments();
      calculatePeakHours();
      calculateDoctorStats();
    }
  }, [appointments, users, patients, selectedDoctors]);

  // Obtener lista de doctores activos
  const doctors = useMemo(() => {
    return users.filter(u => u.role === 'doctor' || (u.role === 'admin' && u.isDoctor));
  }, [users]);

  // Filtrar appointments según doctores seleccionados
  const filteredAppointments = useMemo(() => {
    if (selectedDoctors.length === 0) {
      return appointments;
    }
    return appointments.filter(apt => selectedDoctors.includes(apt.doctorId));
  }, [appointments, selectedDoctors]);

  const loadDashboardData = async () => {
    const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
    if (!clinicId) return;
    
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [appointmentsRes, usersRes, patientsRes] = await Promise.all([
        appointmentsService.getAppointments(clinicId, { limit: 500 }),
        usersService.getUsers(clinicId),
        patientsService.getPatients(clinicId, { limit: 500 })
      ]);

      if (appointmentsRes.success && appointmentsRes.data) {
        setAppointments(appointmentsRes.data);
      }
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
      if (patientsRes.success && patientsRes.data) {
        setPatients(patientsRes.data);
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    // Total de pacientes
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.estado === 'activo').length;

    // Total de doctores (incluyendo admins que son doctores)
    const totalDoctors = doctors.length;
    const activeDoctors = doctors.filter(d => d.estado === 'activo').length;

    // Turnos del mes actual (filtrados)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyAppointments = filteredAppointments.filter(apt => {
      const aptDate = new Date(apt.fecha);
      return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
    }).length;

    // Turnos pendientes (próximos) - filtrados
    const today = new Date().toISOString().split('T')[0];
    const pendingAppointments = filteredAppointments.filter(apt => 
      apt.fecha >= today && (apt.estado === 'confirmada' || apt.estado === 'programada')
    ).length;

    // Tasa de ocupación (simulada)
    const occupancyRate = Math.round((monthlyAppointments / (activeDoctors * 160)) * 100);

    const statsData: StatCard[] = [
      {
        title: 'Total Pacientes',
        value: totalPatients,
        change: 12,
        changeType: 'increase',
        icon: <Users className="w-6 h-6" />,
        color: 'from-blue-500 to-blue-600'
      },
      {
        title: 'Doctores Activos',
        value: activeDoctors,
        change: 5,
        changeType: 'increase',
        icon: <Stethoscope className="w-6 h-6" />,
        color: 'from-blue-500 to-blue-600'
      },
      {
        title: 'Turnos del Mes',
        value: monthlyAppointments,
        change: 18,
        changeType: 'increase',
        icon: <Calendar className="w-6 h-6" />,
        color: 'from-blue-400 to-blue-500'
      },
      {
        title: 'Turnos Pendientes',
        value: pendingAppointments,
        change: 3,
        changeType: 'decrease',
        icon: <Clock className="w-6 h-6" />,
        color: 'from-gray-400 to-gray-500'
      },
      {
        title: 'Tasa de Ocupación',
        value: `${occupancyRate}%`,
        change: 8,
        changeType: 'increase',
        icon: <Activity className="w-6 h-6" />,
        color: 'from-gray-500 to-gray-600'
      },
      {
        title: 'Ingresos del Mes',
        value: '$' + (monthlyAppointments * 5000).toLocaleString(),
        change: 15,
        changeType: 'increase',
        icon: <DollarSign className="w-6 h-6" />,
        color: 'from-blue-600 to-blue-700'
      }
    ];

    setStats(statsData);
  };

  const calculateAppointmentsBySpecialty = () => {
    const specialtyCount: Record<string, number> = {};
    
    filteredAppointments.forEach(apt => {
      const doctor = users.find(u => u.id === apt.doctorId);
      if (doctor && doctor.especialidades) {
        const specialty = doctor.especialidades[0];
        specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
      }
    });

    const total = Object.values(specialtyCount).reduce((sum, count) => sum + count, 0);
    
    const specialtyData = Object.entries(specialtyCount)
      .map(([specialty, count]) => ({
        specialty: getSpecialtyName(specialty),
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    setAppointmentsBySpecialty(specialtyData);
  };

  const calculateDailyAppointments = () => {
    const last7Days: DailyAppointment[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = filteredAppointments.filter(apt => apt.fecha === dateStr).length;
      
      last7Days.push({
        day: date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' }),
        count
      });
    }

    setDailyAppointments(last7Days);
  };

  const loadRecentAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    const recent = filteredAppointments
      .filter(apt => apt.fecha >= today)
      .sort((a, b) => {
        if (a.fecha === b.fecha) {
          return a.horaInicio.localeCompare(b.horaInicio);
        }
        return a.fecha.localeCompare(b.fecha);
      })
      .slice(0, 5);

    setRecentAppointments(recent);
  };

  const calculatePeakHours = () => {
    const hourCount: Record<string, number> = {};
    
    filteredAppointments.forEach(apt => {
      const hour = apt.horaInicio.split(':')[0];
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });

    const total = Object.values(hourCount).reduce((sum, count) => sum + count, 0);
    
    const peakData = Object.entries(hourCount)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    setPeakHours(peakData);
  };

  const calculateDoctorStats = () => {
    const doctorsToAnalyze = selectedDoctors.length > 0 
      ? doctors.filter(d => selectedDoctors.includes(d.id))
      : doctors;

    const statsData: DoctorStats[] = doctorsToAnalyze.map(doctor => {
      const doctorAppointments = appointments.filter(apt => apt.doctorId === doctor.id);
      const completed = doctorAppointments.filter(apt => apt.estado === 'completada').length;
      const canceled = doctorAppointments.filter(apt => apt.estado === 'cancelada').length;
      
      // Calcular tasa de ocupación (simulada basada en turnos del mes)
      const currentMonth = new Date().getMonth();
      const monthlyAppointments = doctorAppointments.filter(apt => {
        const aptDate = new Date(apt.fecha);
        return aptDate.getMonth() === currentMonth;
      }).length;
      const occupancyRate = Math.min(Math.round((monthlyAppointments / 160) * 100), 100);

      return {
        doctorId: doctor.id,
        doctorName: `${doctor.nombres} ${doctor.apellidos}`,
        totalAppointments: doctorAppointments.length,
        completedAppointments: completed,
        canceledAppointments: canceled,
        averageDuration: 30, // Simulado
        occupancyRate
      };
    }).sort((a, b) => b.totalAppointments - a.totalAppointments);

    setDoctorStats(statsData);
  };

  const getSpecialtyName = (specialty: string): string => {
    const names: Record<string, string> = {
      'clinica-medica': 'Clínica Médica',
      'medicina-interna': 'Medicina Interna',
      'cardiologia': 'Cardiología',
      'pediatria': 'Pediatría',
      'dermatologia': 'Dermatología',
      'ginecologia': 'Ginecología',
      'obstetricia': 'Obstetricia',
      'odontologia': 'Odontología',
      'cirugia-oral': 'Cirugía Oral',
      'traumatologia': 'Traumatología',
      'ortopedia': 'Ortopedia',
      'psiquiatria': 'Psiquiatría'
    };
    return names[specialty] || specialty;
  };

  const getPatientName = (patientId: string): string => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return 'Paciente';
    return `${patient.nombres || ''} ${patient.apellidos || ''}`.trim() || 'Paciente';
  };

  const getDoctorName = (doctorId: string): string => {
    const doctor = users.find(u => u.id === doctorId);
    if (!doctor) return 'Doctor';
    return `${doctor.nombres || ''} ${doctor.apellidos || ''}`.trim() || 'Doctor';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'confirmado': 'bg-blue-100 text-blue-800',
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'cancelado': 'bg-red-100 text-red-800',
      'completado': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const toggleDoctorSelection = (doctorId: string) => {
    setSelectedDoctors(prev => {
      if (prev.includes(doctorId)) {
        return prev.filter(id => id !== doctorId);
      }
      return [...prev, doctorId];
    });
  };

  const selectAllDoctors = () => {
    if (selectedDoctors.length === doctors.length) {
      setSelectedDoctors([]);
    } else {
      setSelectedDoctors(doctors.map(d => d.id));
    }
  };

  const maxDailyCount = Math.max(...dailyAppointments.map(d => d.count), 1);
  const maxPeakCount = Math.max(...peakHours.map(h => h.count), 1);

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
                <p className="text-gray-600 mt-1">Resumen general del sistema y métricas clave</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Filtro de Médicos */}
              <div className="relative">
                <button
                  onClick={() => setShowDoctorFilter(!showDoctorFilter)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtrar por Médico</span>
                  {selectedDoctors.length > 0 && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                      {selectedDoctors.length}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showDoctorFilter && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowDoctorFilter(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20 max-h-96 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <button
                          onClick={selectAllDoctors}
                          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {selectedDoctors.length === doctors.length ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                          {selectedDoctors.length === doctors.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                        </button>
                      </div>
                      {doctors.map(doctor => (
                        <button
                          key={doctor.id}
                          onClick={() => toggleDoctorSelection(doctor.id)}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          {selectedDoctors.includes(doctor.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {doctor.nombres} {doctor.apellidos}
                            </p>
                            {doctor.especialidades && doctor.especialidades.length > 0 && (
                              <p className="text-xs text-gray-500">
                                {getSpecialtyName(doctor.especialidades[0])}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Exportar Reporte
              </button>
            </div>
          </div>

          {/* Filtros Activos */}
          {selectedDoctors.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Filtrando por:</span>
              {selectedDoctors.map(doctorId => {
                const doctor = doctors.find(d => d.id === doctorId);
                if (!doctor) return null;
                return (
                  <span
                    key={doctorId}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {doctor.nombres} {doctor.apellidos}
                    <button
                      onClick={() => toggleDoctorSelection(doctorId)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={() => setSelectedDoctors([])}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg shadow-md`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                    stat.changeType === 'increase' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {stat.changeType === 'increase' ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    {stat.change}%
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico de Turnos por Día */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Turnos de los Últimos 7 Días</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-end justify-between gap-3 h-64">
            {dailyAppointments.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full flex flex-col items-center justify-end flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-700 hover:to-blue-500 cursor-pointer group relative"
                    style={{ height: `${(day.count / maxDailyCount) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {day.count} turnos
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-xs font-medium text-gray-600">{day.day}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Horarios Pico y Estadísticas por Médico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Horarios Pico */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Horarios Pico</h2>
              </div>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Horarios con mayor demanda de turnos
            </p>
            <div className="space-y-3">
              {peakHours.map((peak, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-sm font-semibold text-gray-700">
                    {peak.hour}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{peak.count} turnos</span>
                      <span className="text-sm font-medium text-blue-600">{peak.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(peak.count / maxPeakCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas por Médico */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Rendimiento por Médico</h2>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {doctorStats.map((doctor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {doctor.doctorName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{doctor.doctorName}</p>
                        <p className="text-xs text-gray-500">{doctor.totalAppointments} turnos totales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{doctor.occupancyRate}%</div>
                      <div className="text-xs text-gray-500">Ocupación</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                      <div className="text-xs text-gray-600">Completados</div>
                      <div className="text-lg font-bold text-green-700">{doctor.completedAppointments}</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <div className="text-xs text-gray-600">Cancelados</div>
                      <div className="text-lg font-bold text-red-700">{doctor.canceledAppointments}</div>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                      style={{ width: `${doctor.occupancyRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Próximos Turnos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Próximos Turnos</h2>
            <Link 
              href="/admin/appointments" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Ver todos →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Paciente</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Doctor</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hora</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((apt, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {getPatientName(apt.patientId).charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{getPatientName(apt.patientId)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{getDoctorName(apt.doctorId)}</td>
                    <td className="py-4 px-4 text-gray-700">
                      {new Date(apt.fecha).toLocaleDateString('es-AR', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="py-4 px-4 text-gray-700">{apt.horaInicio}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.estado)}`}>
                        {apt.estado.charAt(0).toUpperCase() + apt.estado.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Facturación */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Facturación y Pagos</h2>
            </div>
            <Link 
              href="/secretary/billing" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Ver todo →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Ingresos del Mes */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Ingresos del Mes</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-700">
                ${(filteredAppointments.filter(apt => {
                  const aptDate = new Date(apt.fecha);
                  return aptDate.getMonth() === new Date().getMonth();
                }).length * 5000).toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                <ArrowUp className="w-3 h-3" />
                <span>+15% vs mes anterior</span>
              </div>
            </div>

            {/* Pagos Pendientes */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Pagos Pendientes</span>
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-700">
                ${Math.round(filteredAppointments.length * 5000 * 0.15).toLocaleString()}
              </div>
              <div className="text-xs text-yellow-600 mt-2">
                {Math.round(filteredAppointments.length * 0.15)} facturas pendientes
              </div>
            </div>

            {/* Pagos Completados */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Pagos Completados</span>
                <UserCheck className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-700">
                ${Math.round(filteredAppointments.length * 5000 * 0.85).toLocaleString()}
              </div>
              <div className="text-xs text-green-600 mt-2">
                {Math.round(filteredAppointments.length * 0.85)} facturas pagadas
              </div>
            </div>

            {/* Tasa de Cobro */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Tasa de Cobro</span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-700">85%</div>
              <div className="text-xs text-blue-600 mt-2">
                Promedio de cobro efectivo
              </div>
            </div>
          </div>

          {/* Gráfico de Ingresos por Día */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Ingresos de los Últimos 7 Días</h3>
            <div className="flex items-end justify-between gap-2 h-32">
              {dailyAppointments.map((day, index) => {
                const dailyIncome = day.count * 5000;
                const maxIncome = Math.max(...dailyAppointments.map(d => d.count * 5000), 1);
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full flex flex-col items-center justify-end flex-1">
                      <div 
                        className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all duration-500 hover:from-green-700 hover:to-green-500 cursor-pointer group relative"
                        style={{ height: `${(dailyIncome / maxIncome) * 100}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          ${dailyIncome.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-medium text-gray-600">{day.day}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
