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
  XCircle
} from 'lucide-react';

export default function Home() {
  const stats = [
    { label: 'Pacientes Registrados', value: '1,245', icon: Users, color: 'blue' },
    { label: 'Citas Hoy', value: '32', icon: Calendar, color: 'green' },
    { label: 'Consultas Pendientes', value: '8', icon: Clock, color: 'yellow' },
    { label: 'Personal Activo', value: '18', icon: UserCog, color: 'purple' }
  ];

  const recentActivity = [
    { patient: 'María González', action: 'Consulta completada', time: '10:30 AM', type: 'success', icon: CheckCircle },
    { patient: 'Juan Pérez', action: 'Cita programada', time: '11:00 AM', type: 'info', icon: Info },
    { patient: 'Ana López', action: 'Examen pendiente', time: '11:30 AM', type: 'warning', icon: AlertCircle },
    { patient: 'Carlos Ruiz', action: 'Seguimiento requerido', time: '12:00 PM', type: 'error', icon: XCircle }
  ];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard - Sistema MediCore
            </h1>
            <p className="text-gray-600">
              Bienvenido al sistema de gestión médica. Aquí tienes un resumen de la actividad del día.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div 
              key={index} 
              className={`rounded-lg shadow-sm p-6 ${getColorClasses(stat.color)}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="opacity-75">
                  <IconComponent className="w-8 h-8" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity and Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Actividad Reciente
                </h2>
                <p className="text-sm text-gray-600">
                  Últimas actividades registradas en el sistema
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
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
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Acciones Rápidas
            </h2>
          </div>
          <div className="space-y-4">
            <Link href="/pacientes/nuevo" className="group block">
              <div className="p-4 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Nuevo Paciente</div>
                    <div className="text-sm text-gray-600">Registrar nuevo paciente en el sistema</div>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/calendario" className="group block">
              <div className="p-4 text-left rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <CalendarPlus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Nueva Cita</div>
                    <div className="text-sm text-gray-600">Programar cita médica con paciente</div>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/historiales" className="group block">
              <div className="p-4 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <ClipboardList className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Ver Historiales</div>
                    <div className="text-sm text-gray-600">Consultar expedientes médicos de pacientes</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}