'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { Users, UserPlus, Info, Calendar, ClipboardList, Stethoscope } from 'lucide-react';
import SecretaryPatientsTable from './SecretaryPatientsTable';
import SecretaryPatientsFilters, { SecretaryPatientFilters } from './SecretaryPatientsFilters';
import { patientsService } from '@/services/api/patients.service';

export default function SecretaryPatientsPage() {
  const { currentUser } = useAuth();
  const { buildPath } = useTenant();
  const [activeTab, setActiveTab] = useState<'all' | 'assigned'>('all');
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
              <Link
                href={buildPath('/secretary/appointments/new')}
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

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`
                flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all
                ${activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                <span>Todos los Pacientes</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              className={`
                flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all
                ${activeTab === 'assigned'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <Stethoscope className="w-5 h-5" />
                <span>Pacientes Asignados</span>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pacientes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Registrados en el sistema</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pacientes Activos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-green-600">En seguimiento</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Con Turno Hoy</p>
                <p className="text-3xl font-bold text-gray-900">{appointmentsToday}</p>
                <p className="text-sm text-blue-600">Ver agenda</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Requieren Seguimiento</p>
                <p className="text-3xl font-bold text-gray-900">{requireFollowUp}</p>
                <p className="text-sm text-red-600">Atención requerida</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ClipboardList className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <SecretaryPatientsFilters onFiltersChange={setFilters} />

        {/* Table */}
        <SecretaryPatientsTable 
          filters={filters} 
          showOnlyAssigned={activeTab === 'assigned'}
        />
      </div>
    </div>
  );
}