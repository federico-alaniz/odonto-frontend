'use client';

import { useState } from 'react';
import { Search, X, Settings, BarChart3, AlertTriangle } from 'lucide-react';

interface FiltersProps {
  filters: DoctorPatientFilters;
  onFiltersChange?: (filters: DoctorPatientFilters) => void;
}

export interface DoctorPatientFilters {
  search: string;
  numeroDocumento: string;
  genero: string;
  obraSocial: string;
  edadMin: string;
  edadMax: string;
  urgencia: string;
  ultimaConsulta: string;
}

export default function DoctorPatientsFilters({ filters, onFiltersChange }: FiltersProps) {
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

  const urgencias = [
    { value: '', label: 'Todas las urgencias' },
    { value: 'high', label: 'Alta prioridad' },
    { value: 'medium', label: 'Prioridad media' },
    { value: 'low', label: 'Prioridad baja' }
  ];

  const ultimaConsulta = [
    { value: '', label: 'Cualquier fecha' },
    { value: '7', label: 'Última semana' },
    { value: '30', label: 'Último mes' },
    { value: '90', label: 'Últimos 3 meses' },
    { value: '180', label: 'Últimos 6 meses' }
  ];

  const handleFilterChange = (field: keyof DoctorPatientFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: DoctorPatientFilters = {
      search: '',
      numeroDocumento: '',
      genero: '',
      obraSocial: '',
      edadMin: '',
      edadMax: '',
      urgencia: '',
      ultimaConsulta: ''
    };
    onFiltersChange?.(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Encabezado de filtros */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
              Filtros activos
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            {showAdvanced ? 'Filtros básicos' : 'Filtros avanzados'}
          </button>
        </div>
      </div>

      {/* Filtro básico - Búsqueda general */}
      <div className="mb-4">
        <div className="relative">
          <label className="sr-only">Búsqueda general</label>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full h-12 pl-11 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Número de documento */}
            <div className="relative">
              <label className="sr-only">Número de documento</label>
              <input
                type="text"
                placeholder="Número de documento"
                value={filters.numeroDocumento}
                onChange={(e) => handleFilterChange('numeroDocumento', e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              />
            </div>

            {/* Urgencia */}
            <div className="relative">
              <label className="sr-only">Urgencia</label>
              <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
              <select
                value={filters.urgencia}
                onChange={(e) => handleFilterChange('urgencia', e.target.value)}
                className="w-full h-12 pl-10 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
              >
                {urgencias.map(urgencia => (
                  <option key={urgencia.value} value={urgencia.value}>
                    {urgencia.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Última consulta */}
            <div className="relative">
              <label className="sr-only">Última consulta</label>
              <select
                value={filters.ultimaConsulta}
                onChange={(e) => handleFilterChange('ultimaConsulta', e.target.value)}
                className="w-full h-12 px-4 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
              >
                {ultimaConsulta.map(consulta => (
                  <option key={consulta.value} value={consulta.value}>
                    {consulta.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Género */}
            <div className="relative">
              <label className="sr-only">Género</label>
              <select
                value={filters.genero}
                onChange={(e) => handleFilterChange('genero', e.target.value)}
                className="w-full h-12 px-4 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
              >
                {generos.map(genero => (
                  <option key={genero.value} value={genero.value}>
                    {genero.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Obra Social */}
            <div className="relative">
              <label className="sr-only">Obra Social</label>
              <input
                type="text"
                placeholder="Obra Social"
                value={filters.obraSocial}
                onChange={(e) => handleFilterChange('obraSocial', e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              />
            </div>

            {/* Edad mínima */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Edad mínima</label>
              <input
                type="number"
                placeholder="Edad mínima"
                value={filters.edadMin}
                onChange={(e) => handleFilterChange('edadMin', e.target.value)}
                min="0"
                max="120"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              />
            </div>

            {/* Edad máxima */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Edad máxima</label>
              <input
                type="number"
                placeholder="Edad máxima"
                value={filters.edadMax}
                onChange={(e) => handleFilterChange('edadMax', e.target.value)}
                min="0"
                max="120"
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              />
            </div>

          </div>
        </div>
      )}

      {/* Resumen de filtros activos */}
      {hasActiveFilters && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                Nombre: {filters.search}
                <button onClick={() => handleFilterChange('search', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.numeroDocumento && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                Doc: {filters.numeroDocumento}
                <button onClick={() => handleFilterChange('numeroDocumento', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.urgencia && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                Urgencia: {urgencias.find(u => u.value === filters.urgencia)?.label}
                <button onClick={() => handleFilterChange('urgencia', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.genero && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                Género: {generos.find(g => g.value === filters.genero)?.label}
                <button onClick={() => handleFilterChange('genero', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.obraSocial && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                Obra Social: {filters.obraSocial}
                <button onClick={() => handleFilterChange('obraSocial', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(filters.edadMin || filters.edadMax) && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                Edad: {filters.edadMin || '0'}-{filters.edadMax || '∞'}
                <button onClick={() => {
                  handleFilterChange('edadMin', '');
                  handleFilterChange('edadMax', '');
                }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}