'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, UserPlus } from 'lucide-react';
import PatientsTable from "@/app/pacientes/PatientsTable";
import PatientsFilters, { PatientFilters } from "@/app/pacientes/PatientsFilters";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pacientes
              </h1>
              <p className="text-gray-600 mt-1">
                Gestión y consulta de pacientes registrados en el sistema
              </p>
            </div>
          </div>
          <Link
            href="/pacientes/nuevo"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Paciente</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <PatientsFilters onFiltersChange={setFilters} />

      {/* Table */}
      <PatientsTable filters={filters} />
    </div>
  );
}