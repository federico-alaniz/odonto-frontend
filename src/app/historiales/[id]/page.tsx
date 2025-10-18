'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserCircle, ArrowLeft, Edit3, Info, Filter, Plus } from 'lucide-react';
import { MedicalHistory, convertEntryToHistory } from '../adapter';
import { MedicalRecord } from '../types';
import { sampleMedicalRecords } from '../sampleData';

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const historyId = params.id as string;
  
  const [history, setHistory] = useState<MedicalHistory | null>(null);
  const [, setPatientRecord] = useState<MedicalRecord | null>(null);
  const [allHistories, setAllHistories] = useState<MedicalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    specialty: '',
    type: '',
    status: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Buscar el paciente y sus registros médicos por ID del registro
    const findPatientAndRecords = () => {
      for (const record of sampleMedicalRecords) {
        for (const entry of record.entries) {
          const convertedHistory = convertEntryToHistory(entry, record.patient);
          if (convertedHistory.id === historyId) {
            // Retornar tanto la historia específica como todos los registros del paciente
            const allPatientHistories = record.entries.map(e => convertEntryToHistory(e, record.patient));
            return {
              selectedHistory: convertedHistory,
              patientRecord: record,
              allHistories: allPatientHistories
            };
          }
        }
      }
      return null;
    };

    const result = findPatientAndRecords();
    if (result) {
      setHistory(result.selectedHistory);
      setPatientRecord(result.patientRecord);
      setAllHistories(result.allHistories);
    }
    setLoading(false);
  }, [historyId]);

  const handleEdit = () => {
    // Navegar a la página de nueva consulta
    console.log('Abrir modal de nueva consulta');
  };

  const handleBack = () => {
    router.push('/historiales');
  };

  // Función para aplicar filtros
  const filteredHistories = allHistories.filter(record => {
    // Filtro por fecha desde
    if (filters.dateFrom) {
      const recordDate = new Date(record.consultationDate);
      const filterDate = new Date(filters.dateFrom);
      if (recordDate < filterDate) return false;
    }

    // Filtro por fecha hasta
    if (filters.dateTo) {
      const recordDate = new Date(record.consultationDate);
      const filterDate = new Date(filters.dateTo);
      filterDate.setHours(23, 59, 59, 999); // Incluir todo el día
      if (recordDate > filterDate) return false;
    }

    // Filtro por especialidad
    if (filters.specialty && record.specialty !== filters.specialty) {
      return false;
    }

    // Filtro por tipo de consulta
    if (filters.type && record.type !== filters.type) {
      return false;
    }

    // Filtro por estado
    if (filters.status && record.status !== filters.status) {
      return false;
    }

    // Filtro por búsqueda de texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = `
        ${record.doctor} 
        ${record.diagnosis} 
        ${record.treatment} 
        ${record.symptoms}
        ${record.notes || ''}
      `.toLowerCase();
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      specialty: '',
      type: '',
      status: '',
      search: ''
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Historia clínica no encontrada</h2>
          <p className="text-gray-600 mb-4">La historia clínica que buscas no existe o ha sido eliminada.</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Volver a Historias Clínicas
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      in_progress: 'bg-blue-100 text-blue-800'
    };

    const statusLabels = {
      completed: 'Completada',
      pending: 'Pendiente',
      cancelled: 'Cancelada',
      in_progress: 'En Progreso'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'consultation': 'Consulta',
      'followup': 'Seguimiento',
      'emergency': 'Urgencia',
      'checkup': 'Control',
      'surgery': 'Cirugía',
      'therapy': 'Terapia'
    };
    return types[type] || type;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'closed': return 'Cerrado';
      case 'follow_up': return 'Seguimiento';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'follow_up': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'followup': return 'bg-amber-100 text-amber-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'checkup': return 'bg-green-100 text-green-800';
      case 'surgery': return 'bg-purple-100 text-purple-800';
      case 'therapy': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpecialtyLabel = (specialty: string) => {
    const specialties: { [key: string]: string } = {
      'clinica-medica': 'Clínica Médica',
      'pediatria': 'Pediatría',
      'cardiologia': 'Cardiología',
      'traumatologia': 'Traumatología',
      'ginecologia': 'Ginecología',
      'dermatologia': 'Dermatología',
      'neurologia': 'Neurología',
      'psiquiatria': 'Psiquiatría',
      'odontologia': 'Odontología',
      'oftalmologia': 'Oftalmología',
      'otorrinolaringologia': 'Otorrinolaringología',
      'urologia': 'Urología',
      'endocrinologia': 'Endocrinología',
      'gastroenterologia': 'Gastroenterología',
      'nefrologia': 'Nefrología',
      'neumologia': 'Neumología'
    };
    return specialties[specialty] || specialty;
  };

  const getSpecialtyColor = (specialty: string) => {
    switch (specialty) {
      case 'clinica-medica': return 'bg-blue-100 text-blue-800';
      case 'pediatria': return 'bg-pink-100 text-pink-800';
      case 'cardiologia': return 'bg-red-100 text-red-800';
      case 'traumatologia': return 'bg-orange-100 text-orange-800';
      case 'ginecologia': return 'bg-purple-100 text-purple-800';
      case 'dermatologia': return 'bg-yellow-100 text-yellow-800';
      case 'neurologia': return 'bg-indigo-100 text-indigo-800';
      case 'psiquiatria': return 'bg-teal-100 text-teal-800';
      case 'odontologia': return 'bg-cyan-100 text-cyan-800';
      case 'oftalmologia': return 'bg-lime-100 text-lime-800';
      case 'otorrinolaringologia': return 'bg-emerald-100 text-emerald-800';
      case 'urologia': return 'bg-sky-100 text-sky-800';
      case 'endocrinologia': return 'bg-violet-100 text-violet-800';
      case 'gastroenterologia': return 'bg-amber-100 text-amber-800';
      case 'nefrologia': return 'bg-rose-100 text-rose-800';
      case 'neumologia': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-md">
                <UserCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Historia Clínica</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  {history.patient.firstName} {history.patient.lastName} • {formatDate(history.consultationDate)}
              </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {getStatusBadge(history.status)}
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-violet-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-md flex items-center space-x-2"
              >
                <Edit3 className="w-5 h-5" />
                <span>Editar Historia</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb visual */}
        <div className="px-6 pb-4">
          <div className="flex items-center text-sm text-gray-500 space-x-2">
            <span>Gestión</span>
            <span>•</span>
            <span className="text-purple-600 font-medium">Historias Clínicas</span>
            <span>•</span>
            <span className="text-gray-700">{history.patient.firstName} {history.patient.lastName}</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          
          {/* Información del Paciente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserCircle className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Información del Paciente</h2>
                    <p className="text-sm text-gray-600 mt-1">Datos demográficos y contacto</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg border border-gray-200">
                  {allHistories.length} registros médicos
                </div>
              </div>
            </div>
            
            <div className="p-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-2xl">
                      {history.patient.firstName[0]}{history.patient.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {history.patient.firstName} {history.patient.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{history.patient.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Teléfono</label>
                  <p className="text-sm font-medium text-gray-900">{history.patient.phone}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide">DNI</label>
                  <p className="text-sm font-medium text-gray-900">{history.patient.dni}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Edad</label>
                  <p className="text-sm font-medium text-gray-900">{history.patient.age} años</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Última Consulta</label>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(allHistories[0]?.consultationDate || history.consultationDate)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-end">
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Nueva Consulta</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de Registros Médicos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-gray-200 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Plus className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Historial Médico Completo</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredHistories.length} de {allHistories.length} registros médicos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtros</span>
                  {(filters.dateFrom || filters.dateTo || filters.specialty || filters.type || filters.status || filters.search) && (
                    <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {[filters.dateFrom, filters.dateTo, filters.specialty, filters.type, filters.status, filters.search].filter(Boolean).length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Panel de Filtros */}
            {showFilters && (
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Búsqueda</label>
                    <input
                      type="text"
                      placeholder="Buscar en diagnóstico, tratamiento..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha desde</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha hasta</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
                    <select
                      value={filters.specialty}
                      onChange={(e) => handleFilterChange('specialty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Todas las especialidades</option>
                      <option value="clinica-medica">Clínica Médica</option>
                      <option value="pediatria">Pediatría</option>
                      <option value="cardiologia">Cardiología</option>
                      <option value="traumatologia">Traumatología</option>
                      <option value="ginecologia">Ginecología</option>
                      <option value="dermatologia">Dermatología</option>
                      <option value="neurologia">Neurología</option>
                      <option value="psiquiatria">Psiquiatría</option>
                      <option value="odontologia">Odontología</option>
                      <option value="oftalmologia">Oftalmología</option>
                      <option value="otorrinolaringologia">Otorrinolaringología</option>
                      <option value="urologia">Urología</option>
                      <option value="endocrinologia">Endocrinología</option>
                      <option value="gastroenterologia">Gastroenterología</option>
                      <option value="nefrologia">Nefrología</option>
                      <option value="neumologia">Neumología</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de consulta</label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Todos los tipos</option>
                      <option value="consultation">Consulta</option>
                      <option value="followup">Seguimiento</option>
                      <option value="emergency">Urgencia</option>
                      <option value="checkup">Control</option>
                      <option value="surgery">Cirugía</option>
                      <option value="therapy">Terapia</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Todos los estados</option>
                      <option value="active">Activo</option>
                      <option value="closed">Cerrado</option>
                      <option value="follow_up">Seguimiento</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-end mt-4 space-x-3">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Limpiar filtros
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Especialidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnóstico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHistories.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm text-gray-500">No se encontraron registros que coincidan con los filtros aplicados.</p>
                          <button
                            onClick={clearFilters}
                            className="mt-2 text-blue-600 hover:text-blue-500 text-sm font-medium"
                          >
                            Limpiar filtros
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredHistories.map((record) => (
                    <tr 
                      key={record.id} 
                      className={`hover:bg-gray-50 transition-colors ${record.id === historyId ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(record.consultationDate)}</div>
                        <div className="text-xs text-gray-500">{record.consultationTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.doctor}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSpecialtyColor(record.specialty)}`}>
                          {getSpecialtyLabel(record.specialty)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                          {getTypeLabel(record.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={record.diagnosis}>
                          {record.diagnosis}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {getStatusLabel(record.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/historiales/${historyId}/registro/${record.id}`)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1 rounded transition-colors"
                            title="Ver detalles"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => router.push(`/historiales/${historyId}/registro/${record.id}/editar`)}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 p-1 rounded transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}