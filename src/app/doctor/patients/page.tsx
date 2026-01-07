'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, Info, Stethoscope, UserPlus } from 'lucide-react';
import DoctorPatientsTable from './DoctorPatientsTable';
import DoctorPatientsFilters, { DoctorPatientFilters } from './DoctorPatientsFilters';

export default function DoctorPatientsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'assigned'>('all');
  const [filters, setFilters] = useState<DoctorPatientFilters>({
    search: '',
    numeroDocumento: '',
    genero: '',
    obraSocial: '',
    edadMin: '',
    edadMax: '',
    urgencia: '',
    ultimaConsulta: ''
  });

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Pacientes</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Gestión de pacientes asignados a mi consulta
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link
                href="/doctor/patients/new"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md inline-flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Nuevo Paciente</span>
              </Link>
              
              <Link
                href="/calendario"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md inline-flex items-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Programar Cita</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb visual */}
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Dashboard</span>
            <span>•</span>
            <span className="text-blue-600 font-medium">Mis Pacientes</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Todos los Pacientes</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('assigned')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'assigned'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  <span>Mis Pacientes Asignados</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <DoctorPatientsFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Tabla de pacientes */}
        <DoctorPatientsTable
          filters={filters}
          showOnlyAssigned={activeTab === 'assigned'}
        />

      </div>
    </div>
  );
}