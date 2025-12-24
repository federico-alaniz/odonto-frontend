'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Info, Plus, Download } from 'lucide-react';
import { MedicalHistory, getAllMedicalHistories } from '../historiales/adapter';

export default function RegistrosMedicosPage() {
  const router = useRouter();
  
  // Estado para las historias clínicas usando datos fake
  const [medicalHistories] = useState<MedicalHistory[]>(getAllMedicalHistories());
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Estados para ordenamiento
  const [sortField, setSortField] = useState<string>('consultationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Usar directamente las historias médicas
  const allEntries = useMemo(() => {
    return medicalHistories;
  }, [medicalHistories]);

  // Aplicar filtros y ordenamiento
  const filteredEntries = useMemo(() => {
    const filtered = allEntries.filter(entry => {
      // Filtro de búsqueda (paciente, doctor, diagnóstico)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          `${entry.patient.firstName} ${entry.patient.lastName}`.toLowerCase().includes(searchLower) ||
          entry.doctor.toLowerCase().includes(searchLower) ||
          entry.diagnosis.toLowerCase().includes(searchLower) ||
          entry.symptoms.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtro por especialidad
      if (selectedSpecialty && entry.specialty !== selectedSpecialty) {
        return false;
      }

      // Filtro por estado
      if (selectedStatus && entry.status !== selectedStatus) {
        return false;
      }

      // Filtro por fecha
      if (dateFilter && entry.consultationDate !== dateFilter) {
        return false;
      }

      return true;
    });

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sortField as keyof typeof a] as string | number | Date;
      let bValue: string | number | Date = b[sortField as keyof typeof b] as string | number | Date;

      // Manejo especial para campos anidados
      if (sortField === 'patientName') {
        aValue = `${a.patient.firstName} ${a.patient.lastName}`;
        bValue = `${b.patient.firstName} ${b.patient.lastName}`;
      }

      // Convertir a string para comparación consistente
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allEntries, searchTerm, selectedSpecialty, selectedStatus, dateFilter, sortField, sortDirection]);

  // Manejar visualización de detalle
  const handleViewEntry = (entry: MedicalHistory) => {
    // Navegar a la página de detalles
    router.push(`/historiales/${entry.patientId}/registro/${entry.id}`);
  };

  // Manejar edición
  const handleEditEntry = (entry: MedicalHistory) => {
    // Navegar a la página de edición
    router.push(`/historiales/${entry.patientId}/registro/${entry.id}/editar`);
  };

  // Manejar ordenamiento
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Obtener estadísticas rápidas
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);
    
    return {
      total: allEntries.length,
      today: allEntries.filter(e => e.consultationDate === today).length,
      thisMonth: allEntries.filter(e => e.consultationDate.startsWith(thisMonth)).length,
      active: allEntries.filter(e => e.status === 'active').length
    };
  }, [allEntries]);

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'consultation': 'bg-blue-100 text-blue-800',
      'followup': 'bg-green-100 text-green-800',
      'emergency': 'bg-red-100 text-red-800',
      'checkup': 'bg-purple-100 text-purple-800',
      'surgery': 'bg-orange-100 text-orange-800',
      'therapy': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-yellow-100 text-yellow-800',
      'closed': 'bg-gray-100 text-gray-800',
      'follow_up': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-md">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Registros Médicos</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Consultas y registros individuales de pacientes
                </p>
                
                {/* Estadísticas rápidas */}
                <div className="flex items-center space-x-6 mt-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                    <span className="text-gray-600">Total: <strong className="text-gray-900">{stats.total}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-600">Hoy: <strong className="text-gray-900">{stats.today}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    <span className="text-gray-600">Este mes: <strong className="text-gray-900">{stats.thisMonth}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="text-gray-600">Activos: <strong className="text-gray-900">{stats.active}</strong></span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium border border-gray-300 flex items-center space-x-2 transition-all">
                <Download className="w-5 h-5" />
                <span>Exportar</span>
              </button>
              
              <button 
                onClick={() => {}}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-md flex items-center space-x-2"
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
            <span className="text-emerald-600 font-medium">Registros Médicos</span>
            <span>•</span>
            <span className="text-gray-700">Consultas Individuales</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Paciente, doctor, diagnóstico..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Especialidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las especialidades</option>
              <option value="clinica-medica">Clínica Médica</option>
              <option value="cardiologia">Cardiología</option>
              <option value="odontologia">Odontología</option>
              <option value="pediatria">Pediatría</option>
              <option value="traumatologia">Traumatología</option>
              <option value="ginecologia">Ginecología</option>
              <option value="dermatologia">Dermatología</option>
              <option value="neurologia">Neurología</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="follow_up">Seguimiento</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros médicos</h3>
            <p className="text-gray-600">No se encontraron registros que coincidan con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('consultationDate')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Fecha/Hora</span>
                        {sortField === 'consultationDate' && (
                          <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('patientName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Paciente</span>
                        {sortField === 'patientName' && (
                          <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('doctor')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Doctor/Especialidad</span>
                        {sortField === 'doctor' && (
                          <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Tipo</span>
                        {sortField === 'type' && (
                          <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('diagnosis')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Diagnóstico</span>
                        {sortField === 'diagnosis' && (
                          <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Estado</span>
                        {sortField === 'status' && (
                          <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(entry.consultationDate).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">{entry.consultationTime}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {entry.patient.firstName.charAt(0)}{entry.patient.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.patient.firstName} {entry.patient.lastName}
                            </div>
                            <div className="text-sm text-gray-500">DNI: {entry.patient.dni}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{entry.doctor}</div>
                        <div className="text-sm text-gray-500 capitalize">{entry.specialty.replace('-', ' ')}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}>
                          {entry.type === 'consultation' ? 'Consulta' :
                           entry.type === 'followup' ? 'Seguimiento' :
                           entry.type === 'emergency' ? 'Urgencia' :
                           entry.type === 'checkup' ? 'Control' :
                           entry.type === 'surgery' ? 'Cirugía' : 'Terapia'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={entry.diagnosis}>
                          {entry.diagnosis}
                        </div>
                        {entry.symptoms && (
                          <div className="text-sm text-gray-500 max-w-xs truncate" title={entry.symptoms}>
                            {entry.symptoms}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                          {entry.status === 'active' ? 'Activo' :
                           entry.status === 'closed' ? 'Cerrado' : 'Seguimiento'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => handleViewEntry(entry)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-sm transition-colors"
                            title="Ver detalle"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded text-sm transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Info */}
            <div className="bg-white px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{filteredEntries.length}</span> registro(s) médico(s)
                </div>
                <div className="text-sm text-gray-500">
                  Última actualización: {new Date().toLocaleTimeString('es-ES')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}