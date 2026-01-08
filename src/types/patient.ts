/**
 * Patient-related type definitions
 */

export interface Direccion {
  calle: string;
  numero?: string;
  ciudad: string;
  provincia: string;
  codigoPostal?: string;
}

export interface ContactoEmergencia {
  nombre: string;
  telefono: string;
  relacion: string;
}

export interface SeguroMedico {
  empresa: string;
  numeroPoliza: string;
  vigencia: string;
}

export interface Patient {
  id: string;
  clinicId: string;
  numeroHistoriaClinica: string;
  
  // Información Personal
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  tipoDocumento: 'dni' | 'le' | 'lc' | 'ci' | 'pasaporte' | 'extranjero';
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: 'masculino' | 'femenino' | 'otro';
  edad: number;
  
  // Contacto
  telefono: string;
  email?: string;
  direccion?: Direccion;
  
  // Información Médica
  tipoSangre?: string;
  alergias?: string[];
  medicamentosActuales?: string[];
  antecedentesPersonales?: string[];
  antecedentesFamiliares?: string[];
  
  // Contacto de Emergencia
  contactoEmergencia?: ContactoEmergencia;
  
  // Seguro Médico
  seguroMedico?: SeguroMedico;
  
  // Doctor Asignado
  doctorAsignado?: string;
  
  // Estado
  estado: 'activo' | 'inactivo';
  isActive: boolean;
  
  // Auditoría
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface CreatePatientData {
  // Requeridos
  nombres: string;
  apellidos: string;
  tipoDocumento: 'dni' | 'le' | 'lc' | 'ci' | 'pasaporte' | 'extranjero';
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: 'masculino' | 'femenino' | 'otro';
  telefono: string;
  
  // Opcionales
  email?: string;
  direccion?: Direccion;
  tipoSangre?: string;
  alergias?: string[];
  medicamentosActuales?: string[];
  antecedentesPersonales?: string[];
  antecedentesFamiliares?: string[];
  contactoEmergencia?: ContactoEmergencia;
  seguroMedico?: SeguroMedico;
  doctorAsignado?: string;
}

export interface UpdatePatientData {
  nombres?: string;
  apellidos?: string;
  tipoDocumento?: 'dni' | 'le' | 'lc' | 'ci' | 'pasaporte' | 'extranjero';
  numeroDocumento?: string;
  fechaNacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  telefono?: string;
  email?: string;
  direccion?: Direccion;
  tipoSangre?: string;
  alergias?: string[];
  medicamentosActuales?: string[];
  antecedentesPersonales?: string[];
  antecedentesFamiliares?: string[];
  contactoEmergencia?: ContactoEmergencia;
  seguroMedico?: SeguroMedico;
  doctorAsignado?: string;
  estado?: 'activo' | 'inactivo';
}

export interface PatientFilters {
  search?: string;
  estado?: 'activo' | 'inactivo';
  doctorAsignado?: string;
  page?: number;
  limit?: number;
}

export interface PatientResponse {
  success: boolean;
  data: Patient;
  message?: string;
}

export interface PatientsListResponse {
  success: boolean;
  data: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
