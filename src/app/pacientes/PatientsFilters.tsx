'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import MedicalInput from '@/components/forms/MedicalInput';
import MedicalSelect from '@/components/forms/MedicalSelect';

interface FiltersProps {
  onFiltersChange?: (filters: PatientFilters) => void;
}

export interface PatientFilters {
  search: string;
  numeroDocumento: string;
  genero: string;
  tipoSangre: string;
  edadMin: string;
  edadMax: string;
  ciudad: string;
}

export default function PatientsFilters({ onFiltersChange }: FiltersProps) {
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    numeroDocumento: '',
    genero: '',
    tipoSangre: '',
    edadMin: '',
    edadMax: '',
    ciudad: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const generos = [
    { value: '', label: 'Todos los géneros' },
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' }
  ];

  const tiposSangre = [
    { value: '', label: 'Todos los tipos' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  const handleFilterChange = (field: keyof PatientFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: PatientFilters = {
      search: '',
      numeroDocumento: '',
      genero: '',
      tipoSangre: '',
      edadMin: '',
      edadMax: '',
      ciudad: ''
    };
    setFilters(emptyFilters);
    onFiltersChange?.(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Search className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Filtros de Búsqueda
            </h2>
            <p className="text-sm text-gray-600">
              Utiliza los filtros para encontrar pacientes específicos
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Limpiar filtros</span>
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showAdvanced ? '📈 Filtros básicos' : '⚙️ Filtros avanzados'}
          </button>
        </div>
      </div>

      {/* Búsqueda principal */}
      <div className="mb-6">
        <MedicalInput
          label="Búsqueda General"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Buscar por nombre, apellido, documento o email..."
          className="text-lg"
        />
      </div>

      {/* Filtros básicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <MedicalInput
          label="Número de Documento"
          value={filters.numeroDocumento}
          onChange={(e) => handleFilterChange('numeroDocumento', e.target.value)}
          placeholder="Ingrese número de documento"
        />
        
        <MedicalSelect
          label="Género"
          value={filters.genero}
          onChange={(e) => handleFilterChange('genero', e.target.value)}
          options={generos}
        />
        
        <MedicalSelect
          label="Tipo de Sangre"
          value={filters.tipoSangre}
          onChange={(e) => handleFilterChange('tipoSangre', e.target.value)}
          options={tiposSangre}
        />
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Filtros Avanzados</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MedicalInput
              label="Edad Mínima"
              type="number"
              value={filters.edadMin}
              onChange={(e) => handleFilterChange('edadMin', e.target.value)}
              placeholder="Edad mín."
              min="0"
              max="120"
            />
            
            <MedicalInput
              label="Edad Máxima"
              type="number"
              value={filters.edadMax}
              onChange={(e) => handleFilterChange('edadMax', e.target.value)}
              placeholder="Edad máx."
              min="0"
              max="120"
            />

            <MedicalInput
              label="Ciudad"
              value={filters.ciudad}
              onChange={(e) => handleFilterChange('ciudad', e.target.value)}
              placeholder="Filtrar por ciudad"
            />
          </div>
        </div>
      )}

      {/* Contador de resultados */}
      {hasActiveFilters && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">
            Filtros activos: {Object.values(filters).filter(v => v !== '').length}
          </p>
        </div>
      )}
    </div>
  );
}