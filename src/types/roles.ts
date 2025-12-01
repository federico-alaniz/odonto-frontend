// src/types/roles.ts
export type UserRole = 'admin' | 'doctor' | 'secretary';

// Interfaz para horarios de atención (doctores)
export interface HorarioAtencion {
  dia: number; // 1-6 (Lun-Sáb)
  activo: boolean;
  horaInicio: string; // Formato: 'HH:mm'
  horaFin: string; // Formato: 'HH:mm'
}

// Interfaz completa de Usuario
export interface User {
  // Identificación
  id: string;
  clinicId: string; // ID de la clínica (multi-tenancy)
  
  // Datos personales
  nombres: string;
  apellidos: string;
  name?: string; // Nombre completo (computed: nombres + apellidos)
  tipoDocumento: 'DNI' | 'Pasaporte' | 'CI' | 'Otro';
  numeroDocumento: string;
  fechaNacimiento: string; // Formato: 'YYYY-MM-DD'
  genero: 'masculino' | 'femenino' | 'otro';
  avatar?: string;
  
  // Contacto
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  
  // Sistema
  role: UserRole;
  estado: 'activo' | 'inactivo' | 'suspendido';
  isActive: boolean;
  permissions: Permission[];
  lastLogin?: Date;
  
  // Auditoría
  createdAt: Date;
  createdBy: string; // ID del usuario que creó este registro
  updatedAt: Date;
  updatedBy: string; // ID del usuario que modificó por última vez
  deletedAt?: Date; // Para soft delete
  deletedBy?: string; // ID del usuario que eliminó (soft delete)
  
  // Campos específicos para DOCTOR
  especialidades?: string[]; // Array de IDs de especialidades
  consultorio?: string; // ID del consultorio asignado
  matricula?: string; // Número de matrícula profesional
  horariosAtencion?: HorarioAtencion[];
  notificacionesConfig?: {
    nuevaCita?: boolean;
    pacienteLlego?: boolean;
    cancelacion?: boolean;
    recordatorio1h?: boolean;
    recordatorio30m?: boolean;
    resumenDiario?: boolean;
    resumenFinDia?: boolean;
  };
  department?: string;
  specialization?: string; // Especialidad principal (deprecated, usar especialidades)
  
  // Campos específicos para SECRETARIA
  turno?: 'mañana' | 'tarde' | 'noche' | 'completo';
  area?: string; // 'recepción', 'administración', etc.
}

// Interfaz para crear/actualizar usuario (sin campos autogenerados)
export interface UserFormData {
  // Multi-tenancy
  clinicId?: string; // Opcional en el form, se puede asignar automáticamente desde el usuario autenticado
  
  // Datos personales
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: string;
  
  // Contacto
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  
  // Sistema
  role: string;
  password?: string; // Solo para creación
  confirmPassword?: string; // Solo para validación en frontend
  estado: string;
  
  // Campos para doctor
  especialidades?: string[];
  consultorio?: string;
  matricula?: string;
  horariosAtencion?: HorarioAtencion[];
  notificacionesConfig?: {
    nuevaCita?: boolean;
    pacienteLlego?: boolean;
    cancelacion?: boolean;
    recordatorio1h?: boolean;
    recordatorio30m?: boolean;
    resumenDiario?: boolean;
    resumenFinDia?: boolean;
  };
  
  // Campos para secretaria
  turno?: string;
  area?: string;
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