'use client';

import { useState } from 'react';
import MedicalInput from '@/components/forms/MedicalInput';
import MedicalSelect from '@/components/forms/MedicalSelect';

interface FiltersProps {
  onFiltersChange?: (filters: PatientFilters) => void;
}

export interface PatientFilters {
  search: string;
  tipoDocumento: string;
  genero: string;
  tipoSangre: string;
  estadoCivil: string;
  edadMin: string;
  edadMax: string;
  ciudad: string;
}

export default function PatientsFilters({ onFiltersChange }: FiltersProps) {
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

  const [showAdvanced, setShowAdvanced] = useState(false);

  const tiposDocumento = [
    { value: '', label: 'Todos los tipos' },
    { value: 'cc', label: 'Cédula de Ciudadanía' },
    { value: 'ti', label: 'Tarjeta de Identidad' },
    { value: 'ce', label: 'Cédula de Extranjería' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'rc', label: 'Registro Civil' }
  ];

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

  const estadosCiviles = [
    { value: '', label: 'Todos los estados' },
    { value: 'soltero', label: 'Soltero/a' },
    { value: 'casado', label: 'Casado/a' },
    { value: 'union_libre', label: 'Unión Libre' },
    { value: 'divorciado', label: 'Divorciado/a' },
    { value: 'viudo', label: 'Viudo/a' }
  ];

  const handleFilterChange = (field: keyof PatientFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: PatientFilters = {
      search: '',
      tipoDocumento: '',
      genero: '',
      tipoSangre: '',
      estadoCivil: '',
      edadMin: '',
      edadMax: '',
      ciudad: ''
    };
    setFilters(emptyFilters);
    onFiltersChange?.(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="medical-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-2 sm:mb-0">
          🔍 Filtros de Búsqueda
        </h2>
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              🗑️ Limpiar filtros
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
          icon="🔍"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Buscar por nombre, apellido, documento o email..."
          className="text-lg"
        />
      </div>

      {/* Filtros básicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <MedicalSelect
          label="Tipo de Documento"
          icon="🆔"
          value={filters.tipoDocumento}
          onChange={(e) => handleFilterChange('tipoDocumento', e.target.value)}
          options={tiposDocumento}
        />
        
        <MedicalSelect
          label="Género"
          icon="⚧️"
          value={filters.genero}
          onChange={(e) => handleFilterChange('genero', e.target.value)}
          options={generos}
        />
        
        <MedicalInput
          label="Ciudad"
          icon="🏙️"
          value={filters.ciudad}
          onChange={(e) => handleFilterChange('ciudad', e.target.value)}
          placeholder="Filtrar por ciudad"
        />
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="border-t medical-border pt-4">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Filtros Avanzados</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MedicalSelect
              label="Tipo de Sangre"
              icon="🩸"
              value={filters.tipoSangre}
              onChange={(e) => handleFilterChange('tipoSangre', e.target.value)}
              options={tiposSangre}
            />
            
            <MedicalSelect
              label="Estado Civil"
              icon="💑"
              value={filters.estadoCivil}
              onChange={(e) => handleFilterChange('estadoCivil', e.target.value)}
              options={estadosCiviles}
            />
            
            <MedicalInput
              label="Edad Mínima"
              icon="📅"
              type="number"
              value={filters.edadMin}
              onChange={(e) => handleFilterChange('edadMin', e.target.value)}
              placeholder="Edad mín."
              min="0"
              max="120"
            />
            
            <MedicalInput
              label="Edad Máxima"
              icon="📅"
              type="number"
              value={filters.edadMax}
              onChange={(e) => handleFilterChange('edadMax', e.target.value)}
              placeholder="Edad máx."
              min="0"
              max="120"
            />
          </div>
        </div>
      )}

      {/* Contador de resultados */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            📊 Filtros activos: {Object.values(filters).filter(v => v !== '').length}
          </p>
        </div>
      )}
    </div>
  );
}