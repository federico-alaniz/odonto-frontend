'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, Info, Stethoscope } from 'lucide-react';
import DoctorPatientsTable from './DoctorPatientsTable';
import DoctorPatientsFilters, { DoctorPatientFilters } from './DoctorPatientsFilters';

export default function DoctorPatientsPage() {
  const [filters, setFilters] = useState<DoctorPatientFilters>({
    search: '',
    numeroDocumento: '',
    genero: '',
    tipoSangre: '',
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
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
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
            
            <Link
              href="/calendario"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md inline-flex items-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Programar Cita</span>
            </Link>
          </div>
        </div>
        
        {/* Breadcrumb visual */}
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Dashboard</span>
            <span>•</span>
            <span className="text-green-600 font-medium">Mis Pacientes</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
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
        />

      </div>
    </div>
  );
}