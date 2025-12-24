// services/api/patients.service.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Tipos
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

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PatientsResponse {
  success: boolean;
  data: Patient[];
  pagination: PaginationInfo;
}

export interface PatientResponse {
  success: boolean;
  data: Patient;
  message?: string;
}

export interface CreatePatientResponse {
  success: boolean;
  data: Patient;
  historiaClinica: any;
  message: string;
}

export interface HistoriaClinica {
  id: string;
  clinicId: string;
  pacienteId: string;
  numeroHistoriaClinica: string;
  consultas: any[];
  diagnosticos: any[];
  tratamientos: any[];
  prescripciones: any[];
  estudios: any[];
  laboratorios: any[];
  vacunas: any[];
  hospitalizaciones: any[];
  cirugias: any[];
  notasEvolucion: any[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface HistoriaClinicaResponse {
  success: boolean;
  data: HistoriaClinica;
}

export interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  byGender: {
    [key: string]: number;
  };
  byAgeRange: Array<{
    _id: number;
    count: number;
  }>;
}

export interface PatientStatsResponse {
  success: boolean;
  data: PatientStats;
}

// Helper para obtener headers
const getHeaders = (clinicId: string, userId?: string) => {
  const normalizedClinicId = (clinicId || 'clinic_001').toLowerCase();
  const headers: any = {
    'Content-Type': 'application/json',
    'X-Clinic-Id': normalizedClinicId,
  };
  
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  
  return headers;
};

// Servicio de Pacientes
export const patientsService = {
  /**
   * Obtener todos los pacientes con filtros opcionales
   */
  async getPatients(
    clinicId: string,
    filters?: PatientFilters
  ): Promise<PatientsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.estado) params.append('estado', filters.estado);
      if (filters?.doctorAsignado) params.append('doctorAsignado', filters.doctorAsignado);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await fetch(
        `${API_BASE_URL}/api/patients?${params.toString()}`,
        { 
          method: 'GET',
          headers: getHeaders(clinicId) 
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener pacientes');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo paciente
   */
  async createPatient(
    clinicId: string,
    userId: string,
    data: CreatePatientData
  ): Promise<CreatePatientResponse> {
    try {
      const url = `${API_BASE_URL}/api/patients`;
      const headers = getHeaders(clinicId, userId);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        const errorMessage = responseData.errors?.[0] || 
                            responseData.error || 
                            'Error al crear paciente';
        console.error('❌ Error message:', errorMessage);
        throw new Error(errorMessage);
      }
      
      return responseData;
    } catch (error: any) {
      console.error('❌ Error creating patient:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  },

  /**
   * Obtener un paciente por ID
   */
  async getPatientById(
    patientId: string,
    clinicId: string
  ): Promise<PatientResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/patients/${patientId}`,
        { 
          method: 'GET',
          headers: getHeaders(clinicId) 
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        const errorMessage =
          errorData?.errors?.[0] ||
          errorData?.error ||
          'Error al obtener paciente';
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  },

  /**
   * Obtener un paciente por número de documento
   */
  async getPatientByDocumento(
    numeroDocumento: string,
    clinicId: string
  ): Promise<PatientResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/patients/by-documento/${numeroDocumento}`,
        { 
          method: 'GET',
          headers: getHeaders(clinicId) 
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al buscar paciente');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching patient by document:', error);
      throw error;
    }
  },

  /**
   * Actualizar un paciente
   */
  async updatePatient(
    patientId: string,
    clinicId: string,
    userId: string,
    data: UpdatePatientData
  ): Promise<PatientResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/patients/${patientId}`,
        {
          method: 'PUT',
          headers: getHeaders(clinicId, userId),
          body: JSON.stringify(data)
        }
      );
      
      const responseData = await response.json();
      
      if (!response.ok) {
        const errorMessage = responseData.errors?.[0] || 
                            responseData.error || 
                            'Error al actualizar paciente';
        throw new Error(errorMessage);
      }
      
      return responseData;
    } catch (error: any) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  /**
   * Eliminar un paciente (soft delete)
   */
  async deletePatient(
    patientId: string,
    clinicId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/patients/${patientId}`,
        {
          method: 'DELETE',
          headers: getHeaders(clinicId, userId)
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar paciente');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  },

  /**
   * Obtener la historia clínica de un paciente
   */
  async getHistoriaClinica(
    patientId: string,
    clinicId: string
  ): Promise<HistoriaClinicaResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/patients/${patientId}/historia-clinica`,
        { 
          method: 'GET',
          headers: getHeaders(clinicId) 
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener historia clínica');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching historia clínica:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de pacientes
   */
  async getPatientStats(clinicId: string): Promise<PatientStatsResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/patients/stats`,
        { 
          method: 'GET',
          headers: getHeaders(clinicId) 
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener estadísticas');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching patient stats:', error);
      throw error;
    }
  },

  /**
   * Buscar pacientes (alias de getPatients con search)
   */
  async searchPatients(
    clinicId: string,
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PatientsResponse> {
    return this.getPatients(clinicId, {
      search: searchTerm,
      page,
      limit
    });
  },

  /**
   * Obtener pacientes activos
   */
  async getActivePatients(
    clinicId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PatientsResponse> {
    return this.getPatients(clinicId, {
      estado: 'activo',
      page,
      limit
    });
  },

  /**
   * Obtener pacientes por doctor
   */
  async getPatientsByDoctor(
    clinicId: string,
    doctorId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PatientsResponse> {
    return this.getPatients(clinicId, {
      doctorAsignado: doctorId,
      page,
      limit
    });
  },

  /**
   * Asignar un doctor a un paciente
   */
  async assignDoctor(
    patientId: string,
    doctorId: string,
    clinicId: string,
    userId: string
  ): Promise<PatientResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/patients/${patientId}/assign-doctor`,
        {
          method: 'POST',
          headers: getHeaders(clinicId, userId),
          body: JSON.stringify({ doctorId })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0] || 'Error al asignar doctor');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error assigning doctor:', error);
      throw error;
    }
  },

  /**
   * Desasignar un doctor de un paciente
   */
  async unassignDoctor(
    patientId: string,
    clinicId: string,
    userId: string
  ): Promise<PatientResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/patients/${patientId}/unassign-doctor`,
        {
          method: 'POST',
          headers: getHeaders(clinicId, userId)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0] || 'Error al desasignar doctor');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error unassigning doctor:', error);
      throw error;
    }
  }
};

export default patientsService;
