const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface SignosVitales {
  presionArterial?: string;
  frecuenciaCardiaca?: number;
  temperatura?: number;
  frecuenciaRespiratoria?: number;
  saturacionOxigeno?: number;
  peso?: number;
  altura?: number;
  imc?: number;
}

export interface DatosOdontologicos {
  motivoConsultaOdontologica?: string;
  historiaEnfermedadActual?: string;
  antecedentesOdontologicos?: string;
  habitosOrales?: string[];
  higieneBucal?: string;
  piezasDentales?: string;
  procedimiento?: string;
  materiales?: string;
}

export interface ToothSector {
  sector: 'top' | 'bottom' | 'left' | 'right' | 'center';
  hasRestoration: boolean;
}

export interface ToothCondition {
  number: number;
  status: 'healthy' | 'caries' | 'filling' | 'crown' | 'extraction' | 'root_canal' | 'implant' | 'missing';
  sectors?: ToothSector[];
  hasCrown?: boolean;
  hasProsthesis?: boolean;
  notes?: string;
}

export interface Odontogramas {
  historico: ToothCondition[];
  actual: ToothCondition[];
}

export interface Prescripcion {
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicaciones?: string;
}

export interface ImagenDocumento {
  nombre: string;
  url: string;
  tipo: 'imagen' | 'documento';
  fecha: string;
}

export interface MedicalRecord {
  id: string;
  clinicId: string;
  pacienteId: string;
  doctorId?: string;
  
  // Información General
  fecha: string;
  tipoConsulta: 'general' | 'odontologia';
  
  // Motivo y Antecedentes
  motivoConsulta?: string;
  anamnesis?: string;
  
  // Signos Vitales
  signosVitales?: SignosVitales;
  
  // Examen Físico
  examenFisico?: string;
  
  // Datos Odontológicos
  datosOdontologicos?: DatosOdontologicos;
  
  // Odontogramas
  odontogramas?: Odontogramas;
  
  // Diagnóstico
  diagnostico?: string;
  diagnosticoCIE10?: string[];
  
  // Tratamiento
  tratamiento?: string;
  prescripciones?: Prescripcion[];
  
  // Observaciones
  observaciones?: string;
  
  // Imágenes y Documentos
  imagenes?: ImagenDocumento[];
  documentos?: ImagenDocumento[];
  
  // Próxima Cita
  proximaCita?: string;
  
  // Estado
  estado: string;
  
  // Auditoría
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CreateMedicalRecordData {
  pacienteId: string;
  doctorId?: string;
  fecha: string;
  tipoConsulta: 'general' | 'odontologia';
  motivoConsulta?: string;
  anamnesis?: string;
  signosVitales?: SignosVitales;
  examenFisico?: string;
  datosOdontologicos?: DatosOdontologicos;
  odontogramas?: Odontogramas;
  diagnostico?: string;
  diagnosticoCIE10?: string[];
  tratamiento?: string;
  prescripciones?: Prescripcion[];
  observaciones?: string;
  imagenes?: ImagenDocumento[];
  documentos?: ImagenDocumento[];
  proximaCita?: string;
}

export interface MedicalRecordFilters {
  pacienteId?: string;
  tipoConsulta?: 'general' | 'odontologia';
  doctorId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}

export interface PatientSummary {
  totalConsultas: number;
  consultasGenerales: number;
  consultasOdontologicas: number;
  ultimaConsulta?: MedicalRecord;
  diagnosticosRecientes: Array<{
    fecha: string;
    diagnostico: string;
    recordId: string;
  }>;
  tratamientosActivos: Array<{
    fecha: string;
    tratamiento: string;
    recordId: string;
  }>;
  prescripcionesActivas: Array<{
    fecha: string;
    medicamento: string;
    dosis: string;
    duracion: string;
    recordId: string;
  }>;
}

class MedicalRecordsService {
  private baseUrl = `${API_BASE_URL}/api/medical-records`;

  private async fetchWithHeaders(url: string, options: RequestInit = {}) {
    const clinicId = localStorage.getItem('clinicId') || 'CLINIC_001';
    const userId = localStorage.getItem('userId') || 'system';
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Clinic-ID': clinicId,
      'X-User-ID': userId,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ errors: ['Error en la solicitud'] }));
        throw new Error(error.errors?.[0] || 'Error en la solicitud');
      }

      return response.json();
    } catch (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }
  }

  /**
   * Get all medical records with optional filters
   */
  async getAll(filters?: MedicalRecordFilters) {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.pacienteId) params.append('pacienteId', filters.pacienteId);
      if (filters.tipoConsulta) params.append('tipoConsulta', filters.tipoConsulta);
      if (filters.doctorId) params.append('doctorId', filters.doctorId);
      if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
      if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }
    
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    return this.fetchWithHeaders(url);
  }

  /**
   * Get a specific medical record by ID
   */
  async getById(recordId: string) {
    return this.fetchWithHeaders(`${this.baseUrl}/${recordId}`);
  }

  /**
   * Get all medical records for a specific patient
   */
  async getByPatient(patientId: string, page = 1, limit = 50) {
    return this.fetchWithHeaders(`${this.baseUrl}/patient/${patientId}?page=${page}&limit=${limit}`);
  }

  /**
   * Get patient medical records summary
   */
  async getPatientSummary(patientId: string): Promise<{ success: boolean; data: PatientSummary }> {
    return this.fetchWithHeaders(`${this.baseUrl}/patient/${patientId}/summary`);
  }

  /**
   * Create a new medical record
   */
  async create(data: CreateMedicalRecordData) {
    return this.fetchWithHeaders(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a medical record
   */
  async update(recordId: string, data: Partial<CreateMedicalRecordData>) {
    return this.fetchWithHeaders(`${this.baseUrl}/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a medical record (soft delete)
   */
  async delete(recordId: string) {
    return this.fetchWithHeaders(`${this.baseUrl}/${recordId}`, {
      method: 'DELETE',
    });
  }
}

export const medicalRecordsService = new MedicalRecordsService();
export default medicalRecordsService;
