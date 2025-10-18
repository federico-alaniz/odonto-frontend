'use client';

import { useRouter } from 'next/navigation';
import { MedicalHistory } from '../adapter';
import { MedicalEntry } from '../types';

interface ConsolidatedHistory extends MedicalHistory {
  totalEntries?: number;
  lastUpdated?: string;
  allEntries?: MedicalEntry[];
}

interface PatientHistoryListProps {
  histories: ConsolidatedHistory[];
  onViewHistory?: (history: ConsolidatedHistory) => void; // Ahora es opcional
}

export default function PatientHistoryList({ histories, onViewHistory }: PatientHistoryListProps) {
  const router = useRouter();

  const handleViewHistory = (history: ConsolidatedHistory) => {
    if (onViewHistory) {
      // Si se proporciona onViewHistory, usarlo (para compatibilidad)
      onViewHistory(history);
    } else {
      // Por defecto, navegar a la página de detalles
      router.push(`/historiales/${history.id}`);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'closed': return 'Cerrado';
      case 'follow_up': return 'Seguimiento';
      default: return status;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'follow_up': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (histories.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay historias clínicas</h3>
          <p className="text-gray-500">No se encontraron historias clínicas que coincidan con los filtros seleccionados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Indicador de interacción */}
      <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center text-sm text-blue-700">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Hacer clic en cualquier fila para ver la historia clínica completa del paciente</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paciente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registros Médicos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Consulta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor / Especialidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Diagnóstico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {histories.map((history) => (
              <tr 
                key={history.id} 
                className="hover:bg-blue-50 hover:shadow-sm transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-blue-400"
                onClick={() => handleViewHistory(history)}
                title="Hacer clic para ver detalles de la historia clínica"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-800">
                          {history.patient.firstName.charAt(0)}{history.patient.lastName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {history.patient.firstName} {history.patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {history.patient.age} años • {history.patient.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {history.totalEntries || 1}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(history.totalEntries || 1) === 1 ? 'registro' : 'registros'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(history.consultationDate).toLocaleDateString('es-ES')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {history.consultationTime}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{history.doctor}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSpecialtyColor(history.specialty)}`}>
                    {getSpecialtyLabel(history.specialty)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={history.diagnosis}>
                    {history.diagnosis}
                  </div>
                  <div className="text-sm text-gray-500 max-w-xs truncate" title={history.symptoms}>
                    Síntomas: {history.symptoms}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(history.status)}`}>
                    {getStatusLabel(history.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="text-blue-600 flex items-center space-x-1">
                    <span>Ver detalles</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}