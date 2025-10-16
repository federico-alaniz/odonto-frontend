export default function Home() {
  const stats = [
    { label: 'Pacientes Registrados', value: '1,245', icon: '👥', color: 'blue' },
    { label: 'Citas Hoy', value: '32', icon: '📅', color: 'green' },
    { label: 'Consultas Pendientes', value: '8', icon: '⏰', color: 'yellow' },
    { label: 'Personal Activo', value: '18', icon: '👨‍⚕️', color: 'purple' }
  ];

  const recentActivity = [
    { patient: 'María González', action: 'Consulta completada', time: '10:30 AM', type: 'success' },
    { patient: 'Juan Pérez', action: 'Cita programada', time: '11:00 AM', type: 'info' },
    { patient: 'Ana López', action: 'Examen pendiente', time: '11:30 AM', type: 'warning' },
    { patient: 'Carlos Ruiz', action: 'Seguimiento requerido', time: '12:00 PM', type: 'error' }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200'
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
      <div className="medical-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">
          🏥 Dashboard - Sistema MediCore
        </h1>
        <p className="medical-text-secondary">
          Bienvenido al sistema de gestión médica. Aquí tienes un resumen de la actividad del día.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`medical-card p-6 ${getColorClasses(stat.color)}`}
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
              <div className="text-3xl opacity-75">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="medical-card">
        <div className="p-6 border-b medical-border">
          <h2 className="text-lg font-semibold text-slate-800">
            Actividad Reciente
          </h2>
          <p className="text-sm medical-text-secondary">
            Últimas actividades registradas en el sistema
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {activity.patient}
                    </p>
                    <p className="text-sm medical-text-secondary">
                      {activity.action}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeClasses(activity.type)}`}>
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="medical-card p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left rounded-lg border medical-border hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all focus-ring">
            <div className="text-2xl mb-2">👤</div>
            <div className="font-medium text-slate-800">Nuevo Paciente</div>
            <div className="text-sm medical-text-secondary">Registrar nuevo paciente</div>
          </button>
          <button className="p-4 text-left rounded-lg border medical-border hover:border-green-300 hover:bg-green-50 hover:shadow-md transition-all focus-ring">
            <div className="text-2xl mb-2">📅</div>
            <div className="font-medium text-slate-800">Nueva Cita</div>
            <div className="text-sm medical-text-secondary">Programar cita médica</div>
          </button>
          <button className="p-4 text-left rounded-lg border medical-border hover:border-purple-300 hover:bg-purple-50 hover:shadow-md transition-all focus-ring">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-medium text-slate-800">Ver Historiales</div>
            <div className="text-sm medical-text-secondary">Consultar expedientes</div>
          </button>
        </div>
      </div>
    </div>
  );
}