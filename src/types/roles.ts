// src/types/roles.ts
export type UserRole = 'admin' | 'doctor' | 'secretary';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  specialization?: string; // Para doctores
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
  scope?: 'own' | 'department' | 'all';
  conditions?: Record<string, unknown>;
}

export interface RoleConfig {
  name: string;
  displayName: string;
  description: string;
  defaultPermissions: Permission[];
  defaultHomePage: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    gradientFrom: string;
    gradientTo: string;
  };
  features: string[];
  sidebarSections: SidebarSection[];
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface SidebarItem {
  label: string;
  href: string;
  icon: string; // Nombre del icono de Lucide
  description?: string;
  roles: UserRole[]; // Roles que pueden ver este item
  color: {
    bg: string;
    text: string;
    hover: string;
    active: string;
    iconBg: string;
    iconText: string;
  };
}

// Tipos para el contexto de autenticación
export interface AuthContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void; // Para testing en Fase 1
  isLoading: boolean;
  hasPermission: (resource: string, action: string, scope?: string) => boolean;
  canAccess: (feature: string) => boolean;
}

// Tipos para estadísticas específicas por rol
export interface DashboardStats {
  label: string;
  value: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
}

export interface ActivityItem {
  id: string;
  patient: string;
  action: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
  icon: string;
  urgency?: 'low' | 'medium' | 'high';
}

// Tipos específicos para el contexto médico
export interface MedicalStats {
  totalPatients: number;
  todayAppointments: number;
  pendingConsultations: number;
  completedConsultations: number;
  labResults: number;
  prescriptions: number;
}