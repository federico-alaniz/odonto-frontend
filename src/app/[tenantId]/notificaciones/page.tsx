'use client';

import { Bell, Check, Clock, Calendar } from 'lucide-react';

export default function NotificacionesPage() {
  const notifications = [
    {
      id: '1',
      type: 'appointment',
      title: 'Nueva cita programada',
      message: 'María González tiene una cita programada para mañana a las 10:00 AM',
      time: '2025-10-17 14:30',
      read: false
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Recordatorio de cita',
      message: 'Juan Carlos Rodríguez tiene una cita en 30 minutos',
      time: '2025-10-17 13:15',
      read: false
    },
    {
      id: '3',
      type: 'system',
      title: 'Actualización del sistema',
      message: 'El sistema se actualizará automáticamente esta noche a las 2:00 AM',
      time: '2025-10-17 12:00',
      read: true
    }
  ];

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Bell className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona tus notificaciones y alertas
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Notificaciones Recientes</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-6 flex items-start space-x-4 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-blue-50' : ''
              }`}>
                <div className={`p-2 rounded-full ${
                  notification.type === 'appointment' ? 'bg-blue-100' :
                  notification.type === 'reminder' ? 'bg-orange-100' :
                  'bg-gray-100'
                }`}>
                  {notification.type === 'appointment' && <Calendar className="w-5 h-5 text-blue-600" />}
                  {notification.type === 'reminder' && <Clock className="w-5 h-5 text-orange-600" />}
                  {notification.type === 'system' && <Bell className="w-5 h-5 text-gray-600" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                </div>
                
                {!notification.read && (
                  <button className="text-blue-600 hover:text-blue-800">
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}