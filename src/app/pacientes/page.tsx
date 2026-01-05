'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, UserPlus, Info } from 'lucide-react';
import PatientsTable from "./PatientsTable";
import PatientsFilters, { PatientFilters } from "./PatientsFilters";

export default function PatientsPage() {
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    numeroDocumento: '',
    genero: '',
    tipoSangre: '',
    edadMin: '',
    edadMax: '',
    ciudad: ''
  });

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Consulta y administración de pacientes registrados en el sistema
                </p>
              </div>
            </div>
            
            <Link
              href="/pacientes/nuevo"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md inline-flex items-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Nuevo Paciente</span>
            </Link>
          </div>
        </div>
        
        {/* Breadcrumb visual */}
        <div className="px-6 pb-4">
          <div className="flex items-center text-sm text-gray-700 space-x-2">
            <span>Gestión</span>
            <span>•</span>
            <span className="text-blue-600 font-medium">Pacientes</span>
            <span>•</span>
            <span className="text-gray-700">Lista General</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Filters */}
        <PatientsFilters onFiltersChange={setFilters} />

        {/* Table */}
        <PatientsTable filters={filters} />
      </div>
    </div>
  );
}