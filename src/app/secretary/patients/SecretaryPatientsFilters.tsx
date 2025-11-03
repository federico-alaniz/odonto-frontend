'use client';

import { useState } from 'react';
import { Search, X, Settings, BarChart3, Filter, Calendar, Users } from 'lucide-react';
import MedicalInput from '@/components/forms/MedicalInput';
import MedicalSelect from '@/components/forms/MedicalSelect';

interface FiltersProps {
  onFiltersChange?: (filters: SecretaryPatientFilters) => void;
}

export interface SecretaryPatientFilters {
  search: string;
  numeroDocumento: string;
  genero: string;
  tipoSangre: string;
  edadMin: string;
  edadMax: string;
  ciudad: string;
  estado: string;
  ultimaConsulta: string;
}

export default function SecretaryPatientsFilters({ onFiltersChange }: FiltersProps) {
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

  const estados = [
    { value: '', label: 'Todos los estados' },
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'pendiente', label: 'Pendiente de datos' },
    { value: 'seguimiento', label: 'Requiere seguimiento' }
  ];

  const periodosConsulta = [
    { value: '', label: 'Cualquier período' },
    { value: 'hoy', label: 'Consulta hoy' },
    { value: 'esta-semana', label: 'Esta semana' },
    { value: 'este-mes', label: 'Este mes' },
    { value: 'ultimo-mes', label: 'Último mes' },
    { value: 'mas-de-mes', label: 'Más de 1 mes' },
    { value: 'mas-de-3-meses', label: 'Más de 3 meses' },
    { value: 'nunca', label: 'Sin consultas' }
  ];

  const ciudades = [
    { value: '', label: 'Todas las ciudades' },
    { value: 'buenos-aires', label: 'Buenos Aires' },
    { value: 'cordoba', label: 'Córdoba' },
    { value: 'rosario', label: 'Rosario' },
    { value: 'mendoza', label: 'Mendoza' },
    { value: 'la-plata', label: 'La Plata' },
    { value: 'mar-del-plata', label: 'Mar del Plata' },
    { value: 'salta', label: 'Salta' },
    { value: 'santa-fe', label: 'Santa Fe' },
    { value: 'san-juan', label: 'San Juan' },
    { value: 'resistencia', label: 'Resistencia' }
  ];

  const handleFilterChange = (field: keyof SecretaryPatientFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: SecretaryPatientFilters = {
      search: '',
      numeroDocumento: '',
      genero: '',
      tipoSangre: '',
      edadMin: '',
      edadMax: '',
      ciudad: '',
      estado: '',
      ultimaConsulta: ''
    };
    setFilters(emptyFilters);
    onFiltersChange?.(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Search className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Filtros de Búsqueda
            </h2>
            <p className="text-sm text-gray-600">
              Encuentra pacientes específicos usando múltiples criterios
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
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              showAdvanced 
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{showAdvanced ? 'Ocultar' : 'Mostrar'} filtros avanzados</span>
          </button>
        </div>
      </div>

      {/* Filtros principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <MedicalInput
            label="Búsqueda general"
            placeholder="Nombre, apellido, documento, teléfono..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <MedicalInput
          label="Número de documento"
          placeholder="Ej: 12345678"
          value={filters.numeroDocumento}
          onChange={(e) => handleFilterChange('numeroDocumento', e.target.value)}
        />
      </div>

      {/* Filtros rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MedicalSelect
          label="Estado"
          value={filters.estado}
          onChange={(e) => handleFilterChange('estado', e.target.value)}
          options={estados}
        />

        <MedicalSelect
          label="Última consulta"
          value={filters.ultimaConsulta}
          onChange={(e) => handleFilterChange('ultimaConsulta', e.target.value)}
          options={periodosConsulta}
        />

        <MedicalSelect
          label="Género"
          value={filters.genero}
          onChange={(e) => handleFilterChange('genero', e.target.value)}
          options={generos}
        />

        <MedicalSelect
          label="Ciudad"
          value={filters.ciudad}
          onChange={(e) => handleFilterChange('ciudad', e.target.value)}
          options={ciudades}
        />
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">Filtros Avanzados</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MedicalSelect
              label="Tipo de sangre"
              value={filters.tipoSangre}
              onChange={(e) => handleFilterChange('tipoSangre', e.target.value)}
              options={tiposSangre}
            />

            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <MedicalInput
                label="Edad mínima"
                type="number"
                placeholder="18"
                value={filters.edadMin}
                onChange={(e) => handleFilterChange('edadMin', e.target.value)}
                min="0"
                max="120"
              />
              <MedicalInput
                label="Edad máxima"
                type="number"
                placeholder="65"
                value={filters.edadMax}
                onChange={(e) => handleFilterChange('edadMax', e.target.value)}
                min="0"
                max="120"
              />
            </div>
          </div>
        </div>
      )}

      {/* Resumen de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Filtros activos:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters)
              .filter(([_, value]) => value !== '')
              .map(([key, value]) => {
                const labels: Record<string, string> = {
                  search: 'Búsqueda',
                  numeroDocumento: 'Documento',
                  genero: 'Género',
                  tipoSangre: 'Tipo de sangre',
                  edadMin: 'Edad mín.',
                  edadMax: 'Edad máx.',
                  ciudad: 'Ciudad',
                  estado: 'Estado',
                  ultimaConsulta: 'Última consulta'
                };
                
                return (
                  <span
                    key={key}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md"
                  >
                    <span>{labels[key]}: {value}</span>
                    <button
                      onClick={() => handleFilterChange(key as keyof SecretaryPatientFilters, '')}
                      className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}