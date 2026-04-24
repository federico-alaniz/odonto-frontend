'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { Users, UserPlus, Info, Calendar, ClipboardList, Stethoscope, Search, X } from 'lucide-react';
import SecretaryPatientsTable from './SecretaryPatientsTable';
import { patientsService } from '@/services/api/patients.service';

export default function SecretaryPatientsPage() {
  const { currentUser } = useAuth();
  const { buildPath } = useTenant();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
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

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [requireFollowUp, setRequireFollowUp] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
        if (!clinicId) return;
        
        // Cargar estadísticas de pacientes
        const response = await patientsService.getPatientStats(clinicId);
        setStats({
          total: response.data.total,
          active: response.data.active,
          inactive: response.data.inactive
        });

        // Cargar citas de hoy
        const today = new Date().toISOString().split('T')[0];
        const { appointmentsService } = await import('@/services/api/appointments.service');
        const appointmentsResponse = await appointmentsService.getAppointments(clinicId, {
          fecha: today,
          limit: 1000
        });
        setAppointmentsToday(appointmentsResponse.data?.length || 0);

        // Cargar pacientes que requieren seguimiento
        const patientsResponse = await patientsService.getPatients(clinicId, {
          limit: 1000
        });
        // TODO: Implementar lógica de seguimiento cuando se agregue al modelo Patient
        const followUpCount = 0;
        setRequireFollowUp(followUpCount);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, [currentUser]);

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Registro, consulta y administración de pacientes
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setFilters(prev => ({ ...prev, search: e.target.value }));
                  }}
                  placeholder="Buscar paciente..."
                  className="w-80 pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilters(prev => ({ ...prev, search: '' }));
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <Link
                href={buildPath('/secretary/appointments')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Nuevo Turno</span>
              </Link>
              
              <Link
                href={buildPath('/pacientes/nuevo')}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md inline-flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Nuevo Paciente</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb visual */}
        <div className="px-6 pb-4">
          <div className="flex items-center text-sm text-gray-700 space-x-2">
            <span>Secretaría</span>
            <span>•</span>
            <span className="text-purple-600 font-medium">Pacientes</span>
            <span>•</span>
            <span className="text-gray-700">Gestión General</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-6 py-8 space-y-8">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Total Pacientes</p>
                <p className="text-xl font-black text-gray-900 leading-none mt-1">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg text-green-600 border border-green-100 group-hover:bg-green-600 group-hover:text-white transition-colors flex-shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Pacientes Activos</p>
                <p className="text-xl font-black text-gray-900 leading-none mt-1">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600 border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-colors flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Con Turno Hoy</p>
                <p className="text-xl font-black text-gray-900 leading-none mt-1">{appointmentsToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg text-red-600 border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-colors flex-shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Requieren Seguimiento</p>
                <p className="text-xl font-black text-gray-900 leading-none mt-1">{requireFollowUp}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <SecretaryPatientsTable 
          filters={filters} 
        />
      </div>
    </div>
  );
}