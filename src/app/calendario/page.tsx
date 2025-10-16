'use client';

import { useState } from 'react';
import Calendar from '@/app/calendario/Calendar';
import DailyAgenda from './DailyAgenda';
import NewAppointmentModal from './modals/NewAppointmentModal';

export default function CalendarioPage() {
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('agenda');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  return (
    <div className="medical-page">
      <div className="medical-page-header">
        <div className="flex items-center">
          <span className="text-2xl mr-3">📅</span>
          <div>
            <h1 className="medical-page-title">Calendario de Citas</h1>
            <p className="medical-page-description">
              Gestión y visualización de citas médicas programadas
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Toggle de vista */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all
                ${viewMode === 'calendar' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'
                }
              `}
            >
              📅 Calendario
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all
                ${viewMode === 'agenda' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'
                }
              `}
            >
              📋 Agenda
            </button>
          </div>
          
          <button
            className="medical-button-primary"
            onClick={() => setShowNewAppointmentModal(true)}
          >
            <span className="mr-2">➕</span>
            Nueva Cita
          </button>
        </div>
      </div>

      <div className="medical-page-content">
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
          console.log('Nueva cita:', appointment);
          // Aquí se integraría con la lógica de guardar en la base de datos
          setShowNewAppointmentModal(false);
        }}
      />
    </div>
  );
}