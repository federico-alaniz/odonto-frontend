'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, Stethoscope, UserPlus } from 'lucide-react';
import DoctorPatientsTable from './DoctorPatientsTable';
import DoctorPatientsFilters, { DoctorPatientFilters } from './DoctorPatientsFilters';

export default function DoctorPatientsPage() {
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
          <div className="flex items-center justify-between gap-6">
            {/* Lado izquierdo: Icono y título */}
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
            
            {/* Lado derecho: Filtros y botones */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <DoctorPatientsFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
              
              <Link
                href="/doctor/patients/new"
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md inline-flex items-center space-x-2 whitespace-nowrap"
              >
                <UserPlus className="w-5 h-5" />
                <span>Nuevo Paciente</span>
              </Link>
              
              <Link
                href="/calendario"
                className="px-4 py-2.5 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md inline-flex items-center space-x-2 whitespace-nowrap"
              >
                <Calendar className="w-5 h-5" />
                <span>Programar Cita</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Tabla de pacientes */}
        <DoctorPatientsTable
          filters={filters}
          showOnlyAssigned={false}
        />

      </div>
    </div>
  );
}