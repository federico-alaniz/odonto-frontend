'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  MoreVertical,
  Download,
  Upload,
  Shield,
  Stethoscope,
  UserCog,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usersService } from '@/services/api/users.service';
import { User } from '@/types/roles';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuth } from '@/hooks/useAuth';
import UserPermissionsModal from '@/components/UserPermissionsModal';
import { LoadingSpinner } from '@/components/ui/Spinner';

interface UserFilters {
  search: string;
  role: string;
  status: string;
  specialty: string;
}

export default function AdminUsersPage() {
  const { currentUser, hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    status: '',
    specialty: ''
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUserForView, setSelectedUserForView] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);

  const clinicId = (currentUser as any)?.clinicId || (currentUser as any)?.tenantId;
  const currentUserId = (currentUser as any)?.id;

  // Cargar usuarios desde la API (se ejecuta al montar y cuando cambian los filtros)
  useEffect(() => {
    if (!clinicId) return;
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId, filters.role, filters.status, currentPage]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!clinicId) {
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
        return;
      }
      
      const response = await usersService.getUsers(clinicId, {
        role: filters.role as any,
        estado: filters.status as any,
        page: currentPage,
        limit: 10
      });

      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalUsers(response.pagination.total);
    } catch (err) {
      setError('Error al cargar usuarios. Por favor, intenta nuevamente.');
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUserForView(user);
  };

  const handleEditUser = (userId: string) => {
    window.location.href = `/admin/users/edit/${userId}`;
  };

  const handleDeleteUser = async (userId: string) => {
    setShowDeleteConfirm(null);
    setActiveDropdown(null);

    try {
      await usersService.deleteUser(userId, clinicId, currentUserId);
      await loadUsers(); // Recargar lista
      showSuccess('Usuario eliminado', 'El usuario ha sido eliminado exitosamente');
    } catch (err) {
      showError('Error al eliminar', 'No se pudo eliminar el usuario. Intenta nuevamente.');
      console.error('Error deleting user:', err);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    setActiveDropdown(null);
    
    const newEstado = user.estado === 'activo' ? 'inactivo' : 'activo';
    
    try {
      await usersService.updateUser(
        user.id,
        { estado: newEstado } as any,
        clinicId,
        currentUserId
      );
      await loadUsers();
      showSuccess(
        'Estado actualizado',
        `Usuario ${newEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`
      );
    } catch (err) {
      showError('Error al actualizar', 'No se pudo cambiar el estado del usuario.');
      console.error('Error updating user status:', err);
    }
  };

  const handleSendEmail = (email: string) => {
    setActiveDropdown(null);
    if (email) {
      window.location.href = `mailto:${email}`;
    } else {
      showError('Email no disponible', 'Este usuario no tiene un email configurado.');
    }
  };

  const handleManagePermissions = (user: User) => {
    setActiveDropdown(null);
    setSelectedUserForPermissions(user);
  };

  // Filtrar usuarios
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Filtro de búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const fullName = `${user.nombres} ${user.apellidos}`.toLowerCase();
        const matchesSearch = 
          fullName.includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.numeroDocumento.includes(filters.search);
        
        if (!matchesSearch) return false;
      }

      // Filtro de rol
      if (filters.role && user.role !== filters.role) {
        return false;
      }

      // Filtro de estado
      if (filters.status && user.estado !== filters.status) {
        return false;
      }

      // Filtro de especialidad (solo para doctores)
      if (filters.specialty && user.role === 'doctor') {
        if (!user.especialidades?.includes(filters.specialty)) {
          return false;
        }
      }

      return true;
    });
  }, [users, filters]);

  // Estadísticas
  const stats = {
    total: users.length,
    active: users.filter(u => u.estado === 'activo').length,
    doctors: users.filter(u => u.role === 'doctor').length,
    secretaries: users.filter(u => u.role === 'secretary').length,
    admins: users.filter(u => u.role === 'admin').length
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { label: 'Administrador', color: 'bg-blue-100 text-blue-800 border border-blue-200', icon: Shield },
      doctor: { label: 'Doctor', color: 'bg-blue-50 text-blue-700 border border-blue-100', icon: Stethoscope },
      secretary: { label: 'Secretaria', color: 'bg-gray-100 text-gray-800 border border-gray-200', icon: UserCog }
    };
    return badges[role as keyof typeof badges] || badges.admin;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      activo: { label: 'Activo', color: 'bg-green-100 text-green-800 border border-green-200', icon: CheckCircle },
      inactivo: { label: 'Inactivo', color: 'bg-gray-100 text-gray-800 border border-gray-200', icon: XCircle },
      suspendido: { label: 'Suspendido', color: 'bg-red-100 text-red-800 border border-red-200', icon: AlertCircle }
    };
    return badges[status as keyof typeof badges] || badges.activo;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: '',
      specialty: ''
    });
  };

  const hasActiveFilters = filters.role || filters.status || filters.specialty;

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-sm">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="text-gray-600 mt-1">Administra usuarios, roles y permisos del sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o documento..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Upload className="w-4 h-4" />
                Importar
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <Link
                href="/admin/users/new"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nuevo Usuario
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-red-900 mb-1">
                  Error al cargar usuarios
                </h3>
                <p className="text-sm text-red-800 mb-3">{error}</p>
                
                {error.includes('base de datos') && (
                  <div className="bg-red-100 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-red-900 mb-2">Posibles causas:</p>
                    <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                      <li>El backend no está corriendo en <code className="bg-red-200 px-1 rounded">localhost:5000</code></li>
                      <li>Credenciales de MongoDB incorrectas</li>
                      <li>IP no autorizada en MongoDB Atlas</li>
                      <li>Usuario de base de datos sin permisos</li>
                    </ul>
                    <p className="text-sm text-red-800 mt-2">
                      📖 Consulta <code className="bg-red-200 px-1 rounded">BACKEND_SETUP.md</code> para más información
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => loadUsers()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Reintentar
                  </button>
                  <a 
                    href="http://localhost:5000/api/users" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    Verificar Backend
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 bg-gray-50 min-h-screen">
            <LoadingSpinner message="Cargando usuarios..." />
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Usuarios</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Activos</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats.active}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Doctores</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.doctors}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Stethoscope className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Secretarias</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.secretaries}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCog className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Admins</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.admins}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {[filters.role, filters.status, filters.specialty].filter(Boolean).length}
                </span>
              )}
            </button>

            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium text-blue-900">
                  {selectedUsers.length} seleccionados
                </span>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Acciones
                </button>
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los roles</option>
                    <option value="admin">Administrador</option>
                    <option value="doctor">Doctor</option>
                    <option value="secretary">Secretaria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los estados</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
                  <select
                    value={filters.specialty}
                    onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={filters.role !== 'doctor' && filters.role !== ''}
                  >
                    <option value="">Todas las especialidades</option>
                    <option value="clinica-medica">Clínica Médica</option>
                    <option value="cardiologia">Cardiología</option>
                    <option value="pediatria">Pediatría</option>
                    <option value="dermatologia">Dermatología</option>
                    <option value="traumatologia">Traumatología</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle pb-32">
              <table className="min-w-full w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Último Acceso
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 relative">
                {filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const statusBadge = getStatusBadge(user.estado);
                  const RoleIcon = roleBadge.icon;
                  const StatusIcon = statusBadge.icon;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={`${user.nombres} ${user.apellidos}`}
                              className="w-10 h-10 rounded-full object-cover shadow-md"
                              onError={(e) => {
                                // Fallback to initials if image fails to load
                                e.currentTarget.style.display = 'none';
                                const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextEl) nextEl.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm"
                            style={{ display: user.avatar ? 'none' : 'flex' }}
                          >
                            {user.nombres.charAt(0)}{user.apellidos.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.nombres} {user.apellidos}
                            </p>
                            <p className="text-sm text-gray-600">
                              {user.tipoDocumento} {user.numeroDocumento}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}>
                          <RoleIcon className="w-3.5 h-3.5" />
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {user.telefono}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {user.role === 'doctor' && user.especialidades ? (
                          <div className="space-y-1">
                            {user.especialidades.slice(0, 2).map((esp, idx) => (
                              <span key={idx} className="block text-sm text-gray-700">
                                {esp}
                              </span>
                            ))}
                            {user.especialidades.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{user.especialidades.length - 2} más
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {user.lastLogin ? formatDateTime(user.lastLogin.toString()) : 'Nunca'}
                        </div>
                      </td>
                      <td className="px-4 py-4 relative">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(activeDropdown === user.id ? null : user.id);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                            {activeDropdown === user.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-[100]" 
                                  onClick={() => setActiveDropdown(null)}
                                />
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[101]">
                                  <button 
                                    onClick={() => handleToggleUserStatus(user)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    {user.estado === 'activo' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                    {user.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                  </button>
                                  <button 
                                    onClick={() => handleSendEmail(user.email)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Mail className="w-4 h-4" />
                                    Enviar email
                                  </button>
                                  {hasPermission('permissions', 'update') && (
                                    <button 
                                      onClick={() => handleManagePermissions(user)}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Shield className="w-4 h-4" />
                                      Permisos
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || hasActiveFilters
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza agregando tu primer usuario'}
              </p>
              {!filters.search && !hasActiveFilters && (
                <Link
                  href="/admin/users/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Usuario
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{filteredUsers.length}</span> de{' '}
                <span className="font-medium">{totalUsers}</span> usuarios
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white' 
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
          </>
        )}

        {/* Modal de Vista de Detalles */}
        {selectedUserForView && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Detalles del Usuario</h2>
                <button
                  onClick={() => setSelectedUserForView(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                  {selectedUserForView.avatar ? (
                    <img 
                      src={selectedUserForView.avatar} 
                      alt={`${selectedUserForView.nombres} ${selectedUserForView.apellidos}`}
                      className="w-20 h-20 rounded-full object-cover shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextEl) nextEl.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-sm"
                    style={{ display: selectedUserForView.avatar ? 'none' : 'flex' }}
                  >
                    {selectedUserForView.nombres.charAt(0)}{selectedUserForView.apellidos.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedUserForView.nombres} {selectedUserForView.apellidos}
                    </h3>
                    <p className="text-gray-600">{selectedUserForView.email}</p>
                  </div>
                </div>

                {/* Info Personal */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombres</label>
                      <p className="text-gray-900 font-medium">{selectedUserForView.nombres}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Apellidos</label>
                      <p className="text-gray-900 font-medium">{selectedUserForView.apellidos}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Documento</label>
                      <p className="text-gray-900">{selectedUserForView.tipoDocumento} {selectedUserForView.numeroDocumento}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</label>
                      <p className="text-gray-900">{selectedUserForView.fechaNacimiento}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Género</label>
                      <p className="text-gray-900 capitalize">{selectedUserForView.genero}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estado</label>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedUserForView.estado).color}`}>
                        {getStatusBadge(selectedUserForView.estado).label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contacto */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Información de Contacto
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedUserForView.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Teléfono</label>
                      <p className="text-gray-900">{selectedUserForView.telefono}</p>
                    </div>
                    {selectedUserForView.direccion && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-600">Dirección</label>
                        <p className="text-gray-900">{selectedUserForView.direccion}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rol y Permisos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Rol y Permisos
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Rol</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(selectedUserForView.role).color}`}>
                          {getRoleBadge(selectedUserForView.role).label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info específica de Doctor */}
                {selectedUserForView.role === 'doctor' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-green-600" />
                      Información Profesional
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Matrícula</label>
                        <p className="text-gray-900">{selectedUserForView.matricula}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Consultorio</label>
                        <p className="text-gray-900">{selectedUserForView.consultorio}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-600">Especialidades</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedUserForView.especialidades?.map((esp, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200">
                              {esp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info específica de Secretaria */}
                {selectedUserForView.role === 'secretary' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <UserCog className="w-5 h-5 text-blue-600" />
                      Información Laboral
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Turno</label>
                        <p className="text-gray-900 capitalize">{selectedUserForView.turno}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Área</label>
                        <p className="text-gray-900">{selectedUserForView.area}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auditoría */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Información del Sistema</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <label className="text-xs text-gray-500">Creado</label>
                      <p className="text-gray-700">{new Date(selectedUserForView.createdAt).toLocaleString('es-AR')}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Última Actualización</label>
                      <p className="text-gray-700">{new Date(selectedUserForView.updatedAt).toLocaleString('es-AR')}</p>
                    </div>
                    {selectedUserForView.lastLogin && (
                      <div>
                        <label className="text-xs text-gray-500">Último Acceso</label>
                        <p className="text-gray-700">{new Date(selectedUserForView.lastLogin).toLocaleString('es-AR')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedUserForView(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    handleEditUser(selectedUserForView.id);
                    setSelectedUserForView(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar Usuario
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación de Eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
                    <p className="text-sm text-gray-600 mt-1">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6">
                  ¿Estás seguro de que deseas eliminar este usuario? Se marcará como eliminado pero se conservará en el sistema por motivos de auditoría.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDeleteUser(showDeleteConfirm)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Permisos Personalizados */}
        {selectedUserForPermissions && (
          <UserPermissionsModal
            user={selectedUserForPermissions}
            clinicId={clinicId}
            currentUserId={currentUserId}
            onClose={() => setSelectedUserForPermissions(null)}
            onUpdate={() => {
              loadUsers();
              setSelectedUserForPermissions(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
