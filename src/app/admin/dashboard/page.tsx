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

// TODO: Reemplazar con llamadas al backend
// import { users } from '../../../utils/fake-users';
// import { patients } from '../../../utils/fake-patients';
// import { appointments } from '../../../utils/fake-appointments';

// Datos temporales vacíos hasta integrar con backend
const users: any[] = [];
const patients: any[] = [];
const appointments: any[] = [];

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
  const [recentAppointments, setRecentAppointments] = useState<typeof appointments>([]);

  useEffect(() => {
    calculateStats();
    calculateAppointmentsBySpecialty();
    calculateDailyAppointments();
    loadRecentAppointments();
  }, []);

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
        color: 'from-purple-500 to-purple-600'
      },
      {
        title: 'Turnos del Mes',
        value: monthlyAppointments,
        change: 18,
        changeType: 'increase',
        icon: <Calendar className="w-6 h-6" />,
        color: 'from-green-500 to-green-600'
      },
      {
        title: 'Turnos Pendientes',
        value: pendingAppointments,
        change: 3,
        changeType: 'decrease',
        icon: <Clock className="w-6 h-6" />,
        color: 'from-orange-500 to-orange-600'
      },
      {
        title: 'Tasa de Ocupación',
        value: `${occupancyRate}%`,
        change: 8,
        changeType: 'increase',
        icon: <Activity className="w-6 h-6" />,
        color: 'from-pink-500 to-pink-600'
      },
      {
        title: 'Ingresos del Mes',
        value: '$' + (monthlyAppointments * 5000).toLocaleString(),
        change: 15,
        changeType: 'increase',
        icon: <DollarSign className="w-6 h-6" />,
        color: 'from-emerald-500 to-emerald-600'
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
    return patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente';
  };

  const getDoctorName = (doctorId: string): string => {
    const doctor = users.find(u => u.id === doctorId);
    return doctor ? `${doctor.nombres} ${doctor.apellidos}` : 'Doctor';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'confirmado': 'bg-green-100 text-green-800',
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
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
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
            <div className="space-y-4">
              {dailyAppointments.map((day, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{day.day}</span>
                    <span className="text-sm font-bold text-gray-900">{day.count} turnos</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(day.count / maxDailyCount) * 100}%` }}
                    />
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
            <div className="space-y-4">
              {appointmentsBySpecialty.map((item, index) => {
                const colors = [
                  'from-blue-500 to-blue-600',
                  'from-purple-500 to-purple-600',
                  'from-pink-500 to-pink-600',
                  'from-orange-500 to-orange-600',
                  'from-green-500 to-green-600',
                  'from-teal-500 to-teal-600'
                ];
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${colors[index % colors.length]} rounded-lg flex items-center justify-center text-white font-bold shadow-md`}>
                      {item.percentage}%
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{item.specialty}</span>
                        <span className="text-sm text-gray-600">{item.count} turnos</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`bg-gradient-to-r ${colors[index % colors.length]} h-2 rounded-full`}
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
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-purple-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Reportes</h3>
                <p className="text-sm text-gray-600">Ver reportes</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/settings" 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-green-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Configuración</h3>
                <p className="text-sm text-gray-600">Ajustes del sistema</p>
              </div>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md p-6 text-white">
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
