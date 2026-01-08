// src/utils/roleConfig.ts
import { RoleConfig, UserRole, Permission } from '../types/roles';

// Definir permisos base por recurso
const PERMISSIONS: Record<string, Permission[]> = {
  // Permisos de Admin - Control total
  admin: [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'patients', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'appointments', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'medical-records', actions: ['create', 'read', 'update'], scope: 'all' },
    { resource: 'billing', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'reports', actions: ['read'], scope: 'all' },
    { resource: 'settings', actions: ['read', 'update'], scope: 'all' },
    { resource: 'system', actions: ['read', 'update'], scope: 'all' },
    { resource: 'consultations', actions: ['create', 'read', 'update'], scope: 'all' },
    { resource: 'reception', actions: ['create', 'read', 'update'], scope: 'all' }
  ],
  
  // Permisos de Doctor - Enfoque clínico
  doctor: [
    { resource: 'patients', actions: ['read', 'update'], scope: 'department' },
    { resource: 'appointments', actions: ['read', 'update'], scope: 'own' },
    { resource: 'medical-records', actions: ['create', 'read', 'update'], scope: 'own' },
    { resource: 'prescriptions', actions: ['create', 'read', 'update'], scope: 'own' },
    { resource: 'lab-results', actions: ['read'], scope: 'department' },
    { resource: 'diagnoses', actions: ['create', 'read', 'update'], scope: 'own' },
    { resource: 'consultations', actions: ['create', 'read', 'update'], scope: 'own' }
  ],
  
  // Permisos de Secretaria - Gestión operativa
  secretary: [
    { resource: 'patients', actions: ['create', 'read', 'update'], scope: 'all' },
    { resource: 'appointments', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
    { resource: 'billing', actions: ['create', 'read', 'update'], scope: 'all' },
    { resource: 'reception', actions: ['create', 'read', 'update'], scope: 'all' },
    { resource: 'communications', actions: ['create', 'read'], scope: 'all' },
    { resource: 'waiting-room', actions: ['read', 'update'], scope: 'all' },
    { resource: 'insurance', actions: ['read', 'update'], scope: 'all' },
    { resource: 'users', actions: ['read'], scope: 'all' }
  ]
};

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    name: 'admin',
    displayName: 'Administrador',
    description: 'Control total del sistema y configuración',
    defaultHomePage: '/admin/dashboard',
    theme: {
      primaryColor: 'blue',
      secondaryColor: 'gray',
      accentColor: 'blue',
      gradientFrom: 'from-blue-600',
      gradientTo: 'to-blue-700'
    },
    features: [
      'user-management',
      'system-configuration',
      'reports-analytics',
      'billing-management',
      'security-settings',
      'audit-logs',
      'backup-restore'
    ],
    defaultPermissions: PERMISSIONS.admin,
    sidebarSections: [
      {
        title: 'Panel Principal',
        items: [
          {
            label: 'Dashboard Admin',
            href: '/admin/dashboard',
            icon: 'BarChart3',
            description: 'Vista general administrativa',
            roles: ['admin'],
            requiredPermission: { resource: 'system', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          }
        ]
      },
      {
        title: 'Atención Médica',
        items: [
          {
            label: 'Dashboard Médico',
            href: '/doctor/dashboard',
            icon: 'Stethoscope',
            description: 'Panel de control médico',
            roles: ['admin'],
            requiredPermission: { resource: 'medical-records', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          },
          {
            label: 'Mis Pacientes',
            href: '/doctor/patients',
            icon: 'Users',
            description: 'Pacientes asignados',
            roles: ['admin'],
            requiredPermission: { resource: 'patients', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          },
          {
            label: 'Consultas',
            href: '/doctor/consultations',
            icon: 'ClipboardList',
            description: 'Consultas médicas',
            roles: ['admin'],
            requiredPermission: { resource: 'consultations', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          }
        ]
      },
      {
        title: 'Gestión Operativa',
        items: [
          {
            label: 'Citas',
            href: '/secretary/appointments',
            icon: 'CalendarPlus',
            description: 'Programación de citas',
            roles: ['admin'],
            requiredPermission: { resource: 'appointments', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          },
          {
            label: 'Recepción',
            href: '/secretary/reception',
            icon: 'DoorOpen',
            description: 'Control de recepción',
            roles: ['admin'],
            requiredPermission: { resource: 'reception', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          },
          {
            label: 'Pacientes',
            href: '/secretary/patients',
            icon: 'Users',
            description: 'Registro de pacientes',
            roles: ['admin'],
            requiredPermission: { resource: 'patients', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          },
          {
            label: 'Facturación',
            href: '/secretary/billing',
            icon: 'Receipt',
            description: 'Gestión de facturación',
            roles: ['admin'],
            requiredPermission: { resource: 'billing', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          },
          {
            label: 'Plantilla Médica',
            href: '/secretary/medical-staff',
            icon: 'Stethoscope',
            description: 'Estado y novedades del personal médico',
            roles: ['admin'],
            requiredPermission: { resource: 'users', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          }
        ]
      },
      {
        title: 'Administración',
        items: [
          {
            label: 'Usuarios',
            href: '/admin/users',
            icon: 'UserCog',
            description: 'Gestión de usuarios del sistema',
            roles: ['admin'],
            requiredPermission: { resource: 'users', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          },
          {
            label: 'Reportes',
            href: '/admin/reports',
            icon: 'TrendingUp',
            description: 'Informes y analíticas',
            roles: ['admin'],
            requiredPermission: { resource: 'reports', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          },
          {
            label: 'Configuración',
            href: '/admin/settings',
            icon: 'Settings',
            description: 'Configuración del sistema',
            roles: ['admin'],
            requiredPermission: { resource: 'settings', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          }
        ]
      }
    ]
  },

  doctor: {
    name: 'doctor',
    displayName: 'Doctor',
    description: 'Funciones clínicas, diagnósticos y tratamientos',
    defaultHomePage: '/doctor/dashboard',
    theme: {
      primaryColor: 'blue',
      secondaryColor: 'gray',
      accentColor: 'blue',
      gradientFrom: 'from-blue-600',
      gradientTo: 'to-blue-700'
    },
    features: [
      'patient-care',
      'medical-records',
      'prescriptions',
      'lab-results',
      'consultations',
      'diagnoses',
      'medical-imaging'
    ],
    defaultPermissions: PERMISSIONS.doctor,
    sidebarSections: [
      {
        title: 'Panel Médico',
        items: [
          {
            label: 'Dashboard Médico',
            href: '/doctor/dashboard',
            icon: 'Stethoscope',
            description: 'Panel de control médico',
            roles: ['doctor'],
            requiredPermission: { resource: 'medical-records', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          }
        ]
      },
      {
        title: 'Atención Médica',
        items: [
          {
            label: 'Mis Pacientes',
            href: '/doctor/patients',
            icon: 'Users',
            description: 'Pacientes asignados',
            roles: ['doctor'],
            requiredPermission: { resource: 'patients', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          },
          {
            label: 'Consultas',
            href: '/doctor/consultations',
            icon: 'ClipboardList',
            description: 'Consultas médicas',
            roles: ['doctor'],
            requiredPermission: { resource: 'consultations', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          }
        ]
      }
    ]
  },

  secretary: {
    name: 'secretary',
    displayName: 'Secretaria',
    description: 'Gestión operativa, citas y recepción',
    defaultHomePage: '/secretary/dashboard',
    theme: {
      primaryColor: 'pink',
      secondaryColor: 'rose',
      accentColor: 'purple',
      gradientFrom: 'from-pink-500',
      gradientTo: 'to-rose-600'
    },
    features: [
      'appointment-scheduling',
      'patient-registration',
      'billing-support',
      'reception-management',
      'communication',
      'waiting-room',
      'insurance-management'
    ],
    defaultPermissions: PERMISSIONS.secretary,
    sidebarSections: [
      {
        title: 'Panel Operativo',
        items: [
          {
            label: 'Dashboard Operativo',
            href: '/secretary/dashboard',
            icon: 'Calendar',
            description: 'Panel de control operativo',
            roles: ['secretary'],
            requiredPermission: { resource: 'appointments', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          }
        ]
      },
      {
        title: 'Gestión Operativa',
        items: [
          {
            label: 'Citas',
            href: '/secretary/appointments',
            icon: 'CalendarPlus',
            description: 'Programación de citas',
            roles: ['secretary'],
            requiredPermission: { resource: 'appointments', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          },
          {
            label: 'Recepción',
            href: '/secretary/reception',
            icon: 'DoorOpen',
            description: 'Control de recepción',
            roles: ['secretary'],
            requiredPermission: { resource: 'reception', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          },
          {
            label: 'Pacientes',
            href: '/secretary/patients',
            icon: 'Users',
            description: 'Registro de pacientes',
            roles: ['secretary'],
            requiredPermission: { resource: 'patients', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          },
          {
            label: 'Facturación',
            href: '/secretary/billing',
            icon: 'Receipt',
            description: 'Gestión de facturación',
            roles: ['secretary'],
            requiredPermission: { resource: 'billing', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          },
          {
            label: 'Plantilla Médica',
            href: '/secretary/medical-staff',
            icon: 'Stethoscope',
            description: 'Estado y novedades del personal médico',
            roles: ['secretary'],
            requiredPermission: { resource: 'users', action: 'read' },
            color: {
              bg: 'hover:bg-gray-700',
              text: 'text-gray-100 hover:text-white',
              hover: 'hover:text-white',
              active: 'bg-blue-600 text-white border-l-blue-400',
              iconBg: 'bg-gray-700',
              iconText: 'text-gray-100 group-hover:text-white'
            }
          }
        ]
      }
    ]
  }
};

// Funciones helper para obtener configuraciones
export const getRoleConfig = (role: UserRole): RoleConfig => {
  return ROLE_CONFIGS[role];
};

export const getRoleTheme = (role: UserRole) => {
  return ROLE_CONFIGS[role].theme;
};

export const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_CONFIGS[role].defaultPermissions;
};

export const getRoleSidebarSections = (role: UserRole) => {
  return ROLE_CONFIGS[role].sidebarSections;
};

export const getRoleFeatures = (role: UserRole): string[] => {
  return ROLE_CONFIGS[role].features;
};

export const getAllRoles = (): UserRole[] => {
  return Object.keys(ROLE_CONFIGS) as UserRole[];
};

export const getRoleDisplayName = (role: UserRole): string => {
  return ROLE_CONFIGS[role].displayName;
};

export const hasRoleAccess = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};