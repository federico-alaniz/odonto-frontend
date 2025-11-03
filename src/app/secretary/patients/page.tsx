'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, UserPlus, Info, Calendar, ClipboardList } from 'lucide-react';
import SecretaryPatientsTable from './SecretaryPatientsTable';
import SecretaryPatientsFilters, { SecretaryPatientFilters } from './SecretaryPatientsFilters';

export default function SecretaryPatientsPage() {
  const [filters, setFilters] = useState<SecretaryPatientFilters>({
    search: '',
    numeroDocumento: '',
    genero: '',
    tipoSangre: '',
    edadMin: '',
    edadMax: '',
    ciudad: '',
    estado: '',
    ultimaConsulta: ''
  });

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Registro, consulta y administración de pacientes
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                href="/secretary/appointments/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Nuevo Turno</span>
              </Link>
              
              <Link
                href="/secretary/patients/new"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md inline-flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Nuevo Paciente</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb visual */}
        <div className="px-6 pb-4">
          <div className="flex items-center text-sm text-gray-700 space-x-2">
            <span>Secretaría</span>
            <span>•</span>
            <span className="text-purple-600 font-medium">Pacientes</span>
            <span>•</span>
            <span className="text-gray-700">Gestión General</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pacientes</p>
                <p className="text-3xl font-bold text-gray-900">1,247</p>
                <p className="text-sm text-green-600">+12 este mes</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nuevos (30 días)</p>
                <p className="text-3xl font-bold text-gray-900">48</p>
                <p className="text-sm text-green-600">+8% vs anterior</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Con Turno Hoy</p>
                <p className="text-3xl font-bold text-gray-900">23</p>
                <p className="text-sm text-blue-600">Ver agenda</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Requieren Seguimiento</p>
                <p className="text-3xl font-bold text-gray-900">7</p>
                <p className="text-sm text-red-600">Atención requerida</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ClipboardList className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <SecretaryPatientsFilters onFiltersChange={setFilters} />

        {/* Table */}
        <SecretaryPatientsTable filters={filters} />
      </div>
    </div>
  );
}