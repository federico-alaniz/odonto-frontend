'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, List, Plus, Info } from 'lucide-react';
import Calendar from './Calendar';
import DailyAgenda from './DailyAgenda';
import NewAppointmentModal from './modals/NewAppointmentModal';

export default function CalendarioPage() {
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('agenda');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                <CalendarIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Calendario de Citas</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Gestión y visualización de citas médicas programadas
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Toggle de vista */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2
                    ${viewMode === 'calendar' 
                      ? 'bg-white text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Calendario</span>
                </button>
                <button
                  onClick={() => setViewMode('agenda')}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2
                    ${viewMode === 'agenda' 
                      ? 'bg-white text-blue-700 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                >
                  <List className="w-4 h-4" />
                  <span>Agenda</span>
                </button>
              </div>
              
              <button
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md flex items-center space-x-2"
                onClick={() => setShowNewAppointmentModal(true)}
              >
                <Plus className="w-5 h-5" />
                <span>Nueva Cita</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb visual */}
        <div className="px-6 pb-4">
          <div className="flex items-center text-sm text-gray-500 space-x-2">
            <span>Gestión</span>
            <span>•</span>
            <span className="text-blue-600 font-medium">Calendario de Citas</span>
            <span>•</span>
            <span className="text-gray-700">{viewMode === 'calendar' ? 'Vista Calendario' : 'Vista Agenda'}</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {viewMode === 'calendar' ? (
          <Calendar />
        ) : (
          <DailyAgenda />
        )}
      </div>

      {/* Modal de Nueva Cita */}
      <NewAppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        onSave={(appointment) => {
          // Aquí se integraría con la lógica de guardar en la base de datos
          setShowNewAppointmentModal(false);
        }}
      />
    </div>
  );
}