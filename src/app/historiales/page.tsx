'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipboardList, Info, Plus, FileText, Filter, Download, Users, Search } from 'lucide-react';
import PatientHistoryList from './components/PatientHistoryList';
import NewHistoryModal from './modals/NewHistoryModal';
import { MedicalRecord } from './types';
import { MedicalHistory, getAllMedicalHistories } from './adapter';

function HistorialesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Estado para las historias clínicas usando datos fake
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>(getAllMedicalHistories());
  
  // Estados para los modales
  const [showNewHistoryModal, setShowNewHistoryModal] = useState(false);

  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    patientName: '',
    doctorName: '',
    specialty: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    diagnosis: ''
  });

  // Convertir las historias médicas a formato directo
  const patientHistories = useMemo(() => {
    return medicalHistories;
  }, [medicalHistories]);

  // Obtener parámetro de paciente de la URL
  const patientIdParam = searchParams?.get('patientId');

  // Aplicar filtros a las historias clínicas
  const filteredHistories = useMemo(() => {
    return patientHistories.filter(history => {
      // Si viene patientId en la URL, filtrar por ese paciente y omitir otros filtros
      if (patientIdParam) {
        // Verificar si el history tiene patient con id
        const historyWithPatient = history as { patient?: { id?: string } };
        if (historyWithPatient.patient && historyWithPatient.patient.id) {
          return historyWithPatient.patient.id === patientIdParam;
        }
        return false;
      }
      // Búsqueda rápida (nombre de paciente O doctor)
      if (filters.patientName) {
        const searchTerm = filters.patientName.toLowerCase();
        const fullName = `${history.patient.firstName} ${history.patient.lastName}`.toLowerCase();
        const doctorName = history.doctor.toLowerCase();
        
        // Si no coincide ni con paciente ni con doctor, filtrar
        if (!fullName.includes(searchTerm) && !doctorName.includes(searchTerm)) {
          return false;
        }
      }
      
      // Filtro específico por doctor (solo aplica cuando no viene de búsqueda rápida)
      if (filters.doctorName && filters.doctorName !== filters.patientName) {
        if (!history.doctor.toLowerCase().includes(filters.doctorName.toLowerCase())) {
          return false;
        }
      }
      
      if (filters.specialty && history.specialty !== filters.specialty) {
        return false;
      }
      
      if (filters.dateFrom) {
        const historyDate = new Date(history.consultationDate);
        const filterDate = new Date(filters.dateFrom);
        if (historyDate < filterDate) {
          return false;
        }
      }
      
      if (filters.dateTo) {
        const historyDate = new Date(history.consultationDate);
        const filterDate = new Date(filters.dateTo);
        filterDate.setHours(23, 59, 59, 999);
        if (historyDate > filterDate) {
          return false;
        }
      }
      
      if (filters.status && history.status !== filters.status) {
        return false;
      }
      
      if (filters.diagnosis && !history.diagnosis.toLowerCase().includes(filters.diagnosis.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [patientHistories, filters, patientIdParam]);

  // Manejar creación de nueva historia
  const handleCreateNewHistory = (newHistory: Omit<MedicalHistory, 'id'>) => {
    // Crear nueva historia con ID único
    const history: MedicalHistory = {
      ...newHistory,
      id: `history_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    // Agregar la nueva historia al estado
    setMedicalHistories(prev => [history, ...prev]);
    setShowNewHistoryModal(false);
  };

  // Manejar actualización de historia editada
  // Cerrar modales
  const handleCloseModals = () => {
    setShowNewHistoryModal(false);
  };

  // Funciones de filtrado
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      patientName: '',
      doctorName: '',
      specialty: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      diagnosis: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-md">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Historias Clínicas</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Expedientes médicos completos y consultas de pacientes
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-700">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {medicalHistories.length} pacientes con historia
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {medicalHistories.length} registros totales
                  </span>
                  <span className="flex items-center gap-1">
                    <Search className="w-4 h-4" />
                    {filteredHistories.length} historias mostradas
                  </span>
                </div>
              </div>
            </div>

            
            <div className="flex items-center space-x-3">
              {/* Búsqueda rápida */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Búsqueda por paciente o doctor..."
                    value={filters.patientName}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleFilterChange('patientName', value);
                      handleFilterChange('doctorName', value);
                    }}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {filters.patientName && (
                    <button
                      onClick={() => {
                        handleFilterChange('patientName', '');
                        handleFilterChange('doctorName', '');
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium border border-gray-300 flex items-center space-x-2 transition-all relative"
              >
                <Filter className="w-5 h-5" />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              
              <button className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium border border-gray-300 flex items-center space-x-2 transition-all">
                <Download className="w-5 h-5" />
                <span>Exportar</span>
              </button>
              
              <button
                onClick={() => setShowNewHistoryModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-violet-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-md flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nueva Consulta</span>
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
            <span className="text-gray-700">Expedientes Médicos</span>
          </div>
        </div>
        
        {/* Banner when filtered by patientId */}
        {searchParams?.get('patientId') && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl px-4 py-3">
              <div className="text-sm text-purple-800 font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Mostrando historias para el paciente seleccionado
              </div>
              <button
                onClick={() => router.push('/historiales')}
                className="text-sm px-3 py-1 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 text-purple-700 font-medium transition-all"
              >
                Limpiar filtro
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Panel de Filtros */}
      {showFilters && (
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Búsqueda por nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paciente</label>
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={filters.patientName}
                  onChange={(e) => handleFilterChange('patientName', e.target.value)}
                  className="w-full px-4 py-3 h-12 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filtro por doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                <input
                  type="text"
                  placeholder="Buscar por doctor..."
                  value={filters.doctorName}
                  onChange={(e) => handleFilterChange('doctorName', e.target.value)}
                  className="w-full px-4 py-3 h-12 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filtro por especialidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
                <select
                  value={filters.specialty}
                  onChange={(e) => handleFilterChange('specialty', e.target.value)}
                  className="w-full px-4 py-3 h-12 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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

              {/* Filtro por estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-3 h-12 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="closed">Cerrado</option>
                  <option value="follow_up">Seguimiento</option>
                </select>
              </div>

              {/* Filtro por fecha desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha desde</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-4 py-3 h-12 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filtro por fecha hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha hasta</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-4 py-3 h-12 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filtro por diagnóstico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnóstico</label>
                <input
                  type="text"
                  placeholder="Buscar en diagnóstico..."
                  value={filters.diagnosis}
                  onChange={(e) => handleFilterChange('diagnosis', e.target.value)}
                  className="w-full px-4 py-3 h-12 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Botón limpiar filtros */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PatientHistoryList
          histories={filteredHistories}
        />
      </div>

      {/* Modales */}
      {showNewHistoryModal && (
        <NewHistoryModal
          isOpen={showNewHistoryModal}
          onClose={handleCloseModals}
          onSave={handleCreateNewHistory}
        />
      )}
    </div>
  );
}

export default function HistorialesPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <HistorialesContent />
    </Suspense>
  );
}
