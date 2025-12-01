# 🏥 Enfoque de Desarrollo: Sistema de Roles Multi-Vista

## 📋 Índice
1. [Visión General](#-visión-general)
2. [Arquitectura Recomendada](#️-arquitectura-recomendada)
3. [Fase 1: Prototipo Rápido](#-fase-1-prototipo-rápido-2-3-semanas)
4. [Fase 2: Sistema Híbrido](#-fase-2-sistema-híbrido-3-4-semanas)
5. [Fase 3: Vistas Separadas](#-fase-3-vistas-separadas-4-5-semanas)
6. [Implementación Paso a Paso](#-implementación-paso-a-paso)
7. [Mejores Prácticas](#-mejores-prácticas)
8. [Cronograma Sugerido](#-cronograma-sugerido)
9. [Testing y Validación](#-testing-y-validación)
10. [Próximos Pasos](#-próximos-pasos)

---

## 🎯 Visión General

### **Objetivo Principal**
Crear un sistema médico escalable con **3 roles principales**:
- 👑 **Admin**: Control total del sistema y configuración
- 👩‍💼 **Secretaria**: Gestión operativa, citas y recepción  
- 👨‍⚕️ **Doctor**: Funciones clínicas, diagnósticos y tratamientos

### **Filosofía del Enfoque**
**"Evolucionar, no Revolucionar"**
- ✅ Comenzar con MVP funcional
- ✅ Iterar basado en feedback real de usuarios
- ✅ Escalar arquitectura progresivamente
- ✅ Mantener UX consistente en todo momento

### **Ventajas del Enfoque por Fases**
| Fase | Ventajas | Tiempo | Complejidad |
|------|----------|---------|-------------|
| **1. Prototipo** | Validación rápida, feedback temprano | 2-3 semanas | Baja |
| **2. Híbrido** | Código reutilizable, permisos granulares | 3-4 semanas | Media |
| **3. Separado** | Seguridad real, performance óptima | 4-5 semanas | Alta |

### **Decisión de Arquitectura**
Tu propuesta inicial (**todas las vistas + mostrar/ocultar**) es **perfecta para Fase 1**:

**✅ Ventajas para MVP:**
- Desarrollo ultrarrápido
- Validación inmediata de UX
- Feedback temprano de usuarios
- Iteración ágil

**⚠️ Limitaciones a resolver después:**
- Seguridad solo frontend
- Bundle size mayor
- Escalabilidad limitada

**🎯 Plan:** Empezar con tu enfoque, después migrar gradualmente a arquitectura robusta.

### **🏢 Consideraciones Multitenant**
Si el sistema es **multitenant** (múltiples clínicas/organizaciones), agregar:

**🔒 Aislamiento de Datos:**
- Tenant ID en todas las consultas
- Middleware de verificación de tenant
- Contexto global de tenant activo

**👥 Roles Expandidos:**
- SuperAdmin (gestiona múltiples tenants)
- TenantAdmin (administra una clínica específica)
- Roles existentes con scope de tenant

**🎨 Personalización por Tenant:**
- Temas/branding por clínica
- Configuraciones específicas
- Subdominios/dominios personalizados

---

## 🏗️ Arquitectura Recomendada

### **Estructura de Carpetas Final**
```
src/
├── app/
│   ├── admin/              # 👑 Rutas específicas de administrador
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── reports/
│   │   │   ├── page.tsx
│   │   │   ├── financial/
│   │   │   └── medical/
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── system/
│   │       └── clinic/
│   ├── doctor/             # 👨‍⚕️ Rutas específicas de doctor
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── patients/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── consultations/
│   │   │   ├── page.tsx
│   │   │   ├── today/
│   │   │   └── history/
│   │   ├── prescriptions/
│   │   │   ├── page.tsx
│   │   │   └── templates/
│   │   └── lab-results/
│   │       ├── page.tsx
│   │       └── pending/
│   ├── secretary/          # 👩‍💼 Rutas específicas de secretaria
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── appointments/
│   │   │   ├── page.tsx
│   │   │   ├── calendar/
│   │   │   └── waiting-room/
│   │   ├── patients/
│   │   │   ├── page.tsx
│   │   │   ├── registration/
│   │   │   └── insurance/
│   │   ├── billing/
│   │   │   ├── page.tsx
│   │   │   ├── invoices/
│   │   │   └── payments/
│   │   └── reception/
│   │       ├── page.tsx
│   │       └── check-in/
│   └── shared/             # 🔄 Rutas compartidas entre roles
│       ├── calendar/
│       ├── notifications/
│       └── profile/
├── components/
│   ├── role-specific/      # Componentes específicos por rol
│   │   ├── admin/
│   │   ├── doctor/
│   │   └── secretary/
│   ├── shared/             # Componentes base reutilizables
│   │   ├── PatientsList/
│   │   ├── AppointmentCard/
│   │   └── MedicalForm/
│   ├── layouts/            # Layouts por rol
│   │   ├── AdminLayout.tsx
│   │   ├── DoctorLayout.tsx
│   │   └── SecretaryLayout.tsx
│   └── ui/                 # Sistema de diseño base
├── hooks/
│   ├── useAuth.ts          # Autenticación y usuario actual
│   ├── usePermissions.ts   # Verificación de permisos
│   ├── useRoleNavigation.ts # Navegación específica por rol
│   └── useRoleData.ts      # Datos filtrados por rol
├── utils/
│   ├── permissions.ts      # Definición de permisos
│   ├── roleConfig.ts       # Configuración por rol
│   ├── navigation.ts       # Rutas y navegación
│   └── roleHelpers.ts      # Funciones auxiliares
├── types/
│   ├── roles.ts           # Tipos de roles
│   ├── permissions.ts     # Tipos de permisos
│   ├── user.ts           # Tipos de usuario
│   └── navigation.ts     # Tipos de navegación
└── middleware.ts          # Autorización de rutas
```

---

## 🚀 Fase 1: Prototipo Rápido (2-3 semanas)

### **🎯 Objetivos:**
- ✅ Validar flujos de trabajo por rol con usuarios reales
- ✅ Recopilar feedback específico de cada tipo de usuario
- ✅ Identificar patrones de uso comunes entre roles
- ✅ Prototipar funcionalidades rápidamente

### **📋 Entregables:**
- [ ] Sistema de roles funcional en Sidebar
- [ ] 3 dashboards específicos por rol completamente funcionales
- [ ] Componente RoleGuard implementado y testeado
- [ ] Testing manual con todos los roles
- [ ] Documentación completa de feedback de usuarios

---

### **📝 Paso 1.1: Crear Sistema de Tipos Base**

**Crear archivo:** `src/types/roles.ts`
```typescript
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
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
  scope?: 'own' | 'department' | 'all';
  conditions?: Record<string, any>;
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
  };
  features: string[];
}
```

**Crear archivo:** `src/utils/roleConfig.ts`
```typescript
// src/utils/roleConfig.ts
import { RoleConfig, UserRole } from '../types/roles';

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    name: 'admin',
    displayName: 'Administrador',
    description: 'Control total del sistema y configuración',
    defaultHomePage: '/admin/dashboard',
    theme: {
      primaryColor: 'blue',
      secondaryColor: 'indigo',
      accentColor: 'purple'
    },
    features: [
      'user-management',
      'system-configuration',
      'reports-analytics',
      'billing-management',
      'security-settings'
    ],
    defaultPermissions: [
      { resource: 'users', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
      { resource: 'patients', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
      { resource: 'appointments', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
      { resource: 'reports', actions: ['read'], scope: 'all' },
      { resource: 'settings', actions: ['read', 'update'], scope: 'all' }
    ]
  },
  doctor: {
    name: 'doctor',
    displayName: 'Doctor',
    description: 'Funciones clínicas, diagnósticos y tratamientos',
    defaultHomePage: '/doctor/dashboard',
    theme: {
      primaryColor: 'green',
      secondaryColor: 'emerald',
      accentColor: 'teal'
    },
    features: [
      'patient-care',
      'medical-records',
      'prescriptions',
      'lab-results',
      'consultations'
    ],
    defaultPermissions: [
      { resource: 'patients', actions: ['read', 'update'], scope: 'department' },
      { resource: 'medical-records', actions: ['create', 'read', 'update'], scope: 'own' },
      { resource: 'prescriptions', actions: ['create', 'read', 'update'], scope: 'own' },
      { resource: 'appointments', actions: ['read', 'update'], scope: 'own' },
      { resource: 'lab-results', actions: ['read'], scope: 'department' }
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
      accentColor: 'purple'
    },
    features: [
      'appointment-scheduling',
      'patient-registration',
      'billing-support',
      'reception-management',
      'communication'
    ],
    defaultPermissions: [
      { resource: 'patients', actions: ['create', 'read', 'update'], scope: 'all' },
      { resource: 'appointments', actions: ['create', 'read', 'update', 'delete'], scope: 'all' },
      { resource: 'billing', actions: ['create', 'read', 'update'], scope: 'all' },
      { resource: 'reception', actions: ['create', 'read', 'update'], scope: 'all' }
    ]
  }
};

export const getRoleConfig = (role: UserRole): RoleConfig => {
  return ROLE_CONFIGS[role];
};

export const getRoleTheme = (role: UserRole) => {
  return ROLE_CONFIGS[role].theme;
};
```

---

### **📝 Paso 1.2: Implementar Hook de Autenticación**

**Crear archivo:** `src/hooks/useAuth.ts`
```typescript
// src/hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import { User, UserRole } from '../types/roles';
import { getRoleConfig } from '../utils/roleConfig';

interface AuthContextType {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void; // Para testing en Fase 1
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Para Fase 1: usuarios hardcodeados para testing
const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: 'admin_001',
    role: 'admin',
    name: 'María González',
    email: 'admin@mediclinic.com',
    avatar: '/avatars/admin.jpg',
    department: 'Administración',
    permissions: getRoleConfig('admin').defaultPermissions,
    isActive: true,
    lastLogin: new Date()
  },
  doctor: {
    id: 'doctor_001',
    role: 'doctor',
    name: 'Dr. Juan Pérez',
    email: 'juan.perez@mediclinic.com',
    avatar: '/avatars/doctor.jpg',
    department: 'Cardiología',
    specialization: 'Cardiología Clínica',
    permissions: getRoleConfig('doctor').defaultPermissions,
    isActive: true,
    lastLogin: new Date()
  },
  secretary: {
    id: 'secretary_001',
    role: 'secretary',
    name: 'Ana Martínez',
    email: 'ana.martinez@mediclinic.com',
    avatar: '/avatars/secretary.jpg',
    department: 'Recepción',
    permissions: getRoleConfig('secretary').defaultPermissions,
    isActive: true,
    lastLogin: new Date()
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga inicial - En Fase 1 cargar doctor por defecto
    setTimeout(() => {
      setCurrentUser(DEMO_USERS.doctor);
      setIsLoading(false);
    }, 1000);
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const switchRole = (role: UserRole) => {
    setCurrentUser(DEMO_USERS[role]);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, switchRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook específico para verificar permisos
export const usePermissions = () => {
  const { currentUser } = useAuth();

  const hasPermission = (resource: string, action: string, scope?: string): boolean => {
    if (!currentUser) return false;

    return currentUser.permissions.some(permission => {
      const hasResource = permission.resource === resource;
      const hasAction = permission.actions.includes(action as any);
      const hasScope = !scope || permission.scope === scope || permission.scope === 'all';
      
      return hasResource && hasAction && hasScope;
    });
  };

  const canAccess = (feature: string): boolean => {
    if (!currentUser) return false;
    const roleConfig = getRoleConfig(currentUser.role);
    return roleConfig.features.includes(feature);
  };

  return { hasPermission, canAccess };
};
```

---

## 🏢 Arquitectura Multitenant

### **¿Qué es Multitenancy en tu contexto médico?**
Un **tenant** = Una clínica/centro médico independiente que usa tu sistema.

**Ejemplos:**
- Clínica "MediSalud" (tenant_001)
- Centro "VidaPlena" (tenant_002) 
- Hospital "San Rafael" (tenant_003)

### **Niveles de Aislamiento**

#### **1. Aislamiento de Datos (Crítico)**
```typescript
// types/tenant.ts
export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  plan: 'basic' | 'professional' | 'enterprise';
  settings: TenantSettings;
  branding: TenantBranding;
  isActive: boolean;
  createdAt: Date;
  features: string[];
}

export interface TenantSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  currency: string;
  maxUsers: number;
  maxPatients: number;
  allowedModules: string[];
}

export interface TenantBranding {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  favicon: string;
  customCSS?: string;
}
```

#### **2. Contexto Global de Tenant**
```typescript
// hooks/useTenant.ts
import { createContext, useContext, useState, useEffect } from 'react';

interface TenantContextType {
  currentTenant: Tenant | null;
  switchTenant: (tenantId: string) => void;
  isLoading: boolean;
  hasFeature: (feature: string) => boolean;
  getMaxLimit: (resource: string) => number;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detectar tenant por subdomain/domain
    const detectTenant = async () => {
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      // Si es subdominio: clinica1.tuapp.com
      if (subdomain !== 'www' && subdomain !== 'tuapp') {
        const tenant = await fetchTenantBySubdomain(subdomain);
        setCurrentTenant(tenant);
      }
      // Si es dominio personalizado: clinicamedicenter.com
      else {
        const tenant = await fetchTenantByDomain(hostname);
        setCurrentTenant(tenant);
      }
      
      setIsLoading(false);
    };

    detectTenant();
  }, []);

  const hasFeature = (feature: string): boolean => {
    return currentTenant?.features.includes(feature) || false;
  };

  const getMaxLimit = (resource: string): number => {
    switch (resource) {
      case 'users': return currentTenant?.settings.maxUsers || 10;
      case 'patients': return currentTenant?.settings.maxPatients || 1000;
      default: return 0;
    }
  };

  return (
    <TenantContext.Provider value={{ 
      currentTenant, 
      switchTenant: () => {}, 
      isLoading, 
      hasFeature, 
      getMaxLimit 
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within TenantProvider');
  return context;
};
```

#### **3. Roles Expandidos para Multitenant**
```typescript
// types/roles.ts (ACTUALIZADO)
export type UserRole = 
  | 'super-admin'    // 🌟 Gestiona todos los tenants
  | 'tenant-admin'   // 👑 Administra un tenant específico
  | 'doctor'         // 👨‍⚕️ Doctor en un tenant
  | 'secretary'      // 👩‍💼 Secretaria en un tenant
  | 'patient';       // 🤒 Paciente (solo su info)

export interface User {
  id: string;
  tenantId: string;  // 🆕 NUEVO: ID del tenant
  role: UserRole;
  name: string;
  email: string;
  avatar?: string;
  permissions: Permission[];
  tenantPermissions?: TenantPermission[]; // 🆕 Permisos específicos del tenant
  isActive: boolean;
  lastLogin?: Date;
}

export interface TenantPermission {
  tenantId: string;
  resource: string;
  actions: string[];
  scope: 'own' | 'department' | 'tenant' | 'all';
}
```

### **Implementación por Fases - Multitenant**

#### **Fase 1: Tenant Básico (Semanas 1-2)**
```typescript
// Tareas específicas:
- [ ] Crear tipos de Tenant y TenantContext
- [ ] Implementar detección básica por subdomain
- [ ] Hook useTenant funcional
- [ ] Middleware básico de verificación
- [ ] Testing con 2-3 tenants hardcodeados

// Archivos a crear:
- types/tenant.ts ✨ NUEVO
- hooks/useTenant.ts ✨ NUEVO
- middleware.ts ✨ NUEVO (básico)
- utils/tenantDetection.ts ✨ NUEVO
```

#### **Fase 2: Aislamiento de Datos (Semanas 3-4)**
```typescript
// Tareas específicas:
- [ ] Filtros automáticos por tenantId en queries
- [ ] Verificación de permisos por tenant
- [ ] Límites por plan implementados
- [ ] Testing de aislamiento de datos

// Archivos a modificar:
- hooks/useAuth.ts 🔄 Agregar tenantId
- utils/api.ts 🔄 Headers de tenant automáticos
- components/*.tsx 🔄 Queries con tenant filter
```

#### **Fase 3: Personalización y Super Admin (Semanas 5-6)**
```typescript
// Tareas específicas:
- [ ] Panel de Super Admin para gestionar tenants
- [ ] Personalización visual por tenant
- [ ] Configuraciones específicas por tenant
- [ ] Billing y planes

// Archivos a crear:
- app/super-admin/ ✨ NUEVO
- hooks/useTenantTheme.ts ✨ NUEVO
- components/TenantManager.tsx ✨ NUEVO
```

### **Estructura de URLs Multitenant**

#### **Opción 1: Subdominios (Recomendado)**
```
https://clinica1.tuapp.com/dashboard
https://clinica2.tuapp.com/pacientes
https://hospital3.tuapp.com/doctor/dashboard
```

#### **Opción 2: Path-based**
```
https://tuapp.com/clinica1/dashboard
https://tuapp.com/clinica2/pacientes
https://tuapp.com/hospital3/doctor/dashboard
```

#### **Opción 3: Dominios Personalizados**
```
https://medicenter.com/dashboard
https://clinicavida.com/pacientes
https://hospitalsanrafael.com/doctor/dashboard
```

### **Consideraciones de Seguridad Multitenant**

#### **Aislamiento en Base de Datos**
```sql
-- Todas las tablas deben tener tenant_id
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR NOT NULL,
  email VARCHAR,
  -- otros campos
  CONSTRAINT patients_tenant_isolation CHECK (tenant_id IS NOT NULL)
);

-- Índices compuestos para performance
CREATE INDEX idx_patients_tenant_id ON patients(tenant_id, created_at);

-- Row Level Security (PostgreSQL)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON patients 
  FOR ALL TO authenticated 
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### **Plan de Migración a Multitenant**

#### **Si ya tienes el sistema single-tenant:**

**Paso 1: Preparación**
- [ ] Backup completo de datos
- [ ] Crear tabla `tenants`
- [ ] Agregar `tenant_id` a todas las tablas principales

**Paso 2: Migración de Datos**
- [ ] Crear tenant "default" para datos existentes
- [ ] Asignar `tenant_id = 'default'` a todos los registros existentes
- [ ] Verificar integridad de datos

**Paso 3: Actualizar Código**
- [ ] Implementar TenantContext en frontend
- [ ] Agregar middleware de tenant
- [ ] Actualizar queries para incluir tenant filter

**Paso 4: Testing**
- [ ] Crear tenants de prueba
- [ ] Verificar aislamiento total de datos
- [ ] Testing de performance con múltiples tenants

¿Te gustaría que empecemos implementando algún aspecto específico de la arquitectura multitenant? 🏢

---

### **📝 Paso 1.3: Actualizar Sidebar con Lógica de Roles**

**Modificar archivo:** `src/components/Sidebar.tsx`

Primero, veamos el contenido actual del Sidebar:

<function_calls>
<invoke name="read_file">
<parameter name="filePath">c:\dev\saas-template\front\src\components\Sidebar.tsx