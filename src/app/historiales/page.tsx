'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PatientHistoryList from './components/PatientHistoryList';
import NewHistoryModal from './modals/NewHistoryModal';
import { MedicalRecord } from './types';
import { MedicalHistory, convertEntryToHistory, convertHistoryToEntry } from './adapter';
import { sampleMedicalRecords } from './sampleData';

function HistorialesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Estado para las historias clínicas
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(sampleMedicalRecords);
  
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

  // Convertir registros médicos a historias clínicas consolidadas por paciente
  const patientHistories = useMemo(() => {
    return medicalRecords.map(record => {
      // Tomar la entrada más reciente como representativa
      const latestEntry = record.entries.sort((a, b) => 
        new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime()
      )[0];
      
      if (!latestEntry) return null;
      
      // Crear una historia clínica consolidada
      const consolidatedHistory = convertEntryToHistory(latestEntry, record.patient);
      
      // Agregar información adicional sobre el total de registros
      return {
        ...consolidatedHistory,
        totalEntries: record.entries.length,
        lastUpdated: record.updatedAt,
        allEntries: record.entries
      };
    }).filter((history): history is NonNullable<typeof history> => history !== null);
  }, [medicalRecords]);

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
    // Convertir a MedicalEntry
    const newEntry = convertHistoryToEntry({
      ...newHistory,
      id: `entry_${Date.now()}`
    });

    // Buscar si ya existe una historia clínica para este paciente
    const existingRecord = medicalRecords.find(r => r.patientId === newHistory.patientId);
    
    if (existingRecord) {
      // Agregar el nuevo registro a la historia existente
      setMedicalRecords(prev => prev.map(record => 
        record.id === existingRecord.id 
          ? { 
              ...record, 
              entries: [newEntry, ...record.entries],
              updatedAt: new Date().toISOString()
            }
          : record
      ));
    } else {
      console.log('Necesario crear nueva historia clínica para paciente:', newHistory.patientId);
    }
    
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
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historias Clínicas</h1>
            <p className="text-sm text-gray-600 mt-1">
              Historias clínicas completas y expedientes de pacientes
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>👥 {medicalRecords.length} pacientes con historia</span>
              <span>📋 {medicalRecords.reduce((total, record) => total + record.entries.length, 0)} registros totales</span>
              <span>🔍 {filteredHistories.length} historias mostradas</span>
            </div>
          </div>

          {/* Banner when filtered by patientId */}
          {searchParams?.get('patientId') && (
            <div className="w-full mt-3">
              <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-md px-4 py-2">
                <div className="text-sm text-purple-800">
                  Mostrando historias para el paciente seleccionado
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push('/historiales')}
                    className="text-sm px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    Limpiar filtro
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Búsqueda rápida */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Búsqueda rápida por paciente o doctor..."
                value={filters.patientName}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('patientName', value);
                  // También buscar en doctor
                  handleFilterChange('doctorName', value);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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

          <div className="flex space-x-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium border border-gray-300 flex items-center space-x-2 transition-colors relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium border border-gray-300 flex items-center space-x-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Exportar Historias</span>
            </button>
            <button
              onClick={() => setShowNewHistoryModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nueva Consulta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Filtros */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Búsqueda por nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paciente</label>
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={filters.patientName}
                  onChange={(e) => handleFilterChange('patientName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filtro por especialidad */}
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

              {/* Filtro por estado */}
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

              {/* Filtro por fecha desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha desde</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filtro por fecha hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha hasta</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Content */}
      <div className="flex-1 p-6">
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