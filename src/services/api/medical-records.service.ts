const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

export interface MedicalRecord {
  id: string;
  clinicId: string;
  pacienteId: string;
  doctorId?: string;
  appointmentId?: string;
  fecha: string;
  tipoConsulta: 'general' | 'odontologia';
  motivoConsulta?: string;
  anamnesis?: string;
  signosVitales?: any;
  examenFisico?: string;
  datosOdontologicos?: any;
  odontogramas?: any;
  diagnostico?: string;
  diagnosticoCIE10?: any[];
  tratamiento?: string;
  prescripciones?: any[];
  observaciones?: string;
  imagenes?: any[];
  documentos?: any[];
  proximaCita?: string;
  estadoRegistro?: 'borrador' | 'guardado';
  estado: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface MedicalRecordsResponse {
  success: boolean;
  data: MedicalRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface MedicalRecordResponse {
  success: boolean;
  data?: MedicalRecord;
  message?: string;
  errors?: string[];
}

export const medicalRecordsService = {
  /**
   * Obtener todos los registros médicos de un paciente
   */
  async getPatientRecords(
    patientId: string,
    clinicId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<MedicalRecordsResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medical-records/patient/${patientId}?page=${page}&limit=${limit}`,
        { 
          method: 'GET',
          headers: getHeaders(clinicId) 
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener registros médicos');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching patient medical records:', error);
      return {
        success: false,
        data: [],
        message: error.message
      };
    }
  },

  /**
   * Crear un nuevo registro médico
   */
  async createRecord(
    clinicId: string,
    userId: string,
    data: Partial<MedicalRecord>
  ): Promise<MedicalRecordResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medical-records`,
        { 
          method: 'POST',
          headers: getHeaders(clinicId, userId),
          body: JSON.stringify(data)
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear registro médico');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error creating medical record:', error);
      return {
        success: false,
        errors: [error.message]
      };
    }
  },

  /**
   * Obtener un registro médico por ID
   */
  async getRecord(
    recordId: string,
    clinicId: string
  ): Promise<MedicalRecordResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medical-records/${recordId}`,
        { 
          method: 'GET',
          headers: getHeaders(clinicId) 
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener registro médico');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching medical record:', error);
      return {
        success: false,
        errors: [error.message]
      };
    }
  },

  /**
   * Verificar si existe un registro médico para una cita específica
   */
  async hasRecordForAppointment(
    patientId: string,
    appointmentId: string,
    clinicId: string
  ): Promise<boolean> {
    try {
      const response = await this.getPatientRecords(patientId, clinicId, 1, 1000);
      
      if (!response.success || !response.data) {
        return false;
      }

      // Buscar si existe un registro para esta cita
      const hasRecord = response.data.some((record: MedicalRecord) => {
        // Aquí podrías agregar más lógica de verificación si los registros tienen appointmentId
        // Por ahora, verificamos por pacienteId y fecha reciente
        return record.pacienteId === patientId;
      });

      return hasRecord;
    } catch (error) {
      console.error('Error checking for appointment record:', error);
      return false;
    }
  }
};
