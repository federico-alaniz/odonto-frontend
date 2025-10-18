import { User, UserRole } from './fake-data-types';

export const roles: UserRole[] = [
  {
    id: 'role_admin',
    name: 'admin',
    displayName: 'Administrador del Sistema',
    permissions: [
      {
        resource: 'users',
        actions: ['create', 'read', 'update', 'delete'],
        scope: 'all'
      },
      {
        resource: 'patients',
        actions: ['create', 'read', 'update', 'delete'],
        scope: 'all'
      },
      {
        resource: 'appointments',
        actions: ['create', 'read', 'update', 'delete'],
        scope: 'all'
      },
      {
        resource: 'billing',
        actions: ['create', 'read', 'update', 'delete'],
        scope: 'all'
      },
      {
        resource: 'reports',
        actions: ['create', 'read', 'update', 'delete'],
        scope: 'all'
      },
      {
        resource: 'settings',
        actions: ['create', 'read', 'update', 'delete'],
        scope: 'all'
      },
      {
        resource: 'medical-records',
        actions: ['read', 'update'],
        scope: 'all'
      }
    ]
  },
  {
    id: 'role_secretary',
    name: 'secretary',
    displayName: 'Secretaria/Recepcionista',
    permissions: [
      {
        resource: 'patients',
        actions: ['create', 'read', 'update'],
        scope: 'all'
      },
      {
        resource: 'appointments',
        actions: ['create', 'read', 'update', 'delete'],
        scope: 'all'
      },
      {
        resource: 'billing',
        actions: ['create', 'read', 'update'],
        scope: 'all'
      },
      {
        resource: 'reports',
        actions: ['read'],
        scope: 'department'
      },
      {
        resource: 'medical-records',
        actions: ['read'],
        scope: 'department'
      }
    ]
  },
  {
    id: 'role_doctor',
    name: 'doctor',
    displayName: 'Doctor/Médico',
    permissions: [
      {
        resource: 'patients',
        actions: ['read', 'update'],
        scope: 'own'
      },
      {
        resource: 'appointments',
        actions: ['read', 'update'],
        scope: 'own'
      },
      {
        resource: 'billing',
        actions: ['read'],
        scope: 'own'
      },
      {
        resource: 'reports',
        actions: ['read'],
        scope: 'own'
      },
      {
        resource: 'medical-records',
        actions: ['create', 'read', 'update'],
        scope: 'own',
        conditions: {
          timeLimit: 24 // puede editar hasta 24 horas después
        }
      }
    ]
  }
];

export const users: User[] = [
  // Administradores
  {
    id: 'user_admin_001',
    nombres: 'Federico',
    apellidos: 'Alaniz',
    email: 'federico.alaniz@clinica.com',
    telefono: '+54 11 5555-0001',
    tipoDocumento: 'dni',
    numeroDocumento: '30123456',
    role: 'admin',
    estado: 'activo',
    fechaRegistro: '2024-01-15T09:00:00Z',
    ultimoAcceso: '2025-10-18T14:30:00Z',
    avatar: '/avatars/federico.jpg'
  },
  {
    id: 'user_admin_002',
    nombres: 'María Laura',
    apellidos: 'Rodríguez',
    email: 'maria.rodriguez@clinica.com',
    telefono: '+54 11 5555-0002',
    tipoDocumento: 'dni',
    numeroDocumento: '28987654',
    role: 'admin',
    estado: 'activo',
    fechaRegistro: '2024-02-01T10:00:00Z',
    ultimoAcceso: '2025-10-18T13:15:00Z'
  },

  // Secretarias
  {
    id: 'user_sec_001',
    nombres: 'Carmen',
    apellidos: 'López',
    email: 'carmen.lopez@clinica.com',
    telefono: '+54 11 5555-1001',
    tipoDocumento: 'dni',
    numeroDocumento: '35456789',
    role: 'secretary',
    estado: 'activo',
    fechaRegistro: '2024-03-01T08:00:00Z',
    ultimoAcceso: '2025-10-18T15:00:00Z'
  },
  {
    id: 'user_sec_002',
    nombres: 'Patricia',
    apellidos: 'Fernández',
    email: 'patricia.fernandez@clinica.com',
    telefono: '+54 11 5555-1002',
    tipoDocumento: 'dni',
    numeroDocumento: '33789123',
    role: 'secretary',
    estado: 'activo',
    fechaRegistro: '2024-03-15T09:00:00Z',
    ultimoAcceso: '2025-10-18T14:45:00Z'
  },
  {
    id: 'user_sec_003',
    nombres: 'Silvia',
    apellidos: 'Martínez',
    email: 'silvia.martinez@clinica.com',
    telefono: '+54 11 5555-1003',
    tipoDocumento: 'dni',
    numeroDocumento: '36654321',
    role: 'secretary',
    estado: 'activo',
    fechaRegistro: '2024-04-01T07:30:00Z',
    ultimoAcceso: '2025-10-18T12:30:00Z'
  },

  // Doctores
  {
    id: 'user_doc_001',
    nombres: 'Dr. Miguel',
    apellidos: 'Herrera',
    email: 'miguel.herrera@clinica.com',
    telefono: '+54 11 5555-2001',
    tipoDocumento: 'dni',
    numeroDocumento: '25123456',
    role: 'doctor',
    especialidades: ['clinica-medica', 'medicina-interna'],
    consultorio: 'Consultorio 1',
    horarioAtencion: {
      inicio: '08:00',
      fin: '16:00',
      diasSemana: [1, 2, 3, 4, 5] // Lunes a viernes
    },
    estado: 'activo',
    fechaRegistro: '2024-01-20T08:00:00Z',
    ultimoAcceso: '2025-10-18T15:30:00Z'
  },
  {
    id: 'user_doc_002',
    nombres: 'Dra. Ana',
    apellidos: 'Gutierrez',
    email: 'ana.gutierrez@clinica.com',
    telefono: '+54 11 5555-2002',
    tipoDocumento: 'dni',
    numeroDocumento: '27654321',
    role: 'doctor',
    especialidades: ['odontologia', 'cirugia-oral'],
    consultorio: 'Consultorio Odontológico A',
    horarioAtencion: {
      inicio: '09:00',
      fin: '17:00',
      diasSemana: [1, 2, 3, 4, 5]
    },
    estado: 'activo',
    fechaRegistro: '2024-02-10T09:00:00Z',
    ultimoAcceso: '2025-10-18T16:00:00Z'
  },
  {
    id: 'user_doc_003',
    nombres: 'Dr. Carlos',
    apellidos: 'Mendoza',
    email: 'carlos.mendoza@clinica.com',
    telefono: '+54 11 5555-2003',
    tipoDocumento: 'dni',
    numeroDocumento: '26987654',
    role: 'doctor',
    especialidades: ['pediatria'],
    consultorio: 'Consultorio Pediátrico',
    horarioAtencion: {
      inicio: '14:00',
      fin: '20:00',
      diasSemana: [1, 2, 3, 4, 5]
    },
    estado: 'activo',
    fechaRegistro: '2024-02-15T14:00:00Z',
    ultimoAcceso: '2025-10-18T19:30:00Z'
  },
  {
    id: 'user_doc_004',
    nombres: 'Dra. Elena',
    apellidos: 'Vargas',
    email: 'elena.vargas@clinica.com',
    telefono: '+54 11 5555-2004',
    tipoDocumento: 'dni',
    numeroDocumento: '29321654',
    role: 'doctor',
    especialidades: ['cardiologia'],
    consultorio: 'Consultorio 3',
    horarioAtencion: {
      inicio: '08:00',
      fin: '14:00',
      diasSemana: [1, 2, 3, 4, 5, 6] // Lunes a sábado
    },
    estado: 'activo',
    fechaRegistro: '2024-03-01T08:00:00Z',
    ultimoAcceso: '2025-10-18T13:45:00Z'
  },
  {
    id: 'user_doc_005',
    nombres: 'Dr. Roberto',
    apellidos: 'Silva',
    email: 'roberto.silva@clinica.com',
    telefono: '+54 11 5555-2005',
    tipoDocumento: 'dni',
    numeroDocumento: '24789456',
    role: 'doctor',
    especialidades: ['traumatologia', 'ortopedia'],
    consultorio: 'Consultorio 4',
    horarioAtencion: {
      inicio: '07:00',
      fin: '15:00',
      diasSemana: [1, 2, 3, 4, 5]
    },
    estado: 'activo',
    fechaRegistro: '2024-03-10T07:00:00Z',
    ultimoAcceso: '2025-10-18T14:30:00Z'
  },
  {
    id: 'user_doc_006',
    nombres: 'Dra. Lucía',
    apellidos: 'Morales',
    email: 'lucia.morales@clinica.com',
    telefono: '+54 11 5555-2006',
    tipoDocumento: 'dni',
    numeroDocumento: '32456789',
    role: 'doctor',
    especialidades: ['ginecologia', 'obstetricia'],
    consultorio: 'Consultorio Ginecológico',
    horarioAtencion: {
      inicio: '10:00',
      fin: '18:00',
      diasSemana: [1, 2, 3, 4, 5]
    },
    estado: 'activo',
    fechaRegistro: '2024-03-20T10:00:00Z',
    ultimoAcceso: '2025-10-18T17:30:00Z'
  }
];

// Usuario actual por defecto (Federico como admin)
export const currentUser: User = users[0];

// Función helper para obtener usuario por ID
export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

// Función helper para obtener usuarios por rol
export const getUsersByRole = (role: User['role']): User[] => {
  return users.filter(user => user.role === role);
};

// Función helper para obtener doctores disponibles
export const getAvailableDoctors = (): User[] => {
  return users.filter(user => user.role === 'doctor' && user.estado === 'activo');
};