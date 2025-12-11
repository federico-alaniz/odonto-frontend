'use client';

import { useState, useEffect } from 'react';
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
  Download
} from 'lucide-react';
import Link from 'next/link';
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [appointmentsBySpecialty, setAppointmentsBySpecialty] = useState<AppointmentBySpecialty[]>([]);
  const [dailyAppointments, setDailyAppointments] = useState<DailyAppointment[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (appointments.length > 0) {
      calculateStats();
      calculateAppointmentsBySpecialty();
      calculateDailyAppointments();
      loadRecentAppointments();
    }
  }, [appointments, users, patients]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const clinicId = localStorage.getItem('clinicId') || 'clinic_001';
      
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

    // Total de doctores
    const totalDoctors = users.filter(u => u.role === 'doctor').length;
    const activeDoctors = users.filter(u => u.role === 'doctor' && u.estado === 'activo').length;

    // Turnos del mes actual
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.fecha);
      return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
    }).length;

    // Turnos pendientes (próximos)
    const today = new Date().toISOString().split('T')[0];
    const pendingAppointments = appointments.filter(apt => 
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
    
    appointments.forEach(apt => {
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
      
      const count = appointments.filter(apt => apt.fecha === dateStr).length;
      
      last7Days.push({
        day: date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' }),
        count
      });
    }

    setDailyAppointments(last7Days);
  };

  const loadRecentAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    const recent = appointments
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

  const maxDailyCount = Math.max(...dailyAppointments.map(d => d.count), 1);

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
                <p className="text-gray-600 mt-1">Resumen general del sistema y métricas clave</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Exportar Reporte
            </button>
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Turnos por Día */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

          {/* Turnos por Especialidad */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Turnos por Especialidad</h2>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {appointmentsBySpecialty.map((item, index) => {
                const colors = [
                  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
                  { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
                  { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
                  { bg: 'bg-blue-200', text: 'text-blue-800', border: 'border-blue-300' },
                  { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' },
                  { bg: 'bg-blue-300', text: 'text-blue-900', border: 'border-blue-400' }
                ];
                const colorScheme = colors[index % colors.length];
                return (
                  <div 
                    key={index} 
                    className={`${colorScheme.bg} border-2 ${colorScheme.border} rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${colorScheme.text} uppercase tracking-wide`}>
                          {item.specialty}
                        </span>
                        <Stethoscope className={`w-4 h-4 ${colorScheme.text} opacity-60`} />
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className={`text-3xl font-bold ${colorScheme.text}`}>
                            {item.count}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">turnos</div>
                        </div>
                        <div className={`text-2xl font-bold ${colorScheme.text} opacity-75`}>
                          {item.percentage}%
                        </div>
                      </div>
                      <div className="w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`${colorScheme.bg.replace('bg-', 'bg-gradient-to-r from-')} to-${colorScheme.text.replace('text-', '')} h-1.5 rounded-full transition-all duration-500 group-hover:h-2`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Próximos Turnos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Link 
            href="/admin/users" 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-blue-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Usuarios</h3>
                <p className="text-sm text-gray-600">Gestionar usuarios</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/reports" 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-blue-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Reportes</h3>
                <p className="text-sm text-gray-600">Ver reportes</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/settings" 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-blue-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Configuración</h3>
                <p className="text-sm text-gray-600">Ajustes del sistema</p>
              </div>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Alertas</h3>
                <p className="text-sm opacity-90">3 pendientes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
