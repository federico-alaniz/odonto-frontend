'use client';

import { useState } from 'react';
import PatientsTable from "@/app/pacientes/PatientsTable";
import PatientsFilters, { PatientFilters } from "@/app/pacientes/PatientsFilters";

export default function PatientsPage() {
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    tipoDocumento: '',
    genero: '',
    tipoSangre: '',
    estadoCivil: '',
    edadMin: '',
    edadMax: '',
    ciudad: ''
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medical-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 mb-2">
              👥 Lista de Pacientes
            </h1>
            <p className="medical-text-secondary">
              Gestión y consulta de pacientes registrados en el sistema
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <a
              href="/pacientes/nuevo"
              className="inline-flex items-center medical-button-primary text-sm px-4 py-2 rounded-lg hover:shadow-md transition-all focus-ring"
            >
              <span className="mr-2">👤</span>
              Nuevo Paciente
            </a>
          </div>
        </div>
      </div>

      {/* Filters */}
      <PatientsFilters onFiltersChange={setFilters} />

      {/* Table */}
      <PatientsTable filters={filters} />
    </div>
  );
}