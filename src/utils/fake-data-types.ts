// Tipos base para el sistema de gestión médica

export interface Permission {
  resource: 'patients' | 'appointments' | 'billing' | 'reports' | 'users' | 'settings' | 'medical-records';
  actions: ('create' | 'read' | 'update' | 'delete')[];
  scope: 'own' | 'department' | 'all';
  conditions?: {
    timeLimit?: number; // horas para editar después de creado
    requiresApproval?: boolean;
    maxAmount?: number; // para billing
  };
}

export interface UserRole {
  id: string;
  name: 'admin' | 'secretary' | 'doctor';
  displayName: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  role: UserRole['name'];
  especialidades?: string[]; // solo para doctores
  consultorio?: string; // solo para doctores
  horarioAtencion?: {
    inicio: string;
    fin: string;
    diasSemana: number[]; // 0-6 (domingo-sábado)
  };
  estado: 'activo' | 'inactivo' | 'suspendido';
  fechaRegistro: string;
  ultimoAcceso?: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  direccion: {
    calle: string;
    numero: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
  };
  tipoSangre: string;
  contactoEmergencia: {
    nombre: string;
    telefono: string;
    relacion: string;
  };
  seguroMedico?: {
    empresa: string;
    numeroPoliza: string;
    vigencia: string;
  };
  alergias: string[];
  medicamentosActuales: string[];
  antecedentesPersonales: string[];
  antecedentesFamiliares: string[];
  ultimaConsulta?: string;
  proximaCita?: string;
  estado: 'activo' | 'inactivo';
  fechaRegistro: string;
  doctorAsignado?: string; // ID del doctor
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  especialidad: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  tipo: 'consulta' | 'control' | 'cirugia' | 'emergencia' | 'procedimiento';
  estado: 'programada' | 'confirmada' | 'en-curso' | 'completada' | 'cancelada' | 'no-asistio';
  consultorio: string;
  motivo: string;
  notas?: string;
  recordatorioEnviado: boolean;
  fechaCreacion: string;
  creadoPor: string; // ID del usuario que creó la cita
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  appointmentId?: string;
  doctorId: string;
  fecha: string;
  especialidad: string;
  tipo: 'consulta' | 'control' | 'procedimiento' | 'cirugia' | 'emergencia';
  motivoConsulta: string;
  sintomas: string;
  examenFisico: string;
  diagnostico: string;
  tratamiento: string;
  medicamentos: {
    nombre: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
    instrucciones?: string;
  }[];
  signosVitales?: {
    presionArterial?: string;
    frecuenciaCardiaca?: number;
    temperatura?: number;
    peso?: number;
    altura?: number;
    saturacionOxigeno?: number;
  };
  proximaConsulta?: {
    fecha: string;
    motivo: string;
  };
  estado: 'borrador' | 'finalizado' | 'revisado';
  fechaCreacion: string;
}

export interface Bill {
  id: string;
  patientId: string;
  appointmentId?: string;
  medicalRecordId?: string;
  fecha: string;
  conceptos: {
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
  }[];
  subtotal: number;
  descuentos: number;
  impuestos: number;
  total: number;
  metodoPago?: 'efectivo' | 'tarjeta' | 'transferencia' | 'seguro';
  estado: 'pendiente' | 'pagado' | 'vencido' | 'cancelado';
  fechaVencimiento: string;
  fechaPago?: string;
  notas?: string;
  creadoPor: string;
}

export interface Notification {
  id: string;
  destinatarioId: string;
  tipo: 'appointment' | 'payment' | 'system' | 'emergency' | 'reminder' | 'medical';
  prioridad: 'low' | 'medium' | 'high' | 'critical';
  titulo: string;
  mensaje: string;
  leido: boolean;
  fechaCreacion: string;
  fechaLectura?: string;
  acciones?: {
    label: string;
    action: string;
    url?: string;
  }[];
}

export interface SystemLog {
  id: string;
  userId: string;
  accion: string;
  recurso: string;
  detalles: Record<string, unknown>;
  ip: string;
  userAgent: string;
  fecha: string;
  exitoso: boolean;
}

export interface ClinicSettings {
  id: string;
  nombre: string;
  direccion: {
    calle: string;
    numero: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
    pais: string;
  };
  telefono: string;
  email: string;
  horarioAtencion: {
    [key: string]: { // día de la semana
      abierto: boolean;
      inicio?: string;
      fin?: string;
    };
  };
  especialidades: string[];
  consultorios: string[];
  configuracion: {
    duracionCitaDefault: number; // minutos
    recordatoriosAutomaticos: boolean;
    tiempoAntelacionRecordatorio: number; // horas
    permitirCitasOnline: boolean;
    requiereConfirmacionCitas: boolean;
  };
}

// Tipos para estadísticas y reportes
export interface DashboardStats {
  pacientesTotal: number;
  citasHoy: number;
  citasSemana: number;
  ingresosMes: number;
  doctoresActivos: number;
  ocupacionConsultorios: number; // porcentaje
  pacientesNuevosMes: number;
  satisfaccionPromedio: number; // 1-5
}

export interface ReportData {
  id: string;
  tipo: 'financial' | 'medical' | 'operational' | 'patient-satisfaction';
  titulo: string;
  descripcion: string;
  fechaGeneracion: string;
  periodo: {
    inicio: string;
    fin: string;
  };
  datos: Record<string, unknown>;
  generadoPor: string;
}