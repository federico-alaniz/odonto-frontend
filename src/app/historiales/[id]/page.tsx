'use client';

import { useState, useEffect, useMemo } from 'react';
import { LoadingSpinner } from '@/components/ui/Spinner';
import { useRouter, useParams } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { UserCircle, ArrowLeft, Filter, Plus, Calendar, FileText } from 'lucide-react';
import { patientsService } from '@/services/api/patients.service';
import medicalRecordsService, { MedicalRecord } from '@/services/medicalRecords';
import historiaClinicaService, { HistoriaClinica } from '@/services/historiaClinica';
import { useAuth } from '@/hooks/useAuth';

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { buildPath } = useTenant();
  const { currentUser } = useAuth();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<any>(null);
  const [historiaClinica, setHistoriaClinica] = useState<HistoriaClinica | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
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

  const clinicId = useMemo(() => {
    return (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
  }, [currentUser?.id]);

  useEffect(() => {
    const loadPatientData = async () => {
      if (!clinicId) {
        return;
      }

      try {
        setLoading(true);
        
        // Load patient data
        const patientResponse = await patientsService.getPatientById(patientId, clinicId);
        if (patientResponse.success) {
          setPatient(patientResponse.data);
        }
        
        // TODO: Load historia clínica cuando el endpoint esté implementado en el backend
        // El endpoint /api/patients/:id/historia-clinica aún no existe
        setHistoriaClinica(null);
        
        // Load medical records
        const recordsResponse = await medicalRecordsService.getByPatient(patientId, 1, 50, clinicId);
        if (recordsResponse.success) {
          setMedicalRecords(recordsResponse.data || []);
        }
      } catch (error) {
        console.error('Error loading patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (clinicId) {
      loadPatientData();
    }
  }, [patientId, clinicId]);

  const handleNewRecord = () => {
    router.push(`/historiales/${patientId}/registro/new`);
  };

  const handleBack = () => {
    router.push(buildPath('/historiales'));
  };

  // Función para aplicar filtros
  const filteredHistories = medicalRecords.filter(record => {
    // Filtro por fecha desde
    if (filters.dateFrom) {
      const recordDate = new Date(record.fecha);
      const filterDate = new Date(filters.dateFrom);
      if (recordDate < filterDate) return false;
    }

    // Filtro por fecha hasta
    if (filters.dateTo) {
      const recordDate = new Date(record.fecha);
      const filterDate = new Date(filters.dateTo);
      filterDate.setHours(23, 59, 59, 999);
      if (recordDate > filterDate) return false;
    }

    // Filtro por tipo de consulta
    if (filters.type && record.tipoConsulta !== filters.type) {
      return false;
    }

    // Filtro por búsqueda de texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = `
        ${record.diagnostico || ''} 
        ${record.tratamiento || ''} 
        ${record.motivoConsulta || ''}
        ${record.observaciones || ''}
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
      <div className="flex-1 bg-gray-50 min-h-screen">
        <LoadingSpinner message="Cargando historia clínica..." />
      </div>
    );
  }

  if (!patient && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Paciente no encontrado</h2>
          <p className="text-gray-600 mb-4">El paciente que buscas no existe o ha sido eliminado.</p>
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getConsultaTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'general': 'Consulta General',
      'odontologia': 'Odontología',
      'pediatria': 'Pediatría',
      'cardiologia': 'Cardiología',
      'traumatologia': 'Traumatología',
      'ginecologia': 'Ginecología',
      'dermatologia': 'Dermatología',
      'neurologia': 'Neurología',
      'psiquiatria': 'Psiquiatría',
      'oftalmologia': 'Oftalmología'
    };
    return types[type] || type;
  };

  const getConsultaTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'general': 'bg-blue-100 text-blue-800',
      'odontologia': 'bg-cyan-100 text-cyan-800',
      'pediatria': 'bg-pink-100 text-pink-800',
      'cardiologia': 'bg-red-100 text-red-800',
      'traumatologia': 'bg-orange-100 text-orange-800',
      'ginecologia': 'bg-purple-100 text-purple-800',
      'dermatologia': 'bg-yellow-100 text-yellow-800',
      'neurologia': 'bg-indigo-100 text-indigo-800',
      'psiquiatria': 'bg-teal-100 text-teal-800',
      'oftalmologia': 'bg-lime-100 text-lime-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
                  <FileText className="w-4 h-4" />
                  {patient?.nombreCompleto || 'Cargando...'}
                  {historiaClinica && ` • HC: ${historiaClinica.numeroHistoriaClinica}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleNewRecord}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-violet-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-md flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Registro</span>
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
            <span className="text-gray-700">{patient?.nombreCompleto || 'Paciente'}</span>
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
              {medicalRecords.length} registros médicos
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-2xl">
                    {patient?.nombres?.[0]}{patient?.apellidos?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {patient?.nombreCompleto}
                  </h3>
                  <p className="text-sm text-gray-600">{patient?.email || 'Sin email'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Teléfono</label>
                <p className="text-sm font-medium text-gray-900">{patient?.telefono}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Documento</label>
                <p className="text-sm font-medium text-gray-900">{patient?.tipoDocumento?.toUpperCase()} {patient?.numeroDocumento}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Edad</label>
                <p className="text-sm font-medium text-gray-900">{patient?.edad} años</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Género</label>
                <p className="text-sm font-medium text-gray-900 capitalize">{patient?.genero}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Historia Clínica</label>
                <p className="text-sm font-medium text-gray-900">{historiaClinica?.numeroHistoriaClinica || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Última Consulta</label>
                <p className="text-sm font-medium text-gray-900">
                  {medicalRecords[0]?.fecha ? formatDate(medicalRecords[0].fecha) : 'Sin consultas'}
                </p>
              </div>
            </div>
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
                  {filteredHistories.length} de {medicalRecords.length} registros médicos
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {(filters.dateFrom || filters.dateTo || filters.type || filters.search) && (
                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {[filters.dateFrom, filters.dateTo, filters.type, filters.search].filter(Boolean).length}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de consulta</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los tipos</option>
                  <option value="general">General</option>
                  <option value="odontologia">Odontología</option>
                  <option value="pediatria">Pediatría</option>
                  <option value="cardiologia">Cardiología</option>
                  <option value="traumatologia">Traumatología</option>
                  <option value="ginecologia">Ginecología</option>
                  <option value="dermatologia">Dermatología</option>
                  <option value="neurologia">Neurología</option>
                  <option value="psiquiatria">Psiquiatría</option>
                  <option value="oftalmologia">Oftalmología</option>
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
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo Consulta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnóstico
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-500 mb-2">
                        {medicalRecords.length === 0 
                          ? 'No hay registros médicos para este paciente.'
                          : 'No se encontraron registros que coincidan con los filtros aplicados.'}
                      </p>
                      {medicalRecords.length === 0 ? (
                        <button
                          onClick={handleNewRecord}
                          className="mt-2 text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          Crear primer registro
                        </button>
                      ) : (
                        <button
                          onClick={clearFilters}
                          className="mt-2 text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistories.map((record) => (
                  <tr 
                    key={record.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/historiales/${patientId}/registro/${record.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(record.fecha)}</div>
                      <div className="text-xs text-gray-500">{formatTime(record.fecha)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConsultaTypeColor(record.tipoConsulta)}`}>
                        {getConsultaTypeLabel(record.tipoConsulta)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={record.motivoConsulta}>
                        {record.motivoConsulta || 'Sin motivo especificado'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={record.diagnostico}>
                        {record.diagnostico || 'Sin diagnóstico'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/historiales/${patientId}/registro/${record.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1 rounded transition-colors"
                          title="Ver detalles"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}