'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Calendar, 
  Clock, 
  UserCog, 
  Building2,
  UserPlus,
  CalendarPlus,
  ClipboardList,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  BarChart3
} from 'lucide-react';

// Importar datos fake
import { patients } from '../utils/fake-patients';
import { appointments } from '../utils/fake-appointments';
import { users } from '../utils/fake-users';

export default function Home() {
  const [stats, setStats] = useState([
    { label: 'Pacientes Registrados', value: '0', icon: Users, color: 'blue' },
    { label: 'Citas Hoy', value: '0', icon: Calendar, color: 'green' },
    { label: 'Consultas Pendientes', value: '0', icon: Clock, color: 'yellow' },
    { label: 'Personal Activo', value: '0', icon: UserCog, color: 'purple' }
  ]);

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Calcular estadísticas reales
    const calculateStats = () => {
      // 1. Pacientes registrados - total de pacientes activos
      const totalPatients = patients.filter(p => p.estado === 'activo').length;

      // 2. Citas de hoy - citas para la fecha actual (18 de octubre de 2025)
      const today = '2025-10-18';
      const todayAppointments = appointments.filter(apt => apt.fecha === today).length;

      // 3. Consultas pendientes - citas confirmadas o programadas (no completadas ni canceladas)
      const pendingConsultations = appointments.filter(apt => 
        apt.estado === 'confirmada' || apt.estado === 'programada'
      ).length;

      // 4. Personal activo - usuarios con roles de doctor, enfermero, etc. que están activos
      const activeStaff = users.filter(user => 
        user.estado === 'activo' && 
        ['doctor', 'nurse', 'admin', 'secretary'].includes(user.role)
      ).length;

      setStats([
        { label: 'Pacientes Registrados', value: totalPatients.toLocaleString(), icon: Users, color: 'blue' },
        { label: 'Citas Hoy', value: todayAppointments.toString(), icon: Calendar, color: 'green' },
        { label: 'Consultas Pendientes', value: pendingConsultations.toString(), icon: Clock, color: 'yellow' },
        { label: 'Personal Activo', value: activeStaff.toString(), icon: UserCog, color: 'purple' }
      ]);
    };

    // Calcular actividad reciente basada en citas de hoy
    const calculateRecentActivity = () => {
      const today = '2025-10-18';
      const todayAppointments = appointments
        .filter(apt => apt.fecha === today)
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
        .slice(0, 4) // Mostrar solo las primeras 4
        .map(apt => {
          const patient = patients.find(p => p.id === apt.patientId);
          const patientName = patient ? `${patient.nombres} ${patient.apellidos}` : 'Paciente desconocido';
          
          console.log('Processing appointment:', apt.id, 'Patient:', patientName, 'Estado:', apt.estado);
          
          // Determinar tipo y acción basado en estado
          let type, action, icon;
          switch (apt.estado) {
            case 'completada':
              type = 'success';
              action = 'Consulta completada';
              icon = CheckCircle;
              break;
            case 'en-curso':
              type = 'info';
              action = 'Consulta en curso';
              icon = Activity;
              break;
            case 'confirmada':
              type = 'info';
              action = 'Cita confirmada';
              icon = Info;
              break;
            case 'programada':
              type = 'warning';
              action = 'Cita programada';
              icon = AlertCircle;
              break;
            case 'cancelada':
              type = 'error';
              action = 'Cita cancelada';
              icon = XCircle;
              break;
            default:
              type = 'info';
              action = 'Estado desconocido';
              icon = Info;
          }

          return {
            patient: patientName,
            action: action,
            time: apt.horaInicio,
            type: type,
            icon: icon
          };
        });

      console.log('Recent activity data:', todayAppointments);
      setRecentActivity(todayAppointments);
    };

    calculateStats();
    calculateRecentActivity();
  }, []);

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

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard MediCore</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Resumen general del sistema de gestión médica
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>Panel de Control</span>
                <span>•</span>
                <span className="text-blue-600 font-medium">Vista General</span>
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

        {/* Recent Activity and Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Actividad Reciente</h2>
                  <p className="text-sm text-gray-600 mt-1">Últimas actividades registradas en el sistema</p>
                </div>
              </div>
            </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`w-5 h-5 ${
                          activity.type === 'success' ? 'text-green-600' :
                          activity.type === 'info' ? 'text-blue-600' :
                          activity.type === 'warning' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">
                            {activity.patient}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.action}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeClasses(activity.type)}`}>
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No hay actividad reciente</p>
                  <p className="text-sm text-gray-400">Las actividades aparecerán aquí cuando se registren citas o consultas</p>
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Acciones Rápidas</h2>
                  <p className="text-sm text-gray-600 mt-1">Accesos directos a funciones principales</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <Link href="/pacientes/nuevo" className="group block">
                  <div className="p-4 text-left rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Nuevo Paciente</div>
                        <div className="text-sm text-gray-600">Registrar nuevo paciente en el sistema</div>
                      </div>
                    </div>
                  </div>
                </Link>
                <Link href="/calendario" className="group block">
                  <div className="p-4 text-left rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <CalendarPlus className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Nueva Cita</div>
                        <div className="text-sm text-gray-600">Programar cita médica con paciente</div>
                      </div>
                    </div>
                  </div>
                </Link>
                <Link href="/historiales" className="group block">
                  <div className="p-4 text-left rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <ClipboardList className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Ver Historiales</div>
                        <div className="text-sm text-gray-600">Consultar expedientes médicos de pacientes</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}