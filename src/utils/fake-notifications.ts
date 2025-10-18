import { Notification, SystemLog, DashboardStats, ClinicSettings } from './fake-data-types';

export const notifications: Notification[] = [
  // Notificaciones para Federico (Admin)
  {
    id: 'notif_001',
    destinatarioId: 'user_admin_001',
    tipo: 'system',
    prioridad: 'high',
    titulo: 'Backup automático completado',
    mensaje: 'El backup diario del sistema se completó exitosamente a las 03:00 AM',
    leido: false,
    fechaCreacion: '2025-10-18T03:05:00Z'
  },
  {
    id: 'notif_002',
    destinatarioId: 'user_admin_001',
    tipo: 'system',
    prioridad: 'medium',
    titulo: 'Nuevo usuario registrado',
    mensaje: 'Se registró un nuevo usuario: Dr. Roberto Silva (Traumatología)',
    leido: true,
    fechaCreacion: '2025-10-17T16:30:00Z',
    fechaLectura: '2025-10-17T18:00:00Z'
  },
  {
    id: 'notif_003',
    destinatarioId: 'user_admin_001',
    tipo: 'system',
    prioridad: 'low',
    titulo: 'Reporte mensual disponible',
    mensaje: 'El reporte de estadísticas de septiembre está listo para revisar',
    leido: true,
    fechaCreacion: '2025-10-16T09:00:00Z',
    fechaLectura: '2025-10-16T10:30:00Z',
    acciones: [
      {
        label: 'Ver Reporte',
        action: 'view_report',
        url: '/admin/reportes/septiembre-2025'
      }
    ]
  },

  // Notificaciones para Secretarias
  {
    id: 'notif_004',
    destinatarioId: 'user_sec_001',
    tipo: 'appointment',
    prioridad: 'high',
    titulo: 'Paciente no asistió a cita',
    mensaje: 'Diego Fernández no asistió a su cita de las 09:00 con Dr. Silva',
    leido: false,
    fechaCreacion: '2025-10-17T09:15:00Z',
    acciones: [
      {
        label: 'Reprogramar',
        action: 'reschedule',
        url: '/calendario/reprogramar/apt_017'
      },
      {
        label: 'Contactar Paciente',
        action: 'contact',
        url: '/pacientes/pat_008'
      }
    ]
  },
  {
    id: 'notif_005',
    destinatarioId: 'user_sec_001',
    tipo: 'payment',
    prioridad: 'medium',
    titulo: 'Factura vencida',
    mensaje: 'La factura de Ana Sofía Martínez por $10,400 está vencida desde ayer',
    leido: false,
    fechaCreacion: '2025-10-18T08:00:00Z',
    acciones: [
      {
        label: 'Ver Factura',
        action: 'view_bill',
        url: '/facturacion/bill_010'
      },
      {
        label: 'Enviar Recordatorio',
        action: 'send_reminder',
        url: '/facturacion/recordatorio/bill_010'
      }
    ]
  },
  {
    id: 'notif_006',
    destinatarioId: 'user_sec_002',
    tipo: 'reminder',
    prioridad: 'medium',
    titulo: 'Recordatorios pendientes',
    mensaje: 'Hay 3 recordatorios de citas pendientes de enviar para mañana',
    leido: true,
    fechaCreacion: '2025-10-18T14:00:00Z',
    fechaLectura: '2025-10-18T14:30:00Z'
  },
  {
    id: 'notif_007',
    destinatarioId: 'user_sec_003',
    tipo: 'appointment',
    prioridad: 'low',
    titulo: 'Cita confirmada',
    mensaje: 'Daniela Torres confirmó su cita para el 01/11 a las 11:00',
    leido: true,
    fechaCreacion: '2025-10-18T11:30:00Z',
    fechaLectura: '2025-10-18T12:00:00Z'
  },

  // Notificaciones para Doctores
  {
    id: 'notif_008',
    destinatarioId: 'user_doc_001',
    tipo: 'medical',
    prioridad: 'high',
    titulo: 'Resultado de laboratorio crítico',
    mensaje: 'Resultado urgente de María González: Glucemia 350 mg/dl',
    leido: false,
    fechaCreacion: '2025-10-18T13:45:00Z',
    acciones: [
      {
        label: 'Ver Resultado',
        action: 'view_lab',
        url: '/laboratorios/result_001'
      },
      {
        label: 'Contactar Paciente',
        action: 'contact_patient',
        url: '/pacientes/pat_001'
      }
    ]
  },
  {
    id: 'notif_009',
    destinatarioId: 'user_doc_002',
    tipo: 'appointment',
    prioridad: 'medium',
    titulo: 'Próxima cita en 15 minutos',
    mensaje: 'Juan Carlos Rodríguez - Consulta odontológica a las 16:00',
    leido: true,
    fechaCreacion: '2025-10-18T15:45:00Z',
    fechaLectura: '2025-10-18T15:46:00Z'
  },
  {
    id: 'notif_010',
    destinatarioId: 'user_doc_003',
    tipo: 'reminder',
    prioridad: 'low',
    titulo: 'Actualizar historia clínica',
    mensaje: 'Tienes 2 historias clínicas pendientes de completar',
    leido: false,
    fechaCreacion: '2025-10-18T16:00:00Z'
  },
  {
    id: 'notif_011',
    destinatarioId: 'user_doc_004',
    tipo: 'medical',
    prioridad: 'medium',
    titulo: 'Interconsulta solicitada',
    mensaje: 'Dr. Herrera solicita interconsulta cardiológica para paciente con HTA',
    leido: false,
    fechaCreacion: '2025-10-18T10:30:00Z',
    acciones: [
      {
        label: 'Ver Solicitud',
        action: 'view_consultation',
        url: '/interconsultas/ic_001'
      }
    ]
  },
  {
    id: 'notif_012',
    destinatarioId: 'user_doc_005',
    tipo: 'appointment',
    prioridad: 'low',
    titulo: 'Cita reprogramada',
    mensaje: 'La cita de Diego Fernández fue reprogramada para el 22/10 a las 10:00',
    leido: true,
    fechaCreacion: '2025-10-17T17:00:00Z',
    fechaLectura: '2025-10-17T17:15:00Z'
  },
  {
    id: 'notif_013',
    destinatarioId: 'user_doc_006',
    tipo: 'medical',
    prioridad: 'medium',
    titulo: 'Resultado de laboratorio',
    mensaje: 'Resultado de hemograma de Daniela Torres disponible',
    leido: false,
    fechaCreacion: '2025-10-18T12:00:00Z',
    acciones: [
      {
        label: 'Ver Resultado',
        action: 'view_lab',
        url: '/laboratorios/result_002'
      }
    ]
  }
];

export const systemLogs: SystemLog[] = [
  {
    id: 'log_001',
    userId: 'user_admin_001',
    accion: 'login',
    recurso: 'sistema',
    detalles: { 
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      loginMethod: 'credentials'
    },
    ip: '192.168.1.100',
    userAgent: 'Chrome/118.0.0.0',
    fecha: '2025-10-18T14:30:00Z',
    exitoso: true
  },
  {
    id: 'log_002',
    userId: 'user_sec_001',
    accion: 'create',
    recurso: 'appointment',
    detalles: {
      appointmentId: 'apt_011',
      patientId: 'pat_001',
      doctorId: 'user_doc_001',
      fecha: '2025-10-25'
    },
    ip: '192.168.1.101',
    userAgent: 'Chrome/118.0.0.0',
    fecha: '2025-10-18T09:35:00Z',
    exitoso: true
  },
  {
    id: 'log_003',
    userId: 'user_doc_001',
    accion: 'update',
    recurso: 'medical_record',
    detalles: {
      recordId: 'med_001',
      patientId: 'pat_001',
      changes: ['diagnostico', 'tratamiento']
    },
    ip: '192.168.1.102',
    userAgent: 'Chrome/118.0.0.0',
    fecha: '2025-10-18T09:30:00Z',
    exitoso: true
  },
  {
    id: 'log_004',
    userId: 'user_sec_002',
    accion: 'create',
    recurso: 'patient',
    detalles: {
      patientId: 'pat_010',
      nombres: 'Luis Alberto',
      apellidos: 'Mendez'
    },
    ip: '192.168.1.103',
    userAgent: 'Firefox/119.0',
    fecha: '2025-10-17T13:20:00Z',
    exitoso: true
  },
  {
    id: 'log_005',
    userId: 'user_admin_001',
    accion: 'backup',
    recurso: 'database',
    detalles: {
      backupSize: '2.3GB',
      tablesBackedUp: 15,
      duration: '45 minutes'
    },
    ip: '192.168.1.100',
    userAgent: 'System/1.0',
    fecha: '2025-10-18T03:00:00Z',
    exitoso: true
  },
  {
    id: 'log_006',
    userId: 'user_doc_002',
    accion: 'login_failed',
    recurso: 'sistema',
    detalles: {
      reason: 'invalid_password',
      attempts: 3
    },
    ip: '192.168.1.104',
    userAgent: 'Chrome/118.0.0.0',
    fecha: '2025-10-17T08:15:00Z',
    exitoso: false
  },
  {
    id: 'log_007',
    userId: 'user_sec_003',
    accion: 'update',
    recurso: 'appointment',
    detalles: {
      appointmentId: 'apt_017',
      changes: ['estado'],
      oldStatus: 'programada',
      newStatus: 'no-asistio'
    },
    ip: '192.168.1.105',
    userAgent: 'Chrome/118.0.0.0',
    fecha: '2025-10-17T09:15:00Z',
    exitoso: true
  },
  {
    id: 'log_008',
    userId: 'user_doc_005',
    accion: 'view',
    recurso: 'patient_history',
    detalles: {
      patientId: 'pat_008',
      recordsViewed: 3
    },
    ip: '192.168.1.106',
    userAgent: 'Chrome/118.0.0.0',
    fecha: '2025-10-18T11:00:00Z',
    exitoso: true
  }
];

export const dashboardStats: DashboardStats = {
  pacientesTotal: 10,
  citasHoy: 5,
  citasSemana: 18,
  ingresosMes: 285000,
  doctoresActivos: 6,
  ocupacionConsultorios: 75,
  pacientesNuevosMes: 3,
  satisfaccionPromedio: 4.2
};

export const clinicSettings: ClinicSettings = {
  id: 'clinic_001',
  nombre: 'Clínica Médica Integral',
  direccion: {
    calle: 'Av. Corrientes',
    numero: '1500',
    ciudad: 'Buenos Aires',
    provincia: 'Buenos Aires',
    codigoPostal: '1042',
    pais: 'Argentina'
  },
  telefono: '+54 11 4000-5000',
  email: 'info@clinicaintegral.com.ar',
  horarioAtencion: {
    'lunes': { abierto: true, inicio: '08:00', fin: '20:00' },
    'martes': { abierto: true, inicio: '08:00', fin: '20:00' },
    'miercoles': { abierto: true, inicio: '08:00', fin: '20:00' },
    'jueves': { abierto: true, inicio: '08:00', fin: '20:00' },
    'viernes': { abierto: true, inicio: '08:00', fin: '20:00' },
    'sabado': { abierto: true, inicio: '09:00', fin: '14:00' },
    'domingo': { abierto: false }
  },
  especialidades: [
    'clinica-medica',
    'cardiologia',
    'traumatologia',
    'pediatria',
    'ginecologia',
    'odontologia',
    'medicina-interna',
    'cirugia-oral',
    'ortopedia',
    'obstetricia'
  ],
  consultorios: [
    'Consultorio 1',
    'Consultorio 2',
    'Consultorio 3',
    'Consultorio 4',
    'Consultorio Pediátrico',
    'Consultorio Ginecológico',
    'Consultorio Odontológico A',
    'Consultorio Odontológico B'
  ],
  configuracion: {
    duracionCitaDefault: 30,
    recordatoriosAutomaticos: true,
    tiempoAntelacionRecordatorio: 24,
    permitirCitasOnline: true,
    requiereConfirmacionCitas: true
  }
};

// Funciones helper para notificaciones
export const getNotificationsByUser = (userId: string): Notification[] => {
  return notifications
    .filter(notif => notif.destinatarioId === userId)
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
};

export const getUnreadNotifications = (userId: string): Notification[] => {
  return notifications.filter(notif => 
    notif.destinatarioId === userId && !notif.leido
  );
};

export const getNotificationsByType = (tipo: Notification['tipo']): Notification[] => {
  return notifications.filter(notif => notif.tipo === tipo);
};

export const getNotificationsByPriority = (prioridad: Notification['prioridad']): Notification[] => {
  return notifications.filter(notif => notif.prioridad === prioridad);
};

export const markNotificationAsRead = (notificationId: string): void => {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.leido = true;
    notification.fechaLectura = new Date().toISOString();
  }
};

// Funciones helper para logs
export const getLogsByUser = (userId: string): SystemLog[] => {
  return systemLogs
    .filter(log => log.userId === userId)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

export const getLogsByAction = (accion: string): SystemLog[] => {
  return systemLogs.filter(log => log.accion === accion);
};

export const getLogsByDateRange = (startDate: string, endDate: string): SystemLog[] => {
  return systemLogs.filter(log => {
    return log.fecha >= startDate && log.fecha <= endDate;
  });
};

export const getFailedLoginAttempts = (): SystemLog[] => {
  return systemLogs.filter(log => 
    log.accion === 'login_failed' && !log.exitoso
  );
};

export const getSystemActivity = (hours: number = 24): SystemLog[] => {
  const now = new Date('2025-10-18T16:00:00Z');
  const startTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));
  
  return systemLogs.filter(log => {
    const logDate = new Date(log.fecha);
    return logDate >= startTime && logDate <= now;
  });
};