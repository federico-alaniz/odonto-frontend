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
  ArrowRight,
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
import { getAppointmentStatusConfig } from '@/utils/appointment-status';
import { getSpecialtyName } from '@/utils';

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
        icon: <Users className="w-5 h-5" />,
        color: 'from-blue-500 to-blue-600'
      },
      {
        title: 'Doctores Activos',
        value: activeDoctors,
        change: 5,
        changeType: 'increase',
        icon: <Stethoscope className="w-5 h-5" />,
        color: 'from-blue-500 to-blue-600'
      },
      {
        title: 'Turnos del Mes',
        value: monthlyAppointments,
        change: 18,
        changeType: 'increase',
        icon: <Calendar className="w-5 h-5" />,
        color: 'from-blue-400 to-blue-500'
      },
      {
        title: 'Turnos Pendientes',
        value: pendingAppointments,
        change: 3,
        changeType: 'decrease',
        icon: <Clock className="w-5 h-5" />,
        color: 'from-gray-400 to-gray-500'
      },
      {
        title: 'Ingresos del Mes',
        value: '$' + (monthlyAppointments * 5000).toLocaleString(),
        change: 15,
        changeType: 'increase',
        icon: <DollarSign className="w-5 h-5" />,
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
      {/* Content Container */}
      <div className="w-full px-6 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 -mx-6 -mt-8 mb-8 px-6 py-6 flex items-center justify-between">
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
          </div>
        </div>

        {/* Filtros Activos */}
        {selectedDoctors.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 bg-gradient-to-br ${stat.color} rounded-lg shadow-sm text-white flex-shrink-0`}>
                    {stat.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-wider truncate">{stat.title}</h3>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-lg font-black text-gray-900 truncate">{stat.value}</p>
                      <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                        stat.changeType === 'increase' 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-gray-50 text-gray-500'
                      }`}>
                        {stat.changeType === 'increase' ? (
                          <ArrowUp className="w-2.5 h-2.5" />
                        ) : (
                          <ArrowDown className="w-2.5 h-2.5" />
                        )}
                        {stat.change}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Horarios Pico y Estadísticas por Médico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Horarios Pico */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Horarios Pico</h2>
                  <p className="text-xs text-gray-500">Demanda de turnos por franja horaria</p>
                </div>
              </div>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {peakHours.map((peak, index) => (
                <div key={index} className="relative group">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg font-bold text-sm shadow-sm ${
                        index === 0 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                      }`}>
                        <span>{peak.hour.split(':')[0]}</span>
                        <span className="text-[10px] opacity-70 uppercase">HS</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{peak.count} Turnos</div>
                        <div className="text-xs text-gray-500">Ocupación alta</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-black ${index === 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                        {peak.percentage}%
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            index === 0 ? 'bg-blue-600' : 'bg-blue-400'
                          }`}
                          style={{ width: `${peak.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas por Médico */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Rendimiento Médico</h2>
                  <p className="text-xs text-gray-500">Métricas de atención y ocupación</p>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-4 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
              {doctorStats.map((doctor, index) => (
                <div key={index} className="group bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-indigo-100 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                          {doctor.doctorName.charAt(0)}
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{doctor.doctorName}</p>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                          {users.find(u => u.id === doctor.doctorId)?.especialidades?.[0] ? getSpecialtyName(users.find(u => u.id === doctor.doctorId).especialidades[0]) : 'Especialista'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-indigo-600 font-black text-lg leading-none">
                        {doctor.occupancyRate}%
                        <Activity className="w-3 h-3" />
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Ocupación</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white border border-gray-100 rounded-lg p-2 flex flex-col items-center justify-center group-hover:border-indigo-50 transition-colors">
                      <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">Totales</div>
                      <div className="text-sm font-black text-gray-700">{doctor.totalAppointments}</div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-lg p-2 flex flex-col items-center justify-center group-hover:border-green-50 transition-colors">
                      <div className="text-[9px] font-bold text-green-500/70 uppercase mb-1">Completos</div>
                      <div className="text-sm font-black text-green-600">{doctor.completedAppointments}</div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-lg p-2 flex flex-col items-center justify-center group-hover:border-red-50 transition-colors">
                      <div className="text-[9px] font-bold text-red-500/70 uppercase mb-1">Cancelados</div>
                      <div className="text-sm font-black text-red-600">{doctor.canceledAppointments}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Progreso Mensual</span>
                      <span className="text-[10px] font-bold text-indigo-500">{doctor.occupancyRate}% / 100%</span>
                    </div>
                    <div className="w-full bg-gray-200/60 rounded-full h-1.5 overflow-hidden p-[1px]">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(79,70,229,0.3)]"
                        style={{ width: `${doctor.occupancyRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Próximos Turnos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Próximos Turnos</h2>
            </div>
            <Link 
              href="/admin/appointments" 
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              Gestionar todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Paciente</th>
                  <th className="text-left py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Doctor / Especialidad</th>
                  <th className="text-left py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Fecha y Hora</th>
                  <th className="text-left py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="text-right py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentAppointments.length > 0 ? (
                  recentAppointments.map((apt, index) => (
                    <tr key={index} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                              {getPatientName(apt.patientId).charAt(0)}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{getPatientName(apt.patientId)}</div>
                            <div className="text-[11px] text-gray-400 font-medium">ID: {apt.patientId.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <Stethoscope className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-800">{getDoctorName(apt.doctorId)}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-tight">
                              {users.find(u => u.id === apt.doctorId)?.especialidades?.[0] ? getSpecialtyName(users.find(u => u.id === apt.doctorId).especialidades[0]) : 'Odontología'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            {apt.horaInicio}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {new Date(apt.fecha).toLocaleDateString('es-AR', { 
                              day: 'numeric', 
                              month: 'long'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getAppointmentStatusConfig(apt.estado).color}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {getAppointmentStatusConfig(apt.estado).text}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                      No hay turnos programados para hoy.
                    </td>
                  </tr>
                )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Ingresos del Mes */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Ingresos del Mes</span>
                    <div className="flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      <ArrowUp className="w-2.5 h-2.5" />
                      <span>15%</span>
                    </div>
                  </div>
                  <div className="text-xl font-black text-gray-900 leading-none">
                    ${(filteredAppointments.filter(apt => {
                      const aptDate = new Date(apt.fecha);
                      return aptDate.getMonth() === new Date().getMonth();
                    }).length * 5000).toLocaleString()}
                  </div>
                  <div className="mt-1.5 text-[9px] text-gray-400 uppercase tracking-tighter font-bold">Vs mes anterior</div>
                </div>
              </div>
            </div>

            {/* Pagos Pendientes */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Pagos Pendientes</span>
                    <div className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      PENDIENTE
                    </div>
                  </div>
                  <div className="text-xl font-black text-gray-900 leading-none">
                    ${Math.round(filteredAppointments.length * 5000 * 0.15).toLocaleString()}
                  </div>
                  <div className="mt-1.5 text-[10px] text-gray-400">
                    <span className="font-black text-amber-600">{Math.round(filteredAppointments.length * 0.15)}</span> facturas
                  </div>
                </div>
              </div>
            </div>

            {/* Pagos Completados */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex-shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Pagos Completados</span>
                    <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      LISTO
                    </div>
                  </div>
                  <div className="text-xl font-black text-gray-900 leading-none">
                    ${Math.round(filteredAppointments.length * 5000 * 0.85).toLocaleString()}
                  </div>
                  <div className="mt-1.5 text-[10px] text-gray-400">
                    <span className="font-black text-emerald-600">{Math.round(filteredAppointments.length * 0.85)}</span> facturas
                  </div>
                </div>
              </div>
            </div>

            {/* Tasa de Cobro */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Tasa de Cobro</span>
                    <div className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      EFECTIVIDAD
                    </div>
                  </div>
                  <div className="text-xl font-black text-gray-900 leading-none">85%</div>
                  <div className="mt-1.5 text-[10px] text-gray-400 italic">Promedio cobro</div>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de Ingresos por Día */}
          <div className="border-t border-gray-100 pt-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Análisis de Ingresos Semanales</h3>
                <p className="text-xs text-gray-500 mt-1">Comparativa de ingresos diarios (últimos 7 días)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
                  <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
                  Ingresos Reales
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
                  <span className="w-3 h-3 bg-gray-200 rounded-sm"></span>
                  Promedio
                </div>
              </div>
            </div>

            <div className="relative h-48 flex items-end justify-between gap-3 px-2">
              {/* Líneas de referencia de fondo */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="w-full border-t border-gray-100 border-dashed"></div>
                ))}
              </div>

              {dailyAppointments.map((day, index) => {
                const dailyIncome = day.count * 5000;
                const maxIncome = Math.max(...dailyAppointments.map(d => d.count * 5000), 1);
                const heightPercentage = (dailyIncome / maxIncome) * 100;
                const isToday = index === 6;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-4 group relative z-10">
                    <div className="relative w-full flex flex-col items-center justify-end h-32">
                      {/* Barra de fondo sutil para toda la columna */}
                      <div className="absolute inset-x-1 top-0 bottom-0 bg-gray-50/50 rounded-t-lg -z-10 group-hover:bg-gray-100 transition-colors"></div>
                      
                      {/* Valor flotante en hover */}
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none mb-2">
                        <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xl whitespace-nowrap relative">
                          ${dailyIncome.toLocaleString()}
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                      </div>

                      {/* La Barra Principal */}
                      <div 
                        className={`w-full max-w-[40px] rounded-t-lg transition-all duration-700 ease-out relative overflow-hidden shadow-sm ${
                          isToday 
                            ? 'bg-gradient-to-t from-blue-600 to-blue-400' 
                            : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                        }`}
                        style={{ height: `${Math.max(heightPercentage, 5)}%` }}
                      >
                        {/* Efecto de brillo en la barra */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        {/* Indicador de valor estático (si es significativo) */}
                        {dailyIncome > 0 && (
                          <div className="absolute top-1 left-0 right-0 text-center text-[8px] font-black text-white/80 leading-none">
                            {day.count}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Etiqueta del día */}
                    <div className="text-center flex flex-col items-center">
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${
                        isToday ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {day.day.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-medium text-gray-500">
                        {day.day.split(' ')[1]}
                      </span>
                    </div>

                    {/* Punto indicador para el día de hoy */}
                    {isToday && (
                      <div className="absolute -bottom-2 w-1 h-1 bg-blue-600 rounded-full"></div>
                    )}
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
